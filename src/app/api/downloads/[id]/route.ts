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

const BUCKET_NAME = 'downloads'
const SUPABASE_STORAGE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL + '/storage/v1/object/public/downloads/'

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

    // 1. Hole zuerst die Download-Daten um die Datei-URL zu bekommen
    const { data: download, error: fetchError } = await supabase
      .from('downloads')
      .select('file_url')
      .eq('id', idParam)
      .single()

    if (fetchError) {
      console.error('Error fetching download:', fetchError)
    }

    // 2. Wenn es eine Supabase Storage URL ist, lösche die Datei
    if (download?.file_url && download.file_url.includes(SUPABASE_STORAGE_URL)) {
      const storagePath = download.file_url.replace(SUPABASE_STORAGE_URL, '')

      const { error: storageError } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([storagePath])

      if (storageError) {
        console.error('Error deleting file from storage:', storageError)
        // Weiter machen auch wenn Datei nicht gelöscht werden konnte
      }
    }

    // 3. Lösche den Datenbank-Eintrag
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
