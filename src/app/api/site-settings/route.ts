import { NextRequest, NextResponse } from 'next/server'
import { ensureAdminAccess } from '@/lib/admin/serverAuth'
import { getSupabaseAdminClient } from '@/lib/supabaseAdmin'
import { DEFAULT_SITE_SETTINGS, type SiteSettings } from '@/lib/supabase'

const TABLE_NAME = 'site_settings'
const SITE_SETTINGS_ID = 'default'

const sanitizeOptional = (value: unknown): string | null => {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length === 0 ? null : trimmed
}

const sanitizeRequired = (value: unknown, fallback: string): string => {
  if (typeof value !== 'string') return fallback
  const trimmed = value.trim()
  return trimmed.length === 0 ? fallback : trimmed
}

export async function GET() {
  try {
    const supabase = getSupabaseAdminClient()
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('id', SITE_SETTINGS_ID)
      .maybeSingle()

    if (error) {
      console.error('Database error loading site settings:', error)
      throw error
    }

    if (!data) {
      return NextResponse.json(DEFAULT_SITE_SETTINGS)
    }

    const payload: SiteSettings = {
      ...DEFAULT_SITE_SETTINGS,
      ...(data as SiteSettings),
    }

    return NextResponse.json(payload)
  } catch (error) {
    console.error('Site settings could not be loaded:', error)
    
    // Check if this is a configuration error
    if (error instanceof Error && error.message.includes('SUPABASE_SERVICE_ROLE_KEY')) {
      return NextResponse.json(
        { 
          error: 'Supabase Konfigurationsfehler. Bitte SUPABASE_SERVICE_ROLE_KEY in .env.local setzen.',
          details: error.message 
        }, 
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: 'Seiteneinstellungen konnten nicht geladen werden.' }, 
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  const authResponse = ensureAdminAccess(request)
  if (authResponse) {
    return authResponse
  }

  try {
    const body = await request.json()

    const siteName = sanitizeRequired(body?.siteName, DEFAULT_SITE_SETTINGS.site_name)
    const tagline = sanitizeOptional(body?.tagline)
    const supportEmail = sanitizeOptional(body?.supportEmail)
    const imprint = sanitizeOptional(body?.imprint)
    const privacy = sanitizeOptional(body?.privacy)

    const supabase = getSupabaseAdminClient()
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .upsert(
        {
          id: SITE_SETTINGS_ID,
          site_name: siteName,
          tagline,
          support_email: supportEmail,
          imprint,
          privacy,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' },
      )
      .select()
      .single()

    if (error || !data) {
      console.error('Database error saving site settings:', error)
      throw error ?? new Error('Seiteneinstellungen konnten nicht gespeichert werden.')
    }

    const payload: SiteSettings = {
      ...DEFAULT_SITE_SETTINGS,
      ...(data as SiteSettings),
    }

    return NextResponse.json(payload)
  } catch (error) {
    console.error('Site settings could not be saved:', error)
    
    // Check if this is a configuration error
    if (error instanceof Error && error.message.includes('SUPABASE_SERVICE_ROLE_KEY')) {
      return NextResponse.json(
        { 
          error: 'Supabase Konfigurationsfehler. Bitte SUPABASE_SERVICE_ROLE_KEY in .env.local setzen.',
          details: error.message 
        }, 
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: 'Seiteneinstellungen konnten nicht gespeichert werden.' }, 
      { status: 500 }
    )
  }
}
