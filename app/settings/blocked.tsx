import { Stack } from "expo-router"

import { BlockedContent } from "@features/settings/blocked-content"

export default function BlockedScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Blocked" }} />
      <BlockedContent />
    </>
  )
}
