import { createClient } from '@supabase/supabase-js'

function getSupabaseUrl() {
  return (
    import.meta.env.SUPABASE_URL ||
    import.meta.env.VITE_SUPABASE_URL ||
    import.meta.env.PUBLIC_SUPABASE_URL
  )
}

function getSupabaseAnonKey() {
  return (
    import.meta.env.SUPABASE_ANON_KEY ||
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY
  )
}

const supabaseUrl = getSupabaseUrl()
const supabaseAnonKey = getSupabaseAnonKey()

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or Anon Key is missing. Please check your environment variables.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)