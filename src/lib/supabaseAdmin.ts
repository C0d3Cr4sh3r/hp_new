import { createClient } from '@supabase/supabase-js'

export function getSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url) {
    throw new Error('Supabase URL ist nicht gesetzt. Bitte NEXT_PUBLIC_SUPABASE_URL konfigurieren.')
  }

  if (!serviceKey) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY ist nicht gesetzt. ' +
      'Dieser Schlüssel wird für Admin-Operationen benötigt. ' +
      'Bitte konfigurieren Sie die Umgebungsvariable in .env.local'
    )
  }

  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
