import { AuthRepository, AuthResult, OAuthProvider, Session } from "../types"

import { supabase } from "./client"

function mapSession(session: any): Session | null {
  if (!session) return null
  return {
    user: {
      id: session.user.id,
      email: session.user.email,
      phone: session.user.phone,
    },
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
    expiresAt: session.expires_at,
  }
}

function mapAuthResult(data: any, error: any): AuthResult {
  if (error) {
    return { session: null, user: null, error: error.message }
  }
  const session = mapSession(data.session)
  return {
    session,
    user: session?.user || null,
  }
}

export const authRepository: AuthRepository = {
  async signInWithEmail(email: string, password: string): Promise<AuthResult> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return mapAuthResult(data, error)
  },

  async signUpWithEmail(email: string, password: string): Promise<AuthResult> {
    const { data, error } = await supabase.auth.signUp({ email, password })
    return mapAuthResult(data, error)
  },

  async signInWithOAuth(provider: OAuthProvider): Promise<AuthResult> {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: "moltygram://auth/callback",
        skipBrowserRedirect: true,
      },
    })
    if (error) {
      return { session: null, user: null, error: error.message }
    }
    // OAuth returns a URL to redirect to, not a session directly
    // The session will be captured via onAuthStateChange
    return { session: null, user: null }
  },

  async signInWithApple(identityToken: string): Promise<AuthResult> {
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: "apple",
      token: identityToken,
    })
    return mapAuthResult(data, error)
  },

  async signInWithPhone(phone: string): Promise<{ error?: string }> {
    const { error } = await supabase.auth.signInWithOtp({ phone })
    return { error: error?.message }
  },

  async verifyOtp(phone: string, token: string): Promise<AuthResult> {
    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: "sms",
    })
    return mapAuthResult(data, error)
  },

  async signOut(): Promise<{ error?: string }> {
    const { error } = await supabase.auth.signOut()
    return { error: error?.message }
  },

  async getSession(): Promise<Session | null> {
    const { data } = await supabase.auth.getSession()
    return mapSession(data.session)
  },

  onAuthStateChange(callback: (session: Session | null) => void): () => void {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      callback(mapSession(session))
    })
    return () => data.subscription.unsubscribe()
  },

  async resetPassword(email: string): Promise<{ error?: string }> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "moltygram://auth/reset-password",
    })
    return { error: error?.message }
  },
}
