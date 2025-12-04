import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabaseAdmin'
import type { NewsArticle } from '@/lib/supabase'
import { ensureAdminAccess } from '@/lib/admin/serverAuth'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authResponse = ensureAdminAccess(request)
  if (authResponse) {
    return authResponse
  }

  try {
    const { id: idParam } = await params

    const body = await request.json()
  const supabase = getSupabaseAdminClient()
    const { data, error } = await supabase
      .from('news')
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq('id', idParam)
      .select()
      .single()

    if (error || !data) {
      throw error ?? new Error('News konnten nicht aktualisiert werden.')
    }

    return NextResponse.json(data as NewsArticle)
  } catch (error) {
    console.error('Error updating news:', error)
    return NextResponse.json({ error: 'News konnten nicht aktualisiert werden.' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authResponse = ensureAdminAccess(request)
  if (authResponse) {
    return authResponse
  }

  try {
    const { id: idParam } = await params
  const supabase = getSupabaseAdminClient()
    const { error } = await supabase.from('news').delete().eq('id', idParam)

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting news:', error)
    return NextResponse.json({ error: 'News konnten nicht gelöscht werden.' }, { status: 500 })
  }
}
