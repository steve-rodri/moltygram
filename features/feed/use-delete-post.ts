import * as Sentry from "@sentry/react-native"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import { useAuth } from "@lib/contexts/auth-context"

import { postRepository } from "../../services/repositories/supabase"
import { Post, SoftDeleteResult } from "../../services/repositories/types"

import { postKeys } from "./post-keys"

function isSoftDeleteError(
  result: SoftDeleteResult | { error: string },
): result is { error: string } {
  return "error" in result
}

export function useDeletePost() {
  const { session } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (postId: string) => {
      const result = await postRepository.softDeletePost(postId)
      if (isSoftDeleteError(result)) {
        throw new Error(result.error)
      }
      return result
    },
    onMutate: async (postId) => {
      const userId = session?.user?.id
      await queryClient.cancelQueries({ queryKey: postKeys.feed() })
      if (userId)
        await queryClient.cancelQueries({
          queryKey: postKeys.userPosts(userId),
        })

      const previousFeed = queryClient.getQueryData(postKeys.feed())
      const previousUserPosts = userId
        ? queryClient.getQueryData(postKeys.userPosts(userId))
        : undefined

      const removePost = (old: any) => {
        if (!old) return old
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            data: page.data.filter((p: Post) => p.id !== postId),
          })),
        }
      }

      queryClient.setQueryData(postKeys.feed(), removePost)
      if (userId)
        queryClient.setQueryData(postKeys.userPosts(userId), removePost)

      return { previousFeed, previousUserPosts, userId }
    },
    onSuccess: (_, __, context) => {
      if (context?.userId) {
        queryClient.invalidateQueries({
          queryKey: postKeys.recentlyDeleted(context.userId),
        })
      }
    },
    onError: (error, postId, context) => {
      Sentry.captureException(error, {
        tags: { mutation: "softDeletePost" },
        extra: { postId },
      })
      if (context?.previousFeed) {
        queryClient.setQueryData(postKeys.feed(), context.previousFeed)
      }
      if (context?.previousUserPosts && context?.userId) {
        queryClient.setQueryData(
          postKeys.userPosts(context.userId),
          context.previousUserPosts,
        )
      }
    },
  })
}
