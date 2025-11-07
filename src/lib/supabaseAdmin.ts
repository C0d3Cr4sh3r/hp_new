import { createClient } from '@supabase/supabase-js'

export function getSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url) {
    throw new Error('Supabase URL ist nicht gesetzt. Bitte NEXT_PUBLIC_SUPABASE_URL konfigurieren.')
  }

  const keyToUse = serviceKey || anonKey

  if (!keyToUse) {
    throw new Error('Kein Supabase-Schlüssel gesetzt. Bitte Service- oder Anon-Key konfigurieren.')
  }

  if (!serviceKey) {
    console.warn('SUPABASE_SERVICE_ROLE_KEY nicht gesetzt. Es wird der öffentliche Anon-Key verwendet – Schreiboperationen benötigen passende RLS-Policies.')
  }

  return createClient(url, keyToUse, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
