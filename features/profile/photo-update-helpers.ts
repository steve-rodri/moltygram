export type PhotoType = "profile" | "cover"

export interface PhotoTransform {
  scale: number
  offsetX: number
  offsetY: number
  rotation: number
}

interface PhotoConfig {
  bucket: string
  pathPrefix: string
  urlField: "avatarUrl" | "coverPhotoUrl"
  transformField: "avatarTransform" | "coverPhotoTransform"
}

const PHOTO_CONFIG: Record<PhotoType, PhotoConfig> = {
  profile: {
    bucket: "avatars",
    pathPrefix: "avatar",
    urlField: "avatarUrl",
    transformField: "avatarTransform",
  },
  cover: {
    bucket: "covers",
    pathPrefix: "cover",
    urlField: "coverPhotoUrl",
    transformField: "coverPhotoTransform",
  },
}

export function getPhotoConfig(type: PhotoType): PhotoConfig {
  return PHOTO_CONFIG[type]
}

export function getPhotoUpdates(
  type: PhotoType,
  url: string | null,
  transform: PhotoTransform | null,
): Record<string, string | PhotoTransform | null> {
  const config = PHOTO_CONFIG[type]
  return {
    [config.urlField]: url,
    [config.transformField]: transform,
  }
}

export function getStoragePath(type: PhotoType, userId: string): string {
  const config = PHOTO_CONFIG[type]
  return `${userId}/${config.pathPrefix}_${Date.now()}.jpg`
}

export function getStorageBucket(type: PhotoType): string {
  return PHOTO_CONFIG[type].bucket
}
