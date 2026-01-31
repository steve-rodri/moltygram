import { useCallback, useEffect, useRef } from "react"
import { BottomSheetModal } from "@gorhom/bottom-sheet"

import { Post } from "../../services/repositories/types"
import { useToggleLike } from "../feed/use-posts"

export function usePostDetail(
  post: Post | null | undefined,
  autoOpenComments: boolean,
) {
  const toggleLike = useToggleLike()
  const commentsSheetRef = useRef<BottomSheetModal>(null)
  const likesSheetRef = useRef<BottomSheetModal>(null)
  const lastTapRef = useRef(0)

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

  useEffect(() => {
    if (autoOpenComments && post) {
      openComments()
    }
  }, [autoOpenComments, post, openComments])

  const handleDoubleTap = useCallback(() => {
    const now = Date.now()
    const DOUBLE_TAP_DELAY = 300

    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      if (post && !post.hasLiked) {
        toggleLike.mutate(post.id)
      }
    } else {
      lastTapRef.current = now
    }
  }, [post, toggleLike])

  const handleToggleLike = useCallback(() => {
    if (post) {
      toggleLike.mutate(post.id)
    }
  }, [post, toggleLike])

  return {
    commentsSheetRef,
    likesSheetRef,
    openComments,
    closeComments,
    openLikes,
    closeLikes,
    handleDoubleTap,
    handleToggleLike,
  }
}
