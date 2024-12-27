import { createClient } from '@supabase/supabase-js'

// Get environment variables
const getSupabaseUrl = () => {
  if (typeof window !== 'undefined' && window.ENV && window.ENV.PUBLIC_SUPABASE_URL) {
    return window.ENV.PUBLIC_SUPABASE_URL
  }
  return import.meta.env.PUBLIC_SUPABASE_URL
}

const getSupabaseAnonKey = () => {
  if (typeof window !== 'undefined' && window.ENV && window.ENV.PUBLIC_SUPABASE_ANON_KEY) {
    return window.ENV.PUBLIC_SUPABASE_ANON_KEY
  }
  return import.meta.env.PUBLIC_SUPABASE_ANON_KEY
}

const supabaseUrl = getSupabaseUrl()
const supabaseAnonKey = getSupabaseAnonKey()

// Create Supabase client if credentials are available
let supabase = null

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  })
} else {
  console.warn('Supabase credentials not found. Some features may not work.')
}

export { supabase }
