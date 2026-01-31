-- Retrograde Row Level Security Policies
-- Run this after 001_initial_schema.sql

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follow_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES POLICIES
-- ============================================

-- Anyone can view profiles (unless blocked)
CREATE POLICY "Profiles viewable by non-blocked users"
  ON public.profiles FOR SELECT
  USING (
    NOT EXISTS (
      SELECT 1 FROM public.blocked_users
      WHERE blocker_id = profiles.id AND blocked_id = auth.uid()
    )
  );

-- Users can insert their own profile
CREATE POLICY "Users can create own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- ============================================
-- USER SETTINGS POLICIES
-- ============================================

-- Users can only view their own settings
CREATE POLICY "Users can view own settings"
  ON public.user_settings FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own settings
CREATE POLICY "Users can create own settings"
  ON public.user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own settings
CREATE POLICY "Users can update own settings"
  ON public.user_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- POSTS POLICIES
-- ============================================

-- Posts viewable if: own post, OR not blocked AND (public account OR following)
CREATE POLICY "Posts viewable with privacy rules"
  ON public.posts FOR SELECT
  USING (
    user_id = auth.uid()
    OR (
      NOT EXISTS (
        SELECT 1 FROM public.blocked_users
        WHERE blocker_id = posts.user_id AND blocked_id = auth.uid()
      )
      AND (
        NOT (SELECT is_private FROM public.profiles WHERE id = posts.user_id)
        OR EXISTS (
          SELECT 1 FROM public.follows
          WHERE follower_id = auth.uid()
          AND following_id = posts.user_id
          AND status = 'active'
        )
      )
    )
  );

-- Users can create their own posts
CREATE POLICY "Users can create own posts"
  ON public.posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own posts
CREATE POLICY "Users can update own posts"
  ON public.posts FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own posts
CREATE POLICY "Users can delete own posts"
  ON public.posts FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- POST IMAGES POLICIES
-- ============================================

-- Post images viewable if post is viewable
CREATE POLICY "Post images viewable with post"
  ON public.post_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.posts
      WHERE posts.id = post_images.post_id
    )
  );

-- Users can insert images for their own posts
CREATE POLICY "Users can add images to own posts"
  ON public.post_images FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.posts
      WHERE posts.id = post_images.post_id
      AND posts.user_id = auth.uid()
    )
  );

-- Users can delete images from their own posts
CREATE POLICY "Users can delete images from own posts"
  ON public.post_images FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.posts
      WHERE posts.id = post_images.post_id
      AND posts.user_id = auth.uid()
    )
  );

-- ============================================
-- LIKES POLICIES
-- ============================================

-- Likes viewable on viewable posts
CREATE POLICY "Likes viewable with post"
  ON public.likes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.posts
      WHERE posts.id = likes.post_id
    )
  );

-- Users can like posts
CREATE POLICY "Users can like posts"
  ON public.likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can unlike (delete their likes)
CREATE POLICY "Users can unlike posts"
  ON public.likes FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- COMMENTS POLICIES
-- ============================================

-- Comments viewable on viewable posts
CREATE POLICY "Comments viewable with post"
  ON public.comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.posts
      WHERE posts.id = comments.post_id
    )
  );

-- Users can comment on posts
CREATE POLICY "Users can comment on posts"
  ON public.comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own comments
CREATE POLICY "Users can delete own comments"
  ON public.comments FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- FOLLOWS POLICIES
-- ============================================

-- Users can view follows
CREATE POLICY "Follows are viewable"
  ON public.follows FOR SELECT
  USING (true);

-- Users can follow others
CREATE POLICY "Users can follow others"
  ON public.follows FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

-- Users can unfollow
CREATE POLICY "Users can unfollow"
  ON public.follows FOR DELETE
  USING (auth.uid() = follower_id);

-- ============================================
-- BLOCKED USERS POLICIES
-- ============================================

-- Users can view their own blocked list
CREATE POLICY "Users can view own blocked list"
  ON public.blocked_users FOR SELECT
  USING (auth.uid() = blocker_id);

-- Users can block others
CREATE POLICY "Users can block others"
  ON public.blocked_users FOR INSERT
  WITH CHECK (auth.uid() = blocker_id);

-- Users can unblock
CREATE POLICY "Users can unblock"
  ON public.blocked_users FOR DELETE
  USING (auth.uid() = blocker_id);

-- ============================================
-- FOLLOW REQUESTS POLICIES
-- ============================================

-- Users can view requests they sent or received
CREATE POLICY "Users can view relevant follow requests"
  ON public.follow_requests FOR SELECT
  USING (auth.uid() = requester_id OR auth.uid() = target_id);

-- Users can create follow requests
CREATE POLICY "Users can create follow requests"
  ON public.follow_requests FOR INSERT
  WITH CHECK (auth.uid() = requester_id);

-- Target users can update requests (accept/reject)
CREATE POLICY "Target users can respond to requests"
  ON public.follow_requests FOR UPDATE
  USING (auth.uid() = target_id);

-- Users can delete their own requests
CREATE POLICY "Users can cancel own requests"
  ON public.follow_requests FOR DELETE
  USING (auth.uid() = requester_id);

-- ============================================
-- NOTIFICATIONS POLICIES
-- ============================================

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

-- System/triggers create notifications (using service role)
-- For now, allow authenticated users to create notifications for others
CREATE POLICY "Authenticated users can create notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (auth.uid() = actor_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY "Users can delete own notifications"
  ON public.notifications FOR DELETE
  USING (auth.uid() = user_id);
