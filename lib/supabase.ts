import { createClient } from '@supabase/supabase-js'

// Create a single supabase client for interacting with your database
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

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

// Database operations
export class DatabaseService {
  // Events
  static async getEvents() {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: true })
    
    if (error) throw error
    return data as Event[]
  }

  static async createEvent(event: Omit<Event, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('events')
      .insert([event])
      .select()
    
    if (error) throw error
    return data[0] as Event
  }

  static async updateEvent(id: number, updates: Partial<Event>) {
    const { data, error } = await supabase
      .from('events')
      .update(updates)
      .eq('id', id)
      .select()
    
    if (error) throw error
    return data[0] as Event
  }

  static async deleteEvent(id: number) {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return true
  }

  // Projects
  static async getProjects() {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data as Project[]
  }

  static async createProject(project: Omit<Project, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('projects')
      .insert([project])
      .select()
    
    if (error) throw error
    return data[0] as Project
  }

  // Users
  static async getUsers() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data as User[]
  }

  static async getUserById(id: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data as User
  }
}