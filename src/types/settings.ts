/**
 * Settings Types für Site- und Theme-Konfiguration
 */

export interface SiteSettings {
  id?: string
  site_name: string
  tagline: string | null
  support_email: string | null
  imprint: string | null
  privacy: string | null
  hero_title: string | null
  hero_subtitle: string | null
  hero_description: string | null
  hero_primary_cta_label: string | null
  hero_primary_cta_url: string | null
  hero_secondary_cta_label: string | null
  hero_secondary_cta_url: string | null
  services_section_eyebrow: string | null
  services_section_title: string | null
  services_section_description: string | null
  // Grid-Bereich Sichtbarkeit
  show_hero: boolean
  show_features: boolean
  show_gallery: boolean
  show_services: boolean
  show_portfolio: boolean
  show_shootinghub: boolean
  // Grid-Bereich Reihenfolge (sort_order)
  hero_sort_order: number
  features_sort_order: number
  gallery_sort_order: number
  services_sort_order: number
  portfolio_sort_order: number
  shootinghub_sort_order: number
  created_at?: string
  updated_at?: string
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  id: 'default',
  site_name: '',
  tagline: null,
  support_email: null,
  imprint: null,
  privacy: null,
  hero_title: null,
  hero_subtitle: null,
  hero_description: null,
  hero_primary_cta_label: null,
  hero_primary_cta_url: null,
  hero_secondary_cta_label: null,
  hero_secondary_cta_url: null,
  services_section_eyebrow: null,
  services_section_title: null,
  services_section_description: null,
  // Grid-Bereich Sichtbarkeit - alle standardmäßig sichtbar
  show_hero: true,
  show_features: true,
  show_gallery: true,
  show_services: true,
  show_portfolio: true,
  show_shootinghub: true,
  // Grid-Bereich Reihenfolge
  hero_sort_order: 1,
  features_sort_order: 2,
  gallery_sort_order: 3,
  services_sort_order: 4,
  portfolio_sort_order: 5,
  shootinghub_sort_order: 6,
}

export interface ServicesSectionSettings {
  eyebrow: string | null
  title: string | null
  description: string | null
}

export const DEFAULT_SERVICES_SECTION: ServicesSectionSettings = {
  eyebrow: 'Unsere Services',
  title: 'Web-Entwicklung für kreative Professionals',
  description:
    'Von maßgeschneiderten Photographer-Websites bis hin zu innovativen Apps - wir entwickeln digitale Lösungen für deine kreativen Projekte.',
}

export interface FooterLink {
  label: string
  href: string
  external: boolean
}

export interface FooterSection {
  title: string
  links: FooterLink[]
}

export interface ThemeSettings {
  id: string
  primaryColor: string
  accentColor: string
  navigationStyle: 'classic' | 'minimal' | 'split'
  footerLayout: 'compact' | 'columns'
  footerBrandName: string
  footerBrandDescription: string | null
  footerBadges: string[]
  footerSections: FooterSection[]
  footerMetaLines: string[]
  footerShowUpdatedAt: boolean
  createdAt?: string
  updatedAt?: string
}

export const DEFAULT_THEME_SETTINGS: ThemeSettings = {
  id: 'default',
  primaryColor: '#6366f1',
  accentColor: '#ec4899',
  navigationStyle: 'classic',
  footerLayout: 'compact',
  footerBrandName: '',
  footerBrandDescription: null,
  footerBadges: [],
  footerSections: [],
  footerMetaLines: [],
  footerShowUpdatedAt: false,
}

export interface ShootingHubSectionContent {
  section_key: string
  headline: string
  subheadline: string | null
  description: string | null
  bullets: string[]
  cta_label: string | null
  cta_url: string | null
  image_url: string | null
  image_alt?: string | null
  image_storage_path?: string | null
  image_width?: number | null
  image_height?: number | null
  sort_order: number
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export const DEFAULT_SHOOTINGHUB_SECTION: ShootingHubSectionContent = {
  section_key: 'shootinghub',
  headline: '',
  subheadline: null,
  description: null,
  bullets: [],
  cta_label: null,
  cta_url: null,
  image_url: null,
  image_alt: null,
  image_storage_path: null,
  image_width: null,
  image_height: null,
  sort_order: 1,
  is_active: false,
}

