import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Create a fallback client for development
const createSupabaseClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Missing Supabase environment variables. Using mock client for development.')
    
    // Return a mock client that won't crash the app
    return {
      auth: {
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signInWithPassword: () => Promise.resolve({ error: new Error('Supabase not configured') }),
        signUp: () => Promise.resolve({ error: new Error('Supabase not configured') }),
        signOut: () => Promise.resolve({ error: new Error('Supabase not configured') }),
        signInWithOAuth: () => Promise.resolve({ error: new Error('Supabase not configured') }),
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            order: () => Promise.resolve({ data: [], error: null })
          })
        }),
        insert: () => Promise.resolve({ error: new Error('Supabase not configured') }),
        delete: () => ({
          eq: () => Promise.resolve({ error: new Error('Supabase not configured') })
        })
      }),
      rpc: () => Promise.resolve({ data: [], error: null })
    } as any
  }

  return createClient(supabaseUrl, supabaseAnonKey)
}

export const supabase = createSupabaseClient()

// Database types
export interface Bookmark {
  id: string
  user_id: string
  url: string
  title: string
  description?: string
  image_url?: string
  platform: 'youtube' | 'vimeo' | 'twitter' | 'linkedin' | 'reddit' | 'tiktok' | 'github' | 'web'
  tags: string[]
  source: 'web' | 'whatsapp' | 'extension'
  is_public: boolean
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  email: string
  created_at: string
}

export interface UserPhoneNumber {
  id: string
  user_id: string
  phone_number: string
  is_verified: boolean
  created_at: string
  updated_at: string
}

export interface UserProfile {
  id: string
  user_id: string
  username?: string
  display_name?: string
  bio?: string
  avatar_url?: string
  is_private: boolean
  created_at: string
  updated_at: string
  followStatus?: 'none' | 'pending' | 'following'
}

export interface Follow {
  id: string
  follower_id: string
  following_id: string
  status: 'pending' | 'accepted' | 'rejected'
  created_at: string
  updated_at: string
}

export interface FeedBookmark extends Bookmark {
  author_username?: string
  author_display_name?: string
}

export interface Follower {
  follower_id: string
  follower_username?: string
  follower_display_name?: string
  status: string
  created_at: string
}

export interface Following {
  following_id: string
  following_username?: string
  following_display_name?: string
  status: string
  created_at: string
} 