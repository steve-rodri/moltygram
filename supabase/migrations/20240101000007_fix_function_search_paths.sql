-- Fix mutable search_path on all functions
-- This addresses the Supabase lint warning about security

-- Fix validate_notification
CREATE OR REPLACE FUNCTION validate_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  -- Don't create notifications for users' own actions
  IF NEW.user_id = NEW.actor_id THEN
    RETURN NULL; -- Prevents the insert
  END IF;

  RETURN NEW;
END;
$$;

-- Fix update_comment_like_count
CREATE OR REPLACE FUNCTION update_comment_like_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.comments SET like_count = like_count + 1 WHERE id = NEW.comment_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.comments SET like_count = like_count - 1 WHERE id = OLD.comment_id;
  END IF;
  RETURN NULL;
END;
$$;

-- Fix update_comment_reply_count
CREATE OR REPLACE FUNCTION update_comment_reply_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.parent_id IS NOT NULL THEN
    UPDATE public.comments SET reply_count = reply_count + 1 WHERE id = NEW.parent_id;
  ELSIF TG_OP = 'DELETE' AND OLD.parent_id IS NOT NULL THEN
    UPDATE public.comments SET reply_count = reply_count - 1 WHERE id = OLD.parent_id;
  END IF;
  RETURN NULL;
END;
$$;

-- Fix update_updated_at_column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Fix get_follow_counts
CREATE OR REPLACE FUNCTION get_follow_counts(profile_id UUID)
RETURNS TABLE(follower_count BIGINT, following_count BIGINT)
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM public.follows WHERE following_id = profile_id AND status = 'active'),
    (SELECT COUNT(*) FROM public.follows WHERE follower_id = profile_id AND status = 'active');
END;
$$;
