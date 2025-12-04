import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabaseAdmin'
import { DEFAULT_SHOOTINGHUB_SECTION, type ShootingHubSectionContent } from '@/lib/supabase'
import { ensureAdminAccess } from '@/lib/admin/serverAuth'

const TABLE_NAME = 'shootinghub_sections'
const SECTION_KEY = 'shootinghub'

const sanitizeBullets = (value: unknown): string[] => {
  if (!Array.isArray(value)) return []
  return value
    .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
    .filter((entry) => entry.length > 0)
}

const sanitizeString = (value: unknown): string | null => {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length === 0 ? null : trimmed
}

export async function GET() {
  try {
    const supabase = getSupabaseAdminClient()
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('section_key', SECTION_KEY)
      .maybeSingle()

    if (error) {
      throw error
    }

    if (!data) {
      return NextResponse.json(DEFAULT_SHOOTINGHUB_SECTION)
    }

    const payload: ShootingHubSectionContent = {
      ...DEFAULT_SHOOTINGHUB_SECTION,
      ...(data as Partial<ShootingHubSectionContent>),
      section_key: SECTION_KEY,
      bullets: Array.isArray((data as { bullets?: unknown }).bullets)
        ? ((data as { bullets: string[] }).bullets ?? [])
        : [],
    }

    return NextResponse.json(payload)
  } catch (error) {
    console.error('ShootingHub-Section konnte nicht geladen werden:', error)
    return NextResponse.json({ error: 'ShootingHub-Section konnte nicht geladen werden.' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const authResponse = ensureAdminAccess(request)
  if (authResponse) {
    return authResponse
  }

  try {
    const body = (await request.json()) as Partial<ShootingHubSectionContent>

    const headline = sanitizeString(body.headline) ?? DEFAULT_SHOOTINGHUB_SECTION.headline
    const subheadline = sanitizeString(body.subheadline) ?? null
    const description = sanitizeString(body.description) ?? null
    const ctaLabel = sanitizeString(body.cta_label)
    const ctaUrl = sanitizeString(body.cta_url)
    const imageUrl = sanitizeString(body.image_url)
    const imageAlt = sanitizeString(body.image_alt)
    const imageStoragePath = sanitizeString(body.image_storage_path)
    const imageWidth = typeof body.image_width === 'number' ? body.image_width : null
    const imageHeight = typeof body.image_height === 'number' ? body.image_height : null

    const payload = {
      section_key: SECTION_KEY,
      headline,
      subheadline,
      description,
      bullets: sanitizeBullets(body.bullets ?? []),
      cta_label: ctaLabel,
      cta_url: ctaUrl,
      image_url: imageUrl,
      image_alt: imageAlt,
      image_storage_path: imageStoragePath,
      image_width: imageWidth,
      image_height: imageHeight,
      updated_at: new Date().toISOString(),
    }

  const supabase = getSupabaseAdminClient()
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .upsert(payload, { onConflict: 'section_key' })
      .select()
      .single()

    if (error || !data) {
      throw error ?? new Error('ShootingHub-Section konnte nicht gespeichert werden.')
    }

    return NextResponse.json({ ...(data as ShootingHubSectionContent), bullets: payload.bullets })
  } catch (error) {
    console.error('ShootingHub-Section konnte nicht gespeichert werden:', error)
    return NextResponse.json({ error: 'ShootingHub-Section konnte nicht gespeichert werden.' }, { status: 500 })
  }
}
