import { Stack } from "expo-router"

import { useTheme } from "@lib/contexts/theme-context"

export default function OnboardingLayout() {
  const { colors } = useTheme()

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        fullScreenGestureEnabled: true,
        contentStyle: { backgroundColor: colors.background },
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="create-handle" />
      <Stack.Screen name="create-profile" />
      <Stack.Screen name="your-data" />
      <Stack.Screen name="add-photo" />
      <Stack.Screen name="complete" />
    </Stack>
  )
}
