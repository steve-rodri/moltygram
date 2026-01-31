import { useInfiniteQuery } from "@tanstack/react-query"

import { useAuth } from "@lib/contexts/auth-context"

import { postRepository } from "../../services/repositories/supabase"

import { postKeys } from "./post-keys"

export function useRecentlyDeletedPosts() {
  const { session } = useAuth()
  const userId = session?.user?.id

  return useInfiniteQuery({
    queryKey: postKeys.recentlyDeleted(userId!),
    queryFn: ({ pageParam }) =>
      postRepository.getRecentlyDeleted(userId!, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: !!userId,
    select: (data) => data.pages.flatMap((page) => page.data),
  })
}
