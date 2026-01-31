import { useCallback, useRef, useState } from "react"
import {
  Alert,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import { BottomSheetModal } from "@gorhom/bottom-sheet"
import { Image } from "expo-image"
import { useRouter } from "expo-router"
import { Heart, MessageCircle, Trash2, User } from "lucide-react-native"
import { useCSSVariable } from "uniwind"

import { StyledImage } from "@lib/components/styled-image"
import { useAuth } from "@lib/contexts/auth-context"
import { formatRelativeTime } from "@lib/utils/format-date"

import {
  IMAGE_CACHE_POLICY,
  IMAGE_TRANSITION_MS,
} from "../../lib/constants/image"
import { Post } from "../../services/repositories/types"
import { CommentsSheet } from "../post-detail/comments-sheet"
import { LikesSheet } from "../post-detail/likes-sheet"
import { LikesText } from "../post-detail/likes-text"

import { useDeletePost } from "./use-delete-post"
import { useToggleLike } from "./use-toggle-like"

const { width: SCREEN_WIDTH } = Dimensions.get("window")

interface PostCardProps {
  post: Post
}

export function PostCard({ post }: PostCardProps) {
  const router = useRouter()
  const [text, textSecondary, textTertiary, primary] = useCSSVariable([
    "--color-text",
    "--color-text-secondary",
    "--color-text-tertiary",
    "--color-primary",
  ]) as [string, string, string, string]
  const { profile } = useAuth()
  const toggleLike = useToggleLike()
  const deletePost = useDeletePost()
  const [currentIndex, setCurrentIndex] = useState(0)
  const commentsSheetRef = useRef<BottomSheetModal>(null)
  const likesSheetRef = useRef<BottomSheetModal>(null)

  const lastTapRef = useRef(0)
  const tapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const openComments = useCallback(() => {
    commentsSheetRef.current?.present(0)
  }, [])

  const closeComments = useCallback(() => {
    commentsSheetRef.current?.dismiss()
  }, [])

  const openLikes = useCallback(() => {
    likesSheetRef.current?.present(0)
  }, [])

  const closeLikes = useCallback(() => {
    likesSheetRef.current?.dismiss()
  }, [])

  const author = post.user
  const isOwnPost = profile && post.userId === profile.id

  const handleImageTap = () => {
    const now = Date.now()
    const DOUBLE_TAP_DELAY = 300

    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      if (tapTimeoutRef.current) {
        clearTimeout(tapTimeoutRef.current)
        tapTimeoutRef.current = null
      }
      if (!post.hasLiked) {
        toggleLike.mutate(post.id)
      }
    } else {
      lastTapRef.current = now
      tapTimeoutRef.current = setTimeout(() => {
        router.push(`/post/${post.id}`)
      }, DOUBLE_TAP_DELAY)
    }
  }

  const handleDelete = () => {
    Alert.alert("Delete Post", "Are you sure you want to delete this post?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deletePost.mutate(post.id),
      },
    ])
  }

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x
    const index = Math.round(offsetX / SCREEN_WIDTH)
    setCurrentIndex(index)
  }

  return (
    <View className="border-b border-border bg-surface">
      <View className="flex-row items-center justify-between p-3">
        <TouchableOpacity
          className="flex-row items-center gap-2.5"
          onPress={() => router.push(`/profile/${post.userId}`)}
        >
          {author?.avatarUrl ? (
            <StyledImage
              source={{ uri: author.avatarUrl }}
              className="w-8 h-8 rounded-full"
              cachePolicy={IMAGE_CACHE_POLICY}
            />
          ) : (
            <View className="w-8 h-8 rounded-full items-center justify-center bg-border-light">
              <User size={16} color={textTertiary} />
            </View>
          )}
          <Text className="text-sm font-semibold text-text">
            {author?.handle || "Unknown"}
          </Text>
        </TouchableOpacity>
        {isOwnPost && (
          <TouchableOpacity onPress={handleDelete} className="p-1">
            <Trash2 size={18} color={textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      <View className="relative">
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          scrollEnabled={post.images.length > 1}
        >
          {post.images.map((image, index) => (
            <TouchableOpacity
              key={index}
              activeOpacity={0.9}
              onPress={handleImageTap}
            >
              <Image
                source={{ uri: image }}
                style={{ width: SCREEN_WIDTH, height: SCREEN_WIDTH }}
                cachePolicy={IMAGE_CACHE_POLICY}
                transition={IMAGE_TRANSITION_MS}
              />
            </TouchableOpacity>
          ))}
        </ScrollView>

        {post.images.length > 1 && (
          <View className="absolute bottom-3 left-0 right-0 flex-row justify-center gap-1.5">
            {post.images.map((_, index) => (
              <View
                key={index}
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  backgroundColor:
                    index === currentIndex ? primary : "rgba(255,255,255,0.6)",
                }}
              />
            ))}
          </View>
        )}
      </View>

      <View className="p-3">
        <View className="flex-row gap-4 mb-2">
          <TouchableOpacity
            onPress={() => toggleLike.mutate(post.id)}
            className="p-0.5"
          >
            <Heart
              size={24}
              color={post.hasLiked ? "#ed4956" : text}
              fill={post.hasLiked ? "#ed4956" : "transparent"}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={openComments}
            className="flex-row items-center p-0.5 gap-1"
          >
            <MessageCircle size={24} color={text} />
            {post.commentCount > 0 && (
              <Text className="text-sm font-semibold text-text">
                {post.commentCount}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <LikesText post={post} color={text} onOpenLikes={openLikes} />

        {post.caption && (
          <Text className="text-sm leading-5 text-text">
            <Text
              className="font-semibold"
              onPress={() => router.push(`/profile/${post.userId}`)}
            >
              {author?.handle || "Unknown"}
            </Text>{" "}
            {post.caption}
          </Text>
        )}

        <Text className="text-[10px] mt-1 uppercase text-text-tertiary">
          {formatRelativeTime(post.createdAt)}
        </Text>
      </View>

      <CommentsSheet
        sheetRef={commentsSheetRef}
        postId={post.id}
        onClose={closeComments}
      />
      <LikesSheet
        sheetRef={likesSheetRef}
        postId={post.id}
        onClose={closeLikes}
      />
    </View>
  )
}
