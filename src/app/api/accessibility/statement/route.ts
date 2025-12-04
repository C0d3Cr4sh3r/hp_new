import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabaseAdmin'
import { ensureAdminAccess } from '@/lib/admin/serverAuth'

const TABLE_NAME = 'accessibility_statement'

export interface AccessibilityStatement {
  id: string
  content: string | null
  conformance_status: 'full' | 'partial' | 'none' | 'unknown'
  last_reviewed: string | null
  statement_date: string | null
  contact_email: string | null
  contact_phone: string | null
  contact_address: string | null
  feedback_mechanism: string | null
  enforcement_procedure_url: string | null
  known_limitations: Array<{ area: string; description: string; remedy?: string }>
  technologies_used: string[]
  assessment_method: string | null
  created_at: string
  updated_at: string
}

// GET /api/accessibility/statement - Barrierefreiheitserklärung abrufen
export async function GET() {
  try {
    const supabase = getSupabaseAdminClient()
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('id', 'default')
      .maybeSingle()

    if (error) {
      console.error('Error fetching accessibility statement:', error)
      throw error
    }

    if (!data) {
      // Return default empty statement if none exists
      return NextResponse.json({
        id: 'default',
        content: null,
        conformance_status: 'unknown',
        last_reviewed: null,
        statement_date: null,
        contact_email: null,
        contact_phone: null,
        contact_address: null,
        feedback_mechanism: null,
        enforcement_procedure_url: 'https://www.bfit-bund.de/DE/Home/home_node.html',
        known_limitations: [],
        technologies_used: ['HTML5', 'CSS3', 'JavaScript', 'React', 'Next.js'],
        assessment_method: 'self-assessment',
      })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching accessibility statement:', error)
    return NextResponse.json(
      { error: 'Barrierefreiheitserklärung konnte nicht geladen werden.' },
      { status: 500 }
    )
  }
}

// PUT /api/accessibility/statement - Barrierefreiheitserklärung aktualisieren
export async function PUT(request: NextRequest) {
  const authResponse = ensureAdminAccess(request)
  if (authResponse) {
    return authResponse
  }

  try {
    const body = await request.json()
    const supabase = getSupabaseAdminClient()

    const updatePayload = {
      id: 'default',
      content: body.content ?? null,
      conformance_status: body.conformance_status ?? 'partial',
      last_reviewed: body.last_reviewed ?? new Date().toISOString().split('T')[0],
      statement_date: body.statement_date ?? null,
      contact_email: body.contact_email ?? null,
      contact_phone: body.contact_phone ?? null,
      contact_address: body.contact_address ?? null,
      feedback_mechanism: body.feedback_mechanism ?? null,
      enforcement_procedure_url: body.enforcement_procedure_url ?? 'https://www.bfit-bund.de/DE/Home/home_node.html',
      known_limitations: body.known_limitations ?? [],
      technologies_used: body.technologies_used ?? ['HTML5', 'CSS3', 'JavaScript', 'React', 'Next.js'],
      assessment_method: body.assessment_method ?? 'self-assessment',
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .upsert(updatePayload, { onConflict: 'id' })
      .select()
      .single()

    if (error) {
      console.error('Error updating accessibility statement:', error)
      throw error
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating accessibility statement:', error)
    return NextResponse.json(
      { error: 'Barrierefreiheitserklärung konnte nicht aktualisiert werden.' },
      { status: 500 }
    )
  }
}

