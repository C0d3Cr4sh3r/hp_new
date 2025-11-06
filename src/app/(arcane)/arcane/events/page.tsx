'use client'

import { useState, useEffect } from 'react'
import { Event } from '../../../../../lib/supabase'
import ArcaneNavigation from '@/components/arcane/ArcaneNavigation'

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)

  // Fetch events from API
  useEffect(() => {
    async function fetchEvents() {
      try {
        const response = await fetch('/api/events')
        if (!response.ok) throw new Error('Failed to fetch events')
        const data = await response.json()
        setEvents(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

  const handleCreateEvent = async (eventData: Omit<Event, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData)
      })

      if (!response.ok) throw new Error('Failed to create event')
      
      const newEvent = await response.json()
      setEvents([...events, newEvent])
      setShowCreateForm(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create event')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-purple-300">Loading events...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <ArcaneNavigation />
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Event Management</h1>
          <p className="text-purple-200 text-lg">
            Verwalte deine TFP-Shootings und kreative Projekte
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-900/50 border border-red-500 rounded-lg p-4">
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {/* Create Event Button */}
        <div className="mb-8">
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-6 py-3 rounded-lg font-semibold transition-all"
          >
            {showCreateForm ? 'Cancel' : 'New Event'}
          </button>
        </div>

        {/* Create Event Form */}
        {showCreateForm && (
          <CreateEventForm 
            onSubmit={handleCreateEvent}
            onCancel={() => setShowCreateForm(false)}
          />
        )}

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-purple-300 text-lg">No events found. Create your first event!</p>
            </div>
          ) : (
            events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))
          )}
        </div>
      </div>
    </>
  )
}

function CreateEventForm({ 
  onSubmit, 
  onCancel 
}: { 
  onSubmit: (data: Omit<Event, 'id' | 'created_at' | 'updated_at'>) => void
  onCancel: () => void 
}) {
  const [formData, setFormData] = useState<{
    title: string
    description: string
    date: string
    time: string
    location: string
    type: 'tfp' | 'paid' | 'collaboration'
    status: 'planned' | 'confirmed' | 'completed' | 'cancelled'
  }>({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    type: 'tfp',
    status: 'planned'
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <div className="mb-8 bg-black/40 backdrop-blur-sm rounded-lg p-6 border border-purple-500/20">
      <h3 className="text-xl font-semibold text-white mb-4">Create New Event</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-purple-300 text-sm font-medium mb-2">
              Event Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full px-3 py-2 bg-black/50 border border-purple-500/30 rounded-md text-white placeholder-purple-400 focus:outline-none focus:border-purple-500"
              placeholder="Portfolio Shooting"
            />
          </div>
          <div>
            <label className="block text-purple-300 text-sm font-medium mb-2">
              Date *
            </label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              className="w-full px-3 py-2 bg-black/50 border border-purple-500/30 rounded-md text-white focus:outline-none focus:border-purple-500"
            />
          </div>
          <div>
            <label className="block text-purple-300 text-sm font-medium mb-2">
              Time
            </label>
            <input
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({...formData, time: e.target.value})}
              className="w-full px-3 py-2 bg-black/50 border border-purple-500/30 rounded-md text-white focus:outline-none focus:border-purple-500"
            />
          </div>
          <div>
            <label className="block text-purple-300 text-sm font-medium mb-2">
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              className="w-full px-3 py-2 bg-black/50 border border-purple-500/30 rounded-md text-white placeholder-purple-400 focus:outline-none focus:border-purple-500"
              placeholder="Studio, Location, etc."
            />
          </div>
          <div>
            <label className="block text-purple-300 text-sm font-medium mb-2">
              Type *
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value as 'tfp' | 'paid' | 'collaboration'})}
              className="w-full px-3 py-2 bg-black/50 border border-purple-500/30 rounded-md text-white focus:outline-none focus:border-purple-500"
            >
              <option value="tfp">TFP (Time for Prints)</option>
              <option value="paid">Paid Shooting</option>
              <option value="collaboration">Collaboration</option>
            </select>
          </div>
          <div>
            <label className="block text-purple-300 text-sm font-medium mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value as 'planned' | 'confirmed' | 'completed' | 'cancelled'})}
              className="w-full px-3 py-2 bg-black/50 border border-purple-500/30 rounded-md text-white focus:outline-none focus:border-purple-500"
            >
              <option value="planned">Planned</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-purple-300 text-sm font-medium mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            rows={3}
            className="w-full px-3 py-2 bg-black/50 border border-purple-500/30 rounded-md text-white placeholder-purple-400 focus:outline-none focus:border-purple-500"
            placeholder="Event details, requirements, etc."
          />
        </div>
        <div className="flex gap-4">
          <button
            type="submit"
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-6 py-2 rounded-md font-semibold transition-all"
          >
            Create Event
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-600 hover:bg-gray-500 text-white px-6 py-2 rounded-md font-semibold transition-all"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

function EventCard({ event }: { event: Event }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planned': return 'bg-yellow-600/20 text-yellow-300 border-yellow-600/30'
      case 'confirmed': return 'bg-blue-600/20 text-blue-300 border-blue-600/30'
      case 'completed': return 'bg-green-600/20 text-green-300 border-green-600/30'
      case 'cancelled': return 'bg-red-600/20 text-red-300 border-red-600/30'
      default: return 'bg-purple-600/20 text-purple-300 border-purple-600/30'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'tfp': return 'bg-purple-600/20 text-purple-300'
      case 'paid': return 'bg-green-600/20 text-green-300'
      case 'collaboration': return 'bg-blue-600/20 text-blue-300'
      default: return 'bg-gray-600/20 text-gray-300'
    }
  }

  return (
    <div className="bg-black/40 backdrop-blur-sm rounded-lg p-6 border border-purple-500/20 hover:border-purple-500/40 transition-all">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold text-white truncate">{event.title}</h3>
        <div className="flex gap-2">
          <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(event.status)}`}>
            {event.status}
          </span>
          <span className={`px-2 py-1 text-xs rounded-full ${getTypeColor(event.type)}`}>
            {event.type}
          </span>
        </div>
      </div>
      
      <div className="space-y-2 text-sm text-purple-200">
        <p><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
        {event.time && <p><strong>Time:</strong> {event.time}</p>}
        {event.location && <p><strong>Location:</strong> {event.location}</p>}
        {event.description && (
          <p className="mt-3 text-purple-300">
            {event.description.length > 100 
              ? `${event.description.substring(0, 100)}...` 
              : event.description
            }
          </p>
        )}
      </div>
      
      <div className="mt-4 flex gap-2">
        <button className="text-purple-400 hover:text-purple-300 text-sm font-medium">
          Edit
        </button>
        <button className="text-red-400 hover:text-red-300 text-sm font-medium">
          Delete
        </button>
      </div>
    </div>
  )
}
