-- Retrograde Storage Bucket Policies
-- Run this after creating the storage buckets (avatars, covers, posts)

-- ============================================
-- AVATARS BUCKET POLICIES
-- ============================================

-- Public read access for avatars
CREATE POLICY "Avatars are publicly accessible"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'avatars');

-- Users can upload to their own folder
CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can update their own avatars
CREATE POLICY "Users can update own avatar"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can delete their own avatars
CREATE POLICY "Users can delete own avatar"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================
-- COVERS BUCKET POLICIES
-- ============================================

-- Public read access for covers
CREATE POLICY "Covers are publicly accessible"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'covers');

-- Users can upload to their own folder
CREATE POLICY "Users can upload own cover"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'covers'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can update their own covers
CREATE POLICY "Users can update own cover"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'covers'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can delete their own covers
CREATE POLICY "Users can delete own cover"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'covers'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================
-- POSTS BUCKET POLICIES
-- ============================================

-- Public read access for post images
CREATE POLICY "Post images are publicly accessible"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'posts');

-- Users can upload to their own folder
CREATE POLICY "Users can upload own post images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'posts'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can update their own post images
CREATE POLICY "Users can update own post images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'posts'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can delete their own post images
CREATE POLICY "Users can delete own post images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'posts'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
