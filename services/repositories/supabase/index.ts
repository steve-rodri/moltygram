import { RepositoryRegistry } from "../types"

import { authRepository } from "./auth-repository"
import { blockRepository } from "./block-repository"
import { commentRepository } from "./comment-repository"
import { followRepository } from "./follow-repository"
import { likeRepository } from "./like-repository"
import { notificationRepository } from "./notification-repository"
import { postRepository } from "./post-repository"
import { storageRepository } from "./storage-repository"
import { userRepository } from "./user-repository"

export function createSupabaseRepositoryRegistry(): RepositoryRegistry {
  return {
    auth: authRepository,
    user: userRepository,
    storage: storageRepository,
    post: postRepository,
    like: likeRepository,
    comment: commentRepository,
    follow: followRepository,
    block: blockRepository,
    notification: notificationRepository,
  }
}

export { authRepository }
export { userRepository }
export { storageRepository }
export { postRepository }
export { likeRepository }
export { commentRepository }
export { followRepository }
export { blockRepository }
export { notificationRepository }
export { supabase } from "./client"
