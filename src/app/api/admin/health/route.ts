import { NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabaseAdmin'
import { cookies } from 'next/headers'

// Health-Check-Endpoint für Admin-Bereich
// Prüft ob alle erforderlichen Umgebungsvariablen gesetzt sind und die Datenbankverbindung funktioniert

export async function GET() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('admin_session')
  
  // Nur für eingeloggte Admins
  if (!sessionCookie?.value) {
    return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
  }

  const checks: Record<string, { status: 'ok' | 'error' | 'warning'; message: string }> = {}

  // 1. Prüfe NEXT_PUBLIC_SUPABASE_URL
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    checks.supabase_url = { status: 'ok', message: 'Supabase URL ist gesetzt' }
  } else {
    checks.supabase_url = { status: 'error', message: 'NEXT_PUBLIC_SUPABASE_URL fehlt!' }
  }

  // 2. Prüfe NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    checks.supabase_anon_key = { status: 'ok', message: 'Supabase Anon Key ist gesetzt' }
  } else {
    checks.supabase_anon_key = { status: 'error', message: 'NEXT_PUBLIC_SUPABASE_ANON_KEY fehlt!' }
  }

  // 3. Prüfe SUPABASE_SERVICE_ROLE_KEY (kritisch für Schreiboperationen!)
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    checks.supabase_service_key = { status: 'ok', message: 'Service Role Key ist gesetzt' }
  } else {
    checks.supabase_service_key = { 
      status: 'error', 
      message: 'SUPABASE_SERVICE_ROLE_KEY fehlt! Schreiboperationen werden fehlschlagen.' 
    }
  }

  // 4. Prüfe ADMIN_PASSWORD
  if (process.env.ADMIN_PASSWORD) {
    checks.admin_password = { status: 'ok', message: 'Admin-Passwort ist gesetzt' }
  } else {
    checks.admin_password = { status: 'warning', message: 'ADMIN_PASSWORD fehlt (Standard wird verwendet)' }
  }

  // 5. Teste Datenbankverbindung
  try {
    const supabase = getSupabaseAdminClient()
    const { data, error } = await supabase
      .from('site_settings')
      .select('id')
      .limit(1)
    
    if (error) {
      checks.database_connection = { 
        status: 'error', 
        message: `Datenbankfehler: ${error.message}` 
      }
    } else {
      checks.database_connection = { status: 'ok', message: 'Datenbankverbindung erfolgreich' }
    }
  } catch (err) {
    checks.database_connection = { 
      status: 'error', 
      message: `Verbindungsfehler: ${err instanceof Error ? err.message : 'Unbekannter Fehler'}` 
    }
  }

  // 6. Teste Schreibzugriff
  try {
    const supabase = getSupabaseAdminClient()
    const { error } = await supabase
      .from('site_settings')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', 'default')
    
    if (error) {
      checks.write_access = { 
        status: 'error', 
        message: `Schreibzugriff fehlgeschlagen: ${error.message}` 
      }
    } else {
      checks.write_access = { status: 'ok', message: 'Schreibzugriff funktioniert' }
    }
  } catch (err) {
    checks.write_access = { 
      status: 'error', 
      message: `Schreibfehler: ${err instanceof Error ? err.message : 'Unbekannter Fehler'}` 
    }
  }

  // Gesamtstatus ermitteln
  const hasErrors = Object.values(checks).some(c => c.status === 'error')
  const hasWarnings = Object.values(checks).some(c => c.status === 'warning')
  
  const overallStatus = hasErrors ? 'error' : hasWarnings ? 'warning' : 'ok'

  return NextResponse.json({
    status: overallStatus,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    checks,
  })
}

