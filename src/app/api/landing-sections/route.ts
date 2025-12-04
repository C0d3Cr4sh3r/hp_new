import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabaseAdmin'
import { ensureAdminAccess } from '@/lib/admin/serverAuth'

const TABLE_NAME = 'landing_sections'

export interface LandingSection {
  id: number
  section_key: string
  section_type: 'hero' | 'features' | 'cta' | 'image-text' | 'gallery' | 'testimonials' | 'pricing' | 'faq' | 'contact' | 'custom'
  headline: string | null
  subheadline: string | null
  description: string | null
  content: Record<string, unknown>
  image_url: string | null
  image_alt: string | null
  image_position: 'left' | 'right' | 'top' | 'bottom' | 'background'
  cta_label: string | null
  cta_url: string | null
  secondary_cta_label: string | null
  secondary_cta_url: string | null
  background_color: string | null
  text_color: string | null
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

// GET: Alle aktiven Sections (sortiert)
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdminClient()
    const { searchParams } = new URL(request.url)
    const includeInactive = searchParams.get('all') === 'true'
    
    let query = supabase
      .from(TABLE_NAME)
      .select('*')
      .order('sort_order', { ascending: true })
    
    if (!includeInactive) {
      query = query.eq('is_active', true)
    }
    
    const { data, error } = await query

    if (error) {
      throw error
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Landing-Sections konnten nicht geladen werden:', error)
    return NextResponse.json({ error: 'Landing-Sections konnten nicht geladen werden.' }, { status: 500 })
  }
}

// POST: Neue Section erstellen
export async function POST(request: NextRequest) {
  const authResponse = ensureAdminAccess(request)
  if (authResponse) return authResponse

  try {
    const body = await request.json() as Partial<LandingSection>

    if (!body.section_key || !body.section_type) {
      return NextResponse.json({ error: 'section_key und section_type sind erforderlich.' }, { status: 400 })
    }

    const payload = {
      section_key: body.section_key.toLowerCase().replace(/\s+/g, '-'),
      section_type: body.section_type,
      headline: body.headline || null,
      subheadline: body.subheadline || null,
      description: body.description || null,
      content: body.content || {},
      image_url: body.image_url || null,
      image_alt: body.image_alt || null,
      image_position: body.image_position || 'right',
      cta_label: body.cta_label || null,
      cta_url: body.cta_url || null,
      secondary_cta_label: body.secondary_cta_label || null,
      secondary_cta_url: body.secondary_cta_url || null,
      background_color: body.background_color || null,
      text_color: body.text_color || null,
      sort_order: body.sort_order ?? 0,
      is_active: body.is_active ?? true,
    }

    const supabase = getSupabaseAdminClient()
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert(payload)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Landing-Section konnte nicht erstellt werden:', error)
    return NextResponse.json({ error: 'Landing-Section konnte nicht erstellt werden.' }, { status: 500 })
  }
}

// PUT: Section aktualisieren (Bulk oder einzeln via section_key)
export async function PUT(request: NextRequest) {
  const authResponse = ensureAdminAccess(request)
  if (authResponse) return authResponse

  try {
    const body = await request.json() as Partial<LandingSection> & { id?: number }

    if (!body.id && !body.section_key) {
      return NextResponse.json({ error: 'id oder section_key erforderlich.' }, { status: 400 })
    }

    const supabase = getSupabaseAdminClient()
    
    const updateData = {
      ...(body.headline !== undefined && { headline: body.headline }),
      ...(body.subheadline !== undefined && { subheadline: body.subheadline }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.content !== undefined && { content: body.content }),
      ...(body.image_url !== undefined && { image_url: body.image_url }),
      ...(body.image_alt !== undefined && { image_alt: body.image_alt }),
      ...(body.image_position !== undefined && { image_position: body.image_position }),
      ...(body.cta_label !== undefined && { cta_label: body.cta_label }),
      ...(body.cta_url !== undefined && { cta_url: body.cta_url }),
      ...(body.secondary_cta_label !== undefined && { secondary_cta_label: body.secondary_cta_label }),
      ...(body.secondary_cta_url !== undefined && { secondary_cta_url: body.secondary_cta_url }),
      ...(body.background_color !== undefined && { background_color: body.background_color }),
      ...(body.text_color !== undefined && { text_color: body.text_color }),
      ...(body.sort_order !== undefined && { sort_order: body.sort_order }),
      ...(body.is_active !== undefined && { is_active: body.is_active }),
      updated_at: new Date().toISOString(),
    }

    let query = supabase.from(TABLE_NAME).update(updateData)
    
    if (body.id) {
      query = query.eq('id', body.id)
    } else if (body.section_key) {
      query = query.eq('section_key', body.section_key)
    }

    const { data, error } = await query.select().single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Landing-Section konnte nicht aktualisiert werden:', error)
    return NextResponse.json({ error: 'Landing-Section konnte nicht aktualisiert werden.' }, { status: 500 })
  }
}

