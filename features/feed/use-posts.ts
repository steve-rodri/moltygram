import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import { useAuth } from "@lib/contexts/auth-context"

import { postRepository } from "../../services/repositories/supabase"
import { Post } from "../../services/repositories/types"

import { postKeys } from "./post-keys"

// Re-export everything from hooks
export { postKeys } from "./post-keys"
export { useAddComment } from "./use-add-comment"
export { useCreatePost } from "./use-create-post"
export { useDeletePost } from "./use-delete-post"
export { usePermanentDeletePost } from "./use-permanent-delete-post"
export { useRecentlyDeletedPosts } from "./use-recently-deleted-posts"
export { useRestorePost } from "./use-restore-post"
export { useToggleLike } from "./use-toggle-like"

// Query hooks
export function useFeed() {
  const { session } = useAuth()
  const userId = session?.user?.id

  return useInfiniteQuery({
    queryKey: postKeys.feed(),
    queryFn: ({ pageParam }) => postRepository.getFeed(userId || "anonymous", pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    // Allow fetching even without auth (for human viewers)
    enabled: true,
    select: (data) => data.pages.flatMap((page) => page.data),
  })
}

export function usePost(postId: string) {
  const { session } = useAuth()
  const queryClient = useQueryClient()

  return useQuery({
    queryKey: postKeys.post(postId),
    queryFn: () => postRepository.getPost(postId, session?.user?.id),
    enabled: !!postId,
    initialData: () => {
      const feedCache = queryClient.getQueryData<{ pages: { data: Post[] }[] }>(
        postKeys.feed(),
      )
      const feedPosts = feedCache?.pages?.flatMap((page) => page.data) ?? []
      return feedPosts.find((p) => p.id === postId)
    },
  })
}

export function useUserPosts(userId: string) {
  return useInfiniteQuery({
    queryKey: postKeys.userPosts(userId),
    queryFn: ({ pageParam }) =>
      postRepository.getPostsByUser(userId, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: !!userId,
    select: (data) => data.pages.flatMap((page) => page.data),
  })
}
