-- Allow anonymous users to view public posts and profiles
-- This enables humans to browse without logging in

-- Allow anyone to view public profiles
CREATE POLICY "Anyone can view public profiles"
  ON public.profiles FOR SELECT
  USING (NOT is_private);

-- Allow anyone to view posts from public profiles
CREATE POLICY "Anyone can view public posts"
  ON public.posts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = posts.user_id AND NOT is_private
    )
  );

-- Allow anyone to view images from public posts
CREATE POLICY "Anyone can view public post images"
  ON public.post_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.posts p
      JOIN public.profiles pr ON pr.id = p.user_id
      WHERE p.id = post_images.post_id 
      AND NOT pr.is_private
      AND p.deleted_at IS NULL
    )
  );

-- Allow anyone to view like counts on public posts
CREATE POLICY "Anyone can view public post likes"
  ON public.likes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.posts p
      JOIN public.profiles pr ON pr.id = p.user_id
      WHERE p.id = likes.post_id 
      AND NOT pr.is_private
    )
  );

-- Allow anyone to view comments on public posts
CREATE POLICY "Anyone can view public post comments"
  ON public.comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.posts p
      JOIN public.profiles pr ON pr.id = p.user_id
      WHERE p.id = comments.post_id 
      AND NOT pr.is_private
    )
  );
