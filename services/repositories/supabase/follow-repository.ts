import { PAGE_SIZE } from "../mappers/pagination-utils"
import { mapProfile } from "../mappers/profile-mapper"
import {
  FollowRepository,
  FollowResult,
  PaginatedResult,
  Profile,
} from "../types"

import { supabase } from "./client"
import { notificationRepository } from "./notification-repository"

export const followRepository: FollowRepository = {
  async follow(followerId: string, targetId: string): Promise<FollowResult> {
    // Check if target has private account
    const { data: targetProfile } = await supabase
      .from("profiles")
      .select("is_private")
      .eq("id", targetId)
      .single()

    if (targetProfile?.is_private) {
      // Create follow request instead
      const { error } = await supabase.from("follow_requests").insert({
        requester_id: followerId,
        target_id: targetId,
        status: "pending",
      })

      if (error) {
        return { status: "error", error: error.message }
      }

      // Notify target of follow request
      notificationRepository.createNotification({
        userId: targetId,
        type: "follow_request",
        actorId: followerId,
      })

      return { status: "requested" }
    }

    // Direct follow for public accounts
    const { error } = await supabase.from("follows").insert({
      follower_id: followerId,
      following_id: targetId,
      status: "active",
    })

    if (error) {
      return { status: "error", error: error.message }
    }

    // Notify target of new follower
    notificationRepository.createNotification({
      userId: targetId,
      type: "follow",
      actorId: followerId,
    })

    return { status: "following" }
  },

  async unfollow(
    followerId: string,
    targetId: string,
  ): Promise<{ error?: string }> {
    // Remove follow
    const { error: followError } = await supabase
      .from("follows")
      .delete()
      .eq("follower_id", followerId)
      .eq("following_id", targetId)

    // Also remove any pending request
    await supabase
      .from("follow_requests")
      .delete()
      .eq("requester_id", followerId)
      .eq("target_id", targetId)

    if (followError) {
      return { error: followError.message }
    }

    return {}
  },

  async getFollowers(
    userId: string,
    cursor?: string,
  ): Promise<PaginatedResult<Profile>> {
    let query = supabase
      .from("follows")
      .select(
        `
        created_at,
        profiles!follows_follower_id_fkey(*)
      `,
      )
      .eq("following_id", userId)
      .eq("status", "active")
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
    const followers = data
      .slice(0, PAGE_SIZE)
      .map((f) => mapProfile(f.profiles))
    const nextCursor = hasMore ? data[PAGE_SIZE - 1].created_at : null

    return { data: followers, nextCursor, hasMore }
  },

  async getFollowing(
    userId: string,
    cursor?: string,
  ): Promise<PaginatedResult<Profile>> {
    let query = supabase
      .from("follows")
      .select(
        `
        created_at,
        profiles!follows_following_id_fkey(*)
      `,
      )
      .eq("follower_id", userId)
      .eq("status", "active")
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
    const following = data
      .slice(0, PAGE_SIZE)
      .map((f) => mapProfile(f.profiles))
    const nextCursor = hasMore ? data[PAGE_SIZE - 1].created_at : null

    return { data: following, nextCursor, hasMore }
  },

  async getMutuals(
    userId: string,
    cursor?: string,
  ): Promise<PaginatedResult<Profile>> {
    // Get users where both follow each other
    // First get all users this person follows
    const { data: followingIds } = await supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", userId)
      .eq("status", "active")

    if (!followingIds || followingIds.length === 0) {
      return { data: [], nextCursor: null, hasMore: false }
    }

    const followingIdList = followingIds.map((f) => f.following_id)

    // Then find which of those also follow back
    let query = supabase
      .from("follows")
      .select(
        `
        created_at,
        profiles!follows_follower_id_fkey(*)
      `,
      )
      .eq("following_id", userId)
      .eq("status", "active")
      .in("follower_id", followingIdList)
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
    const mutuals = data.slice(0, PAGE_SIZE).map((f) => mapProfile(f.profiles))
    const nextCursor = hasMore ? data[PAGE_SIZE - 1].created_at : null

    return { data: mutuals, nextCursor, hasMore }
  },

  async getFollowStatus(
    followerId: string,
    targetId: string,
  ): Promise<"following" | "requested" | "none"> {
    // Check for active follow
    const { data: follow } = await supabase
      .from("follows")
      .select("status")
      .eq("follower_id", followerId)
      .eq("following_id", targetId)
      .single()

    if (follow?.status === "active") return "following"

    // Check for pending request
    const { data: request } = await supabase
      .from("follow_requests")
      .select("status")
      .eq("requester_id", followerId)
      .eq("target_id", targetId)
      .eq("status", "pending")
      .single()

    if (request) return "requested"

    return "none"
  },

  async getPendingRequests(userId: string): Promise<Profile[]> {
    const { data, error } = await supabase
      .from("follow_requests")
      .select(
        `
        profiles!follow_requests_requester_id_fkey(*)
      `,
      )
      .eq("target_id", userId)
      .eq("status", "pending")
      .order("created_at", { ascending: false })

    if (error || !data) return []

    return data.map((r) => mapProfile(r.profiles))
  },

  async acceptFollowRequest(requesterId: string): Promise<{ error?: string }> {
    const { data: session } = await supabase.auth.getSession()
    const targetId = session?.session?.user?.id

    if (!targetId) {
      return { error: "Not authenticated" }
    }

    const { error: followError } = await supabase.from("follows").insert({
      follower_id: requesterId,
      following_id: targetId,
      status: "active",
    })

    if (followError) {
      return { error: followError.message }
    }

    const { error: updateError } = await supabase
      .from("follow_requests")
      .update({ status: "accepted", responded_at: new Date().toISOString() })
      .eq("requester_id", requesterId)
      .eq("target_id", targetId)

    if (updateError) {
      return { error: updateError.message }
    }

    return {}
  },

  async rejectFollowRequest(requesterId: string): Promise<{ error?: string }> {
    const { data: session } = await supabase.auth.getSession()
    const targetId = session?.session?.user?.id

    if (!targetId) {
      return { error: "Not authenticated" }
    }

    const { error: updateError } = await supabase
      .from("follow_requests")
      .update({ status: "rejected", responded_at: new Date().toISOString() })
      .eq("requester_id", requesterId)
      .eq("target_id", targetId)

    if (updateError) {
      return { error: updateError.message }
    }

    return {}
  },
}
