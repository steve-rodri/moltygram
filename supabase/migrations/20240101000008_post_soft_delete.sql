-- Post Soft Delete Migration
-- Adds soft delete capability with 30-day restore window

-- Add soft delete columns to posts table
ALTER TABLE public.posts
  ADD COLUMN deleted_at TIMESTAMPTZ,
  ADD COLUMN scheduled_deletion_at TIMESTAMPTZ;

-- Index for efficiently querying deleted posts
CREATE INDEX idx_posts_deleted_at ON public.posts(deleted_at)
  WHERE deleted_at IS NOT NULL;

-- Index for the cleanup job to find posts ready for permanent deletion
CREATE INDEX idx_posts_scheduled_deletion ON public.posts(scheduled_deletion_at)
  WHERE scheduled_deletion_at IS NOT NULL;

-- Update the existing RLS policy for viewing posts to exclude soft-deleted posts
-- First drop the existing policy
DROP POLICY IF EXISTS "Posts viewable with privacy rules" ON public.posts;

-- Recreate with soft delete check (excludes deleted posts unless viewing own)
CREATE POLICY "Posts viewable with privacy rules"
  ON public.posts FOR SELECT
  USING (
    (
      user_id = auth.uid()
      AND deleted_at IS NULL
    )
    OR (
      deleted_at IS NULL
      AND NOT EXISTS (
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

-- Policy for viewing own soft-deleted posts (recently deleted section)
CREATE POLICY "Users can view own deleted posts"
  ON public.posts FOR SELECT
  USING (
    user_id = auth.uid()
    AND deleted_at IS NOT NULL
  );

-- Function to calculate days remaining before permanent deletion
CREATE OR REPLACE FUNCTION get_days_until_deletion(scheduled_at TIMESTAMPTZ)
RETURNS INTEGER AS $$
BEGIN
  RETURN GREATEST(0, EXTRACT(DAY FROM (scheduled_at - NOW()))::INTEGER);
END;
$$ LANGUAGE plpgsql IMMUTABLE;
