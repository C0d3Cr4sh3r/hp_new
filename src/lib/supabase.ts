import { createClient } from '@supabase/supabase-js'
import { getSupabaseAdminClient } from '@/lib/supabaseAdmin'

// Re-export all types from centralized type files for backward compatibility
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
  BugRecord,
} from '@/types/database'

export type {
  SiteSettings,
  ServicesSectionSettings,
  FooterLink,
  FooterSection,
  ThemeSettings,
  ShootingHubSectionContent,
} from '@/types/settings'

export {
  DEFAULT_SITE_SETTINGS,
  DEFAULT_SERVICES_SECTION,
  DEFAULT_THEME_SETTINGS,
  DEFAULT_SHOOTINGHUB_SECTION,
} from '@/types/settings'

// Import types for internal use
import type {
  Event,
  NewsArticle,
  Screenshot,
  Portfolio,
  Service,
  ShootingHubDownload,
} from '@/types/database'

import type {
  SiteSettings,
  ServicesSectionSettings,
} from '@/types/settings'

// Public client für client-side Zugriffe (mit RLS)
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Admin client für serverseitige Zugriffe (umgeht RLS)
const getAdminClient = () => {
  try {
    return getSupabaseAdminClient()
  } catch {
    // Fallback auf public client wenn service key nicht verfügbar
    return supabase
  }
}

export class DatabaseService {
  static async getSiteSettings(): Promise<SiteSettings> {
    const adminClient = getAdminClient()
    const { data, error } = await adminClient
      .from('site_settings')
      .select('*')
      .eq('id', 'default')
      .maybeSingle()

    if (error) throw new Error(`Fehler beim Laden der Site-Settings: ${error.message}`)
    if (!data) throw new Error('Site-Settings nicht gefunden')

    return data as SiteSettings
  }

  static async getServicesSectionSettings(): Promise<ServicesSectionSettings> {
    const adminClient = getAdminClient()
    const { data, error } = await adminClient
      .from('site_settings')
      .select('services_section_eyebrow, services_section_title, services_section_description')
      .eq('id', 'default')
      .maybeSingle()

    if (error) throw new Error(`Fehler beim Laden der Services-Section: ${error.message}`)
    if (!data) throw new Error('Services-Section-Settings nicht gefunden')

    return {
      eyebrow: data.services_section_eyebrow ?? null,
      title: data.services_section_title ?? null,
      description: data.services_section_description ?? null,
    }
  }

  // News methods
  static async getNews(): Promise<NewsArticle[]> {
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    if (error) throw new Error(`Fehler beim Laden der News: ${error.message}`)
    return data ?? []
  }

  static async createNews(article: Omit<NewsArticle, 'id' | 'created_at' | 'updated_at'>): Promise<NewsArticle | null> {
    try {
      const { data, error } = await supabase
        .from('news')
        .insert(article)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating news:', error)
      return null
    }
  }

  static async updateNews(id: number, updates: Partial<NewsArticle>): Promise<NewsArticle | null> {
    try {
      const { data, error } = await supabase
        .from('news')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating news:', error)
      return null
    }
  }

