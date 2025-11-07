import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

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
  title?: string // Optional title for display
  version: string
  platform: 'ios' | 'android' | 'web' | 'desktop'
  channel?: 'stable' | 'beta' | 'legacy' // Optional channel designation
  download_url: string
  file_url?: string // Alias for download_url
  release_date: string
  file_size: string
  description?: string
  is_latest: boolean
  download_count: number
  available_in_store?: boolean // Whether available in app store
  store_url?: string
  changelog_markdown?: string
  changelog_file_name?: string
  security_hash?: string
  created_at?: string
  updated_at?: string
}

export interface SiteSettings {
  id?: string
  site_name: string
  tagline: string | null
  support_email: string | null
  imprint: string | null
  privacy: string | null
  created_at?: string
  updated_at?: string
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  id: 'default',
  site_name: 'ArcanePixels',
  tagline: 'Digitale Experiences für Fotografen & Kreative',
  support_email: 'support@arcanepixels.com',
  imprint: 'ArcanePixels GmbH · Musterstraße 12 · 12345 Berlin',
  privacy: 'Wir verarbeiten personenbezogene Daten ausschließlich nach DSGVO-Richtlinien.',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

// Legacy export for backward compatibility
export type DownloadEntry = ShootingHubDownload

// Mock Downloads Data
const mockDownloads: ShootingHubDownload[] = [
  {
    id: 1,
    title: 'ShootingHub für iOS',
    version: '2.5.0',
    platform: 'ios',
    channel: 'stable',
    download_url: 'https://apps.apple.com/app/shootinghub',
    file_url: 'https://apps.apple.com/app/shootinghub',
    release_date: '2025-01-01',
    file_size: '45 MB',
    description: 'Shooting-Management für iOS',
    is_latest: true,
    download_count: 1250,
    available_in_store: true,
    store_url: 'https://apps.apple.com/app/shootinghub',
    changelog_markdown: '# ShootingHub 2.5.0\n\n- Verbesserte Shooting-Verwaltung\n- Neue Community-Features\n- Performance-Optimierungen',
    changelog_file_name: 'CHANGELOG_2_5_0.md',
    security_hash: 'placeholder-hash',
    created_at: '2025-01-01T12:00:00Z',
    updated_at: '2025-01-01T12:00:00Z',
  },
  {
    id: 2,
    title: 'ShootingHub für Android',
    version: '2.5.0',
    platform: 'android',
    channel: 'stable',
    download_url: 'https://play.google.com/store/apps/details?id=com.arcane.shootinghub',
    file_url: 'https://play.google.com/store/apps/details?id=com.arcane.shootinghub',
    release_date: '2025-01-01',
    file_size: '52 MB',
    description: 'Shooting-Management für Android',
    is_latest: true,
    download_count: 890,
    available_in_store: true,
    store_url: 'https://play.google.com/store/apps/details?id=com.arcane.shootinghub',
    changelog_markdown: '# ShootingHub 2.5.0\n\n- Verbesserte Shooting-Verwaltung\n- Neue Community-Features\n- Performance-Optimierungen',
    changelog_file_name: 'CHANGELOG_2_5_0.md',
    security_hash: 'placeholder-hash',
    created_at: '2025-01-01T12:00:00Z',
    updated_at: '2025-01-01T12:00:00Z',
  },
]

// Default ShootingHub Section Content
export const DEFAULT_SHOOTINGHUB_SECTION: ShootingHubSectionContent = {
  section_key: 'shootinghub',
  headline: 'ShootingHub',
  subheadline: 'Die ultimative App für Fotografen',
  description: 'Verwalte deine Shootings, Kunden und Termine in einer einzigen, professionellen App. ShootingHub revolutioniert dein Fotografie-Business.',
  bullets: [
    'Shooting-Verwaltung & Terminplanung',
    'Kundenverwaltung & Model-Database',
    'Automatische Rechnungserstellung',
    'Portfolio & Galerie-Management',
    'Analytics & Business-Insights',
    'Cross-Platform für iOS & Android'
  ],
  cta_label: 'App herunterladen',
  cta_url: '#downloads',
  image_url: '/api/placeholder/600/400?text=ShootingHub+App+Screenshot',
  sort_order: 1,
  is_active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}


const mockPortfolios: Portfolio[] = [
  {
    id: 1,
    title: 'Hochzeitsfotografie München',
    description: 'Romantische Hochzeitsreportage in München mit natürlichen Momenten',
    category: 'photography',
    image_url: '/api/placeholder/800/600?text=Hochzeit+München',
    image_alt: 'Hochzeitsfotografie München',
    image_width: 800,
    image_height: 600,
    client_name: 'Familie Müller',
    project_date: '2024-09-15',
    technologies: ['Canon EOS R5', 'Lightroom', 'Photoshop'],
    sort_order: 1,
    is_featured: true,
    status: 'active',
    created_at: '2024-09-15T12:00:00Z',
    updated_at: '2024-09-15T12:00:00Z',
  },
  {
    id: 2,
    title: 'Fotografen-Portfolio Website',
    description: 'Moderne Portfolio-Website für professionelle Fotografin',
    category: 'websites',
    image_url: '/api/placeholder/800/600?text=Portfolio+Website',
    image_alt: 'Fotografen Portfolio Website',
    image_width: 800,
    image_height: 600,
    client_name: 'Sarah Photography',
    project_date: '2024-08-20',
    project_url: 'https://sarah-photography.com',
    technologies: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Supabase'],
    sort_order: 2,
    is_featured: true,
    status: 'active',
    created_at: '2024-08-20T12:00:00Z',
    updated_at: '2024-08-20T12:00:00Z',
  },
  {
    id: 3,
    title: 'Shooting-Management App',
    description: 'Mobile App zur Verwaltung von Fotoshootings und Terminen',
    category: 'apps',
    image_url: '/api/placeholder/800/600?text=ShootingHub+App',
    image_alt: 'ShootingHub Mobile App',
    image_width: 800,
    image_height: 600,
    client_name: 'ArcanePixels',
    project_date: '2024-10-01',
    project_url: 'https://shootinghub.app',
    technologies: ['React Native', 'TypeScript', 'Supabase', 'Expo'],
    sort_order: 3,
    is_featured: true,
    status: 'active',
    created_at: '2024-10-01T12:00:00Z',
    updated_at: '2024-10-01T12:00:00Z',
  },
  {
    id: 4,
    title: 'Restaurant Marketing Kampagne',
    description: 'Komplette Marketing-Kampagne mit Food-Fotografie',
    category: 'marketing',
    image_url: '/api/placeholder/800/600?text=Restaurant+Marketing',
    image_alt: 'Restaurant Marketing Fotos',
    image_width: 800,
    image_height: 600,
    client_name: 'Bella Italia Restaurant',
    project_date: '2024-06-25',
    project_url: 'https://bella-italia.com',
    technologies: ['Canon EOS 5D', 'Foodstyling', 'Instagram Marketing'],
    sort_order: 4,
    is_featured: false,
    status: 'active',
    created_at: '2024-06-25T12:00:00Z',
    updated_at: '2024-06-25T12:00:00Z',
  },
]

const mockScreenshots: Screenshot[] = [
  {
    id: 1,
    title: 'Dashboard Overview',
    description: 'Hauptansicht des ShootingHub Dashboards',
    category: 'app',
    image_url: '/api/placeholder/800/600?text=Dashboard',
    image_alt: 'ShootingHub Dashboard',
    image_width: 800,
    image_height: 600,
    sort_order: 1,
    status: 'active',
    created_at: '2025-01-01T12:00:00Z',
    updated_at: '2025-01-01T12:00:00Z',
  },
  {
    id: 2,
    title: 'Shooting Planner',
    description: 'Terminplanung und -verwaltung',
    category: 'app',
    image_url: '/api/placeholder/800/600?text=Shooting+Planner',
    image_alt: 'ShootingHub Shooting Planner',
    image_width: 800,
    image_height: 600,
    sort_order: 2,
    status: 'active',
    created_at: '2025-01-01T12:00:00Z',
    updated_at: '2025-01-01T12:00:00Z',
  },
  {
    id: 3,
    title: 'Client Management',
    description: 'Kundenverwaltung und Kontakte',
    category: 'app',
    image_url: '/api/placeholder/800/600?text=Client+Management',
    image_alt: 'ShootingHub Client Management',
    image_width: 800,
    image_height: 600,
    sort_order: 3,
    status: 'active',
    created_at: '2025-01-01T12:00:00Z',
    updated_at: '2025-01-01T12:00:00Z',
  },
  {
    id: 4,
    title: 'Analytics Dashboard',
    description: 'Auswertungen und Statistiken',
    category: 'app',
    image_url: '/api/placeholder/800/600?text=Analytics',
    image_alt: 'ShootingHub Analytics',
    image_width: 800,
    image_height: 600,
    sort_order: 4,
    status: 'active',
    created_at: '2025-01-01T12:00:00Z',
    updated_at: '2025-01-01T12:00:00Z',
  },
]

export class DatabaseService {
  static async getSiteSettings(): Promise<SiteSettings> {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .limit(1)
        .maybeSingle()

      if (error) throw error
      if (!data) {
        return { ...DEFAULT_SITE_SETTINGS }
      }

      return {
        ...DEFAULT_SITE_SETTINGS,
        ...(data as SiteSettings),
      }
    } catch (error) {
      console.error('Error fetching site settings:', error)
      return { ...DEFAULT_SITE_SETTINGS }
    }
  }

