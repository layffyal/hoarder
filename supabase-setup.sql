-- Hoarder Database Setup for Supabase
-- Run this SQL in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgvector";

-- Create bookmarks table
CREATE TABLE IF NOT EXISTS bookmarks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  platform TEXT NOT NULL DEFAULT 'web',
  tags TEXT[] DEFAULT '{}',
  source TEXT DEFAULT 'web', -- 'web', 'whatsapp', 'extension'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_phone_numbers table for WhatsApp integration
CREATE TABLE IF NOT EXISTS user_phone_numbers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL UNIQUE,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_platform ON bookmarks(platform);
CREATE INDEX IF NOT EXISTS idx_bookmarks_tags ON bookmarks USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_bookmarks_created_at ON bookmarks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_phone_numbers_phone ON user_phone_numbers(phone_number);
CREATE INDEX IF NOT EXISTS idx_user_phone_numbers_user_id ON user_phone_numbers(user_id);

-- Enable Row Level Security
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_phone_numbers ENABLE ROW LEVEL SECURITY;

-- Create policies for bookmarks
CREATE POLICY "Users can view their own bookmarks" ON bookmarks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bookmarks" ON bookmarks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookmarks" ON bookmarks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmarks" ON bookmarks
  FOR DELETE USING (auth.uid() = user_id);

-- Create policies for user_phone_numbers
CREATE POLICY "Users can view their own phone numbers" ON user_phone_numbers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own phone numbers" ON user_phone_numbers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own phone numbers" ON user_phone_numbers
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own phone numbers" ON user_phone_numbers
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_bookmarks_updated_at BEFORE UPDATE ON bookmarks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_phone_numbers_updated_at BEFORE UPDATE ON user_phone_numbers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable pgvector extension for future AI features
CREATE EXTENSION IF NOT EXISTS vector; 