  static async deleteNews(id: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('news')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      return true
    } catch (error) {
      console.error('Error deleting news:', error)
      return false
    }
  }

  // Screenshots methods
  static async getScreenshots(): Promise<Screenshot[]> {
    const { data, error } = await supabase
      .from('screenshots')
      .select('*')
      .eq('status', 'active')
      .order('sort_order', { ascending: true })

    if (error) throw new Error(`Fehler beim Laden der Screenshots: ${error.message}`)
    return data ?? []
  }

  static async getScreenshotsByCategory(category: string): Promise<Screenshot[]> {
    const { data, error } = await supabase
      .from('screenshots')
      .select('*')
      .eq('status', 'active')
      .eq('category', category)
      .order('sort_order', { ascending: true })

    if (error) throw new Error(`Fehler beim Laden der Screenshots: ${error.message}`)
    return data ?? []
  }

  static async createScreenshot(screenshot: Omit<Screenshot, 'id' | 'created_at' | 'updated_at'>): Promise<Screenshot | null> {
    try {
      const { data, error } = await supabase
        .from('screenshots')
        .insert(screenshot)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating screenshot:', error)
      return null
    }
  }

  static async updateScreenshot(id: number, updates: Partial<Screenshot>): Promise<Screenshot | null> {
    try {
      const { data, error } = await supabase
        .from('screenshots')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating screenshot:', error)
      return null
    }
  }

  static async deleteScreenshot(id: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('screenshots')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      return true
    } catch (error) {
      console.error('Error deleting screenshot:', error)
      return false
    }
  }

  // Portfolio methods
  static async getPortfolios(): Promise<Portfolio[]> {
    const { data, error } = await supabase
      .from('portfolios')
      .select('*')
      .eq('status', 'active')
      .order('sort_order', { ascending: true })

    if (error) throw new Error(`Fehler beim Laden der Portfolios: ${error.message}`)
    return data ?? []
  }

  static async getPortfoliosByCategory(category: string): Promise<Portfolio[]> {
    const { data, error } = await supabase
      .from('portfolios')
      .select('*')
      .eq('status', 'active')
      .eq('category', category)
      .order('sort_order', { ascending: true })

    if (error) throw new Error(`Fehler beim Laden der Portfolios: ${error.message}`)
    return data ?? []
  }

  static async createPortfolio(portfolio: Omit<Portfolio, 'id' | 'created_at' | 'updated_at'>): Promise<Portfolio | null> {
    try {
      const { data, error } = await supabase
        .from('portfolios')
        .insert(portfolio)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating portfolio:', error)
      return null
    }
  }

  static async updatePortfolio(id: number, updates: Partial<Portfolio>): Promise<Portfolio | null> {
    try {
      const { data, error } = await supabase
        .from('portfolios')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating portfolio:', error)
      return null
    }
  }

  static async deletePortfolio(id: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('portfolios')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      return true
    } catch (error) {
      console.error('Error deleting portfolio:', error)
      return false
    }
  }

  // Services methods
  static async getServices(): Promise<Service[]> {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('status', 'active')
      .order('sort_order', { ascending: true })

    if (error) throw new Error(`Fehler beim Laden der Services: ${error.message}`)
    return data ?? []
  }

  static async createService(service: Omit<Service, 'id' | 'created_at' | 'updated_at'>): Promise<Service | null> {
    try {
      const { data, error } = await supabase
        .from('services')
        .insert(service)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating service:', error)
      return null
    }
  }

  static async updateService(id: number, updates: Partial<Service>): Promise<Service | null> {
    try {
      const { data, error } = await supabase
        .from('services')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating service:', error)
      return null
    }
  }

  static async deleteService(id: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      return true
    } catch (error) {
      console.error('Error deleting service:', error)
      return false
    }
  }

  // Downloads methods
  static async getDownloads(): Promise<ShootingHubDownload[]> {
    const { data, error } = await supabase
      .from('downloads')
      .select('*')
      .order('release_date', { ascending: false })

    if (error) throw new Error(`Fehler beim Laden der Downloads: ${error.message}`)
    return data ?? []
  }

  static async createDownload(download: Omit<ShootingHubDownload, 'id' | 'created_at' | 'updated_at'>): Promise<ShootingHubDownload | null> {
    try {
      const { data, error } = await supabase
        .from('downloads')
        .insert(download)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating download:', error)
      return null
    }
  }

  static async updateDownload(id: number, updates: Partial<ShootingHubDownload>): Promise<ShootingHubDownload | null> {
    try {
      const { data, error } = await supabase
        .from('downloads')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating download:', error)
      return null
    }
  }

  static async deleteDownload(id: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('downloads')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      return true
    } catch (error) {
      console.error('Error deleting download:', error)
      return false
    }
  }

  // Events methods
  static async getEvents(): Promise<Event[]> {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: false })

    if (error) throw new Error(`Fehler beim Laden der Events: ${error.message}`)
    return data ?? []
  }

  static async createEvent(event: Omit<Event, 'id' | 'created_at' | 'updated_at'>): Promise<Event | null> {
    try {
      const { data, error } = await supabase
        .from('events')
        .insert(event)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating event:', error)
      return null
    }
  }

  static async updateEvent(id: number, updates: Partial<Event>): Promise<Event | null> {
    try {
      const { data, error } = await supabase
        .from('events')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating event:', error)
      return null
    }
  }

  static async deleteEvent(id: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      return true
    } catch (error) {
      console.error('Error deleting event:', error)
      return false
    }
  }
}