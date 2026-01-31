import { mapProfile } from "../mappers/profile-mapper"
import { Profile, ProfileUpdate, UserRepository, UserSettings } from "../types"

import { supabase } from "./client"

function mapSettings(data: any): UserSettings {
  return {
    notificationLikes: data.notification_likes ?? true,
    notificationComments: data.notification_comments ?? true,
    notificationFollows: data.notification_follows ?? true,
    notificationMentions: data.notification_mentions ?? true,
    screenTimeLimit: data.screen_time_limit ?? 0,
  }
}

export const userRepository: UserRepository = {
  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from("profiles")
      .select(
        `
        *,
        follower_count:follows!follows_following_id_fkey(count),
        following_count:follows!follows_follower_id_fkey(count)
      `,
      )
      .eq("id", userId)
      .single()

    if (error || !data) return null

    return mapProfile({
      ...data,
      follower_count: data.follower_count?.[0]?.count || 0,
      following_count: data.following_count?.[0]?.count || 0,
    })
  },

  async getProfileByHandle(handle: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from("profiles")
      .select(
        `
        *,
        follower_count:follows!follows_following_id_fkey(count),
        following_count:follows!follows_follower_id_fkey(count)
      `,
      )
      .eq("handle", handle)
      .single()

    if (error || !data) return null

    return mapProfile({
      ...data,
      follower_count: data.follower_count?.[0]?.count || 0,
      following_count: data.following_count?.[0]?.count || 0,
    })
  },

  async createProfile(
    userId: string,
    profileData: ProfileUpdate,
  ): Promise<Profile> {
    const { data, error } = await supabase
      .from("profiles")
      .insert({
        id: userId,
        handle: profileData.handle,
        name: profileData.name,
        pronouns: profileData.pronouns,
        bio: profileData.bio,
        avatar_url: profileData.avatarUrl,
        avatar_transform: profileData.avatarTransform,
        cover_photo_url: profileData.coverPhotoUrl,
        cover_photo_transform: profileData.coverPhotoTransform,
        is_private: profileData.isPrivate ?? false,
      })
      .select()
      .single()

    if (error) throw new Error(error.message)

    // Also create default settings
    await supabase.from("user_settings").insert({ user_id: userId })

    return mapProfile({ ...data, follower_count: 0, following_count: 0 })
  },

  async updateProfile(
    userId: string,
    updates: ProfileUpdate,
  ): Promise<Profile> {
    const updateData: Record<string, any> = {}

    if (updates.handle !== undefined) updateData.handle = updates.handle
    if (updates.name !== undefined) updateData.name = updates.name
    if (updates.pronouns !== undefined) updateData.pronouns = updates.pronouns
    if (updates.bio !== undefined) updateData.bio = updates.bio
    if (updates.avatarUrl !== undefined)
      updateData.avatar_url = updates.avatarUrl
    if (updates.avatarTransform !== undefined)
      updateData.avatar_transform = updates.avatarTransform
    if (updates.coverPhotoUrl !== undefined)
      updateData.cover_photo_url = updates.coverPhotoUrl
    if (updates.coverPhotoTransform !== undefined)
      updateData.cover_photo_transform = updates.coverPhotoTransform
    if (updates.isPrivate !== undefined)
      updateData.is_private = updates.isPrivate

    const { error } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", userId)
      .select()
      .single()

    if (error) throw new Error(error.message)

    // Fetch full profile with counts
    const profile = await this.getProfile(userId)
    if (!profile) throw new Error("Profile not found after update")
    return profile
  },

  async getSettings(userId: string): Promise<UserSettings> {
    const { data, error } = await supabase
      .from("user_settings")
      .select("*")
      .eq("user_id", userId)
      .single()

    if (error || !data) {
      // Return defaults if no settings exist
      return {
        notificationLikes: true,
        notificationComments: true,
        notificationFollows: true,
        notificationMentions: true,
        screenTimeLimit: 0,
      }
    }

    return mapSettings(data)
  },

  async updateSettings(
    userId: string,
    updates: Partial<UserSettings>,
  ): Promise<UserSettings> {
    const updateData: Record<string, any> = {}

    if (updates.notificationLikes !== undefined)
      updateData.notification_likes = updates.notificationLikes
    if (updates.notificationComments !== undefined)
      updateData.notification_comments = updates.notificationComments
    if (updates.notificationFollows !== undefined)
      updateData.notification_follows = updates.notificationFollows
    if (updates.notificationMentions !== undefined)
      updateData.notification_mentions = updates.notificationMentions
    if (updates.screenTimeLimit !== undefined)
      updateData.screen_time_limit = updates.screenTimeLimit

    const { data, error } = await supabase
      .from("user_settings")
      .upsert({ user_id: userId, ...updateData })
      .select()
      .single()

    if (error) throw new Error(error.message)
    return mapSettings(data)
  },

  async searchUsers(query: string, limit = 20): Promise<Profile[]> {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .or(`handle.ilike.%${query}%,name.ilike.%${query}%`)
      .limit(limit)

    if (error || !data) return []
    return data.map((p) =>
      mapProfile({ ...p, follower_count: 0, following_count: 0 }),
    )
  },

  async checkHandleAvailable(handle: string): Promise<boolean> {
    const { data, error } = await supabase
      .from("profiles")
      .select("id")
      .eq("handle", handle)
      .single()

    // If no data found and error is "no rows", handle is available
    return !data && !!error
  },
}
