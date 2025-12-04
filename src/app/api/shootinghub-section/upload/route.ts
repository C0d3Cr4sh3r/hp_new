import { randomUUID } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import { getSupabaseAdminClient } from '@/lib/supabaseAdmin'
import { ensureAdminAccess } from '@/lib/admin/serverAuth'

export const runtime = 'nodejs'

const BUCKET_NAME = 'landing-assets'
const SECTION_DIRECTORY = 'shootinghub'
const TARGET_WIDTH = 1600
const TARGET_HEIGHT = 900

const sanitizePath = (value: unknown): string | null => {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length === 0 ? null : trimmed
}

export async function POST(request: NextRequest) {
  const authResponse = ensureAdminAccess(request)
  if (authResponse) {
    return authResponse
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file')
    const previousPath = sanitizePath(formData.get('previousPath'))

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'Es wurde keine Datei übermittelt.' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())

    const transformer = sharp(buffer).rotate().resize({
      width: TARGET_WIDTH,
      height: TARGET_HEIGHT,
      fit: 'inside',
      withoutEnlargement: true,
    })

    const { data: webpBuffer, info } = await transformer.webp({ quality: 82 }).toBuffer({ resolveWithObject: true })

    const supabase = getSupabaseAdminClient()
    const fileName = `${Date.now()}-${randomUUID()}.webp`
    const storagePath = `${SECTION_DIRECTORY}/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(storagePath, webpBuffer, {
        contentType: 'image/webp',
        cacheControl: '31536000',
        upsert: true,
      })

    if (uploadError) {
      throw uploadError
    }

    if (previousPath && previousPath !== storagePath) {
      await supabase.storage.from(BUCKET_NAME).remove([previousPath])
    }

    const { data: publicData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(storagePath)
    const publicUrl = publicData?.publicUrl ?? null

    return NextResponse.json({
      image_url: publicUrl,
      image_storage_path: storagePath,
      image_width: info.width ?? TARGET_WIDTH,
      image_height: info.height ?? null,
      mime_type: 'image/webp',
    })
  } catch (error) {
    console.error('Upload des ShootingHub-Sections-Bildes fehlgeschlagen:', error)
    const bucketMissing =
      error instanceof Error &&
      (error.message.includes('No such file or directory') || error.message.includes('The resource was not found'))
    const message = bucketMissing
      ? 'Storage-Bucket nicht gefunden. Bitte lege den Bucket "landing-assets" in Supabase an und aktiviere die öffentliche Auslieferung.'
      : 'Upload fehlgeschlagen.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
