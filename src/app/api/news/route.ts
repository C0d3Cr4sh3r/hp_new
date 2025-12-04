import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabaseAdmin'
import type { NewsArticle } from '@/lib/supabase'
import { ensureAdminAccess } from '@/lib/admin/serverAuth'

export async function GET() {
  try {
  const supabase = getSupabaseAdminClient()
    const { data, error } = await supabase.from('news').select('*').order('updated_at', { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json((data ?? []) as NewsArticle[])
  } catch (error) {
    console.error('Error fetching news:', error)
    return NextResponse.json({ error: 'News konnten nicht geladen werden.' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const authResponse = ensureAdminAccess(request)
  if (authResponse) {
    return authResponse
  }

  try {
    const body = await request.json()

    if (!body.title || !body.slug || !body.content) {
      return NextResponse.json(
        { error: 'Titel, Slug und Inhalt sind Pflichtfelder.' },
        { status: 400 },
      )
    }

  const supabase = getSupabaseAdminClient()
    const payload = {
      title: String(body.title),
      slug: String(body.slug),
      content: String(body.content),
      status: body.status === 'published' ? 'published' : 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase.from('news').insert([payload]).select().single()

    if (error || !data) {
      throw error ?? new Error('News konnten nicht gespeichert werden.')
    }

    return NextResponse.json(data as NewsArticle, { status: 201 })
  } catch (error) {
    console.error('Error creating news:', error)
    return NextResponse.json({ error: 'News konnten nicht gespeichert werden.' }, { status: 500 })
  }
}
