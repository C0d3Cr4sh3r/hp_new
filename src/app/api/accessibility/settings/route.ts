import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabaseAdmin'
import { ensureAdminAccess } from '@/lib/admin/serverAuth'

const TABLE_NAME = 'accessibility_settings'

export interface AccessibilitySettings {
  id: string
  min_contrast_ratio: number
  target_wcag_level: 'A' | 'AA' | 'AAA'
  min_font_size_px: number
  min_line_height: number
  min_paragraph_spacing: number
  focus_outline_width_px: number
  focus_outline_color: string
  focus_outline_offset_px: number
  respect_reduced_motion: boolean
  max_animation_duration_ms: number
  min_touch_target_px: number
  allow_extended_timeouts: boolean
  created_at: string
  updated_at: string
}

// Default-Werte für Accessibility-Einstellungen
const DEFAULT_SETTINGS: Omit<AccessibilitySettings, 'created_at' | 'updated_at'> = {
  id: 'default',
  min_contrast_ratio: 4.5,
  target_wcag_level: 'AA',
  min_font_size_px: 16,
  min_line_height: 1.5,
  min_paragraph_spacing: 1.5,
  focus_outline_width_px: 3,
  focus_outline_color: '#a855f7',
  focus_outline_offset_px: 2,
  respect_reduced_motion: true,
  max_animation_duration_ms: 5000,
  min_touch_target_px: 44,
  allow_extended_timeouts: true,
}

// GET /api/accessibility/settings - Accessibility-Einstellungen abrufen
export async function GET() {
  try {
    const supabase = getSupabaseAdminClient()
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('id', 'default')
      .maybeSingle()

    if (error) {
      console.error('Error fetching accessibility settings:', error)
      throw error
    }

    // Return defaults if no settings exist
    if (!data) {
      return NextResponse.json(DEFAULT_SETTINGS)
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching accessibility settings:', error)
    return NextResponse.json(
      { error: 'Accessibility-Einstellungen konnten nicht geladen werden.' },
      { status: 500 }
    )
  }
}

// PUT /api/accessibility/settings - Accessibility-Einstellungen aktualisieren
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
      min_contrast_ratio: body.min_contrast_ratio ?? DEFAULT_SETTINGS.min_contrast_ratio,
      target_wcag_level: body.target_wcag_level ?? DEFAULT_SETTINGS.target_wcag_level,
      min_font_size_px: body.min_font_size_px ?? DEFAULT_SETTINGS.min_font_size_px,
      min_line_height: body.min_line_height ?? DEFAULT_SETTINGS.min_line_height,
      min_paragraph_spacing: body.min_paragraph_spacing ?? DEFAULT_SETTINGS.min_paragraph_spacing,
      focus_outline_width_px: body.focus_outline_width_px ?? DEFAULT_SETTINGS.focus_outline_width_px,
      focus_outline_color: body.focus_outline_color ?? DEFAULT_SETTINGS.focus_outline_color,
      focus_outline_offset_px: body.focus_outline_offset_px ?? DEFAULT_SETTINGS.focus_outline_offset_px,
      respect_reduced_motion: body.respect_reduced_motion ?? DEFAULT_SETTINGS.respect_reduced_motion,
      max_animation_duration_ms: body.max_animation_duration_ms ?? DEFAULT_SETTINGS.max_animation_duration_ms,
      min_touch_target_px: body.min_touch_target_px ?? DEFAULT_SETTINGS.min_touch_target_px,
      allow_extended_timeouts: body.allow_extended_timeouts ?? DEFAULT_SETTINGS.allow_extended_timeouts,
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .upsert(updatePayload, { onConflict: 'id' })
      .select()
      .single()

    if (error) {
      console.error('Error updating accessibility settings:', error)
      throw error
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating accessibility settings:', error)
    return NextResponse.json(
      { error: 'Accessibility-Einstellungen konnten nicht aktualisiert werden.' },
      { status: 500 }
    )
  }
}

