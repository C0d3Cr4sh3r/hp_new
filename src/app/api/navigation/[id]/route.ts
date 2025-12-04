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

type RouteContext = { params: Promise<{ id: string }> }

// DELETE - Link löschen
export async function DELETE(request: NextRequest, context: RouteContext) {
  const authResponse = ensureAdminAccess(request)
  if (authResponse) return authResponse

  try {
    const { id } = await context.params
    const supabase = getSupabaseAdminClient()
    
    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('id', parseInt(id))

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error)
  }
}

// PATCH - Einzelnen Link aktualisieren
export async function PATCH(request: NextRequest, context: RouteContext) {
  const authResponse = ensureAdminAccess(request)
  if (authResponse) return authResponse

  try {
    const { id } = await context.params
    const body = await request.json()
    const supabase = getSupabaseAdminClient()

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq('id', parseInt(id))
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    return handleApiError(error)
  }
}

