import { useEffect, useState } from "react"
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native"
import { Stack } from "expo-router"
import { Camera, Check } from "lucide-react-native"
import { useCSSVariable } from "uniwind"

import { AppIconName, appIcons } from "@lib/constants/themes"

let DynamicAppIcon: typeof import("expo-dynamic-app-icon") | null = null
try {
  DynamicAppIcon = require("expo-dynamic-app-icon")
} catch {
  // Native module not available (Expo Go)
}

const iconColors: Record<AppIconName, { bg: string; fg: string }> = {
  classic: { bg: "#833AB4", fg: "#fff" },
  sunset: { bg: "#FF6B6B", fg: "#fff" },
  neon: { bg: "#0a0a0a", fg: "#00ffff" },
  minimalist: { bg: "#fff", fg: "#1a1a1a" },
  retro: { bg: "#8B4513", fg: "#f5f5dc" },
  dark: { bg: "#121212", fg: "#fafafa" },
  pastel: { bg: "#FFB5E8", fg: "#fff" },
  pride: { bg: "#E40303", fg: "#fff" },
}

export default function AppIconScreen() {
  const [primary, border] = useCSSVariable([
    "--color-primary",
    "--color-border",
  ]) as [string, string]
  const [appIcon, setAppIconState] = useState<AppIconName>("classic")
  const isNativeAvailable = DynamicAppIcon !== null

  useEffect(() => {
    if (DynamicAppIcon) {
      const currentIcon = DynamicAppIcon.getAppIcon()
      const isValidIcon = currentIcon && currentIcon in iconColors
      setAppIconState(isValidIcon ? (currentIcon as AppIconName) : "classic")
    }
  }, [])

  const handleSetIcon = (iconName: AppIconName) => {
    if (DynamicAppIcon) {
      const success = DynamicAppIcon.setAppIcon(iconName)
      if (success) {
        setAppIconState(iconName)
      } else {
        Alert.alert("Error", "Failed to change app icon")
      }
    } else {
      setAppIconState(iconName)
    }
  }

  const currentIcon = appIcons.find((i) => i.name === appIcon)

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen options={{ title: "App Icon" }} />

      <ScrollView className="flex-1 p-4">
        <View className="items-center mb-6">
          <View
            className="w-24 h-24 rounded-3xl border-2 justify-center items-center mb-2"
            style={{
              backgroundColor: iconColors[appIcon].bg,
              borderColor: border,
            }}
          >
            <Camera size={40} color={iconColors[appIcon].fg} />
          </View>
          <Text className="text-sm text-text-secondary">
            {currentIcon?.label}
          </Text>
        </View>

        <Text className="text-xs font-semibold mb-2 text-text-secondary">
          CHOOSE APP ICON
        </Text>
        <Text className="text-sm mb-4 text-text-tertiary">
          Select an icon for your home screen.
        </Text>

        <View className="flex-row flex-wrap gap-4 mb-6">
          {appIcons.map((icon) => {
            const isSelected = appIcon === icon.name
            const iconColor = iconColors[icon.name]
            return (
              <TouchableOpacity
                key={icon.name}
                className="w-[22%] items-center"
                onPress={() => handleSetIcon(icon.name)}
              >
                <View
                  className="w-16 h-16 rounded-2xl border-2 justify-center items-center mb-1"
                  style={{
                    backgroundColor: iconColor.bg,
                    borderColor: isSelected ? primary : border,
                  }}
                >
                  <Camera size={24} color={iconColor.fg} />
                  {isSelected && (
                    <View className="absolute -top-1 -right-1 w-[18px] h-[18px] rounded-full justify-center items-center bg-primary">
                      <Check size={10} color="#fff" />
                    </View>
                  )}
                </View>
                <Text className="text-[10px] text-center text-text-secondary">
                  {icon.label}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>

        <View className="p-4 rounded-xl border border-border bg-card">
          <Text className="text-sm font-semibold mb-2 text-text">
            {isNativeAvailable
              ? "About app icons"
              : "How to change your app icon"}
          </Text>
          {isNativeAvailable ? (
            <Text className="text-sm leading-5 text-text-secondary">
              Tap an icon above to change your app icon. The change will take
              effect immediately.
            </Text>
          ) : (
            <>
              <Text className="text-sm leading-5 text-text-secondary">
                {
                  'iOS: Tap Share, then "Add to Home Screen". The selected icon will be used.'
                }
              </Text>
              <Text className="text-sm leading-5 text-text-secondary mt-2">
                Android: Install as PWA from browser menu.
              </Text>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  )
}
