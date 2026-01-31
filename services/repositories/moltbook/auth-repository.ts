import { Platform } from "react-native"

import { AuthRepository, AuthResult, OAuthProvider, Session } from "../types"

// SecureStore is native-only, use localStorage on web
const storage = {
  async getItemAsync(key: string): Promise<string | null> {
    if (Platform.OS === "web") {
      return localStorage.getItem(key)
    }
    const SecureStore = await import("expo-secure-store")
    return SecureStore.getItemAsync(key)
  },
  async setItemAsync(key: string, value: string): Promise<void> {
    if (Platform.OS === "web") {
      localStorage.setItem(key, value)
      return
    }
    const SecureStore = await import("expo-secure-store")
    return SecureStore.setItemAsync(key, value)
  },
  async deleteItemAsync(key: string): Promise<void> {
    if (Platform.OS === "web") {
      localStorage.removeItem(key)
      return
    }
    const SecureStore = await import("expo-secure-store")
    return SecureStore.deleteItemAsync(key)
  },
}

import { moltbookClient, MoltbookAgent } from "./client"

const API_KEY_STORAGE_KEY = "moltbook_api_key"
const SESSION_STORAGE_KEY = "moltbook_session"

// Auth state change listeners
type AuthStateCallback = (session: Session | null) => void
const listeners = new Set<AuthStateCallback>()

function notifyListeners(session: Session | null) {
  listeners.forEach((callback) => callback(session))
}

function mapAgentToSession(agent: MoltbookAgent, apiKey: string): Session {
  return {
    user: {
      id: agent.id,
      email: undefined,
      phone: undefined,
    },
    accessToken: apiKey,
    refreshToken: apiKey, // API keys don't refresh, but we need the field
    expiresAt: Date.now() + 365 * 24 * 60 * 60 * 1000, // 1 year (API keys don't expire)
  }
}

async function persistSession(session: Session | null): Promise<void> {
  if (session) {
    await storage.setItemAsync(SESSION_STORAGE_KEY, JSON.stringify(session))
    await storage.setItemAsync(API_KEY_STORAGE_KEY, session.accessToken)
    moltbookClient.setApiKey(session.accessToken)
  } else {
    await storage.deleteItemAsync(SESSION_STORAGE_KEY)
    await storage.deleteItemAsync(API_KEY_STORAGE_KEY)
    moltbookClient.setApiKey(null)
  }
}

async function loadPersistedSession(): Promise<Session | null> {
  try {
    const sessionStr = await storage.getItemAsync(SESSION_STORAGE_KEY)
    if (!sessionStr) return null

    const session = JSON.parse(sessionStr) as Session

    // Validate the session is still valid by checking the API key
    moltbookClient.setApiKey(session.accessToken)
    const result = await moltbookClient.getCurrentAgent()

    if (!result.success) {
      // API key no longer valid, clear session
      await persistSession(null)
      return null
    }

    return session
  } catch {
    return null
  }
}

export const authRepository: AuthRepository = {
  // Primary auth method for Moltbook: API key authentication
  async signInWithEmail(apiKey: string, _password: string): Promise<AuthResult> {
    // We repurpose signInWithEmail to accept API key in the email field
    // This allows us to use the existing UI with minimal changes
    // The password field is ignored
    const result = await moltbookClient.validateApiKey(apiKey)

    if (!result.success) {
      return { session: null, user: null, error: result.error }
    }

    const session = mapAgentToSession(result.data, apiKey)
    await persistSession(session)
    notifyListeners(session)

    return { session, user: session.user }
  },

  async signUpWithEmail(_email: string, _password: string): Promise<AuthResult> {
    // Agents are created on Moltbook.com, not in the app
    return {
      session: null,
      user: null,
      error: "Create your agent account at moltbook.com first, then sign in with your API key",
    }
  },

  async signInWithOAuth(_provider: OAuthProvider): Promise<AuthResult> {
    return {
      session: null,
      user: null,
      error: "OAuth not supported. Sign in with your Moltbook API key instead.",
    }
  },

  async signInWithApple(_identityToken: string): Promise<AuthResult> {
    return {
      session: null,
      user: null,
      error: "Apple Sign In not supported. Sign in with your Moltbook API key instead.",
    }
  },

  async signInWithPhone(_phone: string): Promise<{ error?: string }> {
    return { error: "Phone auth not supported. Sign in with your Moltbook API key instead." }
  },

  async verifyOtp(_phone: string, _token: string): Promise<AuthResult> {
    return {
      session: null,
      user: null,
      error: "OTP verification not supported. Sign in with your Moltbook API key instead.",
    }
  },

  async signOut(): Promise<{ error?: string }> {
    await persistSession(null)
    notifyListeners(null)
    return {}
  },

  async getSession(): Promise<Session | null> {
    return loadPersistedSession()
  },

  onAuthStateChange(callback: AuthStateCallback): () => void {
    listeners.add(callback)
    return () => listeners.delete(callback)
  },

  async resetPassword(_email: string): Promise<{ error?: string }> {
    return { error: "Password reset not available. Manage your API key at moltbook.com" }
  },
}
