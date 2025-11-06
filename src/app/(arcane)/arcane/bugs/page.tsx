'use client'

import { useState, useEffect } from 'react'
import ArcaneNavigation from '@/components/arcane/ArcaneNavigation'

interface BugReport {
  id?: number
  title: string
  description: string
  steps_to_reproduce?: string
  expected_behavior?: string
  actual_behavior?: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  reporter_name?: string
  reporter_email?: string
  created_at?: string
}

export default function BugTrackerPage() {
  const [bugs, setBugs] = useState<BugReport[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)

  // Mock data for demonstration (replace with API call)
  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setBugs([
        {
          id: 1,
          title: 'Login form not working on mobile',
          description: 'Users cannot log in using mobile devices',
          severity: 'high',
          status: 'open',
          reporter_name: 'John Doe',
          created_at: '2024-01-15'
        },
        {
          id: 2,
          title: 'Image upload timeout',
          description: 'Large images fail to upload',
          severity: 'medium', 
          status: 'in_progress',
          reporter_name: 'Jane Smith',
          created_at: '2024-01-14'
        }
      ])
      setLoading(false)
    }, 1000)
  }, [])

  const handleSubmitBug = (bugData: Omit<BugReport, 'id' | 'created_at'>) => {
    const newBug: BugReport = {
      ...bugData,
      id: bugs.length + 1,
      created_at: new Date().toISOString().split('T')[0]
    }
    setBugs([newBug, ...bugs])
    setShowForm(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-purple-300">Loading bug reports...</p>
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
          <h1 className="text-4xl font-bold text-white mb-4">Bug Tracker</h1>
          <p className="text-purple-200 text-lg">
            Report issues and track bug fixes for ArcanePixels applications
          </p>
        </div>

        {/* Submit Bug Button */}
        <div className="mb-8">
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-6 py-3 rounded-lg font-semibold transition-all"
          >
            {showForm ? 'Cancel' : 'Report Bug'}
          </button>
        </div>

        {/* Bug Report Form */}
        {showForm && <BugReportForm onSubmit={handleSubmitBug} onCancel={() => setShowForm(false)} />}

        {/* Bug List */}
        <div className="space-y-4">
          {bugs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-purple-300 text-lg">No bug reports found.</p>
            </div>
          ) : (
            bugs.map((bug) => <BugCard key={bug.id} bug={bug} />)
          )}
        </div>
      </div>
    </>
  )
}

