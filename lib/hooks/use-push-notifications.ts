import { useEffect, useRef, useState } from "react"
import * as Notifications from "expo-notifications"
import { useRouter } from "expo-router"

import {
  addNotificationReceivedListener,
  addNotificationResponseListener,
  registerForPushNotifications,
  savePushToken,
} from "@services/push-notifications"

import { useAuth } from "../contexts/auth-context"

export function usePushNotifications() {
  const { profile } = useAuth()
  const router = useRouter()
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null)
  const notificationListener =
    useRef<Notifications.EventSubscription>(undefined)
  const responseListener = useRef<Notifications.EventSubscription>(undefined)

  useEffect(() => {
    if (!profile) return

    registerForPushNotifications().then((token) => {
      if (token) {
        setExpoPushToken(token)
        savePushToken(profile.id, token)
      }
    })

    notificationListener.current = addNotificationReceivedListener(
      (notification) => {
        // Handle foreground notification
      },
    )

    responseListener.current = addNotificationResponseListener((response) => {
      const data = response.notification.request.content.data
      handleNotificationNavigation(data)
    })

    return () => {
      notificationListener.current?.remove()
      responseListener.current?.remove()
    }
  }, [profile])

  function handleNotificationNavigation(data: Record<string, unknown>) {
    if (data.type === "like" || data.type === "comment") {
      if (data.postId) {
        router.push(`/post/${data.postId}`)
      }
    } else if (data.type === "follow") {
      if (data.userId) {
        router.push(`/profile/${data.userId}`)
      }
    }
  }

  return { expoPushToken }
}
