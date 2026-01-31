import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { Uniwind } from "uniwind"

import {
  AppIconName,
  appIcons,
  ThemeColors,
  ThemeName,
  themes,
} from "@lib/constants/themes"

interface ThemeContextValue {
  theme: ThemeName
  colors: ThemeColors
  isDark: boolean
  appIcon: AppIconName
  setTheme: (theme: ThemeName) => void
  setAppIcon: (icon: AppIconName) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

const STORAGE_KEY_THEME = "moltygram-theme"
const STORAGE_KEY_ICON = "moltygram-app-icon"

interface ThemeProviderProps {
  children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<ThemeName>("dark")
  const [appIcon, setAppIconState] = useState<AppIconName>("classic")
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    loadStoredPreferences()
  }, [])

  const loadStoredPreferences = async () => {
    try {
      const [storedTheme, storedIcon] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEY_THEME),
        AsyncStorage.getItem(STORAGE_KEY_ICON),
      ])

      if (storedTheme && themes[storedTheme as ThemeName]) {
        setThemeState(storedTheme as ThemeName)
        Uniwind.setTheme(storedTheme as Parameters<typeof Uniwind.setTheme>[0])
      }
      if (storedIcon && appIcons.some((i) => i.name === storedIcon)) {
        setAppIconState(storedIcon as AppIconName)
      }
    } catch {
      // Failed to load preferences
    } finally {
      setLoaded(true)
    }
  }

  const setTheme = async (newTheme: ThemeName) => {
    setThemeState(newTheme)
    Uniwind.setTheme(newTheme as Parameters<typeof Uniwind.setTheme>[0])
    try {
      await AsyncStorage.setItem(STORAGE_KEY_THEME, newTheme)
    } catch {
      // Failed to save theme
    }
  }

  const setAppIcon = async (newIcon: AppIconName) => {
    setAppIconState(newIcon)
    try {
      await AsyncStorage.setItem(STORAGE_KEY_ICON, newIcon)
    } catch {
      // Failed to save app icon
    }
  }

  const value: ThemeContextValue = {
    theme,
    colors: themes[theme].colors,
    isDark: themes[theme].isDark,
    appIcon,
    setTheme,
    setAppIcon,
  }

  if (!loaded) {
    return null
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
