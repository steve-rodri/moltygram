import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"

import {
  currentUser as defaultUser,
  ImageTransform,
  User,
} from "@features/profile/mock-data"

interface ProfileUpdate {
  name?: string
  handle?: string
  pronouns?: string
  bio?: string
}

interface NotificationSettings {
  likes: boolean
  comments: boolean
  follows: boolean
  mentions: boolean
}

interface UserSettings {
  notifications: NotificationSettings
  blockedUsers: string[]
  screenTimeLimit: number // minutes per day, 0 = unlimited
  isPrivate: boolean
}

const defaultSettings: UserSettings = {
  notifications: { likes: true, comments: true, follows: true, mentions: true },
  blockedUsers: [],
  screenTimeLimit: 0,
  isPrivate: false,
}

interface UserContextValue {
  currentUser: User
  settings: UserSettings
  updateProfile: (updates: ProfileUpdate) => void
  updateProfilePhoto: (uri: string, transform?: ImageTransform) => void
  updateCoverPhoto: (uri: string, transform?: ImageTransform) => void
  updateNotifications: (updates: Partial<NotificationSettings>) => void
  blockUser: (userId: string) => void
  unblockUser: (userId: string) => void
  setScreenTimeLimit: (minutes: number) => void
  setPrivate: (isPrivate: boolean) => void
}

const UserContext = createContext<UserContextValue | null>(null)

const USER_STORAGE_KEY = "retro-insta-user"
const SETTINGS_STORAGE_KEY = "retro-insta-settings"

interface UserProviderProps {
  children: ReactNode
}

export function UserProvider({ children }: UserProviderProps) {
  const [user, setUser] = useState<User>(defaultUser)
  const [settings, setSettings] = useState<UserSettings>(defaultSettings)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (loaded) {
      saveData()
    }
  }, [user, settings, loaded])

  const loadData = async () => {
    try {
      const [storedUser, storedSettings] = await Promise.all([
        AsyncStorage.getItem(USER_STORAGE_KEY),
        AsyncStorage.getItem(SETTINGS_STORAGE_KEY),
      ])
      if (storedUser) setUser(JSON.parse(storedUser))
      if (storedSettings)
        setSettings({ ...defaultSettings, ...JSON.parse(storedSettings) })
    } catch {
      // Failed to load data
    } finally {
      setLoaded(true)
    }
  }

  const saveData = async () => {
    try {
      await Promise.all([
        AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user)),
        AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings)),
      ])
    } catch {
      // Failed to save data
    }
  }

  const updateProfile = (updates: ProfileUpdate) => {
    setUser((prev) => ({ ...prev, ...updates }))
  }

  const updateProfilePhoto = (uri: string, transform?: ImageTransform) => {
    setUser((prev) => ({ ...prev, avatar: uri, avatarTransform: transform }))
  }

  const updateCoverPhoto = (uri: string, transform?: ImageTransform) => {
    setUser((prev) => ({
      ...prev,
      coverPhoto: uri,
      coverPhotoTransform: transform,
    }))
  }

  const updateNotifications = (updates: Partial<NotificationSettings>) => {
    setSettings((prev) => ({
      ...prev,
      notifications: { ...prev.notifications, ...updates },
    }))
  }

  const blockUser = (userId: string) => {
    setSettings((prev) => ({
      ...prev,
      blockedUsers: prev.blockedUsers.includes(userId)
        ? prev.blockedUsers
        : [...prev.blockedUsers, userId],
    }))
  }

  const unblockUser = (userId: string) => {
    setSettings((prev) => ({
      ...prev,
      blockedUsers: prev.blockedUsers.filter((id) => id !== userId),
    }))
  }

  const setScreenTimeLimit = (minutes: number) => {
    setSettings((prev) => ({ ...prev, screenTimeLimit: minutes }))
  }

  const setPrivate = (isPrivate: boolean) => {
    setSettings((prev) => ({ ...prev, isPrivate }))
  }

  if (!loaded) {
    return null
  }

  const value: UserContextValue = {
    currentUser: user,
    settings,
    updateProfile,
    updateProfilePhoto,
    updateCoverPhoto,
    updateNotifications,
    blockUser,
    unblockUser,
    setScreenTimeLimit,
    setPrivate,
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export function useUser(): UserContextValue {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}
