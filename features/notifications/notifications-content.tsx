import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  View,
} from "react-native"
import { useRouter } from "expo-router"
import { useCSSVariable } from "uniwind"

import { Notification } from "../../services/repositories/types"

import { NotificationItem } from "./notification-item"
import { useNotifications } from "./use-notifications"

export function NotificationsContent() {
  const router = useRouter()
  const [textSecondary] = useCSSVariable(["--color-text-secondary"]) as [string]
  const {
    notifications,
    isLoading,
    isRefreshing,
    isLoadingMore,
    refresh,
    loadMore,
  } = useNotifications()

  const handleNotificationPress = (notification: Notification) => {
    if (notification.postId) {
      if (notification.commentId) {
        router.push(
          `/post/${notification.postId}?comments=true&commentId=${notification.commentId}`,
        )
      } else {
        router.push(`/post/${notification.postId}`)
      }
    } else if (notification.actorId) {
      router.push(`/profile/${notification.actorId}`)
    }
  }

  const renderFooter = () => {
    if (!isLoadingMore) return null
    return (
      <View className="py-4 items-center">
        <ActivityIndicator size="small" color={textSecondary} />
      </View>
    )
  }

  if (isLoading) {
    return (
      <View className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={textSecondary} />
        </View>
      </View>
    )
  }

  if (notifications.length === 0) {
    return (
      <View className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center p-8">
          <Text className="text-lg font-semibold mb-2 text-text">
            No notifications yet
          </Text>
          <Text className="text-sm text-center leading-5 text-text-secondary">
            {"When someone interacts with your posts, you'll see it here."}
          </Text>
        </View>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-background">
      <FlatList
        data={notifications}
        renderItem={({ item }) => (
          <NotificationItem
            notification={item}
            onPress={handleNotificationPress}
          />
        )}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refresh}
            tintColor={textSecondary}
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
      />
    </View>
  )
}
