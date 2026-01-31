import { useCallback, useEffect, useMemo, useState } from "react"
import { ActivityIndicator, Text, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import {
  BottomSheetBackdrop,
  BottomSheetFooter,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet"
import { useRouter } from "expo-router"
import { useCSSVariable } from "uniwind"

import { useAuth } from "@lib/contexts/auth-context"

import { CommentInput } from "../../features/comments/comment-input"
import { CommentItem } from "../../features/comments/comment-item"
import { commentRepository } from "../../services/repositories/supabase"
import { Comment } from "../../services/repositories/types"

interface CommentsSheetProps {
  sheetRef: React.RefObject<BottomSheetModal | null>
  postId: string
  scrollToCommentId?: string
  onClose: () => void
}

export function CommentsSheet({
  sheetRef,
  postId,
  scrollToCommentId,
  onClose,
}: CommentsSheetProps) {
  const router = useRouter()
  const [background, text, textSecondary, textTertiary] = useCSSVariable([
    "--color-background",
    "--color-text",
    "--color-text-secondary",
    "--color-text-tertiary",
  ]) as [string, string, string, string]
  const { session } = useAuth()
  const insets = useSafeAreaInsets()

  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null)

  const snapPoints = useMemo(() => ["65%", "92%"], [])

  const loadComments = useCallback(async () => {
    if (!postId) return
    setIsLoading(true)
    try {
      const result = await commentRepository.getComments(postId)
      setComments(result.data)
    } catch {
      // Failed to load comments
    } finally {
      setIsLoading(false)
    }
  }, [postId])

  useEffect(() => {
    if (postId) loadComments()
  }, [postId, loadComments])

  const handleUserPress = (userId: string) => {
    onClose()
    router.push(`/profile/${userId}`)
  }

  const handleLike = async (commentId: string) => {
    if (!session) return
    try {
      await commentRepository.toggleCommentLike(commentId, session.user.id)
    } catch {
      // Failed to toggle like
    }
  }

  const handleSubmit = async (text: string, parentId?: string) => {
    if (!session) return
    const newComment = await commentRepository.addComment(
      postId,
      session.user.id,
      text,
      parentId,
    )

    if (parentId) {
      // Update reply count for parent comment
      setComments((prev) =>
        prev.map((c) =>
          c.id === parentId ? { ...c, replyCount: c.replyCount + 1 } : c,
        ),
      )
    } else {
      // Add new top-level comment
      setComments((prev) => [...prev, newComment])
    }
  }

  const renderFooter = useCallback(
    (props: any) => (
      <BottomSheetFooter {...props} bottomInset={insets.bottom}>
        <CommentInput
          replyingTo={replyingTo}
          onCancelReply={() => setReplyingTo(null)}
          onSubmit={handleSubmit}
        />
      </BottomSheetFooter>
    ),
    [insets.bottom, replyingTo, handleSubmit],
  )

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        pressBehavior="close"
      />
    ),
    [],
  )

  return (
    <BottomSheetModal
      ref={sheetRef}
      index={0}
      snapPoints={snapPoints}
      enableDynamicSizing={false}
      onDismiss={onClose}
      enablePanDownToClose
      keyboardBehavior="extend"
      android_keyboardInputMode="adjustResize"
      backgroundStyle={{ backgroundColor: background }}
      handleIndicatorStyle={{ backgroundColor: textTertiary }}
      backdropComponent={renderBackdrop}
      footerComponent={renderFooter}
    >
      <View className="items-center py-3">
        <Text className="text-base font-semibold" style={{ color: text }}>
          Comments
        </Text>
      </View>

      <BottomSheetScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingBottom: 16 }}
      >
        {isLoading ? (
          <View className="py-12 items-center">
            <ActivityIndicator size="small" color={textSecondary} />
          </View>
        ) : comments.length === 0 ? (
          <View className="items-center py-12">
            <Text className="text-base font-semibold mb-1 text-text-secondary">
              No comments yet
            </Text>
            <Text className="text-sm text-text-tertiary">
              Be the first to comment
            </Text>
          </View>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              isHighlighted={comment.id === scrollToCommentId}
              onLike={handleLike}
              onReply={setReplyingTo}
              onUserPress={handleUserPress}
            />
          ))
        )}
      </BottomSheetScrollView>
    </BottomSheetModal>
  )
}
