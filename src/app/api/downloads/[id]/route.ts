import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabaseAdmin'
import type { DownloadEntry } from '@/lib/supabase'
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
    const allowedKeys = new Set<keyof DownloadEntry>([
      'title',
      'version',
      'file_url',
      'channel',
      'available_in_store',
      'store_url',
      'changelog_markdown',
      'changelog_file_name',
      'security_hash',
    ])
    const sanitized = Object.fromEntries(
      Object.entries(body ?? {}).filter(([key]) => allowedKeys.has(key as keyof DownloadEntry)),
    )
    const updatePayload = {
      ...sanitized,
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from('downloads')
      .update(updatePayload)
      .eq('id', idParam)
      .select()
      .single()

    if (error || !data) {
      throw error ?? new Error('Download konnte nicht aktualisiert werden.')
    }

    return NextResponse.json(data as DownloadEntry)
  } catch (error) {
    console.error('Error updating download:', error)
    return NextResponse.json({ error: 'Download konnte nicht aktualisiert werden.' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authResponse = ensureAdminAccess(_request)
  if (authResponse) {
    return authResponse
  }

  try {
    const { id: idParam } = await params
    const supabase = getSupabaseAdminClient()
    const { error } = await supabase.from('downloads').delete().eq('id', idParam)

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting download:', error)
    return NextResponse.json({ error: 'Download konnte nicht gelöscht werden.' }, { status: 500 })
  }
}
