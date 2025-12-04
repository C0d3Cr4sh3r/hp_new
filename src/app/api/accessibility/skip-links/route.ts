import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabaseAdmin'
import { ensureAdminAccess } from '@/lib/admin/serverAuth'

const TABLE_NAME = 'accessibility_skip_links'

export interface SkipLink {
  id: number
  label: string
  target_id: string
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

// GET /api/accessibility/skip-links - Alle aktiven Skip-Links abrufen
export async function GET() {
  try {
    const supabase = getSupabaseAdminClient()
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('Error fetching skip links:', error)
      throw error
    }

    return NextResponse.json(data ?? [])
  } catch (error) {
    console.error('Error fetching skip links:', error)
    return NextResponse.json(
      { error: 'Skip-Links konnten nicht geladen werden.' },
      { status: 500 }
    )
  }
}

// POST /api/accessibility/skip-links - Neuen Skip-Link erstellen
export async function POST(request: NextRequest) {
  const authResponse = ensureAdminAccess(request)
  if (authResponse) {
    return authResponse
  }

  try {
    const body = await request.json()

    if (!body.label || !body.target_id) {
      return NextResponse.json(
        { error: 'Label und Target-ID sind erforderlich.' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseAdminClient()
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert({
        label: body.label,
        target_id: body.target_id,
        sort_order: body.sort_order ?? 0,
        is_active: body.is_active ?? true,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating skip link:', error)
      throw error
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error creating skip link:', error)
    return NextResponse.json(
      { error: 'Skip-Link konnte nicht erstellt werden.' },
      { status: 500 }
    )
  }
}

