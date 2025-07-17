-- Follower/Following Feature Migration
-- Run this SQL in your Supabase SQL Editor

-- Create user_profiles table for privacy settings
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  is_private BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create follows table for follower/following relationships
CREATE TABLE IF NOT EXISTS public.follows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'accepted', 'rejected'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

-- Add is_public column to bookmarks table for privacy control
ALTER TABLE bookmarks ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT TRUE;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON public.user_profiles(username);
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON public.follows(following_id);
CREATE INDEX IF NOT EXISTS idx_follows_status ON public.follows(status);
CREATE INDEX IF NOT EXISTS idx_bookmarks_is_public ON bookmarks(is_public);

-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- Create policies for user_profiles
CREATE POLICY "Users can view public profiles" ON public.user_profiles
  FOR SELECT USING (
    is_private = FALSE OR 
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.follows 
      WHERE follower_id = auth.uid() 
      AND following_id = user_id 
      AND status = 'accepted'
    )
  );

CREATE POLICY "Users can view their own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own profile" ON public.user_profiles
  FOR DELETE USING (auth.uid() = user_id);

-- Create policies for follows
CREATE POLICY "Users can view their own follow relationships" ON public.follows
  FOR SELECT USING (auth.uid() = follower_id OR auth.uid() = following_id);

CREATE POLICY "Users can insert follow requests" ON public.follows
  FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can update follow requests they're involved in" ON public.follows
  FOR UPDATE USING (auth.uid() = follower_id OR auth.uid() = following_id);

CREATE POLICY "Users can delete their own follow relationships" ON public.follows
  FOR DELETE USING (auth.uid() = follower_id OR auth.uid() = following_id);

-- Update bookmarks policies to include public visibility
DROP POLICY IF EXISTS "Users can view their own bookmarks" ON bookmarks;
CREATE POLICY "Users can view their own bookmarks and public bookmarks from followed users" ON bookmarks
  FOR SELECT USING (
    auth.uid() = user_id OR
    (is_public = TRUE AND EXISTS (
      SELECT 1 FROM public.follows 
      WHERE follower_id = auth.uid() 
      AND following_id = bookmarks.user_id 
      AND status = 'accepted'
    ))
  );

-- Create triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_follows_updated_at BEFORE UPDATE ON public.follows
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to get user's feed (bookmarks from followed users)
CREATE OR REPLACE FUNCTION get_user_feed(user_uuid UUID)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  url TEXT,
  title TEXT,
  description TEXT,
  image_url TEXT,
  platform TEXT,
  tags TEXT[],
  source TEXT,
  is_public BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  author_username TEXT,
  author_display_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id,
    b.user_id,
    b.url,
    b.title,
    b.description,
    b.image_url,
    b.platform,
    b.tags,
    b.source,
    b.is_public,
    b.created_at,
    b.updated_at,
    up.username,
    up.display_name
  FROM bookmarks b
  LEFT JOIN public.user_profiles up ON b.user_id = up.user_id
  WHERE b.is_public = TRUE
    AND EXISTS (
      SELECT 1 FROM public.follows f
      WHERE f.follower_id = user_uuid
        AND f.following_id = b.user_id
        AND f.status = 'accepted'
    )
  ORDER BY b.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get user's followers
CREATE OR REPLACE FUNCTION get_user_followers(user_uuid UUID)
RETURNS TABLE (
  follower_id UUID,
  follower_username TEXT,
  follower_display_name TEXT,
  status TEXT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    f.follower_id,
    up.username,
    up.display_name,
    f.status,
    f.created_at
  FROM public.follows f
  LEFT JOIN public.user_profiles up ON f.follower_id = up.user_id
  WHERE f.following_id = user_uuid
  ORDER BY f.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get user's following
CREATE OR REPLACE FUNCTION get_user_following(user_uuid UUID)
RETURNS TABLE (
  following_id UUID,
  following_username TEXT,
  following_display_name TEXT,
  status TEXT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    f.following_id,
    up.username,
    up.display_name,
    f.status,
    f.created_at
  FROM public.follows f
  LEFT JOIN public.user_profiles up ON f.following_id = up.user_id
  WHERE f.follower_id = user_uuid
  ORDER BY f.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 