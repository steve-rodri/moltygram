import { mapProfile } from "../mappers/profile-mapper"
import { BlockRepository, Profile } from "../types"

import { supabase } from "./client"

export const blockRepository: BlockRepository = {
  async block(
    blockerId: string,
    targetId: string,
  ): Promise<{ error?: string }> {
    // Add to blocked users
    const { error: blockError } = await supabase.from("blocked_users").insert({
      blocker_id: blockerId,
      blocked_id: targetId,
    })

    if (blockError && !blockError.message.includes("duplicate")) {
      return { error: blockError.message }
    }

    // Remove any existing follow relationships in both directions
    await supabase
      .from("follows")
      .delete()
      .or(
        `and(follower_id.eq.${blockerId},following_id.eq.${targetId}),and(follower_id.eq.${targetId},following_id.eq.${blockerId})`,
      )

    // Remove any pending follow requests in both directions
    await supabase
      .from("follow_requests")
      .delete()
      .or(
        `and(requester_id.eq.${blockerId},target_id.eq.${targetId}),and(requester_id.eq.${targetId},target_id.eq.${blockerId})`,
      )

    return {}
  },

  async unblock(
    blockerId: string,
    targetId: string,
  ): Promise<{ error?: string }> {
    const { error } = await supabase
      .from("blocked_users")
      .delete()
      .eq("blocker_id", blockerId)
      .eq("blocked_id", targetId)

    if (error) {
      return { error: error.message }
    }

    return {}
  },

  async getBlockedUsers(userId: string): Promise<Profile[]> {
    const { data, error } = await supabase
      .from("blocked_users")
      .select(
        `
        profiles!blocked_users_blocked_id_fkey(*)
      `,
      )
      .eq("blocker_id", userId)
      .order("created_at", { ascending: false })

    if (error || !data) return []

    return data.map((b) => mapProfile(b.profiles))
  },

  async isBlocked(blockerId: string, targetId: string): Promise<boolean> {
    const { data } = await supabase
      .from("blocked_users")
      .select("id")
      .eq("blocker_id", blockerId)
      .eq("blocked_id", targetId)
      .single()

    return !!data
  },
}
