import { mapDeletedPost, mapPost } from "../mappers/post-mapper"
import {
  CreatePostData,
  DeletedPost,
  PaginatedResult,
  Post,
  PostRepository,
  SoftDeleteResult,
} from "../types"

import { supabase } from "./client"
import { storageRepository } from "./storage-repository"

const SOFT_DELETE_DAYS = 30
const PAGE_SIZE = 20
const POSTS_BUCKET = "posts"
const POST_SELECT = `*, profiles!posts_user_id_fkey(*), post_images(*), likes(user_id, created_at, profiles:profiles!likes_user_id_fkey(*)), like_count:likes(count), comment_count:comments(count)`
const EMPTY_RESULT = { data: [], nextCursor: null, hasMore: false }

function extractStoragePath(url: string): string | null {
  const match = url.match(
    new RegExp(`/storage/v1/object/public/${POSTS_BUCKET}/(.+)$`),
  )
  return match ? match[1] : null
}

export const postRepository: PostRepository = {
  async getFeed(
    userId: string,
    cursor?: string,
  ): Promise<PaginatedResult<Post>> {
    let query = supabase
      .from("posts")
      .select(POST_SELECT)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(PAGE_SIZE + 1)
    if (cursor) query = query.lt("created_at", cursor)
    const { data, error } = await query
    if (error || !data) return EMPTY_RESULT
    const hasMore = data.length > PAGE_SIZE
    const posts = data.slice(0, PAGE_SIZE).map((post) => mapPost(post, userId))
    return {
      data: posts,
      nextCursor: hasMore ? posts[posts.length - 1].createdAt : null,
      hasMore,
    }
  },

  async getPost(postId: string, currentUserId?: string): Promise<Post | null> {
    const { data, error } = await supabase
      .from("posts")
      .select(POST_SELECT)
      .eq("id", postId)
      .is("deleted_at", null)
      .single()
    if (error || !data) return null
    return mapPost(data, currentUserId)
  },

  async getPostsByUser(
    userId: string,
    cursor?: string,
  ): Promise<PaginatedResult<Post>> {
    let query = supabase
      .from("posts")
      .select(POST_SELECT)
      .eq("user_id", userId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(PAGE_SIZE + 1)
    if (cursor) query = query.lt("created_at", cursor)
    const { data, error } = await query
    if (error || !data) return EMPTY_RESULT
    const hasMore = data.length > PAGE_SIZE
    const posts = data.slice(0, PAGE_SIZE).map((post) => mapPost(post, userId))
    return {
      data: posts,
      nextCursor: hasMore ? posts[posts.length - 1].createdAt : null,
      hasMore,
    }
  },

  async createPost(userId: string, postData: CreatePostData): Promise<Post> {
    // Create the post
    const { data: post, error: postError } = await supabase
      .from("posts")
      .insert({
        user_id: userId,
        caption: postData.caption,
        aesthetic_banner_url: postData.aestheticBannerUrl,
      })
      .select()
      .single()

    if (postError) throw new Error(postError.message)

    // Create post images
    if (postData.images.length > 0) {
      const imageInserts = postData.images.map((imageUrl, index) => ({
        post_id: post.id,
        image_url: imageUrl,
        sort_order: index,
      }))

      const { error: imageError } = await supabase
        .from("post_images")
        .insert(imageInserts)

      if (imageError) {
        // Rollback post creation if image insert fails
        await supabase.from("posts").delete().eq("id", post.id)
        throw new Error(imageError.message)
      }
    }

    // Fetch the complete post
    const createdPost = await this.getPost(post.id, userId)
    if (!createdPost) throw new Error("Failed to fetch created post")

    return createdPost
  },

  async softDeletePost(
    postId: string,
  ): Promise<SoftDeleteResult | { error: string }> {
    const now = new Date()
    const scheduledDeletion = new Date(
      now.getTime() + SOFT_DELETE_DAYS * 24 * 60 * 60 * 1000,
    )

    const { data, error } = await supabase
      .from("posts")
      .update({
        deleted_at: now.toISOString(),
        scheduled_deletion_at: scheduledDeletion.toISOString(),
      })
      .eq("id", postId)
      .select("deleted_at, scheduled_deletion_at")
      .single()

    if (error) {
      return { error: error.message }
    }

    return {
      deletedAt: data.deleted_at,
      scheduledDeletionAt: data.scheduled_deletion_at,
    }
  },

  async restorePost(postId: string): Promise<{ error?: string }> {
    const { error } = await supabase
      .from("posts")
      .update({
        deleted_at: null,
        scheduled_deletion_at: null,
      })
      .eq("id", postId)

    if (error) {
      return { error: error.message }
    }

    return {}
  },

  async getRecentlyDeleted(
    userId: string,
    cursor?: string,
  ): Promise<PaginatedResult<DeletedPost>> {
    const deletedSelect = `*, profiles!posts_user_id_fkey(*), post_images(*)`
    let query = supabase
      .from("posts")
      .select(deletedSelect)
      .eq("user_id", userId)
      .not("deleted_at", "is", null)
      .order("deleted_at", { ascending: false })
      .limit(PAGE_SIZE + 1)
    if (cursor) query = query.lt("deleted_at", cursor)
    const { data, error } = await query
    if (error || !data) return EMPTY_RESULT as PaginatedResult<DeletedPost>
    const hasMore = data.length > PAGE_SIZE
    const posts = data.slice(0, PAGE_SIZE).map(mapDeletedPost)
    return {
      data: posts,
      nextCursor: hasMore ? posts[posts.length - 1].deletedAt : null,
      hasMore,
    }
  },

  async permanentlyDeletePost(postId: string): Promise<{ error?: string }> {
    // Fetch image URLs before deleting
    const { data: images } = await supabase
      .from("post_images")
      .select("image_url")
      .eq("post_id", postId)

    // Delete the post (cascades to post_images records)
    const { error } = await supabase.from("posts").delete().eq("id", postId)

    if (error) {
      return { error: error.message }
    }

    // Delete image files from storage
    if (images && images.length > 0) {
      for (const img of images) {
        const path = extractStoragePath(img.image_url)
        if (path) {
          await storageRepository.deleteImage(POSTS_BUCKET, path)
        }
      }
    }

    return {}
  },
}
