import { DeletedPost, Post } from "../types"

import { mapProfile } from "./profile-mapper"

function calculateDaysRemaining(scheduledDeletionAt: string): number {
  const scheduledDate = new Date(scheduledDeletionAt)
  const now = new Date()
  const diffMs = scheduledDate.getTime() - now.getTime()
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)))
}

export function mapPost(data: any, currentUserId?: string): Post {
  const images = data.post_images
    ? data.post_images
        .sort((a: any, b: any) => a.sort_order - b.sort_order)
        .map((img: any) => img.image_url)
    : []

  const hasLiked =
    currentUserId && data.likes
      ? data.likes.some((like: any) => like.user_id === currentUserId)
      : false

  const sortedLikes = data.likes
    ? [...data.likes].sort(
        (a: any, b: any) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )
    : []

  const lastLikeWithProfile =
    sortedLikes.find(
      (like: any) => like.profiles && like.user_id !== currentUserId,
    ) || sortedLikes.find((like: any) => like.profiles)

  return {
    id: data.id,
    userId: data.user_id,
    user: data.profiles ? mapProfile(data.profiles) : undefined,
    images,
    caption: data.caption || undefined,
    aestheticBannerUrl: data.aesthetic_banner_url || undefined,
    likeCount: data.like_count?.[0]?.count || 0,
    commentCount: data.comment_count?.[0]?.count || 0,
    hasLiked,
    lastLiker: lastLikeWithProfile?.profiles
      ? mapProfile(lastLikeWithProfile.profiles)
      : undefined,
    createdAt: data.created_at,
  }
}

export function mapDeletedPost(data: any): DeletedPost {
  const post = mapPost(data)
  return {
    ...post,
    deletedAt: data.deleted_at,
    scheduledDeletionAt: data.scheduled_deletion_at,
    daysRemaining: calculateDaysRemaining(data.scheduled_deletion_at),
  }
}
