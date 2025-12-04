import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabaseAdmin'
import { ensureAdminAccess } from '@/lib/admin/serverAuth'

const TABLE_NAME = 'landing_sections'

// GET: Einzelne Section by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = getSupabaseAdminClient()
    
    // Prüfen ob ID numerisch ist oder ein section_key
    const isNumeric = /^\d+$/.test(id)
    
    let query = supabase.from(TABLE_NAME).select('*')
    
    if (isNumeric) {
      query = query.eq('id', parseInt(id, 10))
    } else {
      query = query.eq('section_key', id)
    }
    
    const { data, error } = await query.single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Section nicht gefunden.' }, { status: 404 })
      }
      throw error
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Landing-Section konnte nicht geladen werden:', error)
    return NextResponse.json({ error: 'Landing-Section konnte nicht geladen werden.' }, { status: 500 })
  }
}

// DELETE: Section löschen
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResponse = ensureAdminAccess(request)
  if (authResponse) return authResponse

  try {
    const { id } = await params
    const supabase = getSupabaseAdminClient()
    
    const isNumeric = /^\d+$/.test(id)
    
    let query = supabase.from(TABLE_NAME).delete()
    
    if (isNumeric) {
      query = query.eq('id', parseInt(id, 10))
    } else {
      query = query.eq('section_key', id)
    }
    
    const { error } = await query

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Landing-Section konnte nicht gelöscht werden:', error)
    return NextResponse.json({ error: 'Landing-Section konnte nicht gelöscht werden.' }, { status: 500 })
  }
}

// PUT: Einzelne Section aktualisieren
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResponse = ensureAdminAccess(request)
  if (authResponse) return authResponse

  try {
    const { id } = await params
    const body = await request.json()
    const supabase = getSupabaseAdminClient()
    
    const isNumeric = /^\d+$/.test(id)
    
    const updateData = {
      ...(body.section_type !== undefined && { section_type: body.section_type }),
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
    
    if (isNumeric) {
      query = query.eq('id', parseInt(id, 10))
    } else {
      query = query.eq('section_key', id)
    }
    
    const { data, error } = await query.select().single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Landing-Section konnte nicht aktualisiert werden:', error)
    return NextResponse.json({ error: 'Landing-Section konnte nicht aktualisiert werden.' }, { status: 500 })
  }
}

