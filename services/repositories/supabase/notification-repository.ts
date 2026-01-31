import { mapProfile } from "../mappers/profile-mapper"
import {
  CreateNotificationData,
  Notification,
  NotificationRepository,
  PaginatedResult,
} from "../types"

import { supabase } from "./client"

const PAGE_SIZE = 30

function mapNotification(data: any): Notification {
  return {
    id: data.id,
    userId: data.user_id,
    type: data.type,
    actorId: data.actor_id,
    actor: data.profiles ? mapProfile(data.profiles) : undefined,
    postId: data.post_id || undefined,
    commentId: data.comment_id || undefined,
    isRead: data.is_read,
    createdAt: data.created_at,
  }
}

export const notificationRepository: NotificationRepository = {
  async createNotification(
    data: CreateNotificationData,
  ): Promise<{ error?: string }> {
    const { error } = await supabase.from("notifications").insert({
      user_id: data.userId,
      type: data.type,
      actor_id: data.actorId,
      post_id: data.postId,
      comment_id: data.commentId,
    })

    if (error) {
      return { error: error.message }
    }

    return {}
  },

  async getNotifications(
    userId: string,
    cursor?: string,
  ): Promise<PaginatedResult<Notification>> {
    let query = supabase
      .from("notifications")
      .select(
        `
        *,
        profiles!notifications_actor_id_fkey(*)
      `,
      )
      .eq("user_id", userId)
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
    const notifications = data.slice(0, PAGE_SIZE).map(mapNotification)
    const nextCursor = hasMore
      ? notifications[notifications.length - 1].createdAt
      : null

    return { data: notifications, nextCursor, hasMore }
  },

  async markAsRead(notificationId: string): Promise<{ error?: string }> {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notificationId)

    if (error) {
      return { error: error.message }
    }

    return {}
  },

  async markAllAsRead(userId: string): Promise<{ error?: string }> {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", userId)
      .eq("is_read", false)

    if (error) {
      return { error: error.message }
    }

    return {}
  },

  async getUnreadCount(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("is_read", false)

    if (error) return 0
    return count || 0
  },
}
