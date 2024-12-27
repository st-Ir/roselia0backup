import { useEffect } from 'react'

export default function EnvScript() {
  useEffect(() => {
    window.ENV = {
      PUBLIC_SUPABASE_URL: import.meta.env.PUBLIC_SUPABASE_URL || '',
      PUBLIC_SUPABASE_ANON_KEY: import.meta.env.PUBLIC_SUPABASE_ANON_KEY || ''
    }
  }, [])

  return null
}
