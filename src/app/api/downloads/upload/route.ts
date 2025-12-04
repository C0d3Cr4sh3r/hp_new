import { randomUUID } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabaseAdmin'
import { ensureAdminAccess } from '@/lib/admin/serverAuth'

export const runtime = 'nodejs'

const BUCKET_NAME = 'downloads'
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL

// Erlaubte Dateitypen
const ALLOWED_EXTENSIONS = ['.apk', '.ipa', '.zip', '.exe', '.dmg', '.msi', '.deb', '.rpm', '.tar.gz']

/**
 * POST: Erstellt eine signierte Upload-URL für direkten Client-Upload
 * Body: { fileName: string, fileType: string }
 */
export async function POST(request: NextRequest) {
  const authResponse = ensureAdminAccess(request)
  if (authResponse) {
    return authResponse
  }

  try {
    const body = await request.json()
    const { fileName } = body

    if (!fileName) {
      return NextResponse.json({ error: 'Dateiname fehlt.' }, { status: 400 })
    }

    // Dateiendung prüfen
    const originalName = fileName.toLowerCase()
    const hasValidExtension = ALLOWED_EXTENSIONS.some(ext => originalName.endsWith(ext))
    if (!hasValidExtension) {
      return NextResponse.json({
        error: `Ungültiger Dateityp. Erlaubt: ${ALLOWED_EXTENSIONS.join(', ')}`
      }, { status: 400 })
    }

    const supabase = getSupabaseAdminClient()

    // Eindeutigen Dateinamen generieren
    const extension = originalName.substring(originalName.lastIndexOf('.'))
    const uniqueFileName = `${Date.now()}-${randomUUID()}${extension}`

    // Signierte Upload-URL erstellen (gültig für 2 Stunden)
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUploadUrl(uniqueFileName)

    if (error) {
      console.error('Signed URL error:', error)

      if (error.message?.includes('not found') || error.message?.includes('Bucket')) {
        return NextResponse.json({
          error: 'Storage-Bucket "downloads" nicht gefunden. Bitte in Supabase erstellen.'
        }, { status: 500 })
      }

      throw error
    }

    // Public URL generieren
    const { data: publicData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(uniqueFileName)

    // Standard Storage Upload URL (für PUT request)
    const uploadUrl = `${SUPABASE_URL}/storage/v1/object/${BUCKET_NAME}/${uniqueFileName}`

    return NextResponse.json({
      // Signierte URL für Upload
      signedUrl: data.signedUrl,
      token: data.token,
      // Alternative: direkte Upload-URL mit Service Key
      uploadUrl,
      path: uniqueFileName,
      publicUrl: publicData?.publicUrl,
    })
  } catch (error) {
    console.error('Fehler beim Erstellen der Upload-URL:', error)
    return NextResponse.json({ error: 'Upload-URL konnte nicht erstellt werden.' }, { status: 500 })
  }
}

