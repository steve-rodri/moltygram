import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import { useRouter } from "expo-router"
import { Heart, MessageCircle, User } from "lucide-react-native"
import { useCSSVariable } from "uniwind"

import { SkeletonImage } from "@lib/components/skeleton-image"
import { StyledImage } from "@lib/components/styled-image"
import { formatFullDate } from "@lib/utils/format-date"

import { IMAGE_CACHE_POLICY } from "../../lib/constants/image"
import { Post } from "../../services/repositories/types"

import { CommentsSheet } from "./comments-sheet"
import { LikesSheet } from "./likes-sheet"
import { LikesText } from "./likes-text"
import { PostCarousel } from "./post-carousel"
import { usePostDetail } from "./use-post-detail"

const { width: SCREEN_WIDTH } = Dimensions.get("window")
const BANNER_HEIGHT = 120

interface PostDetailContentProps {
  post: Post | null | undefined
  isLoading: boolean
  autoOpenComments: boolean
  scrollToCommentId?: string
}

export function PostDetailContent({
  post,
  isLoading,
  autoOpenComments,
  scrollToCommentId,
}: PostDetailContentProps) {
  const router = useRouter()
  const [text, textSecondary, textTertiary] = useCSSVariable([
    "--color-text",
    "--color-text-secondary",
    "--color-text-tertiary",
  ]) as [string, string, string]
  const {
    commentsSheetRef,
    likesSheetRef,
    openComments,
    closeComments,
    openLikes,
    closeLikes,
    handleDoubleTap,
    handleToggleLike,
  } = usePostDetail(post, autoOpenComments)

  if (isLoading) {
    return (
      <View className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={textSecondary} />
        </View>
      </View>
    )
  }

  if (!post) {
    return (
      <View className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center">
          <Text className="text-sm text-text-secondary">Post not found</Text>
        </View>
      </View>
    )
  }

  const author = post.user

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
      >
        {post.aestheticBannerUrl && (
          <View className="mx-4 my-3 rounded-xl overflow-hidden">
            <SkeletonImage
              source={{ uri: post.aestheticBannerUrl }}
              style={{ width: SCREEN_WIDTH - 32, height: BANNER_HEIGHT }}
            />
          </View>
        )}

        <PostCarousel images={post.images} onImageTap={handleDoubleTap} />

        <View className="p-4">
          <View className="flex-row gap-4 mb-3">
            <TouchableOpacity onPress={handleToggleLike} className="p-0.5">
              <Heart
                size={26}
                color={post.hasLiked ? "#ed4956" : text}
                fill={post.hasLiked ? "#ed4956" : "transparent"}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={openComments}
              className="flex-row items-center p-0.5 gap-1"
            >
              <MessageCircle size={26} color={text} />
              {post.commentCount > 0 && (
                <Text className="text-[15px] font-semibold text-text">
                  {post.commentCount}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <LikesText post={post} color={text} onOpenLikes={openLikes} />

          <View className="mb-2">
            <TouchableOpacity
              className="flex-row items-center gap-2 mb-1"
              onPress={() => router.push(`/profile/${post.userId}`)}
            >
              {author?.avatarUrl ? (
                <StyledImage
                  source={{ uri: author.avatarUrl }}
                  className="w-6 h-6 rounded-full"
                  cachePolicy={IMAGE_CACHE_POLICY}
                />
              ) : (
                <View className="w-6 h-6 rounded-full items-center justify-center bg-border-light">
                  <User size={12} color={textTertiary} />
                </View>
              )}
              <Text className="font-semibold text-sm text-text">
                {author?.handle || "Unknown"}
              </Text>
            </TouchableOpacity>
            {post.caption && (
              <Text className="text-[15px] leading-[22px] text-text">
                {post.caption}
              </Text>
            )}
          </View>

          <Text className="text-xs uppercase text-text-tertiary">
            {formatFullDate(post.createdAt)}
          </Text>
        </View>
      </ScrollView>

      <CommentsSheet
        sheetRef={commentsSheetRef}
        postId={post.id}
        scrollToCommentId={scrollToCommentId}
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
