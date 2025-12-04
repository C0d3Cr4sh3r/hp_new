'use client'

import { useState, useEffect, useCallback } from 'react'
import ArcaneNavigation from '@/components/arcane/ArcaneNavigation'
import ArcaneFooter from '@/components/arcane/ArcaneFooter'

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
  screenshot_url?: string
  created_at?: string
}

export default function BugTrackerPage() {
  const [bugs, setBugs] = useState<BugReport[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const fetchBugs = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/bugs')
      if (!res.ok) throw new Error('Failed to fetch bugs')
      const data = await res.json()
      setBugs(data)
    } catch (err) {
      console.error('Error fetching bugs:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBugs()
  }, [fetchBugs])

  const handleSubmitBug = async (bugData: Omit<BugReport, 'id' | 'created_at'>) => {
    try {
      setSubmitting(true)
      const res = await fetch('/api/bugs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bugData)
      })
      if (!res.ok) throw new Error('Failed to submit bug')
      const newBug = await res.json()
      setBugs((prev) => [newBug, ...prev])
      setShowForm(false)
    } catch (err) {
      console.error('Error submitting bug:', err)
      alert('Bug-Report konnte nicht gesendet werden.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-purple-300">Bug-Reports werden geladen...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <ArcaneNavigation />
      <main className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Bug Tracker</h1>
          <p className="text-purple-200 text-lg">
            Melde Probleme und verfolge Bugfixes für unsere Anwendungen
          </p>
        </div>

        {/* Submit Bug Button */}
        <div className="mb-8">
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-6 py-3 rounded-lg font-semibold transition-all"
          >
            {showForm ? 'Abbrechen' : 'Bug melden'}
          </button>
        </div>

        {/* Bug Report Form */}
        {showForm && <BugReportForm onSubmit={handleSubmitBug} onCancel={() => setShowForm(false)} submitting={submitting} />}

        {/* Bug List */}
        <div className="space-y-4">
          {bugs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-purple-300 text-lg">Keine Bug-Reports vorhanden.</p>
            </div>
          ) : (
            bugs.map((bug) => <BugCard key={bug.id} bug={bug} />)
          )}
        </div>
      </main>
      <ArcaneFooter />
    </>
  )
}

