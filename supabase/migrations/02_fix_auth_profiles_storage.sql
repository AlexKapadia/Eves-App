-- Fix for Profile-Auth Synchronization
-- Create a function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger that calls this function after a user is inserted
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Fix for Image Upload Issues
-- Ensure the storage bucket exists with proper configuration
INSERT INTO storage.buckets (id, name, public)
VALUES ('post-images', 'Post Images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Set RLS policies for storage
-- Allow users to upload their own images
DROP POLICY IF EXISTS "Users can upload their own images" ON storage.objects;
CREATE POLICY "Users can upload their own images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'post-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update their own images
DROP POLICY IF EXISTS "Users can update their own images" ON storage.objects;
CREATE POLICY "Users can update their own images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'post-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own images
DROP POLICY IF EXISTS "Users can delete their own images" ON storage.objects;
CREATE POLICY "Users can delete their own images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'post-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow everyone to view images
DROP POLICY IF EXISTS "Images are viewable by everyone" ON storage.objects;
CREATE POLICY "Images are viewable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'post-images');

-- Fix Posts Table Schema
-- Alter posts table to match the client interface
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Fix the relation between posts and user_id if needed
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'posts' AND column_name = 'author_id'
  ) THEN
    ALTER TABLE posts RENAME COLUMN author_id TO user_id;
  END IF;
END $$;

-- Create index for faster post retrieval
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts (user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts (created_at DESC);

-- Fix Auth Session Management
-- Create a function to refresh auth tokens that cleans up expired tokens
CREATE OR REPLACE FUNCTION cleanup_expired_refresh_tokens()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM auth.refresh_tokens
  WHERE expires_at < NOW() - INTERVAL '1 day';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to clean expired tokens when new ones are created
DROP TRIGGER IF EXISTS cleanup_tokens ON auth.refresh_tokens;
CREATE TRIGGER cleanup_tokens
  AFTER INSERT ON auth.refresh_tokens
  FOR EACH STATEMENT EXECUTE FUNCTION cleanup_expired_refresh_tokens();

-- Improve RLS Policies for Posts and Comments
-- Drop incorrect policies if they exist
DROP POLICY IF EXISTS "Users can insert posts" ON posts;
DROP POLICY IF EXISTS "Authors can update their posts" ON posts;
DROP POLICY IF EXISTS "Authors can delete their posts" ON posts;

-- Create correct policies
CREATE POLICY "Users can insert posts" ON posts 
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts" ON posts 
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts" ON posts 
FOR DELETE USING (auth.uid() = user_id);

-- Add Debugging Views to Help Diagnose Issues
-- Create a view to help diagnose auth-profile mismatches
CREATE OR REPLACE VIEW user_account_status AS
SELECT 
  au.id as auth_user_id,
  au.email,
  au.confirmed_at,
  au.last_sign_in_at,
  p.id as profile_id,
  p.name,
  CASE 
    WHEN p.id IS NULL THEN 'Missing profile' 
    ELSE 'Complete'
  END as status
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id;

-- Create a view to help diagnose storage access issues
CREATE OR REPLACE VIEW storage_permissions_check AS
SELECT
  obj.name,
  obj.id,
  split_part(obj.name, '/', 1) as user_folder,
  split_part(obj.name, '/', 1) = auth.uid()::text as has_access,
  obj.created_at,
  obj.updated_at
FROM storage.objects obj
WHERE obj.bucket_id = 'post-images';

-- Create a validation function for the client to check everything is working
CREATE OR REPLACE FUNCTION check_user_setup(user_uuid UUID)
RETURNS jsonb AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'auth_exists', EXISTS(SELECT 1 FROM auth.users WHERE id = user_uuid),
    'profile_exists', EXISTS(SELECT 1 FROM profiles WHERE id = user_uuid),
    'can_post', EXISTS(SELECT 1 FROM pg_policies WHERE tablename = 'posts' AND cmd = 'INSERT'),
    'can_upload', EXISTS(SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND cmd = 'INSERT' AND schemaname = 'storage'),
    'storage_bucket_exists', EXISTS(SELECT 1 FROM storage.buckets WHERE id = 'post-images'),
    'rls_enabled_posts', (SELECT rls_enabled FROM pg_tables WHERE tablename = 'posts' AND schemaname = 'public')
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add a secure function to fix orphaned profiles
CREATE OR REPLACE FUNCTION admin_fix_orphaned_profiles()
RETURNS TABLE(fixed_count INT) SECURITY DEFINER AS $$
DECLARE
  fixed INT := 0;
BEGIN
  -- Create profiles for auth users without profiles
  INSERT INTO profiles (id, name, email, joined_date)
  SELECT 
    au.id, 
    COALESCE(au.raw_user_meta_data->>'name', split_part(au.email, '@', 1)), 
    au.email,
    now()
  FROM auth.users au
  LEFT JOIN profiles p ON au.id = p.id
  WHERE p.id IS NULL;
  
  GET DIAGNOSTICS fixed = ROW_COUNT;
  RETURN QUERY SELECT fixed;
END;
$$ LANGUAGE plpgsql;

-- Fix posts table for better image handling
ALTER TABLE posts 
DROP COLUMN IF EXISTS images,
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add likes count and comments count columns if they don't exist
ALTER TABLE posts
ADD COLUMN IF NOT EXISTS likes_count INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS comments_count INT DEFAULT 0;

-- Ensure likes count updates correctly for post visibility
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET likes_count = COALESCE(likes_count, 0) + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET likes_count = GREATEST(COALESCE(likes_count, 1) - 1, 0) WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for likes count
DROP TRIGGER IF EXISTS after_like_changes ON likes;
CREATE TRIGGER after_like_changes
AFTER INSERT OR DELETE ON likes
FOR EACH ROW EXECUTE FUNCTION update_post_likes_count();

-- Add a function to update comments count
CREATE OR REPLACE FUNCTION update_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET comments_count = COALESCE(comments_count, 0) + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET comments_count = GREATEST(COALESCE(comments_count, 1) - 1, 0) WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for comments count
DROP TRIGGER IF EXISTS after_comment_changes ON comments;
CREATE TRIGGER after_comment_changes
AFTER INSERT OR DELETE ON comments
FOR EACH ROW EXECUTE FUNCTION update_post_comments_count(); 