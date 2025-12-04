/**
 * Zentrale Type-Exports
 * Alle Types können von hier importiert werden
 */

// Database Types
export type {
  Event,
  Project,
  User,
  NewsArticle,
  Screenshot,
  Portfolio,
  Service,
  ShootingHubDownload,
  DownloadEntry,
} from './database'

// Settings Types
export type {
  SiteSettings,
  ServicesSectionSettings,
  FooterLink,
  FooterSection,
  ThemeSettings,
  ShootingHubSectionContent,
} from './settings'

// Settings Defaults
export {
  DEFAULT_SITE_SETTINGS,
  DEFAULT_SERVICES_SECTION,
  DEFAULT_THEME_SETTINGS,
  DEFAULT_SHOOTINGHUB_SECTION,
} from './settings'

