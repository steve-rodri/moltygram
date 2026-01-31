import * as Sentry from "@sentry/react-native"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import { useAuth } from "@lib/contexts/auth-context"

import { moltbookClient } from "../../services/repositories/moltbook"
import {
  postRepository,
  storageRepository,
} from "../../services/repositories/supabase"
import { Post } from "../../services/repositories/types"

import { postKeys } from "./post-keys"

interface CreatePostParams {
  images: string[]
  caption?: string
  aestheticBannerUrl?: string
  crossPostToMoltbook?: boolean
}

export function useCreatePost() {
  const { session, profile } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      images,
      caption,
      aestheticBannerUrl,
      crossPostToMoltbook,
    }: CreatePostParams) => {
      if (!session) throw new Error("Not authenticated")

      const uploadedUrls: string[] = []
      for (let i = 0; i < images.length; i++) {
        const path = `${session.user.id}/post_${Date.now()}_${i}.jpg`
        const result = await storageRepository.uploadImage(
          images[i],
          "posts",
          path,
        )
        if (result.url) uploadedUrls.push(result.url)
      }

      let uploadedBannerUrl: string | undefined
      if (aestheticBannerUrl) {
        const path = `${session.user.id}/aesthetic_${Date.now()}.jpg`
        const result = await storageRepository.uploadImage(
          aestheticBannerUrl,
          "posts",
          path,
        )
        uploadedBannerUrl = result.url
      }

      const post = await postRepository.createPost(session.user.id, {
        images: uploadedUrls,
        caption,
        aestheticBannerUrl: uploadedBannerUrl,
      })

      // Cross-post to Moltbook if enabled
      if (crossPostToMoltbook && uploadedUrls.length > 0) {
        try {
          const moltbookContent = caption
            ? `${caption}\n\n📸 Posted on Moltygram`
            : "📸 New photo on Moltygram"

          await moltbookClient.createPost(moltbookContent, uploadedUrls)
        } catch (error) {
          // Don't fail the whole post if Moltbook cross-post fails
          Sentry.captureException(error, {
            tags: { feature: "crossPostToMoltbook" },
            extra: { postId: post.id },
          })
        }
      }

      return post
    },
    onMutate: async ({ images, caption, aestheticBannerUrl }) => {
      if (!session || !profile) return

      await queryClient.cancelQueries({ queryKey: postKeys.feed() })
      const previousFeed = queryClient.getQueryData(postKeys.feed())

      const optimisticPost: Post = {
        id: `temp_${Date.now()}`,
        userId: session.user.id,
        user: profile,
        images,
        caption,
        aestheticBannerUrl,
        likeCount: 0,
        commentCount: 0,
        hasLiked: false,
        createdAt: new Date().toISOString(),
      }

      queryClient.setQueryData(postKeys.feed(), (old: any) => {
        if (!old)
          return {
            pages: [
              { data: [optimisticPost], nextCursor: null, hasMore: false },
            ],
            pageParams: [undefined],
          }
        return {
          ...old,
          pages: [
            { ...old.pages[0], data: [optimisticPost, ...old.pages[0].data] },
            ...old.pages.slice(1),
          ],
        }
      })

      return { previousFeed, optimisticId: optimisticPost.id }
    },
    onSuccess: (newPost, _, context) => {
      queryClient.setQueryData(postKeys.feed(), (old: any) => {
        if (!old) return old
        return {
          ...old,
          pages: old.pages.map((page: any, i: number) =>
            i === 0
              ? {
                  ...page,
                  data: page.data.map((p: Post) =>
                    p.id === context?.optimisticId ? newPost : p,
                  ),
                }
              : page,
          ),
        }
      })
      queryClient.invalidateQueries({
        queryKey: postKeys.userPosts(newPost.userId),
      })
    },
    onError: (error, variables, context) => {
      Sentry.captureException(error, {
        tags: { mutation: "createPost" },
        extra: {
          imageCount: variables.images.length,
          hasCaption: !!variables.caption,
        },
      })
      if (context?.previousFeed) {
        queryClient.setQueryData(postKeys.feed(), context.previousFeed)
      }
    },
  })
}
