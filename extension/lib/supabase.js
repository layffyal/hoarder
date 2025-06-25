import { createClient } from '@supabase/supabase-js'

// These will be set via environment variables or config
const SUPABASE_URL = 'https://ebsegrbkrmbundqhrvfc.supabase.co/'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVic2VncmJrcm1idW5kcWhydmZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3NjI5MjMsImV4cCI6MjA2NjMzODkyM30.K9FpAtr06HCdmVFHl-SOWho6Fgi77klCUjaWJmRHv6A'

// Create Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
})

// Database types (for reference)
export const BookmarkTypes = {
  TWITTER: 'twitter',
  LINKEDIN: 'linkedin',
  REDDIT: 'reddit',
  TIKTOK: 'tiktok',
  WEB: 'web'
}

export const SourceTypes = {
  WEB: 'web',
  WHATSAPP: 'whatsapp',
  EXTENSION: 'extension'
} 