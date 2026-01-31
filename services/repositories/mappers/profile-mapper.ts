import { Profile } from "../types"

export function mapProfile(data: any): Profile {
  return {
    id: data.id,
    handle: data.handle,
    name: data.name,
    pronouns: data.pronouns || undefined,
    bio: data.bio || undefined,
    avatarUrl: data.avatar_url || undefined,
    avatarTransform: data.avatar_transform || undefined,
    coverPhotoUrl: data.cover_photo_url || undefined,
    coverPhotoTransform: data.cover_photo_transform || undefined,
    isPrivate: data.is_private || false,
    followerCount: data.follower_count || 0,
    followingCount: data.following_count || 0,
    createdAt: data.created_at,
  }
}
