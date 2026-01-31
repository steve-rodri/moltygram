-- Comment Replies and Likes
-- Adds support for nested replies (one level) and liking comments

-- ============================================
-- SCHEMA CHANGES TO COMMENTS TABLE
-- ============================================

-- Add parent_id for replies (NULL = top-level comment)
ALTER TABLE public.comments
  ADD COLUMN parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE;

-- Add denormalized counts for performance
ALTER TABLE public.comments
  ADD COLUMN like_count INTEGER DEFAULT 0,
  ADD COLUMN reply_count INTEGER DEFAULT 0;

-- Index for efficient reply lookups
CREATE INDEX idx_comments_parent_id ON public.comments(parent_id);

-- ============================================
-- COMMENT LIKES TABLE
-- ============================================

CREATE TABLE public.comment_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(comment_id, user_id)
);

CREATE INDEX idx_comment_likes_comment_id ON public.comment_likes(comment_id);
CREATE INDEX idx_comment_likes_user_id ON public.comment_likes(user_id);

-- ============================================
-- RLS POLICIES FOR COMMENT LIKES
-- ============================================

ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;

-- Anyone can view comment likes (if they can view the comment)
CREATE POLICY "Comment likes viewable by all"
  ON public.comment_likes FOR SELECT
  USING (true);

-- Users can like comments
CREATE POLICY "Users can like comments"
  ON public.comment_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can unlike (delete) their own likes
CREATE POLICY "Users can unlike comments"
  ON public.comment_likes FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- TRIGGERS FOR DENORMALIZED COUNTS
-- ============================================

-- Function to update comment like_count
CREATE OR REPLACE FUNCTION update_comment_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE comments SET like_count = like_count + 1 WHERE id = NEW.comment_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE comments SET like_count = like_count - 1 WHERE id = OLD.comment_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER comment_like_count_trigger
  AFTER INSERT OR DELETE ON public.comment_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_comment_like_count();

-- Function to update parent comment reply_count
CREATE OR REPLACE FUNCTION update_comment_reply_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.parent_id IS NOT NULL THEN
    UPDATE comments SET reply_count = reply_count + 1 WHERE id = NEW.parent_id;
  ELSIF TG_OP = 'DELETE' AND OLD.parent_id IS NOT NULL THEN
    UPDATE comments SET reply_count = reply_count - 1 WHERE id = OLD.parent_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER comment_reply_count_trigger
  AFTER INSERT OR DELETE ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION update_comment_reply_count();
