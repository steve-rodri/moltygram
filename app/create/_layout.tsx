import { Stack } from "expo-router"

import { useTheme } from "@lib/contexts/theme-context"

export default function CreateLayout() {
  const { colors } = useTheme()

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
        headerBackButtonDisplayMode: "minimal",
        animation: "none",
      }}
    />
  )
}
