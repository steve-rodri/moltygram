export type ThemeName =
  | "classic"
  | "dark"
  | "sunset"
  | "forest"
  | "ocean"
  | "monochrome"

export interface ThemeColors {
  primary: string
  primaryHover: string
  background: string
  surface: string
  card: string
  text: string
  textSecondary: string
  textTertiary: string
  border: string
  borderLight: string
  accent: string
  error: string
  success: string
  gradientStart: string
  gradientEnd: string
}

export interface ThemeConfig {
  name: ThemeName
  label: string
  isDark: boolean
  colors: ThemeColors
}

export const themes: Record<ThemeName, ThemeConfig> = {
  classic: {
    name: "classic",
    label: "Classic Instagram",
    isDark: false,
    colors: {
      primary: "#3897f0",
      primaryHover: "#2d7dd2",
      background: "#fafafa",
      surface: "#ffffff",
      card: "#ffffff",
      text: "#262626",
      textSecondary: "#8e8e8e",
      textTertiary: "#c7c7c7",
      border: "#dbdbdb",
      borderLight: "#efefef",
      accent: "#3897f0",
      error: "#ed4956",
      success: "#58c322",
      gradientStart: "#3897f0",
      gradientEnd: "#3897f0",
    },
  },
  dark: {
    name: "dark",
    label: "🦞 Moltbook Dark",
    isDark: true,
    colors: {
      primary: "#e74c3c",
      primaryHover: "#c0392b",
      background: "#0d0d0d",
      surface: "#1a1a1a",
      card: "#242424",
      text: "#f5f5f5",
      textSecondary: "#a0a0a0",
      textTertiary: "#606060",
      border: "#333333",
      borderLight: "#2a2a2a",
      accent: "#ff6b5b",
      error: "#e74c3c",
      success: "#27ae60",
      gradientStart: "#e74c3c",
      gradientEnd: "#ff6b5b",
    },
  },
  sunset: {
    name: "sunset",
    label: "Sunset",
    isDark: false,
    colors: {
      primary: "#ff6b6b",
      primaryHover: "#ff5252",
      background: "#fff9f5",
      surface: "#ffffff",
      card: "#ffffff",
      text: "#2d2d2d",
      textSecondary: "#8b7355",
      textTertiary: "#c4a77d",
      border: "#f0d9c4",
      borderLight: "#faf0e6",
      accent: "#ffb347",
      error: "#ff6b6b",
      success: "#7cb342",
      gradientStart: "#ff6b6b",
      gradientEnd: "#ffb347",
    },
  },
  forest: {
    name: "forest",
    label: "Forest",
    isDark: false,
    colors: {
      primary: "#2ecc71",
      primaryHover: "#27ae60",
      background: "#f5f9f6",
      surface: "#ffffff",
      card: "#ffffff",
      text: "#1a3c2a",
      textSecondary: "#5d8a6b",
      textTertiary: "#9dc4a8",
      border: "#c8e6c9",
      borderLight: "#e8f5e9",
      accent: "#81c784",
      error: "#e57373",
      success: "#2ecc71",
      gradientStart: "#2ecc71",
      gradientEnd: "#81c784",
    },
  },
  ocean: {
    name: "ocean",
    label: "Ocean",
    isDark: false,
    colors: {
      primary: "#17a2b8",
      primaryHover: "#138496",
      background: "#f0f9ff",
      surface: "#ffffff",
      card: "#ffffff",
      text: "#0c3547",
      textSecondary: "#5a8fa3",
      textTertiary: "#a3c9d9",
      border: "#b8e2f2",
      borderLight: "#e3f4fc",
      accent: "#4dd0e1",
      error: "#ef5350",
      success: "#26a69a",
      gradientStart: "#17a2b8",
      gradientEnd: "#4dd0e1",
    },
  },
  monochrome: {
    name: "monochrome",
    label: "Monochrome",
    isDark: false,
    colors: {
      primary: "#333333",
      primaryHover: "#1a1a1a",
      background: "#f5f5f5",
      surface: "#ffffff",
      card: "#ffffff",
      text: "#1a1a1a",
      textSecondary: "#666666",
      textTertiary: "#999999",
      border: "#d4d4d4",
      borderLight: "#e8e8e8",
      accent: "#666666",
      error: "#333333",
      success: "#333333",
      gradientStart: "#333333",
      gradientEnd: "#666666",
    },
  },
}

export type AppIconName =
  | "classic"
  | "sunset"
  | "neon"
  | "minimalist"
  | "retro"
  | "dark"
  | "pastel"
  | "pride"

export interface AppIconConfig {
  name: AppIconName
  label: string
}

export const appIcons: AppIconConfig[] = [
  { name: "classic", label: "Classic Camera" },
  { name: "sunset", label: "Gradient Sunset" },
  { name: "neon", label: "Neon" },
  { name: "minimalist", label: "Minimalist" },
  { name: "retro", label: "Retro Film" },
  { name: "dark", label: "Dark Mode" },
  { name: "pastel", label: "Pastel" },
  { name: "pride", label: "Pride" },
]
