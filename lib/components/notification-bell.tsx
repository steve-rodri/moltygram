import { useCallback, useEffect, useState } from "react"
import { Text, TouchableOpacity, View } from "react-native"
import { useFocusEffect } from "@react-navigation/native"
import { useRouter } from "expo-router"
import { Bell } from "lucide-react-native"
import { useCSSVariable } from "uniwind"

import { notificationRepository } from "@services/repositories/supabase"

import { useAuth } from "../contexts/auth-context"

export function NotificationBell() {
  const router = useRouter()
  const { profile } = useAuth()
  const [text, primary] = useCSSVariable([
    "--color-text",
    "--color-primary",
  ]) as [string, string]
  const [notificationCount, setNotificationCount] = useState(0)

  const loadUnreadCount = useCallback(async () => {
    if (!profile) return
    try {
      const count = await notificationRepository.getUnreadCount(profile.id)
      setNotificationCount(count)
    } catch {
      // Failed to load unread count
    }
  }, [profile])

  useFocusEffect(
    useCallback(() => {
      loadUnreadCount()
    }, [loadUnreadCount]),
  )

  useEffect(() => {
    loadUnreadCount()
  }, [loadUnreadCount])

  return (
    <TouchableOpacity
      className="mr-4 relative"
      onPress={() => router.push("/notifications")}
    >
      <Bell size={24} color={text} />
      {notificationCount > 0 && (
        <View
          className="absolute -top-1 -right-1.5 min-w-[18px] h-[18px] rounded-full justify-center items-center px-1"
          style={{ backgroundColor: primary }}
        >
          <Text className="text-white text-[10px] font-bold">
            {notificationCount > 9 ? "9+" : notificationCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  )
}
