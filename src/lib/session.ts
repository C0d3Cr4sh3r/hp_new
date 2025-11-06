import type { User } from '@supabase/supabase-js'
import { cache } from 'react'
import { createSupabaseServerClient } from './supabaseServer'

export const getSessionUser = cache(async (): Promise<User | null> => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return null
  }

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return user ?? null
})
