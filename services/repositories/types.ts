// Repository interfaces - abstraction layer to avoid vendor lock-in
// All data access goes through these interfaces

export interface Session {
  user: AuthUser
  accessToken: string
  refreshToken: string
  expiresAt: number
}

export interface AuthUser {
  id: string
  email?: string
  phone?: string
}

export interface AuthResult {
  session: Session | null
  user: AuthUser | null
  error?: string
}

export type OAuthProvider = "google" | "apple"

export interface AuthRepository {
  signInWithEmail(email: string, password: string): Promise<AuthResult>
  signUpWithEmail(email: string, password: string): Promise<AuthResult>
  signInWithOAuth(provider: OAuthProvider): Promise<AuthResult>
  signInWithApple(identityToken: string): Promise<AuthResult>
  signInWithPhone(phone: string): Promise<{ error?: string }>
  verifyOtp(phone: string, token: string): Promise<AuthResult>
  signOut(): Promise<{ error?: string }>
  getSession(): Promise<Session | null>
  onAuthStateChange(callback: (session: Session | null) => void): () => void
  resetPassword(email: string): Promise<{ error?: string }>
}

export interface Profile {
  id: string
  handle: string
  name: string
  pronouns?: string
  bio?: string
  avatarUrl?: string
  avatarTransform?: ImageTransform
  coverPhotoUrl?: string
  coverPhotoTransform?: ImageTransform
  isPrivate: boolean
  followerCount: number
  followingCount: number
  createdAt: string
}

export interface ImageTransform {
  scale: number
  offsetX: number
  offsetY: number
  rotation: number
}

export interface ProfileUpdate {
  handle?: string
  name?: string
  pronouns?: string | null
  bio?: string | null
  avatarUrl?: string | null
  avatarTransform?: ImageTransform | null
  coverPhotoUrl?: string | null
  coverPhotoTransform?: ImageTransform | null
  isPrivate?: boolean
}

export interface UserSettings {
  notificationLikes: boolean
  notificationComments: boolean
  notificationFollows: boolean
  notificationMentions: boolean
  screenTimeLimit: number
}

export interface UserRepository {
  getProfile(userId: string): Promise<Profile | null>
  getProfileByHandle(handle: string): Promise<Profile | null>
  createProfile(userId: string, data: ProfileUpdate): Promise<Profile>
  updateProfile(userId: string, updates: ProfileUpdate): Promise<Profile>
  getSettings(userId: string): Promise<UserSettings>
  updateSettings(
    userId: string,
    updates: Partial<UserSettings>,
  ): Promise<UserSettings>
  searchUsers(query: string, limit?: number): Promise<Profile[]>
  checkHandleAvailable(handle: string): Promise<boolean>
}

export interface Post {
  id: string
  userId: string
  user?: Profile
  images: string[]
  caption?: string
  aestheticBannerUrl?: string
  likeCount: number
  commentCount: number
  hasLiked: boolean
  lastLiker?: Profile
  createdAt: string
}

export interface DeletedPost extends Post {
  deletedAt: string
  scheduledDeletionAt: string
  daysRemaining: number
}

export interface SoftDeleteResult {
  deletedAt: string
  scheduledDeletionAt: string
}

export interface CreatePostData {
  images: string[]
  caption?: string
  aestheticBannerUrl?: string
}

export interface PaginatedResult<T> {
  data: T[]
  nextCursor: string | null
  hasMore: boolean
}

export interface PostRepository {
  getFeed(userId: string, cursor?: string): Promise<PaginatedResult<Post>>
  getPost(postId: string, currentUserId?: string): Promise<Post | null>
  getPostsByUser(
    userId: string,
    cursor?: string,
  ): Promise<PaginatedResult<Post>>
  createPost(userId: string, data: CreatePostData): Promise<Post>
  softDeletePost(postId: string): Promise<SoftDeleteResult | { error: string }>
  restorePost(postId: string): Promise<{ error?: string }>
  getRecentlyDeleted(
    userId: string,
    cursor?: string,
  ): Promise<PaginatedResult<DeletedPost>>
  permanentlyDeletePost(postId: string): Promise<{ error?: string }>
}

