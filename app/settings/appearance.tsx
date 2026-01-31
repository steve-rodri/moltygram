import { Stack } from "expo-router"

import { ThemePicker } from "@features/settings/theme-picker"

export default function AppearanceScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Appearance" }} />
      <ThemePicker />
    </>
  )
}
