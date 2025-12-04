/**
 * Database Types für Supabase
 * Zentrale Type-Definitionen für alle Datenbank-Entitäten
 */

export interface Event {
  id?: number
  title: string
  description?: string
  date: string
  time?: string
  location?: string
  photographer_id?: string
  model_id?: string
  type: 'tfp' | 'paid' | 'collaboration'
  status: 'planned' | 'confirmed' | 'completed' | 'cancelled'
  created_at?: string
  updated_at?: string
}

export interface Project {
  id?: number
  name: string
  description?: string
  type: 'portfolio' | 'commercial' | 'personal'
  status: 'active' | 'completed' | 'archived'
  images?: string[]
  tags?: string[]
  created_at?: string
  updated_at?: string
}

export interface User {
  id: string
  email: string
  name?: string
  role: 'photographer' | 'model' | 'admin'
  profile_image?: string
  bio?: string
  portfolio_url?: string
  created_at?: string
  updated_at?: string
}

export interface NewsArticle {
  id?: number
  title: string
  slug: string
  content: string
  status: 'draft' | 'published'
  created_at?: string
  updated_at?: string
}

export interface Screenshot {
  id?: number
  title: string
  description?: string
  category: string
  image_url: string
  image_alt?: string
  image_width?: number
  image_height?: number
  image_storage_path?: string
  sort_order?: number
  status: 'active' | 'inactive'
  created_at?: string
  updated_at?: string
}

export interface Portfolio {
  id?: number
  title: string
  description?: string
  category: 'photography' | 'websites' | 'apps' | 'marketing'
  image_url: string
  image_alt?: string
  image_width?: number
  image_height?: number
  image_storage_path?: string
  client_name?: string
  project_date?: string
  project_url?: string
  technologies?: string[]
  sort_order?: number
  is_featured?: boolean
  status: 'active' | 'inactive'
  created_at?: string
  updated_at?: string
}

export interface Service {
  id?: number
  title: string
  description?: string
  short_description?: string
  icon?: string
  features?: string[]
  category?: string
  price_info?: string
  technologies?: string[]
  deliverables?: string[]
  sort_order?: number
  is_featured?: boolean
  status: 'active' | 'inactive' | 'draft'
  created_at?: string
  updated_at?: string
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

export interface ShootingHubDownload {
  id?: number
  title?: string
  version: string
  platform: 'ios' | 'android' | 'web' | 'desktop'
  channel?: 'stable' | 'beta' | 'legacy'
  download_url: string
  file_url?: string
  release_date: string
  file_size: string
  description?: string
  is_latest: boolean
  download_count: number
  available_in_store?: boolean
  store_url?: string
  changelog_markdown?: string
  changelog_file_name?: string
  security_hash?: string
  created_at?: string
  updated_at?: string
}

export interface BugRecord {
  id: number
  title: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  createdAt: string
  updatedAt?: string
}

// Legacy export for backward compatibility
export type DownloadEntry = ShootingHubDownload

