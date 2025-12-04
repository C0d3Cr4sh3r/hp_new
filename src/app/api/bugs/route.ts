import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabaseAdmin'
import { ensureAdminAccess } from '@/lib/admin/serverAuth'

// GET /api/bugs - Fetch all bug reports
export async function GET() {
  try {
    const supabase = getSupabaseAdminClient()
    const { data, error } = await supabase
      .from('bug_reports')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching bugs:', error)
      throw error
    }

    return NextResponse.json(data ?? [])
  } catch (error) {
    console.error('Error fetching bugs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bug reports' },
      { status: 500 }
    )
  }
}

// POST /api/bugs - Create new bug report (public - no auth required)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.title || !body.description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseAdminClient()
    const { data, error } = await supabase
      .from('bug_reports')
      .insert({
        title: body.title,
        description: body.description,
        steps_to_reproduce: body.steps_to_reproduce || null,
        expected_behavior: body.expected_behavior || null,
        actual_behavior: body.actual_behavior || null,
        severity: body.severity || 'medium',
        status: 'open',
        reporter_name: body.reporter_name || null,
        reporter_email: body.reporter_email || null,
        screenshot_url: body.screenshot_url || null
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating bug:', error)
      throw error
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error creating bug:', error)
    return NextResponse.json(
      { error: 'Failed to create bug report' },
      { status: 500 }
    )
  }
}

