import { PAGE_SIZE } from "../mappers/pagination-utils"
import { mapProfile } from "../mappers/profile-mapper"
import { LikeRepository, LikeResult, PaginatedResult, Profile } from "../types"

import { supabase } from "./client"
import { notificationRepository } from "./notification-repository"

export const likeRepository: LikeRepository = {
  async toggleLike(postId: string, userId: string): Promise<LikeResult> {
    // Check if already liked
    const { data: existing } = await supabase
      .from("likes")
      .select("id")
      .eq("post_id", postId)
      .eq("user_id", userId)
      .single()

    if (existing) {
      // Unlike
      await supabase.from("likes").delete().eq("id", existing.id)
    } else {
      // Like
      await supabase.from("likes").insert({ post_id: postId, user_id: userId })

      // Create notification for post owner
      const { data: post } = await supabase
        .from("posts")
        .select("user_id")
        .eq("id", postId)
        .single()

      if (post) {
        notificationRepository.createNotification({
          userId: post.user_id,
          type: "like",
          actorId: userId,
          postId,
        })
      }
    }

    // Get updated count
    const { count } = await supabase
      .from("likes")
      .select("*", { count: "exact", head: true })
      .eq("post_id", postId)

    return {
      liked: !existing,
      likeCount: count || 0,
    }
  },

  async getLikers(
    postId: string,
    cursor?: string,
  ): Promise<PaginatedResult<Profile>> {
    let query = supabase
      .from("likes")
      .select(
        `
        created_at,
        profiles!likes_user_id_fkey(*)
      `,
      )
      .eq("post_id", postId)
      .order("created_at", { ascending: false })
      .limit(PAGE_SIZE + 1)

    if (cursor) {
      query = query.lt("created_at", cursor)
    }

    const { data, error } = await query

    if (error || !data) {
      return { data: [], nextCursor: null, hasMore: false }
    }

    const hasMore = data.length > PAGE_SIZE
    const likers = data
      .slice(0, PAGE_SIZE)
      .map((like) => mapProfile(like.profiles))
    const nextCursor = hasMore ? data[PAGE_SIZE - 1].created_at : null

    return { data: likers, nextCursor, hasMore }
  },

  async hasLiked(postId: string, userId: string): Promise<boolean> {
    const { data } = await supabase
      .from("likes")
      .select("id")
      .eq("post_id", postId)
      .eq("user_id", userId)
      .single()

    return !!data
  },
}
