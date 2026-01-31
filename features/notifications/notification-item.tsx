import { Text, TouchableOpacity, View } from "react-native"
import {
  AtSign,
  Heart,
  MessageCircle,
  User,
  UserPlus,
} from "lucide-react-native"
import { useCSSVariable } from "uniwind"

import { StyledImage } from "@lib/components/styled-image"

import { IMAGE_CACHE_POLICY } from "../../lib/constants/image"
import { Notification } from "../../services/repositories/types"

interface NotificationItemProps {
  notification: Notification
  onPress: (notification: Notification) => void
}

function formatTime(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 1) return "just now"
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

function getMessage(type: Notification["type"]): string {
  switch (type) {
    case "like":
      return "liked your photo"
    case "comment":
      return "commented on your photo"
    case "follow":
      return "started following you"
    case "follow_request":
      return "requested to follow you"
    case "mention":
      return "mentioned you in a comment"
  }
}

export function NotificationItem({
  notification,
  onPress,
}: NotificationItemProps) {
  const [textSecondary, textTertiary, primary] = useCSSVariable([
    "--color-text-secondary",
    "--color-text-tertiary",
    "--color-primary",
  ]) as [string, string, string]

  const renderIcon = () => {
    switch (notification.type) {
      case "like":
        return <Heart size={20} color="#ed4956" fill="#ed4956" />
      case "comment":
        return <MessageCircle size={20} color={textSecondary} />
      case "follow":
      case "follow_request":
        return <UserPlus size={20} color="#3897f0" />
      case "mention":
        return <AtSign size={20} color={primary} />
    }
  }

  return (
    <TouchableOpacity
      className={`flex-row items-center p-4 border-b border-border gap-3 ${!notification.isRead ? "bg-[rgba(56,151,240,0.05)]" : ""}`}
      onPress={() => onPress(notification)}
    >
      <View className="w-9 h-9 rounded-full justify-center items-center bg-surface">
        {renderIcon()}
      </View>
      {notification.actor?.avatarUrl ? (
        <StyledImage
          source={{ uri: notification.actor.avatarUrl }}
          className="w-10 h-10 rounded-full"
          cachePolicy={IMAGE_CACHE_POLICY}
        />
      ) : (
        <View className="w-10 h-10 rounded-full items-center justify-center bg-border-light">
          <User size={16} color={textTertiary} />
        </View>
      )}
      <View className="flex-1">
        <Text className="text-sm leading-5 text-text">
          <Text className="font-semibold">
            @{notification.actor?.handle || "Unknown"}
          </Text>{" "}
          {getMessage(notification.type)}
        </Text>
        <Text className="text-xs mt-0.5 text-text-secondary">
          {formatTime(notification.createdAt)}
        </Text>
      </View>
    </TouchableOpacity>
  )
}
