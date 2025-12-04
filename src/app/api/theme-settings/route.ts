import { NextRequest, NextResponse } from 'next/server'
import { ensureAdminAccess } from '@/lib/admin/serverAuth'
import { getSupabaseAdminClient } from '@/lib/supabaseAdmin'
import { DEFAULT_THEME_SETTINGS, type ThemeSettings } from '@/lib/supabase'
import {
  cloneThemeSettings,
  mapRowToThemeSettings,
  prepareUpsertPayload,
  sanitizeIncomingThemeSettings,
  THEME_SETTINGS_ID,
  THEME_SETTINGS_TABLE,
} from '@/lib/themeSettings'

const handleApiError = (error: unknown): NextResponse => {
  console.error('Theme settings error:', error)

  if (error instanceof Error && error.message.includes('SUPABASE_SERVICE_ROLE_KEY')) {
    return NextResponse.json(
      {
        error: 'Supabase Konfigurationsfehler. Bitte SUPABASE_SERVICE_ROLE_KEY in .env.local setzen.',
        details: error.message,
      },
      { status: 500 },
    )
  }

  return NextResponse.json({ error: 'Theme-Einstellungen konnten nicht verarbeitet werden.' }, { status: 500 })
}

export async function GET() {
  try {
    const supabase = getSupabaseAdminClient()
    const { data, error } = await supabase
      .from(THEME_SETTINGS_TABLE)
      .select('*')
      .eq('id', THEME_SETTINGS_ID)
      .maybeSingle()

    if (error) {
      throw error
    }

    if (!data) {
      return NextResponse.json(cloneThemeSettings(DEFAULT_THEME_SETTINGS))
    }

    return NextResponse.json(mapRowToThemeSettings(data as Record<string, unknown>))
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PUT(request: NextRequest) {
  const authResponse = ensureAdminAccess(request)
  if (authResponse) {
    return authResponse
  }

  try {
    const payload = (await request.json()) as Partial<ThemeSettings>

  const supabase = getSupabaseAdminClient()

    const { data: existingData, error: existingError } = await supabase
      .from(THEME_SETTINGS_TABLE)
      .select('*')
      .eq('id', THEME_SETTINGS_ID)
      .maybeSingle()

    if (existingError) {
      throw existingError
    }

    const existingSettings = existingData
      ? mapRowToThemeSettings(existingData as Record<string, unknown>)
      : cloneThemeSettings(DEFAULT_THEME_SETTINGS)

    const sanitized = sanitizeIncomingThemeSettings(payload, existingSettings)

    const { data, error } = await supabase
      .from(THEME_SETTINGS_TABLE)
      .upsert(prepareUpsertPayload(sanitized), { onConflict: 'id' })
      .select()
      .single()

    if (error || !data) {
      throw error ?? new Error('Theme-Einstellungen konnten nicht gespeichert werden.')
    }

    return NextResponse.json(mapRowToThemeSettings(data as Record<string, unknown>))
  } catch (error) {
    return handleApiError(error)
  }
}
