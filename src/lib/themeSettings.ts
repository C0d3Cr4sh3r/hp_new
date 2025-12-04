import type { FooterLink, FooterSection, ThemeSettings } from '@/lib/supabase'
import { DEFAULT_THEME_SETTINGS } from '@/lib/supabase'

export const THEME_SETTINGS_TABLE = 'theme_settings'
export const THEME_SETTINGS_ID = 'default'

const HEX_COLOR_REGEX = /^#(?:[0-9a-f]{3}){1,2}$/i
const NAVIGATION_STYLES = new Set<ThemeSettings['navigationStyle']>(['classic', 'minimal', 'split'])
const FOOTER_LAYOUTS = new Set<ThemeSettings['footerLayout']>(['compact', 'columns'])

const sanitizeStringArray = (value: unknown, fallback: string[], { allowEmpty = false }: { allowEmpty?: boolean } = {}): string[] => {
  if (!Array.isArray(value)) return [...fallback]
  const result: string[] = []
  for (const entry of value) {
    if (typeof entry !== 'string') continue
    const trimmed = entry.trim()
    if (!trimmed) continue
    result.push(trimmed)
  }
  if (result.length === 0 && !allowEmpty) {
    return [...fallback]
  }
  return result
}

const sanitizeBoolean = (value: unknown, fallback: boolean): boolean => {
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()
    if (normalized === 'true') return true
    if (normalized === 'false') return false
  }
  return fallback
}

const sanitizeStringAllowEmpty = (value: unknown, fallback: string): string => {
  if (typeof value !== 'string') {
    return fallback
  }
  return value.trim()
}

const hasOwnProperty = <T extends object, K extends PropertyKey>(value: T, key: K): key is K & keyof T =>
  Object.prototype.hasOwnProperty.call(value, key)

export const cloneThemeSettings = (settings: ThemeSettings): ThemeSettings => ({
  id: settings.id,
  primaryColor: settings.primaryColor,
  accentColor: settings.accentColor,
  navigationStyle: settings.navigationStyle,
  footerLayout: settings.footerLayout,
  footerBrandName: settings.footerBrandName,
  footerBrandDescription: settings.footerBrandDescription,
  footerBadges: [...settings.footerBadges],
  footerSections: settings.footerSections.map((section) => ({
    title: section.title,
    links: section.links.map((link) => ({ ...link })),
  })),
  footerMetaLines: [...settings.footerMetaLines],
  footerShowUpdatedAt: settings.footerShowUpdatedAt,
  createdAt: settings.createdAt,
  updatedAt: settings.updatedAt,
})

export const sanitizeColor = (value: unknown, fallback: string): string => {
  if (typeof value !== 'string') return fallback
  const trimmed = value.trim()
  return HEX_COLOR_REGEX.test(trimmed) ? trimmed : fallback
}

export const sanitizeRequiredString = (value: unknown, fallback: string): string => {
  if (typeof value !== 'string') return fallback
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : fallback
}

