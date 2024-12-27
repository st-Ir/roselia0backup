import { createClient } from '@supabase/supabase-js'
import { defineMiddleware } from 'astro:middleware'

export const onRequest = defineMiddleware(async (context, next) => {
  const supabase = createClient(
    import.meta.env.SUPABASE_URL,
    import.meta.env.SUPABASE_ANON_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user && context.url.pathname.startsWith('/dashboard')) {
    return context.redirect('/login')
  }

  return next()
})