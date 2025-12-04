import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabaseAdmin'
import { ensureAdminAccess } from '@/lib/admin/serverAuth'

// PUT /api/bugs/[id] - Update bug report (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResponse = ensureAdminAccess(request)
  if (authResponse) {
    return authResponse
  }

  try {
    const { id: idParam } = await params
    const id = parseInt(idParam)
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid bug ID' }, { status: 400 })
    }

    const body = await request.json()
    const supabase = getSupabaseAdminClient()
    
    const { data, error } = await supabase
      .from('bug_reports')
      .update({
        ...body,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating bug:', error)
      throw error
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating bug:', error)
    return NextResponse.json(
      { error: 'Failed to update bug report' },
      { status: 500 }
    )
  }
}

// DELETE /api/bugs/[id] - Delete bug report (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResponse = ensureAdminAccess(request)
  if (authResponse) {
    return authResponse
  }

  try {
    const { id: idParam } = await params
    const id = parseInt(idParam)
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid bug ID' }, { status: 400 })
    }

    const supabase = getSupabaseAdminClient()

    // Erst den Bug-Report laden um die Screenshot-URL zu bekommen
    const { data: bugReport } = await supabase
      .from('bug_reports')
      .select('screenshot_url')
      .eq('id', id)
      .single()

    // Screenshot aus Storage löschen falls vorhanden
    if (bugReport?.screenshot_url) {
      const url = bugReport.screenshot_url
      // Extrahiere den Dateinamen aus der URL
      // URL Format: https://xxx.supabase.co/storage/v1/object/public/bug-screenshots/filename.webp
      const bucketName = 'bug-screenshots'
      if (url.includes(bucketName)) {
        const parts = url.split(`${bucketName}/`)
        if (parts.length > 1) {
          const filePath = parts[1]
          await supabase.storage.from(bucketName).remove([filePath])
        }
      }
    }

    // Bug-Report löschen
    const { error } = await supabase
      .from('bug_reports')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting bug:', error)
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting bug:', error)
    return NextResponse.json(
      { error: 'Failed to delete bug report' },
      { status: 500 }
    )
  }
}

