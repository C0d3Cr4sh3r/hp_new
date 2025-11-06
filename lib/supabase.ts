// Conditional Supabase client für Build-Zeit
let supabase: any = null

if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  const { createClient } = require('@supabase/supabase-js')
  
  supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}

// Type definitions for database tables (based on PHP projects)
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

// Mock data für Demo-Zwecke
const mockEvents: Event[] = [
  {
    id: 1,
    title: 'Portrait Shooting mit Model Sarah',
    description: 'Kreatives Portrait-Shooting im urbanen Umfeld',
    date: '2024-11-15',
    time: '14:00',
    location: 'Hamburg Speicherstadt',
    type: 'tfp',
    status: 'confirmed'
  },
  {
    id: 2,
    title: 'Fashion Shoot Downtown',
    description: 'Kommerzielle Fashion-Fotografie für neues Label',
    date: '2024-11-20',
    time: '10:00',
    location: 'Berlin Mitte',
    type: 'paid',
    status: 'planned'
  }
]

// Database operations with fallback to mock data
export class DatabaseService {
  // Events
  static async getEvents() {
    if (!supabase) {
      return mockEvents
    }
    
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true })
      
      if (error) throw error
      return data as Event[]
    } catch (error) {
      console.warn('Supabase not available, using mock data')
      return mockEvents
    }
  }

  static async createEvent(event: Omit<Event, 'id' | 'created_at' | 'updated_at'>) {
    if (!supabase) {
      const newEvent = {
        ...event,
        id: mockEvents.length + 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      mockEvents.push(newEvent)
      return newEvent
    }

    try {
      const { data, error } = await supabase
        .from('events')
        .insert([event])
        .select()
      
      if (error) throw error
      return data[0] as Event
    } catch (error) {
      console.warn('Supabase not available, using mock creation')
      const newEvent = {
        ...event,
        id: mockEvents.length + 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      mockEvents.push(newEvent)
      return newEvent
    }
  }

  static async updateEvent(id: number, updates: Partial<Event>) {
    if (!supabase) {
      const eventIndex = mockEvents.findIndex(e => e.id === id)
      if (eventIndex >= 0) {
        mockEvents[eventIndex] = { ...mockEvents[eventIndex], ...updates }
        return mockEvents[eventIndex]
      }
      throw new Error('Event not found')
    }

    try {
      const { data, error } = await supabase
        .from('events')
        .update(updates)
        .eq('id', id)
        .select()
      
      if (error) throw error
      return data[0] as Event
    } catch (error) {
      console.warn('Supabase not available, using mock update')
      const eventIndex = mockEvents.findIndex(e => e.id === id)
      if (eventIndex >= 0) {
        mockEvents[eventIndex] = { ...mockEvents[eventIndex], ...updates }
        return mockEvents[eventIndex]
      }
      throw error
    }
  }

  static async deleteEvent(id: number) {
    if (!supabase) {
      const eventIndex = mockEvents.findIndex(e => e.id === id)
      if (eventIndex >= 0) {
        mockEvents.splice(eventIndex, 1)
        return true
      }
      throw new Error('Event not found')
    }

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      return true
    } catch (error) {
      console.warn('Supabase not available, using mock deletion')
      const eventIndex = mockEvents.findIndex(e => e.id === id)
      if (eventIndex >= 0) {
        mockEvents.splice(eventIndex, 1)
        return true
      }
      throw error
    }
  }

  // Projects
  static async getProjects() {
    if (!supabase) {
      return []
    }

    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data as Project[]
    } catch (error) {
      console.warn('Supabase not available, returning empty projects')
      return []
    }
  }

  static async createProject(project: Omit<Project, 'id' | 'created_at' | 'updated_at'>) {
    if (!supabase) {
      return {
        ...project,
        id: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    }

    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([project])
        .select()
      
      if (error) throw error
      return data[0] as Project
    } catch (error) {
      console.warn('Supabase not available, using mock project creation')
      return {
        ...project,
        id: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    }
  }

  // Users
  static async getUsers() {
    if (!supabase) {
      return []
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data as User[]
    } catch (error) {
      console.warn('Supabase not available, returning empty users')
      return []
    }
  }

  static async getUserById(id: string) {
    if (!supabase) {
      return {
        id,
        email: 'demo@example.com',
        name: 'Demo User',
        role: 'photographer' as const
      }
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) throw error
      return data as User
    } catch (error) {
      console.warn('Supabase not available, returning mock user')
      return {
        id,
        email: 'demo@example.com',
        name: 'Demo User',
        role: 'photographer' as const
      }
    }
  }
}

export { supabase }