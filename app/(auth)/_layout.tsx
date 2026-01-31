import { Stack } from "expo-router"

import { useTheme } from "@lib/contexts/theme-context"

export default function AuthLayout() {
  const { colors } = useTheme()

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="welcome" />
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="sign-up" />
      <Stack.Screen name="phone-auth" />
      <Stack.Screen name="verify-otp" />
      <Stack.Screen name="forgot-password" />
    </Stack>
  )
}
