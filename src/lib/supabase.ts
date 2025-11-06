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

const mockEvents: Event[] = [
  {
    id: 1,
    title: 'Portrait Shooting mit Model Sarah',
    description: 'Kreatives Portrait-Shooting im urbanen Umfeld',
    date: '2024-11-15',
    time: '14:00',
    location: 'Hamburg Speicherstadt',
    type: 'tfp',
    status: 'confirmed',
  },
  {
    id: 2,
    title: 'Fashion Shoot Downtown',
    description: 'Kommerzielle Fashion-Fotografie für neues Label',
    date: '2024-11-20',
    time: '10:00',
    location: 'Berlin Mitte',
    type: 'paid',
    status: 'planned',
  },
]

export class DatabaseService {
  static async getEvents() {
    try {
      const { data, error } = await supabase.from('events').select('*').order('date', { ascending: true })

      if (error) {
        console.warn('Supabase error, using mock data:', error)
        return mockEvents
      }
      return data as Event[]
    } catch (error) {
      console.warn('Supabase not available, using mock data', error)
      return mockEvents
    }
  }

  static async createEvent(event: Omit<Event, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await supabase.from('events').insert([event]).select()

      if (error) {
        console.warn('Supabase error, using mock creation:', error)
        const newEvent = {
          ...event,
          id: mockEvents.length + 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        mockEvents.push(newEvent)
        return newEvent
      }
      return data[0] as Event
    } catch (error) {
      console.warn('Supabase not available, using mock creation', error)
      const newEvent = {
        ...event,
        id: mockEvents.length + 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      mockEvents.push(newEvent)
      return newEvent
    }
  }

  static async updateEvent(id: number, updates: Partial<Event>) {
    try {
      const { data, error } = await supabase.from('events').update(updates).eq('id', id).select()

      if (error) {
        console.warn('Supabase error, using mock update:', error)
        const eventIndex = mockEvents.findIndex((e) => e.id === id)
        if (eventIndex >= 0) {
          mockEvents[eventIndex] = { ...mockEvents[eventIndex], ...updates }
          return mockEvents[eventIndex]
        }
        throw new Error('Event not found')
      }
      return data[0] as Event
    } catch (error) {
      console.warn('Supabase not available, using mock update', error)
      const eventIndex = mockEvents.findIndex((e) => e.id === id)
      if (eventIndex >= 0) {
        mockEvents[eventIndex] = { ...mockEvents[eventIndex], ...updates }
        return mockEvents[eventIndex]
      }
      throw error
    }
  }

  static async deleteEvent(id: number) {
    try {
      const { error } = await supabase.from('events').delete().eq('id', id)

      if (error) {
        console.warn('Supabase error, using mock deletion:', error)
        const eventIndex = mockEvents.findIndex((e) => e.id === id)
        if (eventIndex >= 0) {
          mockEvents.splice(eventIndex, 1)
          return true
        }
        throw new Error('Event not found')
      }
      return true
    } catch (error) {
      console.warn('Supabase not available, using mock deletion', error)
      const eventIndex = mockEvents.findIndex((e) => e.id === id)
      if (eventIndex >= 0) {
        mockEvents.splice(eventIndex, 1)
        return true
      }
      throw error
    }
  }

  static async getProjects() {
    try {
      const { data, error } = await supabase.from('projects').select('*').order('created_at', { ascending: false })

      if (error) {
        console.warn('Supabase error, returning empty projects:', error)
        return []
      }
      return data as Project[]
    } catch (error) {
      console.warn('Supabase not available, returning empty projects', error)
      return []
    }
  }

  static async createProject(project: Omit<Project, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await supabase.from('projects').insert([project]).select()

      if (error) {
        console.warn('Supabase error, using mock project creation:', error)
        return {
          ...project,
          id: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      }
      return data[0] as Project
    } catch (error) {
      console.warn('Supabase not available, using mock project creation', error)
      return {
        ...project,
        id: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    }
  }

  static async getUsers() {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.warn('Supabase error, returning empty users:', error)
        return []
      }
      return data as User[]
    } catch (error) {
      console.warn('Supabase not available, returning empty users', error)
      return []
    }
  }

  static async getUserById(id: string) {
    try {
      const { data, error } = await supabase.from('user_profiles').select('*').eq('id', id).single()

      if (error) {
        console.warn('Supabase error, returning mock user:', error)
        return {
          id,
          email: 'demo@example.com',
          name: 'Demo User',
          role: 'photographer' as const,
        }
      }
      return data as User
    } catch (error) {
      console.warn('Supabase not available, returning mock user', error)
      return {
        id,
        email: 'demo@example.com',
        name: 'Demo User',
        role: 'photographer' as const,
      }
    }
  }
}
