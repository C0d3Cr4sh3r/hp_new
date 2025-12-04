import { randomUUID } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import { getSupabaseAdminClient } from '@/lib/supabaseAdmin'

export const runtime = 'nodejs'

const BUCKET_NAME = 'bug-screenshots'
const MAX_WIDTH = 1920
const MAX_HEIGHT = 1080

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'Keine Datei übermittelt.' }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Nur Bilddateien erlaubt.' }, { status: 400 })
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'Datei zu groß (max. 10MB).' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())

    // Process image with sharp
    const { data: webpBuffer, info } = await sharp(buffer)
      .rotate()
      .resize({
        width: MAX_WIDTH,
        height: MAX_HEIGHT,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 80 })
      .toBuffer({ resolveWithObject: true })

    const supabase = getSupabaseAdminClient()
    const fileName = `${Date.now()}-${randomUUID()}.webp`

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, webpBuffer, {
        contentType: 'image/webp',
        cacheControl: '31536000',
        upsert: false,
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      throw uploadError
    }

    const { data: publicData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName)
    const publicUrl = publicData?.publicUrl ?? null

    return NextResponse.json({
      url: publicUrl,
      storage_path: fileName,
      width: info.width,
      height: info.height,
    })
  } catch (error) {
    console.error('Bug screenshot upload failed:', error)
    const bucketMissing =
      error instanceof Error &&
      (error.message.includes('No such file or directory') || error.message.includes('The resource was not found'))
    const message = bucketMissing
      ? 'Storage-Bucket nicht gefunden. Bitte erstelle den Bucket "bug-screenshots" in Supabase.'
      : 'Upload fehlgeschlagen.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