export interface LikeResult {
  liked: boolean
  likeCount: number
}

export interface LikeRepository {
  toggleLike(postId: string, userId: string): Promise<LikeResult>
  getLikers(postId: string, cursor?: string): Promise<PaginatedResult<Profile>>
  hasLiked(postId: string, userId: string): Promise<boolean>
}

export interface Comment {
  id: string
  postId: string
  userId: string
  user?: Profile
  text: string
  parentId?: string
  likeCount: number
  replyCount: number
  hasLiked: boolean
  createdAt: string
}

export interface CommentLikeResult {
  liked: boolean
  likeCount: number
}

export interface CommentRepository {
  getComments(
    postId: string,
    cursor?: string,
  ): Promise<PaginatedResult<Comment>>
  getReplies(commentId: string): Promise<Comment[]>
  addComment(
    postId: string,
    userId: string,
    text: string,
    parentId?: string,
  ): Promise<Comment>
  deleteComment(commentId: string): Promise<{ error?: string }>
  toggleCommentLike(
    commentId: string,
    userId: string,
  ): Promise<CommentLikeResult>
}

export type FollowStatus = "following" | "requested" | "none"

export interface FollowResult {
  status: "following" | "requested" | "error"
  error?: string
}

export interface FollowRepository {
  follow(followerId: string, targetId: string): Promise<FollowResult>
  unfollow(followerId: string, targetId: string): Promise<{ error?: string }>
  getFollowers(
    userId: string,
    cursor?: string,
  ): Promise<PaginatedResult<Profile>>
  getFollowing(
    userId: string,
    cursor?: string,
  ): Promise<PaginatedResult<Profile>>
  getMutuals(userId: string, cursor?: string): Promise<PaginatedResult<Profile>>
  getFollowStatus(
    followerId: string,
    targetId: string,
  ): Promise<"following" | "requested" | "none">
  getPendingRequests(userId: string): Promise<Profile[]>
  acceptFollowRequest(requesterId: string): Promise<{ error?: string }>
  rejectFollowRequest(requesterId: string): Promise<{ error?: string }>
}

export interface BlockRepository {
  block(blockerId: string, targetId: string): Promise<{ error?: string }>
  unblock(blockerId: string, targetId: string): Promise<{ error?: string }>
  getBlockedUsers(userId: string): Promise<Profile[]>
  isBlocked(blockerId: string, targetId: string): Promise<boolean>
}

export interface StorageRepository {
  uploadImage(
    file: Blob | string,
    bucket: string,
    path: string,
  ): Promise<{ url: string; error?: string }>
  deleteImage(bucket: string, path: string): Promise<{ error?: string }>
  getPublicUrl(bucket: string, path: string): string
}

export interface Notification {
  id: string
  userId: string
  type: "like" | "comment" | "follow" | "follow_request" | "mention"
  actorId: string
  actor?: Profile
  postId?: string
  commentId?: string
  isRead: boolean
  createdAt: string
}

export interface CreateNotificationData {
  userId: string
  type: "like" | "comment" | "follow" | "follow_request" | "mention"
  actorId: string
  postId?: string
  commentId?: string
}

export interface NotificationRepository {
  getNotifications(
    userId: string,
    cursor?: string,
  ): Promise<PaginatedResult<Notification>>
  createNotification(data: CreateNotificationData): Promise<{ error?: string }>
  markAsRead(notificationId: string): Promise<{ error?: string }>
  markAllAsRead(userId: string): Promise<{ error?: string }>
  getUnreadCount(userId: string): Promise<number>
}

// Repository factory type
export interface RepositoryRegistry {
  auth: AuthRepository
  user: UserRepository
  post: PostRepository
  like: LikeRepository
  comment: CommentRepository
  follow: FollowRepository
  block: BlockRepository
  storage: StorageRepository
  notification: NotificationRepository
}
