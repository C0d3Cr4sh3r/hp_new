import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabaseAdmin'
import { ensureAdminAccess } from '@/lib/admin/serverAuth'

const TABLE_NAME = 'accessibility_aria_labels'

export interface AriaLabel {
  id: number
  key: string
  label_de: string
  label_en: string | null
  description: string | null
  element_type: string | null
  created_at: string
  updated_at: string
}

// GET /api/accessibility/aria-labels - Alle ARIA-Labels abrufen
export async function GET() {
  try {
    const supabase = getSupabaseAdminClient()
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .order('key', { ascending: true })

    if (error) {
      console.error('Error fetching aria labels:', error)
      throw error
    }

    return NextResponse.json(data ?? [])
  } catch (error) {
    console.error('Error fetching aria labels:', error)
    return NextResponse.json(
      { error: 'ARIA-Labels konnten nicht geladen werden.' },
      { status: 500 }
    )
  }
}

// POST /api/accessibility/aria-labels - Neues ARIA-Label erstellen
export async function POST(request: NextRequest) {
  const authResponse = ensureAdminAccess(request)
  if (authResponse) {
    return authResponse
  }

  try {
    const body = await request.json()

    if (!body.key || !body.label_de) {
      return NextResponse.json(
        { error: 'Key und deutsches Label sind erforderlich.' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseAdminClient()
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert({
        key: body.key,
        label_de: body.label_de,
        label_en: body.label_en ?? null,
        description: body.description ?? null,
        element_type: body.element_type ?? null,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating aria label:', error)
      throw error
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error creating aria label:', error)
    return NextResponse.json(
      { error: 'ARIA-Label konnte nicht erstellt werden.' },
      { status: 500 }
    )
  }
}

