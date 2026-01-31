import * as Sentry from "@sentry/react-native"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import { useAuth } from "@lib/contexts/auth-context"

import { commentRepository } from "../../services/repositories/supabase"
import { Post } from "../../services/repositories/types"

import { postKeys } from "./post-keys"

export function useAddComment() {
  const { session } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      postId,
      text,
      parentId,
    }: {
      postId: string
      text: string
      parentId?: string
    }) =>
      commentRepository.addComment(postId, session!.user.id, text, parentId),
    onSuccess: (_, { postId, parentId }) => {
      if (!parentId) {
        const updateCommentCount = (post: Post) => ({
          ...post,
          commentCount: post.commentCount + 1,
        })

        queryClient.setQueryData(postKeys.feed(), (old: any) => {
          if (!old) return old
          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              data: page.data.map((p: Post) =>
                p.id === postId ? updateCommentCount(p) : p,
              ),
            })),
          }
        })

        queryClient.setQueryData(
          postKeys.post(postId),
          (old: Post | undefined) => {
            if (!old) return old
            return updateCommentCount(old)
          },
        )
      }
    },
    onError: (error, variables) => {
      Sentry.captureException(error, {
        tags: { mutation: "addComment" },
        extra: { postId: variables.postId, isReply: !!variables.parentId },
      })
    },
  })
}
