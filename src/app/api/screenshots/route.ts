import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService, type Screenshot } from '@/lib/supabase'
import { ensureAdminAccess } from '@/lib/admin/serverAuth'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    const screenshots = category
      ? await DatabaseService.getScreenshotsByCategory(category)
      : await DatabaseService.getScreenshots()

    return NextResponse.json(screenshots)
  } catch (error) {
    console.error('Screenshots konnten nicht geladen werden:', error)
    return NextResponse.json({ error: 'Screenshots konnten nicht geladen werden.' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const authResponse = ensureAdminAccess(request)
  if (authResponse) {
    return authResponse
  }

  try {
    const body = (await request.json()) as Omit<Screenshot, 'id' | 'created_at' | 'updated_at'>

    // Validate required fields
    if (!body.title || !body.category || !body.image_url) {
      return NextResponse.json({ error: 'Titel, Kategorie und Bild-URL sind erforderlich.' }, { status: 400 })
    }

    const screenshot = await DatabaseService.createScreenshot({
      title: body.title.trim(),
      description: body.description?.trim() || undefined,
      category: body.category.trim(),
      image_url: body.image_url.trim(),
      image_alt: body.image_alt?.trim() || body.title.trim(),
      image_width: body.image_width || undefined,
      image_height: body.image_height || undefined,
      image_storage_path: body.image_storage_path?.trim() || undefined,
      sort_order: body.sort_order || 0,
      status: body.status || 'active',
    })

    return NextResponse.json(screenshot, { status: 201 })
  } catch (error) {
    console.error('Screenshot konnte nicht erstellt werden:', error)
    return NextResponse.json({ error: 'Screenshot konnte nicht erstellt werden.' }, { status: 500 })
  }
}