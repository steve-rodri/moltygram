import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react"

import {
  authRepository,
  userRepository,
} from "../../services/repositories/moltbook"
import {
  OAuthProvider,
  Profile,
  Session,
} from "../../services/repositories/types"

interface AuthContextValue {
  session: Session | null
  profile: Profile | null
  isLoading: boolean
  isPreviewingOnboarding: boolean
  signInWithEmail: (
    email: string,
    password: string,
  ) => Promise<{ error?: string }>
  signUpWithEmail: (
    email: string,
    password: string,
  ) => Promise<{ error?: string }>
  signInWithOAuth: (provider: OAuthProvider) => Promise<{ error?: string }>
  signInWithPhone: (phone: string) => Promise<{ error?: string }>
  verifyOtp: (phone: string, token: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  setProfile: (profile: Profile | null) => void
  startOnboardingPreview: () => void
  stopOnboardingPreview: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isPreviewingOnboarding, setIsPreviewingOnboarding] = useState(false)

  useEffect(() => {
    // Check for existing session on mount
    authRepository.getSession().then(async (existingSession) => {
      setSession(existingSession)
      if (existingSession) {
        const userProfile = await userRepository.getProfile(
          existingSession.user.id,
        )
        setProfile(userProfile)
      }
      setIsLoading(false)
    })

    // Listen for auth state changes
    const unsubscribe = authRepository.onAuthStateChange(async (newSession) => {
      setSession(newSession)
      if (newSession) {
        const userProfile = await userRepository.getProfile(newSession.user.id)
        setProfile(userProfile)
      } else {
        setProfile(null)
      }
    })

    return unsubscribe
  }, [])

  const signInWithEmail = async (email: string, password: string) => {
    const result = await authRepository.signInWithEmail(email, password)
    if (result.error) {
      return { error: result.error }
    }
    setSession(result.session)
    if (result.session) {
      const userProfile = await userRepository.getProfile(
        result.session.user.id,
      )
      setProfile(userProfile)
    }
    return {}
  }

  const signUpWithEmail = async (email: string, password: string) => {
    const result = await authRepository.signUpWithEmail(email, password)
    if (result.error) {
      return { error: result.error }
    }
    setSession(result.session)
    // New users won't have a profile yet - they go through onboarding
    return {}
  }

  const signInWithOAuth = async (provider: OAuthProvider) => {
    const result = await authRepository.signInWithOAuth(provider)
    if (result.error) {
      return { error: result.error }
    }
    // Session will be set via onAuthStateChange after OAuth redirect
    return {}
  }

  const signInWithPhone = async (phone: string) => {
    const result = await authRepository.signInWithPhone(phone)
    return { error: result.error }
  }

  const verifyOtp = async (phone: string, token: string) => {
    const result = await authRepository.verifyOtp(phone, token)
    if (result.error) {
      return { error: result.error }
    }
    setSession(result.session)
    if (result.session) {
      const userProfile = await userRepository.getProfile(
        result.session.user.id,
      )
      setProfile(userProfile)
    }
    return {}
  }

  const signOut = async () => {
    await authRepository.signOut()
    setSession(null)
    setProfile(null)
  }

  const startOnboardingPreview = () => {
    setIsPreviewingOnboarding(true)
  }

  const stopOnboardingPreview = () => {
    setIsPreviewingOnboarding(false)
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        profile,
        isLoading,
        isPreviewingOnboarding,
        signInWithEmail,
        signUpWithEmail,
        signInWithOAuth,
        signInWithPhone,
        verifyOtp,
        signOut,
        setProfile,
        startOnboardingPreview,
        stopOnboardingPreview,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
