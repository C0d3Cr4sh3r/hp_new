import { NextRequest, NextResponse } from 'next/server'
import { ensureAdminAccess } from '@/lib/admin/serverAuth'
import { getSupabaseAdminClient } from '@/lib/supabaseAdmin'
import { DEFAULT_SERVICES_SECTION, type ServicesSectionSettings } from '@/lib/supabase'

const TABLE_NAME = 'site_settings'
const SITE_SETTINGS_ID = 'default'

const sanitizeOptional = (value: unknown): string | null => {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length === 0 ? null : trimmed
}

const handleError = (error: unknown) => {
  console.error('Service section settings error:', error)
  return NextResponse.json({ error: 'Service-Abschnitt konnte nicht verarbeitet werden.' }, { status: 500 })
}

export async function GET() {
  try {
    const supabase = getSupabaseAdminClient()
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('services_section_eyebrow, services_section_title, services_section_description')
      .eq('id', SITE_SETTINGS_ID)
      .maybeSingle()

    if (error) {
      throw error
    }

    if (!data) {
      return NextResponse.json(DEFAULT_SERVICES_SECTION)
    }

    const payload: ServicesSectionSettings = {
      eyebrow: data.services_section_eyebrow ?? null,
      title: data.services_section_title ?? null,
      description: data.services_section_description ?? null,
    }

    return NextResponse.json(payload)
  } catch (error) {
    return handleError(error)
  }
}

export async function PUT(request: NextRequest) {
  const authResponse = ensureAdminAccess(request)
  if (authResponse) {
    return authResponse
  }

  try {
    const body = await request.json()
    const eyebrow = sanitizeOptional(body?.eyebrow)
    const title = sanitizeOptional(body?.title)
    const description = sanitizeOptional(body?.description)

  const supabase = getSupabaseAdminClient()
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .upsert(
        {
          id: SITE_SETTINGS_ID,
          services_section_eyebrow: eyebrow,
          services_section_title: title,
          services_section_description: description,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' },
      )
      .select('services_section_eyebrow, services_section_title, services_section_description')
      .single()

    if (error || !data) {
      throw error ?? new Error('Service-Abschnitt konnte nicht gespeichert werden.')
    }

    const payload: ServicesSectionSettings = {
      eyebrow: data.services_section_eyebrow ?? null,
      title: data.services_section_title ?? null,
      description: data.services_section_description ?? null,
    }

    return NextResponse.json(payload)
  } catch (error) {
    return handleError(error)
  }
}
