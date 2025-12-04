'use client'

import { useState, useEffect, useCallback } from 'react'

interface BugReport {
  id: number
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
  created_at: string
  updated_at: string
}

export function BugPanel() {
  const [records, setRecords] = useState<BugReport[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBugs = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/bugs', { credentials: 'include' })
      if (!res.ok) throw new Error('Failed to fetch bugs')
      const data = await res.json()
      setRecords(data)
      setError(null)
    } catch (err) {
      console.error('Error fetching bugs:', err)
      setError('Bug-Reports konnten nicht geladen werden.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBugs()
  }, [fetchBugs])

  const handleStatusUpdate = async (id: number, status: BugReport['status']) => {
    try {
      const res = await fetch(`/api/bugs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status })
      })
      if (!res.ok) throw new Error('Failed to update status')
      setRecords((prev) => prev.map((record) => (record.id === id ? { ...record, status } : record)))
    } catch (err) {
      console.error('Error updating bug status:', err)
      alert('Status konnte nicht aktualisiert werden.')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Bug-Report wirklich löschen?')) return
    try {
      const res = await fetch(`/api/bugs/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      if (!res.ok) throw new Error('Failed to delete bug')
      setRecords((prev) => prev.filter((record) => record.id !== id))
    } catch (err) {
      console.error('Error deleting bug:', err)
      alert('Bug-Report konnte nicht gelöscht werden.')
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400 border-red-400/50'
      case 'high': return 'text-orange-400 border-orange-400/50'
      case 'medium': return 'text-yellow-400 border-yellow-400/50'
      case 'low': return 'text-green-400 border-green-400/50'
      default: return 'text-purple-400 border-purple-400/50'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400">{error}</p>
        <button onClick={fetchBugs} className="mt-4 px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-500">
          Erneut versuchen
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Bug Tracker</h2>
          <p className="text-sm text-purple-200">Überblicke aktuelle Bugs und aktualisiere den Status direkt.</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-purple-300">{records.length} Bug-Reports</span>
          <button
            onClick={fetchBugs}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 rounded-lg transition-colors disabled:opacity-50"
          >
            <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Aktualisieren
          </button>
        </div>
      </div>

      {records.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-purple-300">Keine Bug-Reports vorhanden.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {records.map((record) => (
            <article key={record.id} className="rounded-2xl border border-purple-600/30 bg-black/20 p-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1">
                  <p className="text-xs uppercase tracking-widest text-purple-300">#{record.id}</p>
                  <h3 className="text-lg font-semibold text-white">{record.title}</h3>
                  <p className="mt-2 text-sm text-purple-100">{record.description}</p>
                  {record.reporter_name && (
                    <p className="mt-2 text-xs text-purple-300">
                      Gemeldet von: {record.reporter_name} {record.reporter_email && `(${record.reporter_email})`}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-2 text-sm text-purple-200 sm:text-right">
                  <span className={`px-2 py-1 rounded-full border text-xs ${getSeverityColor(record.severity)}`}>
                    {record.severity}
                  </span>
                  <span>Gemeldet am {formatDate(record.created_at)}</span>
                </div>
              </div>

              {/* Screenshot Anzeige */}
              {record.screenshot_url && (
                <div className="mt-4">
                  <p className="text-xs uppercase tracking-widest text-purple-300 mb-2">Screenshot</p>
                  <a href={record.screenshot_url} target="_blank" rel="noopener noreferrer" className="inline-block">
                    <img
                      src={record.screenshot_url}
                      alt="Bug Screenshot"
                      className="max-h-48 rounded-lg border border-purple-500/30 hover:border-purple-500/50 transition-colors"
                    />
                  </a>
                </div>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <label className="text-xs font-semibold uppercase tracking-widest text-purple-300">Status</label>
                <select
                  value={record.status}
                  onChange={(event) => handleStatusUpdate(record.id, event.target.value as BugReport['status'])}
                  className="rounded-full border border-purple-500/40 bg-black/40 px-4 py-2 text-sm text-white outline-none focus:border-purple-300"
                >
                  <option value="open">Offen</option>
                  <option value="in_progress">In Arbeit</option>
                  <option value="resolved">Gelöst</option>
                  <option value="closed">Geschlossen</option>
                </select>
                <button
                  onClick={() => handleDelete(record.id)}
                  className="ml-auto px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  Löschen
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

