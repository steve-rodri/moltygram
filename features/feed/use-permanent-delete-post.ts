import * as Sentry from "@sentry/react-native"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import { useAuth } from "@lib/contexts/auth-context"

import { postRepository } from "../../services/repositories/supabase"
import { DeletedPost } from "../../services/repositories/types"

import { postKeys } from "./post-keys"

export function usePermanentDeletePost() {
  const { session } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (postId: string) => {
      const result = await postRepository.permanentlyDeletePost(postId)
      if (result.error) {
        throw new Error(result.error)
      }
      return result
    },
    onMutate: async (postId) => {
      const userId = session?.user?.id
      if (!userId) return

      await queryClient.cancelQueries({
        queryKey: postKeys.recentlyDeleted(userId),
      })

      const previousDeleted = queryClient.getQueryData(
        postKeys.recentlyDeleted(userId),
      )

      const removeFromDeleted = (old: any) => {
        if (!old) return old
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            data: page.data.filter((p: DeletedPost) => p.id !== postId),
          })),
        }
      }

      queryClient.setQueryData(
        postKeys.recentlyDeleted(userId),
        removeFromDeleted,
      )

      return { previousDeleted, userId }
    },
    onError: (error, postId, context) => {
      Sentry.captureException(error, {
        tags: { mutation: "permanentDeletePost" },
        extra: { postId },
      })
      if (context?.previousDeleted && context?.userId) {
        queryClient.setQueryData(
          postKeys.recentlyDeleted(context.userId),
          context.previousDeleted,
        )
      }
    },
  })
}
