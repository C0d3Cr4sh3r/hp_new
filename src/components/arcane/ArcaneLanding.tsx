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

async function getLandingSections(): Promise<LandingSection[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const res = await fetch(`${baseUrl}/api/landing-sections`, {
      next: { revalidate: 60 }, // Cache for 60 seconds
    })
    if (!res.ok) return []
    return res.json()
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
  const showFeatures = settings.show_features ?? true
  const showGallery = settings.show_gallery ?? true

  // Sortierreihenfolge aus Einstellungen
  const heroOrder = settings.hero_sort_order ?? 1
  const featuresOrder = settings.features_sort_order ?? 2
  const galleryOrder = settings.gallery_sort_order ?? 3

  // Erstelle sortierbare Bereiche
  const staticSections: SectionConfig[] = [
    { key: 'hero', sortOrder: heroOrder, visible: showHero, component: <ArcaneHero key="hero" /> },
    { key: 'features', sortOrder: featuresOrder, visible: showFeatures, component: <ArcaneFeatures key="features" /> },
    { key: 'gallery', sortOrder: galleryOrder, visible: showGallery, component: <ArcaneGallery key="gallery" /> },
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
