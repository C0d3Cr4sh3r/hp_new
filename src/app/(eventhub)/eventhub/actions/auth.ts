"use server"

import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabaseServer'

export type LoginState = {
  error: string | null
}

export async function signIn(prevState: LoginState, formData: FormData): Promise<LoginState> {
  const email = (formData.get('email') ?? '').toString().trim()
  const password = (formData.get('password') ?? '').toString()

  if (!email || !password) {
    return { error: 'E-Mail und Passwort werden benötigt.' }
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return { error: 'Supabase-Konfiguration fehlt. Bitte Umgebungsvariablen prüfen.' }
  }

  try {
    const supabase = await createSupabaseServerClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      return { error: error.message }
    }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unbekannter Fehler beim Login.' }
  }

  redirect('/eventhub/dashboard')
}

export async function signOut() {
  const supabase = await createSupabaseServerClient()
  await supabase.auth.signOut()
  redirect('/eventhub/login')
}
