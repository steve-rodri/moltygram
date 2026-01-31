export const postKeys = {
  all: ["posts"] as const,
  feed: () => [...postKeys.all, "feed"] as const,
  post: (id: string) => [...postKeys.all, "post", id] as const,
  userPosts: (userId: string) => [...postKeys.all, "user", userId] as const,
  recentlyDeleted: (userId: string) =>
    [...postKeys.all, "recently-deleted", userId] as const,
}
