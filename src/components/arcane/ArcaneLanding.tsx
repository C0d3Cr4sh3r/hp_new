import { unstable_noStore as noStore } from 'next/cache'
import { DatabaseService } from "@/lib/supabase";
import type { SiteSettings } from "@/types/settings";
import ArcaneNavigation from "@/components/arcane/ArcaneNavigation";
import ArcaneHero from "@/components/arcane/ArcaneHero";
import ArcaneFeatures from "@/components/arcane/ArcaneFeatures";
import ArcaneGallery from "@/components/arcane/ArcaneGallery";
import ArcaneFooter from "@/components/arcane/ArcaneFooter";
import { SectionRenderer } from "@/components/arcane/sections";
import type { LandingSection } from '@/app/api/landing-sections/route';
import { getSupabaseAdminClient } from '@/lib/supabaseAdmin';

async function getLandingSections(): Promise<LandingSection[]> {
  try {
    // Direkt Supabase aufrufen statt fetch (vermeidet localhost-Problem auf Vercel)
    const supabase = getSupabaseAdminClient()
    const { data, error } = await supabase
      .from('landing_sections')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('Failed to load landing sections:', error)
      return []
    }
    return data || []
  } catch (error) {
    console.error('Failed to load landing sections:', error)
    return []
  }
}

// Typ für sortierbare Bereiche
type SectionConfig = {
  key: string
  sortOrder: number
  visible: boolean
  component: React.ReactNode
}

export async function ArcaneLanding() {
  noStore()

  let siteName = 'ArcanePixels'
  let tagline = ''
  let settings: Partial<SiteSettings> = {}

  try {
    settings = await DatabaseService.getSiteSettings()
    siteName = settings.site_name || 'ArcanePixels'
    tagline = settings.tagline || ''
  } catch (error) {
    console.error('Failed to load site settings for navigation:', error)
  }

  // Grid-Sichtbarkeit aus Einstellungen (Standard: alle sichtbar)
  const showHero = settings.show_hero ?? true
  const showFeatures = settings.show_features ?? true  // Features = Services-Bereich
  const showGallery = settings.show_gallery ?? true
  const showServices = settings.show_services ?? true  // Alias für Features (Rückwärtskompatibilität)
  const showPortfolio = settings.show_portfolio ?? true
  const showShootinghub = settings.show_shootinghub ?? true

  // Sortierreihenfolge aus Einstellungen
  const heroOrder = settings.hero_sort_order ?? 1
  const featuresOrder = settings.features_sort_order ?? 2  // Features = Services
  const galleryOrder = settings.gallery_sort_order ?? 3
  const servicesOrder = settings.services_sort_order ?? 2  // Alias für Features
  const portfolioOrder = settings.portfolio_sort_order ?? 4
  const shootinghubOrder = settings.shootinghub_sort_order ?? 5

  // Berechne kombinierte Sichtbarkeit für ArcaneGallery
  // ArcaneGallery enthält: Gallery, Portfolio und ShootingHub
  const galleryComponentVisible = showGallery || showPortfolio || showShootinghub

  // Berechne Sortierreihenfolge für ArcaneGallery (niedrigste der drei)
  const galleryComponentOrder = Math.min(
    showGallery ? galleryOrder : Infinity,
    showPortfolio ? portfolioOrder : Infinity,
    showShootinghub ? shootinghubOrder : Infinity
  )

  // Erstelle sortierbare Bereiche
  // Hinweis: Features und Services sind dasselbe - wir nutzen beide Flags für Kompatibilität
  const effectiveShowServices = showFeatures && showServices
  const effectiveServicesOrder = Math.min(featuresOrder, servicesOrder)

  const staticSections: SectionConfig[] = [
    { key: 'hero', sortOrder: heroOrder, visible: showHero, component: <ArcaneHero key="hero" /> },
    { key: 'services', sortOrder: effectiveServicesOrder, visible: effectiveShowServices, component: <ArcaneFeatures key="services" /> },
    {
      key: 'gallery',
      sortOrder: galleryComponentOrder,
      visible: galleryComponentVisible,
      component: <ArcaneGallery
        key="gallery"
        showGallery={showGallery}
        showPortfolio={showPortfolio}
        showShootinghub={showShootinghub}
      />
    },
  ]

  // Filtere sichtbare Bereiche und sortiere nach Reihenfolge
  const visibleSections = staticSections
    .filter(s => s.visible)
    .sort((a, b) => a.sortOrder - b.sortOrder)

  // Load additional dynamic sections from database
  // These are EXTRA sections that will be rendered AFTER the static components
  const dynamicSections = await getLandingSections()

  return (
    <>
      <ArcaneNavigation siteName={siteName} tagline={tagline} />
      <main>
        {/* Statische Bereiche - sortiert und gefiltert nach Sichtbarkeit */}
        {visibleSections.map(section => section.component)}

        {/* Additional dynamic sections from database */}
        {dynamicSections.length > 0 && dynamicSections.map((section) => (
          <SectionRenderer key={section.id} section={section} />
        ))}
      </main>
      <ArcaneFooter />
    </>
  );
}
