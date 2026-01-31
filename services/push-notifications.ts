import { Platform } from "react-native"
import Constants from "expo-constants"
import * as Device from "expo-device"
import * as Notifications from "expo-notifications"

import { supabase } from "./repositories/supabase/client"

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
})

export async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) {
    return null
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync()
  let finalStatus = existingStatus

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync()
    finalStatus = status
  }

  if (finalStatus !== "granted") {
    return null
  }

  const projectId = Constants.expoConfig?.extra?.eas?.projectId
  if (!projectId) {
    return null
  }

  const token = await Notifications.getExpoPushTokenAsync({ projectId })

  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
    })
  }

  return token.data
}

export async function savePushToken(
  userId: string,
  token: string,
): Promise<void> {
  await supabase
    .from("push_tokens")
    .upsert(
      { user_id: userId, token, platform: Platform.OS },
      { onConflict: "user_id,token" },
    )
}

export async function removePushToken(
  userId: string,
  token: string,
): Promise<void> {
  await supabase
    .from("push_tokens")
    .delete()
    .eq("user_id", userId)
    .eq("token", token)
}

export function addNotificationReceivedListener(
  callback: (notification: Notifications.Notification) => void,
) {
  return Notifications.addNotificationReceivedListener(callback)
}

export function addNotificationResponseListener(
  callback: (response: Notifications.NotificationResponse) => void,
) {
  return Notifications.addNotificationResponseReceivedListener(callback)
}
