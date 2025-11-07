import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService, type Screenshot } from '@/lib/supabase'
import { ensureAdminAccess } from '@/lib/admin/serverAuth'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResponse = ensureAdminAccess(request)
  if (authResponse) {
    return authResponse
  }

  try {
    const { id } = await params
    const idNum = parseInt(id, 10)
    if (isNaN(idNum)) {
      return NextResponse.json({ error: 'Ungültige ID.' }, { status: 400 })
    }

    const body = (await request.json()) as Partial<Screenshot>
    console.log('PUT /api/screenshots/' + idNum, 'Body:', body)

    const updatedScreenshot = await DatabaseService.updateScreenshot(idNum, {
      title: body.title?.trim(),
      description: body.description?.trim(),
      category: body.category?.trim(),
      image_url: body.image_url?.trim(),
      image_alt: body.image_alt?.trim(),
      image_width: body.image_width,
      image_height: body.image_height,
      image_storage_path: body.image_storage_path?.trim(),
      sort_order: body.sort_order,
      status: body.status,
    })

    console.log('Screenshot updated:', updatedScreenshot)
    return NextResponse.json(updatedScreenshot)
  } catch (error) {
    console.error('Screenshot konnte nicht aktualisiert werden:', error)
    return NextResponse.json({ error: 'Screenshot konnte nicht aktualisiert werden.' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResponse = ensureAdminAccess(request)
  if (authResponse) {
    return authResponse
  }

  try {
    const { id } = await params
    const idNum = parseInt(id, 10)
    if (isNaN(idNum)) {
      return NextResponse.json({ error: 'Ungültige ID.' }, { status: 400 })
    }

    console.log('DELETE /api/screenshots/' + idNum)

    const result = await DatabaseService.deleteScreenshot(idNum)
    console.log('Delete result:', result)

    if (!result) {
      return NextResponse.json({ error: 'Screenshot konnte nicht gelöscht werden.' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Screenshot konnte nicht gelöscht werden:', error)
    return NextResponse.json({ error: 'Screenshot konnte nicht gelöscht werden.' }, { status: 500 })
  }
}