  // News methods
  static async getNews(): Promise<NewsArticle[]> {
    try {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching news:', error)
      return []
    }
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
    try {
      const { data, error } = await supabase
        .from('screenshots')
        .select('*')
        .eq('status', 'active')
        .order('sort_order', { ascending: true })
      
      if (error) throw error
      return data || mockScreenshots
    } catch (error) {
      console.error('Error fetching screenshots:', error)
      return mockScreenshots
    }
  }

  static async getScreenshotsByCategory(category: string): Promise<Screenshot[]> {
    try {
      const { data, error } = await supabase
        .from('screenshots')
        .select('*')
        .eq('status', 'active')
        .eq('category', category)
        .order('sort_order', { ascending: true })
      
      if (error) throw error
      return data || mockScreenshots.filter(s => s.category === category)
    } catch (error) {
      console.error('Error fetching screenshots by category:', error)
      return mockScreenshots.filter(s => s.category === category)
    }
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
    try {
      const { data, error } = await supabase
        .from('portfolios')
        .select('*')
        .eq('status', 'active')
        .order('sort_order', { ascending: true })
      
      if (error) throw error
      return data || mockPortfolios
    } catch (error) {
      console.error('Error fetching portfolios:', error)
      return mockPortfolios
    }
  }

  static async getPortfoliosByCategory(category: string): Promise<Portfolio[]> {
    try {
      const { data, error } = await supabase
        .from('portfolios')
        .select('*')
        .eq('status', 'active')
        .eq('category', category)
        .order('sort_order', { ascending: true })
      
      if (error) throw error
      return data || mockPortfolios.filter(p => p.category === category)
    } catch (error) {
      console.error('Error fetching portfolios by category:', error)
      return mockPortfolios.filter(p => p.category === category)
    }
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
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('status', 'active')
        .order('sort_order', { ascending: true })
      
      if (error) throw error
      return data ?? []
    } catch (error) {
      console.error('Error fetching services:', error)
      return []
    }
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
    try {
      const { data, error } = await supabase
        .from('downloads')
        .select('*')
        .order('release_date', { ascending: false })
      
      if (error) throw error
      return data || mockDownloads
    } catch (error) {
      console.error('Error fetching downloads:', error)
      return mockDownloads
    }
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
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: false })
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching events:', error)
      return []
    }
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