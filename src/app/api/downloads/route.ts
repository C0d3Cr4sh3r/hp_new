import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/supabase'
import type { DownloadEntry } from '@/lib/supabase'
import { ensureAdminAccess } from '@/lib/admin/serverAuth'

export async function GET() {
  try {
    const downloads = await DatabaseService.getDownloads()
    return NextResponse.json(downloads)
  } catch (error) {
    console.error('Error fetching downloads:', error)
    return NextResponse.json({ error: 'Downloads konnten nicht geladen werden.' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const authResponse = ensureAdminAccess(request)
  if (authResponse) {
    return authResponse
  }

  try {
    const body = await request.json()

    if (!body.title || !body.version || !body.file_url) {
      return NextResponse.json(
        { error: 'Titel, Version und Download-URL sind Pflichtfelder.' },
        { status: 400 },
      )
    }

    const payload = {
      title: String(body.title),
      version: String(body.version),
      file_url: String(body.file_url),
      channel: body.channel === 'beta' ? 'beta' : body.channel === 'legacy' ? 'legacy' : 'stable',
      available_in_store: Boolean(body.available_in_store),
      store_url: body.store_url ? String(body.store_url) : null,
      changelog_markdown: body.changelog_markdown ? String(body.changelog_markdown) : null,
      changelog_file_name: body.changelog_file_name ? String(body.changelog_file_name) : null,
      security_hash: body.security_hash ? String(body.security_hash) : null,
    } as Omit<DownloadEntry, 'id' | 'created_at' | 'updated_at'>

    const download = await DatabaseService.createDownload(payload)
    return NextResponse.json(download, { status: 201 })
  } catch (error) {
    console.error('Error creating download:', error)
    return NextResponse.json({ error: 'Download konnte nicht gespeichert werden.' }, { status: 500 })
  }
}
