-- Migration to add user_phone_numbers table for WhatsApp integration
-- Run this in Supabase SQL Editor

-- Create user_phone_numbers table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.user_phone_numbers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  phone_number TEXT UNIQUE NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create indexes (if they don't exist)
CREATE INDEX IF NOT EXISTS idx_user_phone_numbers_phone ON public.user_phone_numbers(phone_number);
CREATE INDEX IF NOT EXISTS idx_user_phone_numbers_user_id ON public.user_phone_numbers(user_id);

-- Enable Row Level Security (if not already enabled)
ALTER TABLE public.user_phone_numbers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own phone numbers" ON public.user_phone_numbers;
DROP POLICY IF EXISTS "Users can insert their own phone numbers" ON public.user_phone_numbers;
DROP POLICY IF EXISTS "Users can update their own phone numbers" ON public.user_phone_numbers;
DROP POLICY IF EXISTS "Users can delete their own phone numbers" ON public.user_phone_numbers;

-- Create policies for user_phone_numbers
CREATE POLICY "Users can view their own phone numbers" ON public.user_phone_numbers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own phone numbers" ON public.user_phone_numbers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own phone numbers" ON public.user_phone_numbers
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own phone numbers" ON public.user_phone_numbers
  FOR DELETE USING (auth.uid() = user_id);

-- Create trigger for updated_at (if it doesn't exist)
DROP TRIGGER IF EXISTS update_user_phone_numbers_updated_at ON public.user_phone_numbers;
CREATE TRIGGER update_user_phone_numbers_updated_at 
  BEFORE UPDATE ON public.user_phone_numbers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 