function BugReportForm({
  onSubmit,
  onCancel,
  submitting = false
}: {
  onSubmit: (data: Omit<BugReport, 'id' | 'created_at'>) => void
  onCancel: () => void
  submitting?: boolean
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
    screenshot_url: string
  }>({
    title: '',
    description: '',
    steps_to_reproduce: '',
    expected_behavior: '',
    actual_behavior: '',
    severity: 'medium',
    status: 'open',
    reporter_name: '',
    reporter_email: '',
    screenshot_url: ''
  })
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null)
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null)
  const [uploadingScreenshot, setUploadingScreenshot] = useState(false)

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setScreenshotFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setScreenshotPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadScreenshot = async (): Promise<string | null> => {
    if (!screenshotFile) return null

    setUploadingScreenshot(true)
    try {
      const formDataUpload = new FormData()
      formDataUpload.append('file', screenshotFile)

      const res = await fetch('/api/bugs/upload', {
        method: 'POST',
        body: formDataUpload
      })

      if (!res.ok) throw new Error('Upload failed')
      const data = await res.json()
      return data.url
    } catch (err) {
      console.error('Screenshot upload error:', err)
      return null
    } finally {
      setUploadingScreenshot(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    let screenshotUrl = formData.screenshot_url
    if (screenshotFile) {
      const uploadedUrl = await uploadScreenshot()
      if (uploadedUrl) {
        screenshotUrl = uploadedUrl
      }
    }

    onSubmit({ ...formData, screenshot_url: screenshotUrl })
  }

  return (
    <div className="mb-8 bg-black/40 backdrop-blur-sm rounded-lg p-6 border border-purple-500/20">
      <h3 className="text-xl font-semibold text-white mb-4">Bug melden</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-purple-300 text-sm font-medium mb-2">
              Titel *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full px-3 py-2 bg-black/50 border border-purple-500/30 rounded-md text-white placeholder-purple-400 focus:outline-none focus:border-purple-500"
              placeholder="Kurze Beschreibung des Problems"
            />
          </div>
          <div>
            <label className="block text-purple-300 text-sm font-medium mb-2">
              Schweregrad
            </label>
            <select
              value={formData.severity}
              onChange={(e) => setFormData({...formData, severity: e.target.value as 'low' | 'medium' | 'high' | 'critical'})}
              className="w-full px-3 py-2 bg-black/50 border border-purple-500/30 rounded-md text-white focus:outline-none focus:border-purple-500"
            >
              <option value="low">Niedrig</option>
              <option value="medium">Mittel</option>
              <option value="high">Hoch</option>
              <option value="critical">Kritisch</option>
            </select>
          </div>
          <div>
            <label className="block text-purple-300 text-sm font-medium mb-2">
              Dein Name
            </label>
            <input
              type="text"
              value={formData.reporter_name}
              onChange={(e) => setFormData({...formData, reporter_name: e.target.value})}
              className="w-full px-3 py-2 bg-black/50 border border-purple-500/30 rounded-md text-white placeholder-purple-400 focus:outline-none focus:border-purple-500"
              placeholder="Dein Name (optional)"
            />
          </div>
          <div>
            <label className="block text-purple-300 text-sm font-medium mb-2">
              E-Mail
            </label>
            <input
              type="email"
              value={formData.reporter_email}
              onChange={(e) => setFormData({...formData, reporter_email: e.target.value})}
              className="w-full px-3 py-2 bg-black/50 border border-purple-500/30 rounded-md text-white placeholder-purple-400 focus:outline-none focus:border-purple-500"
              placeholder="deine@email.de (optional)"
            />
          </div>
        </div>

        <div>
          <label className="block text-purple-300 text-sm font-medium mb-2">
            Beschreibung *
          </label>
          <textarea
            required
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            rows={3}
            className="w-full px-3 py-2 bg-black/50 border border-purple-500/30 rounded-md text-white placeholder-purple-400 focus:outline-none focus:border-purple-500"
            placeholder="Detaillierte Beschreibung des Bugs"
          />
        </div>

        <div>
          <label className="block text-purple-300 text-sm font-medium mb-2">
            Schritte zur Reproduktion
          </label>
          <textarea
            value={formData.steps_to_reproduce}
            onChange={(e) => setFormData({...formData, steps_to_reproduce: e.target.value})}
            rows={3}
            className="w-full px-3 py-2 bg-black/50 border border-purple-500/30 rounded-md text-white placeholder-purple-400 focus:outline-none focus:border-purple-500"
            placeholder="1. Gehe zu...\n2. Klicke auf...\n3. Beobachte..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-purple-300 text-sm font-medium mb-2">
              Erwartetes Verhalten
            </label>
            <textarea
              value={formData.expected_behavior}
              onChange={(e) => setFormData({...formData, expected_behavior: e.target.value})}
              rows={2}
              className="w-full px-3 py-2 bg-black/50 border border-purple-500/30 rounded-md text-white placeholder-purple-400 focus:outline-none focus:border-purple-500"
              placeholder="Was sollte passieren"
            />
          </div>
          <div>
            <label className="block text-purple-300 text-sm font-medium mb-2">
              Tatsächliches Verhalten
            </label>
            <textarea
              value={formData.actual_behavior}
              onChange={(e) => setFormData({...formData, actual_behavior: e.target.value})}
              rows={2}
              className="w-full px-3 py-2 bg-black/50 border border-purple-500/30 rounded-md text-white placeholder-purple-400 focus:outline-none focus:border-purple-500"
              placeholder="Was tatsächlich passiert"
            />
          </div>
        </div>

        {/* Screenshot Upload */}
        <div>
          <label className="block text-purple-300 text-sm font-medium mb-2">
            Screenshot (optional)
          </label>
          <div className="flex items-center gap-4">
            <label className="cursor-pointer bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 rounded-lg px-4 py-2 text-sm text-white transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleScreenshotChange}
                className="hidden"
              />
              📷 Bild auswählen
            </label>
            {screenshotPreview && (
              <div className="relative">
                <img src={screenshotPreview} alt="Screenshot Preview" className="h-16 w-auto rounded border border-purple-500/30" />
                <button
                  type="button"
                  onClick={() => { setScreenshotFile(null); setScreenshotPreview(null); }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={submitting || uploadingScreenshot}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-6 py-2 rounded-md font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting || uploadingScreenshot ? 'Wird gesendet...' : 'Bug melden'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting || uploadingScreenshot}
            className="bg-gray-600 hover:bg-gray-500 text-white px-6 py-2 rounded-md font-semibold transition-all disabled:opacity-50"
          >
            Abbrechen
          </button>
        </div>
      </form>
    </div>
  )
}

function BugCard({ bug }: { bug: BugReport }) {
  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'low': return 'Niedrig'
      case 'medium': return 'Mittel'
      case 'high': return 'Hoch'
      case 'critical': return 'Kritisch'
      default: return severity
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-green-600/20 text-green-300 border-green-600/30'
      case 'medium': return 'bg-yellow-600/20 text-yellow-300 border-yellow-600/30'
      case 'high': return 'bg-orange-600/20 text-orange-300 border-orange-600/30'
      case 'critical': return 'bg-red-600/20 text-red-300 border-red-600/30'
      default: return 'bg-gray-600/20 text-gray-300 border-gray-600/30'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open': return 'Offen'
      case 'in_progress': return 'In Arbeit'
      case 'resolved': return 'Gelöst'
      case 'closed': return 'Geschlossen'
      default: return status
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
            {getSeverityLabel(bug.severity)}
          </span>
          <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(bug.status)}`}>
            {getStatusLabel(bug.status)}
          </span>
        </div>
      </div>

      <p className="text-purple-200 mb-4">{bug.description}</p>

      {bug.screenshot_url && (
        <div className="mb-4">
          <a href={bug.screenshot_url} target="_blank" rel="noopener noreferrer">
            <img
              src={bug.screenshot_url}
              alt="Bug Screenshot"
              className="max-h-48 rounded-lg border border-purple-500/30 hover:border-purple-500/50 transition-colors"
            />
          </a>
        </div>
      )}

      <div className="text-sm text-purple-300 space-y-1">
        {bug.reporter_name && <p><strong>Gemeldet von:</strong> {bug.reporter_name}</p>}
        {bug.created_at && <p><strong>Datum:</strong> {new Date(bug.created_at).toLocaleDateString('de-DE')}</p>}
      </div>
    </div>
  )
}
