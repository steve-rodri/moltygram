import { useState } from "react"
import { Text, TouchableOpacity, View } from "react-native"
import { Heart, User } from "lucide-react-native"
import { useCSSVariable } from "uniwind"

import { StyledImage } from "@lib/components/styled-image"

import { IMAGE_CACHE_POLICY } from "../../lib/constants/image"
import { Comment } from "../../services/repositories/types"

import { RepliesSection } from "./replies-section"

interface CommentItemProps {
  comment: Comment
  isHighlighted?: boolean
  onLike: (commentId: string) => void
  onReply: (comment: Comment) => void
  onUserPress: (userId: string) => void
  isReply?: boolean
}

function formatRelativeTime(timestamp: string): string {
  const now = new Date()
  const date = new Date(timestamp)
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const diffWeeks = Math.floor(diffDays / 7)

  if (diffMins < 1) return "now"
  if (diffMins < 60) return `${diffMins}m`
  if (diffHours < 24) return `${diffHours}h`
  if (diffDays < 7) return `${diffDays}d`
  return `${diffWeeks}w`
}

export function CommentItem({
  comment,
  isHighlighted,
  onLike,
  onReply,
  onUserPress,
  isReply,
}: CommentItemProps) {
  const [text, textTertiary, borderLight, surface] = useCSSVariable([
    "--color-text",
    "--color-text-tertiary",
    "--color-border-light",
    "--color-surface",
  ]) as [string, string, string, string]
  const [localLiked, setLocalLiked] = useState(comment.hasLiked)
  const [localLikeCount, setLocalLikeCount] = useState(comment.likeCount)
  const commenter = comment.user

  const handleLike = () => {
    setLocalLiked(!localLiked)
    setLocalLikeCount((prev) => (localLiked ? prev - 1 : prev + 1))
    onLike(comment.id)
  }

  const highlightStyle = isHighlighted
    ? {
        backgroundColor: surface,
        marginHorizontal: -16,
        paddingHorizontal: 16,
        borderRadius: 8,
      }
    : undefined

  return (
    <View>
      <View
        className={`flex-row items-start gap-3 mb-4 ${isReply ? "ml-12 mb-3" : ""}`}
        style={highlightStyle}
      >
        <TouchableOpacity onPress={() => onUserPress(comment.userId)}>
          {commenter?.avatarUrl ? (
            <StyledImage
              source={{ uri: commenter.avatarUrl }}
              className="w-9 h-9 rounded-full"
              cachePolicy={IMAGE_CACHE_POLICY}
            />
          ) : (
            <View
              className="w-9 h-9 rounded-full items-center justify-center"
              style={{ backgroundColor: borderLight }}
            >
              <User size={16} color={textTertiary} />
            </View>
          )}
        </TouchableOpacity>

        <View className="flex-1">
          <View className="flex-row items-center gap-2 mb-0.5">
            <TouchableOpacity onPress={() => onUserPress(comment.userId)}>
              <Text className="text-sm font-semibold" style={{ color: text }}>
                {commenter?.handle || "Unknown"}
              </Text>
            </TouchableOpacity>
            <Text className="text-xs" style={{ color: textTertiary }}>
              {formatRelativeTime(comment.createdAt)}
            </Text>
          </View>

          <View className="flex-row items-start justify-between gap-3">
            <View className="flex-1">
              <Text className="text-sm leading-5" style={{ color: text }}>
                {comment.text}
              </Text>
              {!isReply && (
                <TouchableOpacity
                  onPress={() => onReply(comment)}
                  className="mt-1.5"
                >
                  <Text
                    className="text-xs font-medium"
                    style={{ color: textTertiary }}
                  >
                    Reply
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              onPress={handleLike}
              className="items-center pr-2"
            >
              <Heart
                size={18}
                color={localLiked ? "#ed4956" : textTertiary}
                fill={localLiked ? "#ed4956" : "transparent"}
              />
              {localLikeCount > 0 && (
                <Text
                  className="text-[13px] mt-0.5"
                  style={{ color: textTertiary }}
                >
                  {localLikeCount}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {!isReply && comment.replyCount > 0 && (
        <RepliesSection
          commentId={comment.id}
          replyCount={comment.replyCount}
          renderReply={(reply) => (
            <CommentItem
              comment={reply}
              onLike={onLike}
              onReply={() => {}}
              onUserPress={onUserPress}
              isReply
            />
          )}
        />
      )}
    </View>
  )
}
