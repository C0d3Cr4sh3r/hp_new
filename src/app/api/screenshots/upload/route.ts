import { randomUUID } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import { getSupabaseAdminClient } from '@/lib/supabaseAdmin'
import { ensureAdminAccess } from '@/lib/admin/serverAuth'

export const runtime = 'nodejs'

const BUCKET_NAME = 'screenshots'
const TARGET_WIDTH = 1200
const TARGET_HEIGHT = 800

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
    const category = sanitizePath(formData.get('category')) || 'app'
    const title = sanitizePath(formData.get('title'))
    const description = sanitizePath(formData.get('description'))
    const previousPath = sanitizePath(formData.get('previousPath'))
    const createScreenshot = formData.get('createScreenshot') === 'true'

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

    const { data: webpBuffer, info } = await transformer.webp({ quality: 85 }).toBuffer({ resolveWithObject: true })

  const supabase = getSupabaseAdminClient()
    const fileName = `${Date.now()}-${randomUUID()}.webp`
    const storagePath = `${category}/${fileName}`

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

    // Wenn createScreenshot true ist und wir Titel haben, direkt Screenshot-Eintrag erstellen
    if (createScreenshot && title) {
      try {
  const { data: screenshot, error: dbError } = await supabase
          .from('screenshots')
          .insert({
            title,
            description,
            category,
            image_url: publicUrl,
            image_alt: title,
            image_width: info.width ?? TARGET_WIDTH,
            image_height: info.height ?? TARGET_HEIGHT,
            image_storage_path: storagePath,
            sort_order: 0,
            status: 'active'
          })
          .select()
          .single()

        if (dbError) {
          console.error('Database error:', dbError)
          // Storage-Datei löschen falls DB-Insert fehlschlägt
          await supabase.storage.from(BUCKET_NAME).remove([storagePath])
          return NextResponse.json({ error: 'Screenshot konnte nicht in Datenbank gespeichert werden.' }, { status: 500 })
        }

        return NextResponse.json({
          success: true,
          screenshot,
          image_url: publicUrl,
          image_storage_path: storagePath,
          image_width: info.width ?? TARGET_WIDTH,
          image_height: info.height ?? TARGET_HEIGHT,
          mime_type: 'image/webp',
        })
      } catch (dbError) {
        console.error('Database error:', dbError)
        await supabase.storage.from(BUCKET_NAME).remove([storagePath])
        return NextResponse.json({ error: 'Screenshot konnte nicht in Datenbank gespeichert werden.' }, { status: 500 })
      }
    }

    return NextResponse.json({
      image_url: publicUrl,
      image_storage_path: storagePath,
      image_width: info.width ?? TARGET_WIDTH,
      image_height: info.height ?? TARGET_HEIGHT,
      mime_type: 'image/webp',
    })
  } catch (error) {
    console.error('Upload des Screenshots fehlgeschlagen:', error)
    const bucketMissing =
      error instanceof Error &&
      (error.message.includes('No such file or directory') || error.message.includes('The resource was not found'))
    const message = bucketMissing
      ? 'Storage-Bucket nicht gefunden. Bitte lege den Bucket "screenshots" in Supabase an und aktiviere die öffentliche Auslieferung.'
      : 'Upload fehlgeschlagen.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}