export const sanitizeOptionalString = (value: unknown): string | null => {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

export const sanitizeNavigationStyle = (
  value: unknown,
  fallback: ThemeSettings['navigationStyle'],
): ThemeSettings['navigationStyle'] => {
  if (typeof value !== 'string') return fallback
  return NAVIGATION_STYLES.has(value as ThemeSettings['navigationStyle'])
    ? (value as ThemeSettings['navigationStyle'])
    : fallback
}

export const sanitizeFooterLayout = (
  value: unknown,
  fallback: ThemeSettings['footerLayout'],
): ThemeSettings['footerLayout'] => {
  if (typeof value !== 'string') return fallback
  return FOOTER_LAYOUTS.has(value as ThemeSettings['footerLayout'])
    ? (value as ThemeSettings['footerLayout'])
    : fallback
}

export const sanitizeBadges = (value: unknown, fallback: string[]): string[] => {
  if (value === undefined) {
    return [...fallback]
  }

  if (value === null) {
    return []
  }

  if (!Array.isArray(value)) return [...fallback]
  const result: string[] = []
  for (const entry of value) {
    if (typeof entry !== 'string') continue
    const trimmed = entry.trim()
    if (!trimmed) continue
    if (!result.includes(trimmed)) {
      result.push(trimmed)
    }
  }
  return result
}

export const sanitizeFooterLink = (value: unknown): FooterLink | null => {
  if (typeof value !== 'object' || value === null) return null
  const record = value as Record<string, unknown>
  const label = typeof record.label === 'string' ? record.label.trim() : ''
  const href = typeof record.href === 'string' ? record.href.trim() : ''
  if (!label || !href) {
    return null
  }
  const externalValue = record.external
  const external = typeof externalValue === 'boolean' ? externalValue : href.startsWith('http')
  return {
    label,
    href,
    external,
  }
}

export const sanitizeFooterSections = (
  value: unknown,
  fallback: FooterSection[],
): FooterSection[] => {
  if (value === undefined) {
    return fallback.map((section) => ({
      title: section.title,
      links: section.links.map((link) => ({ ...link })),
    }))
  }

  if (value === null) {
    return []
  }

  if (!Array.isArray(value)) {
    return fallback.map((section) => ({
      title: section.title,
      links: section.links.map((link) => ({ ...link })),
    }))
  }

  const sanitized: FooterSection[] = []

  for (const entry of value) {
    if (typeof entry !== 'object' || entry === null) continue
    const record = entry as Record<string, unknown>
    const title = typeof record.title === 'string' ? record.title.trim() : ''
    const linksRaw = Array.isArray(record.links) ? record.links : []
    const links: FooterLink[] = []

    for (const linkEntry of linksRaw) {
      const link = sanitizeFooterLink(linkEntry)
      if (link) {
        links.push(link)
      }
    }

    if (!title && links.length === 0) {
      continue
    }

    sanitized.push({
      title,
      links,
    })
  }

  return sanitized
}

export const sanitizeMetaLines = (value: unknown, fallback: string[]): string[] =>
  sanitizeStringArray(value, fallback, { allowEmpty: true })

export const mapRowToThemeSettings = (row: Record<string, unknown>): ThemeSettings => {
  const base = cloneThemeSettings(DEFAULT_THEME_SETTINGS)

  return {
    id: typeof row.id === 'string' ? row.id : base.id,
    primaryColor: sanitizeColor(row.primary_color, base.primaryColor),
    accentColor: sanitizeColor(row.accent_color, base.accentColor),
    navigationStyle: sanitizeNavigationStyle(row.navigation_style, base.navigationStyle),
    footerLayout: sanitizeFooterLayout(row.footer_layout, base.footerLayout),
  footerBrandName: sanitizeStringAllowEmpty(row.footer_brand_name, base.footerBrandName),
    footerBrandDescription: sanitizeOptionalString(row.footer_brand_description) ?? base.footerBrandDescription,
    footerBadges: sanitizeBadges(row.footer_badges, base.footerBadges),
    footerSections: sanitizeFooterSections(row.footer_sections, base.footerSections),
    footerMetaLines: sanitizeMetaLines(row.footer_meta_lines, base.footerMetaLines),
    footerShowUpdatedAt: sanitizeBoolean(row.footer_show_updated_at, base.footerShowUpdatedAt),
    createdAt: typeof row.created_at === 'string' ? row.created_at : base.createdAt,
    updatedAt: typeof row.updated_at === 'string' ? row.updated_at : base.updatedAt,
  }
}

export const sanitizeIncomingThemeSettings = (
  input: Partial<ThemeSettings>,
  baseSettings?: ThemeSettings,
): ThemeSettings => {
  const base = cloneThemeSettings(baseSettings ?? DEFAULT_THEME_SETTINGS)
  const updatedAt = new Date().toISOString()

  const brandName = hasOwnProperty(input, 'footerBrandName')
    ? sanitizeStringAllowEmpty(input.footerBrandName, base.footerBrandName)
    : base.footerBrandName

  const brandDescription = hasOwnProperty(input, 'footerBrandDescription')
    ? sanitizeOptionalString(input.footerBrandDescription)
    : base.footerBrandDescription

  return {
    id: THEME_SETTINGS_ID,
    primaryColor: sanitizeColor(input.primaryColor, base.primaryColor),
    accentColor: sanitizeColor(input.accentColor, base.accentColor),
    navigationStyle: sanitizeNavigationStyle(input.navigationStyle, base.navigationStyle),
    footerLayout: sanitizeFooterLayout(input.footerLayout, base.footerLayout),
    footerBrandName: brandName,
    footerBrandDescription: brandDescription,
    footerBadges: sanitizeBadges(input.footerBadges, base.footerBadges),
    footerSections: sanitizeFooterSections(input.footerSections, base.footerSections),
    footerMetaLines: sanitizeMetaLines(input.footerMetaLines, base.footerMetaLines),
    footerShowUpdatedAt: sanitizeBoolean(input.footerShowUpdatedAt, base.footerShowUpdatedAt),
    createdAt: base.createdAt,
    updatedAt,
  }
}

export const prepareUpsertPayload = (settings: ThemeSettings) => ({
  id: settings.id,
  primary_color: settings.primaryColor,
  accent_color: settings.accentColor,
  navigation_style: settings.navigationStyle,
  footer_layout: settings.footerLayout,
  footer_brand_name: settings.footerBrandName,
  footer_brand_description: settings.footerBrandDescription,
  footer_badges: settings.footerBadges,
  footer_sections: settings.footerSections,
  footer_meta_lines: settings.footerMetaLines,
  footer_show_updated_at: settings.footerShowUpdatedAt,
  updated_at: settings.updatedAt,
})
