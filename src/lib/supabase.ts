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
      })
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
  platform: 'twitter' | 'linkedin' | 'reddit' | 'tiktok' | 'web'
  tags: string[]
  source: 'web' | 'whatsapp' | 'extension'
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