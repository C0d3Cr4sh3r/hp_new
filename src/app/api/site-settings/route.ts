import { NextRequest, NextResponse } from 'next/server'
import { ensureAdminAccess } from '@/lib/admin/serverAuth'
import { getSupabaseAdminClient } from '@/lib/supabaseAdmin'
import { DEFAULT_SITE_SETTINGS, type SiteSettings } from '@/lib/supabase'

const TABLE_NAME = 'site_settings'
const SITE_SETTINGS_ID = 'default'

const sanitizeOptional = (value: unknown): string | null => {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length === 0 ? null : trimmed
}

const sanitizeRequired = (value: unknown, fallback: string): string => {
  if (typeof value !== 'string') return fallback
  const trimmed = value.trim()
  return trimmed.length === 0 ? fallback : trimmed
}

// Helper to handle errors and return appropriate response
const handleApiError = (error: unknown): NextResponse => {
  console.error('Site settings error:', error)
  
  // Check for configuration errors
  if (error instanceof Error && error.message.includes('SUPABASE_SERVICE_ROLE_KEY')) {
    return NextResponse.json(
      { 
        error: 'Supabase Konfigurationsfehler. Bitte SUPABASE_SERVICE_ROLE_KEY in .env.local setzen.',
        details: error.message 
      }, 
      { status: 500 }
    )
  }
  
  // Generic error response
  return NextResponse.json(
    { error: 'Seiteneinstellungen konnten nicht verarbeitet werden.' }, 
    { status: 500 }
  )
}

export async function GET() {
  try {
    const supabase = getSupabaseAdminClient()
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('id', SITE_SETTINGS_ID)
      .maybeSingle()

    if (error) {
      console.error('Database error loading site settings:', error)
      throw error
    }

    if (!data) {
      return NextResponse.json(DEFAULT_SITE_SETTINGS)
    }

    const payload: SiteSettings = {
      ...DEFAULT_SITE_SETTINGS,
      ...(data as SiteSettings),
    }

    return NextResponse.json(payload)
  } catch (error) {
    return handleApiError(error)
  }
}

