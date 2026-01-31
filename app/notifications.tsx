import { Stack } from "expo-router"

import { NotificationsContent } from "../features/notifications"

export default function NotificationsScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Notifications" }} />
      <NotificationsContent />
    </>
  )
}