function BugReportForm({ 
  onSubmit, 
  onCancel 
}: { 
  onSubmit: (data: Omit<BugReport, 'id' | 'created_at'>) => void
  onCancel: () => void 
}) {
  const [formData, setFormData] = useState<{
    title: string
    description: string
    steps_to_reproduce: string
    expected_behavior: string
    actual_behavior: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    status: 'open' | 'in_progress' | 'resolved' | 'closed'
    reporter_name: string
    reporter_email: string
  }>({
    title: '',
    description: '',
    steps_to_reproduce: '',
    expected_behavior: '',
    actual_behavior: '',
    severity: 'medium',
    status: 'open',
    reporter_name: '',
    reporter_email: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <div className="mb-8 bg-black/40 backdrop-blur-sm rounded-lg p-6 border border-purple-500/20">
      <h3 className="text-xl font-semibold text-white mb-4">Report a Bug</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-purple-300 text-sm font-medium mb-2">
              Bug Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full px-3 py-2 bg-black/50 border border-purple-500/30 rounded-md text-white placeholder-purple-400 focus:outline-none focus:border-purple-500"
              placeholder="Short description of the issue"
            />
          </div>
          <div>
            <label className="block text-purple-300 text-sm font-medium mb-2">
              Severity
            </label>
            <select
              value={formData.severity}
              onChange={(e) => setFormData({...formData, severity: e.target.value as 'low' | 'medium' | 'high' | 'critical'})}
              className="w-full px-3 py-2 bg-black/50 border border-purple-500/30 rounded-md text-white focus:outline-none focus:border-purple-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <div>
            <label className="block text-purple-300 text-sm font-medium mb-2">
              Your Name
            </label>
            <input
              type="text"
              value={formData.reporter_name}
              onChange={(e) => setFormData({...formData, reporter_name: e.target.value})}
              className="w-full px-3 py-2 bg-black/50 border border-purple-500/30 rounded-md text-white placeholder-purple-400 focus:outline-none focus:border-purple-500"
              placeholder="Your name (optional)"
            />
          </div>
          <div>
            <label className="block text-purple-300 text-sm font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              value={formData.reporter_email}
              onChange={(e) => setFormData({...formData, reporter_email: e.target.value})}
              className="w-full px-3 py-2 bg-black/50 border border-purple-500/30 rounded-md text-white placeholder-purple-400 focus:outline-none focus:border-purple-500"
              placeholder="your@email.com (optional)"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-purple-300 text-sm font-medium mb-2">
            Description *
          </label>
          <textarea
            required
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            rows={3}
            className="w-full px-3 py-2 bg-black/50 border border-purple-500/30 rounded-md text-white placeholder-purple-400 focus:outline-none focus:border-purple-500"
            placeholder="Detailed description of the bug"
          />
        </div>

        <div>
          <label className="block text-purple-300 text-sm font-medium mb-2">
            Steps to Reproduce
          </label>
          <textarea
            value={formData.steps_to_reproduce}
            onChange={(e) => setFormData({...formData, steps_to_reproduce: e.target.value})}
            rows={3}
            className="w-full px-3 py-2 bg-black/50 border border-purple-500/30 rounded-md text-white placeholder-purple-400 focus:outline-none focus:border-purple-500"
            placeholder="1. Go to...\n2. Click on...\n3. Observe..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-purple-300 text-sm font-medium mb-2">
              Expected Behavior
            </label>
            <textarea
              value={formData.expected_behavior}
              onChange={(e) => setFormData({...formData, expected_behavior: e.target.value})}
              rows={2}
              className="w-full px-3 py-2 bg-black/50 border border-purple-500/30 rounded-md text-white placeholder-purple-400 focus:outline-none focus:border-purple-500"
              placeholder="What should happen"
            />
          </div>
          <div>
            <label className="block text-purple-300 text-sm font-medium mb-2">
              Actual Behavior
            </label>
            <textarea
              value={formData.actual_behavior}
              onChange={(e) => setFormData({...formData, actual_behavior: e.target.value})}
              rows={2}
              className="w-full px-3 py-2 bg-black/50 border border-purple-500/30 rounded-md text-white placeholder-purple-400 focus:outline-none focus:border-purple-500"
              placeholder="What actually happens"
            />
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-6 py-2 rounded-md font-semibold transition-all"
          >
            Submit Bug Report
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

function BugCard({ bug }: { bug: BugReport }) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-green-600/20 text-green-300 border-green-600/30'
      case 'medium': return 'bg-yellow-600/20 text-yellow-300 border-yellow-600/30'
      case 'high': return 'bg-orange-600/20 text-orange-300 border-orange-600/30'
      case 'critical': return 'bg-red-600/20 text-red-300 border-red-600/30'
      default: return 'bg-gray-600/20 text-gray-300 border-gray-600/30'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-600/20 text-red-300 border-red-600/30'
      case 'in_progress': return 'bg-blue-600/20 text-blue-300 border-blue-600/30'
      case 'resolved': return 'bg-green-600/20 text-green-300 border-green-600/30'
      case 'closed': return 'bg-gray-600/20 text-gray-300 border-gray-600/30'
      default: return 'bg-purple-600/20 text-purple-300 border-purple-600/30'
    }
  }

  return (
    <div className="bg-black/40 backdrop-blur-sm rounded-lg p-6 border border-purple-500/20 hover:border-purple-500/40 transition-all">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold text-white">{bug.title}</h3>
        <div className="flex gap-2">
          <span className={`px-2 py-1 text-xs rounded-full border ${getSeverityColor(bug.severity)}`}>
            {bug.severity}
          </span>
          <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(bug.status)}`}>
            {bug.status.replace('_', ' ')}
          </span>
        </div>
      </div>
      
      <p className="text-purple-200 mb-4">{bug.description}</p>
      
      <div className="text-sm text-purple-300 space-y-1">
        {bug.reporter_name && <p><strong>Reported by:</strong> {bug.reporter_name}</p>}
        {bug.created_at && <p><strong>Date:</strong> {new Date(bug.created_at).toLocaleDateString()}</p>}
      </div>
      
      <div className="mt-4 flex gap-2">
        <button className="text-purple-400 hover:text-purple-300 text-sm font-medium">
          View Details
        </button>
        <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">
          Update Status
        </button>
      </div>
    </div>
  )
}
