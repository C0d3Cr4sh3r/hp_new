import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabaseAdmin'
import { ensureAdminAccess } from '@/lib/admin/serverAuth'

const TABLE_NAME = 'navigation_links'

const handleApiError = (error: unknown): NextResponse => {
  console.error('Navigation error:', error)
  return NextResponse.json(
    { error: 'Navigation konnte nicht verarbeitet werden.' },
    { status: 500 }
  )
}

export interface NavigationLink {
  id: number
  label: string
  href: string
  external: boolean
  sort_order: number
  visible: boolean
}

// GET - Alle Navigation Links abrufen
export async function GET() {
  try {
    const supabase = getSupabaseAdminClient()
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .order('sort_order', { ascending: true })

    if (error) throw error

    return NextResponse.json(data || [])
  } catch (error) {
    return handleApiError(error)
  }
}

// POST - Neuen Link erstellen
export async function POST(request: NextRequest) {
  const authResponse = ensureAdminAccess(request)
  if (authResponse) return authResponse

  try {
    const body = await request.json()
    const { label, href, external = false, sort_order = 0, visible = true } = body

    const supabase = getSupabaseAdminClient()
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert({ label, href, external, sort_order, visible })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}

// PUT - Alle Links auf einmal aktualisieren (für Reorder)
export async function PUT(request: NextRequest) {
  const authResponse = ensureAdminAccess(request)
  if (authResponse) return authResponse

  try {
    const links: NavigationLink[] = await request.json()
    const supabase = getSupabaseAdminClient()

    // Alle bestehenden löschen und neu einfügen
    await supabase.from(TABLE_NAME).delete().neq('id', 0)

    if (links.length > 0) {
      const { error } = await supabase.from(TABLE_NAME).insert(
        links.map((link, index) => ({
          label: link.label,
          href: link.href,
          external: link.external,
          sort_order: index,
          visible: link.visible,
        }))
      )
      if (error) throw error
    }

    const { data } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .order('sort_order', { ascending: true })

    return NextResponse.json(data || [])
  } catch (error) {
    return handleApiError(error)
  }
}