async function saveSettings(request: NextRequest) {
  const authResponse = ensureAdminAccess(request)
  if (authResponse) {
    return authResponse
  }

  try {
    const body = await request.json()
    console.log('Site settings save - received body:', JSON.stringify(body, null, 2))

    // Support both camelCase and snake_case inputs
    const siteName = sanitizeRequired(body?.siteName ?? body?.site_name, DEFAULT_SITE_SETTINGS.site_name)
    const tagline = sanitizeOptional(body?.tagline)
    const supportEmail = sanitizeOptional(body?.supportEmail ?? body?.support_email)
    const imprint = sanitizeOptional(body?.imprint)
    const privacy = sanitizeOptional(body?.privacy)
    const heroTitle = sanitizeOptional(body?.heroTitle ?? body?.hero_title)
    const heroSubtitle = sanitizeOptional(body?.heroSubtitle ?? body?.hero_subtitle)
    const heroDescription = sanitizeOptional(body?.heroDescription ?? body?.hero_description)
    const heroPrimaryCtaLabel = sanitizeOptional(body?.heroPrimaryCtaLabel ?? body?.hero_primary_cta_label)
    const heroPrimaryCtaUrl = sanitizeOptional(body?.heroPrimaryCtaUrl ?? body?.hero_primary_cta_url)
    const heroSecondaryCtaLabel = sanitizeOptional(body?.heroSecondaryCtaLabel ?? body?.hero_secondary_cta_label)
    const heroSecondaryCtaUrl = sanitizeOptional(body?.heroSecondaryCtaUrl ?? body?.hero_secondary_cta_url)
    const servicesSectionEyebrow = sanitizeOptional(body?.servicesSectionEyebrow ?? body?.services_section_eyebrow)
    const servicesSectionTitle = sanitizeOptional(body?.servicesSectionTitle ?? body?.services_section_title)
    const servicesSectionDescription = sanitizeOptional(body?.servicesSectionDescription ?? body?.services_section_description)

    // Grid-Bereich Sichtbarkeit
    const showHero = typeof body?.show_hero === 'boolean' ? body.show_hero : undefined
    const showFeatures = typeof body?.show_features === 'boolean' ? body.show_features : undefined
    const showGallery = typeof body?.show_gallery === 'boolean' ? body.show_gallery : undefined
    const showServices = typeof body?.show_services === 'boolean' ? body.show_services : undefined
    const showPortfolio = typeof body?.show_portfolio === 'boolean' ? body.show_portfolio : undefined
    const showShootinghub = typeof body?.show_shootinghub === 'boolean' ? body.show_shootinghub : undefined

    // Grid-Bereich Reihenfolge
    const heroSortOrder = typeof body?.hero_sort_order === 'number' ? body.hero_sort_order : undefined
    const featuresSortOrder = typeof body?.features_sort_order === 'number' ? body.features_sort_order : undefined
    const gallerySortOrder = typeof body?.gallery_sort_order === 'number' ? body.gallery_sort_order : undefined
    const servicesSortOrder = typeof body?.services_sort_order === 'number' ? body.services_sort_order : undefined
    const portfolioSortOrder = typeof body?.portfolio_sort_order === 'number' ? body.portfolio_sort_order : undefined
    const shootinghubSortOrder = typeof body?.shootinghub_sort_order === 'number' ? body.shootinghub_sort_order : undefined

    // Baue das zu speichernde Objekt - nur definierte Felder inkludieren
    const dataToSave: Record<string, unknown> = {
      id: SITE_SETTINGS_ID,
      site_name: siteName,
      tagline,
      support_email: supportEmail,
      imprint,
      privacy,
      hero_title: heroTitle,
      hero_subtitle: heroSubtitle,
      hero_description: heroDescription,
      hero_primary_cta_label: heroPrimaryCtaLabel,
      hero_primary_cta_url: heroPrimaryCtaUrl,
      hero_secondary_cta_label: heroSecondaryCtaLabel,
      hero_secondary_cta_url: heroSecondaryCtaUrl,
      services_section_eyebrow: servicesSectionEyebrow,
      services_section_title: servicesSectionTitle,
      services_section_description: servicesSectionDescription,
      updated_at: new Date().toISOString(),
    }

    // Grid-Sichtbarkeit nur hinzufügen wenn definiert
    if (showHero !== undefined) dataToSave.show_hero = showHero
    if (showFeatures !== undefined) dataToSave.show_features = showFeatures
    if (showGallery !== undefined) dataToSave.show_gallery = showGallery
    if (showServices !== undefined) dataToSave.show_services = showServices
    if (showPortfolio !== undefined) dataToSave.show_portfolio = showPortfolio
    if (showShootinghub !== undefined) dataToSave.show_shootinghub = showShootinghub

    // Grid-Reihenfolge nur hinzufügen wenn definiert
    if (heroSortOrder !== undefined) dataToSave.hero_sort_order = heroSortOrder
    if (featuresSortOrder !== undefined) dataToSave.features_sort_order = featuresSortOrder
    if (gallerySortOrder !== undefined) dataToSave.gallery_sort_order = gallerySortOrder
    if (servicesSortOrder !== undefined) dataToSave.services_sort_order = servicesSortOrder
    if (portfolioSortOrder !== undefined) dataToSave.portfolio_sort_order = portfolioSortOrder
    if (shootinghubSortOrder !== undefined) dataToSave.shootinghub_sort_order = shootinghubSortOrder
    console.log('=== DATA TO SAVE ===')
    console.log('hero_title:', dataToSave.hero_title)
    console.log('hero_subtitle:', dataToSave.hero_subtitle)
    console.log('Full data:', JSON.stringify(dataToSave, null, 2))

    const supabase = getSupabaseAdminClient()
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .upsert(dataToSave, { onConflict: 'id' })
      .select()
      .single()

    console.log('=== UPSERT RESULT ===')
    console.log('Error:', error)
    console.log('Returned data:', JSON.stringify(data, null, 2))

    if (error || !data) {
      console.error('Database error saving site settings:', error)
      throw error ?? new Error('Seiteneinstellungen konnten nicht gespeichert werden.')
    }

    const payload: SiteSettings = {
      ...DEFAULT_SITE_SETTINGS,
      ...(data as SiteSettings),
    }

    return NextResponse.json(payload)
  } catch (error) {
    return handleApiError(error)
  }
}

// Support both PUT and POST methods
export const PUT = saveSettings
export const POST = saveSettings
