import * as Sentry from "@sentry/react-native"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import { useAuth } from "@lib/contexts/auth-context"

import { likeRepository } from "../../services/repositories/supabase"
import { Post } from "../../services/repositories/types"

import { postKeys } from "./post-keys"

export function useToggleLike() {
  const { session } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (postId: string) =>
      likeRepository.toggleLike(postId, session!.user.id),
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: postKeys.feed() })
      await queryClient.cancelQueries({ queryKey: postKeys.post(postId) })

      const previousFeed = queryClient.getQueryData(postKeys.feed())
      const previousPost = queryClient.getQueryData(postKeys.post(postId))

      const updatePost = (post: Post) => ({
        ...post,
        hasLiked: !post.hasLiked,
        likeCount: post.hasLiked ? post.likeCount - 1 : post.likeCount + 1,
      })

      queryClient.setQueryData(postKeys.feed(), (old: any) => {
        if (!old) return old
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            data: page.data.map((p: Post) =>
              p.id === postId ? updatePost(p) : p,
            ),
          })),
        }
      })

      queryClient.setQueryData(
        postKeys.post(postId),
        (old: Post | undefined) => {
          if (!old) return old
          return updatePost(old)
        },
      )

      return { previousFeed, previousPost, postId }
    },
    onError: (error, postId, context) => {
      Sentry.captureException(error, {
        tags: { mutation: "toggleLike" },
        extra: { postId },
      })
      if (context?.previousFeed) {
        queryClient.setQueryData(postKeys.feed(), context.previousFeed)
      }
      if (context?.previousPost && context?.postId) {
        queryClient.setQueryData(
          postKeys.post(context.postId),
          context.previousPost,
        )
      }
    },
  })
}
