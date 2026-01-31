import { mapProfile } from "../mappers/profile-mapper"
import {
  Comment,
  CommentLikeResult,
  CommentRepository,
  PaginatedResult,
} from "../types"

import { supabase } from "./client"
import { notificationRepository } from "./notification-repository"
import { userRepository } from "./user-repository"

const PAGE_SIZE = 30

function mapComment(data: any, currentUserId?: string): Comment {
  const hasLiked =
    currentUserId && data.comment_likes
      ? data.comment_likes.some((like: any) => like.user_id === currentUserId)
      : false

  return {
    id: data.id,
    postId: data.post_id,
    userId: data.user_id,
    user: data.profiles ? mapProfile(data.profiles) : undefined,
    text: data.text,
    parentId: data.parent_id || undefined,
    likeCount: data.like_count || 0,
    replyCount: data.reply_count || 0,
    hasLiked,
    createdAt: data.created_at,
  }
}

async function getCurrentUserId(): Promise<string | undefined> {
  const { data } = await supabase.auth.getSession()
  return data.session?.user?.id
}

export const commentRepository: CommentRepository = {
  async getComments(
    postId: string,
    cursor?: string,
  ): Promise<PaginatedResult<Comment>> {
    const currentUserId = await getCurrentUserId()

    let query = supabase
      .from("comments")
      .select(
        `
        *,
        profiles!comments_user_id_fkey(*),
        comment_likes(user_id)
      `,
      )
      .eq("post_id", postId)
      .is("parent_id", null)
      .order("created_at", { ascending: true })
      .limit(PAGE_SIZE + 1)

    if (cursor) {
      query = query.gt("created_at", cursor)
    }

    const { data, error } = await query

    if (error || !data) {
      return { data: [], nextCursor: null, hasMore: false }
    }

    const hasMore = data.length > PAGE_SIZE
    const comments = data
      .slice(0, PAGE_SIZE)
      .map((d) => mapComment(d, currentUserId))
    const nextCursor = hasMore ? comments[comments.length - 1].createdAt : null

    return { data: comments, nextCursor, hasMore }
  },

  async getReplies(commentId: string): Promise<Comment[]> {
    const currentUserId = await getCurrentUserId()

    const { data, error } = await supabase
      .from("comments")
      .select(
        `
        *,
        profiles!comments_user_id_fkey(*),
        comment_likes(user_id)
      `,
      )
      .eq("parent_id", commentId)
      .order("created_at", { ascending: true })

    if (error || !data) return []
    return data.map((d) => mapComment(d, currentUserId))
  },

  async addComment(
    postId: string,
    userId: string,
    text: string,
    parentId?: string,
  ): Promise<Comment> {
    const insertData: any = { post_id: postId, user_id: userId, text }
    if (parentId) insertData.parent_id = parentId

    const { data, error } = await supabase
      .from("comments")
      .insert(insertData)
      .select(
        `
        *,
        profiles!comments_user_id_fkey(*),
        comment_likes(user_id)
      `,
      )
      .single()

    if (error) throw new Error(error.message)

    // Create notifications
    if (parentId) {
      // Reply: notify the parent comment author
      const { data: parentComment } = await supabase
        .from("comments")
        .select("user_id")
        .eq("id", parentId)
        .single()

      if (parentComment) {
        notificationRepository.createNotification({
          userId: parentComment.user_id,
          type: "comment",
          actorId: userId,
          postId,
          commentId: data.id,
        })
      }
    } else {
      // Top-level comment: notify post owner
      const { data: post } = await supabase
        .from("posts")
        .select("user_id")
        .eq("id", postId)
        .single()

      if (post) {
        notificationRepository.createNotification({
          userId: post.user_id,
          type: "comment",
          actorId: userId,
          postId,
          commentId: data.id,
        })
      }
    }

    // Parse and notify @mentions
    const mentionRegex = /@(\w+)/g
    const mentions = [...text.matchAll(mentionRegex)]

    for (const match of mentions) {
      const handle = match[1]
      const mentionedUser = await userRepository.getProfileByHandle(handle)
      if (mentionedUser && mentionedUser.id !== userId) {
        notificationRepository.createNotification({
          userId: mentionedUser.id,
          type: "mention",
          actorId: userId,
          postId,
          commentId: data.id,
        })
      }
    }

    return mapComment(data, userId)
  },

  async deleteComment(commentId: string): Promise<{ error?: string }> {
    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId)
    if (error) return { error: error.message }
    return {}
  },

  async toggleCommentLike(
    commentId: string,
    userId: string,
  ): Promise<CommentLikeResult> {
    // Check if already liked
    const { data: existing } = await supabase
      .from("comment_likes")
      .select("id")
      .eq("comment_id", commentId)
      .eq("user_id", userId)
      .single()

    if (existing) {
      await supabase.from("comment_likes").delete().eq("id", existing.id)
    } else {
      await supabase
        .from("comment_likes")
        .insert({ comment_id: commentId, user_id: userId })

      // Notify comment author
      const { data: comment } = await supabase
        .from("comments")
        .select("user_id, post_id")
        .eq("id", commentId)
        .single()

      if (comment) {
        notificationRepository.createNotification({
          userId: comment.user_id,
          type: "like",
          actorId: userId,
          postId: comment.post_id,
          commentId,
        })
      }
    }

    // Get updated count
    const { data: updated } = await supabase
      .from("comments")
      .select("like_count")
      .eq("id", commentId)
      .single()

    return {
      liked: !existing,
      likeCount: updated?.like_count || 0,
    }
  },
}
