'use client'

import { useCallback, useEffect, useState } from 'react'
import { ArrowPathIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { handleAdminUnauthorized } from '@/components/admin/utils/handleUnauthorized'

const ENDPOINT = '/api/site-settings'

type FormState = {
  eyebrow: string
  title: string
  description: string
}

type FeedbackState = { variant: 'success' | 'error'; message: string }

export function ServicesSettingsPanel() {
  const [form, setForm] = useState<FormState>({
    eyebrow: '',
    title: '',
    description: '',
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [feedback, setFeedback] = useState<FeedbackState | null>(null)

  const fetchSettings = useCallback(async () => {
    try {
      setIsLoading(true)
      const res = await fetch(ENDPOINT, { cache: 'no-store' })
      if (handleAdminUnauthorized(res)) return
      if (!res.ok) throw new Error('Laden fehlgeschlagen')
      const data = await res.json()
      setForm({
        eyebrow: data.services_section_eyebrow ?? '',
        title: data.services_section_title ?? '',
        description: data.services_section_description ?? '',
      })
    } catch (err) {
      setFeedback({ variant: 'error', message: err instanceof Error ? err.message : 'Fehler beim Laden' })
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  const handleSave = async () => {
    try {
      setIsSaving(true)
      setFeedback(null)
      const res = await fetch(ENDPOINT, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          services_section_eyebrow: form.eyebrow.trim() || null,
          services_section_title: form.title.trim() || null,
          services_section_description: form.description.trim() || null,
        }),
      })
      if (handleAdminUnauthorized(res)) return
      if (!res.ok) throw new Error('Speichern fehlgeschlagen')
      setFeedback({ variant: 'success', message: 'Services-Bereich gespeichert!' })
    } catch (err) {
      setFeedback({ variant: 'error', message: err instanceof Error ? err.message : 'Fehler beim Speichern' })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <ArrowPathIcon className="h-8 w-8 animate-spin text-purple-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">Services-Bereich</h2>
        <p className="mt-1 text-sm text-purple-300">Texte für die Services/Leistungen-Sektion auf der Startseite.</p>
      </div>

      {feedback && (
        <div className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm ${
          feedback.variant === 'success'
            ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-100'
            : 'border-rose-500/40 bg-rose-500/10 text-rose-100'
        }`}>
          {feedback.variant === 'success' ? <CheckCircleIcon className="h-5 w-5" /> : <ExclamationTriangleIcon className="h-5 w-5" />}
          {feedback.message}
        </div>
      )}

      <div className="rounded-xl border border-purple-500/30 bg-purple-500/5 p-4">
        <div className="grid gap-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-widest text-purple-300">Eyebrow (Klein-Text)</label>
            <input
              type="text"
              value={form.eyebrow}
              onChange={(e) => setForm((p) => ({ ...p, eyebrow: e.target.value }))}
              className="mt-2 w-full rounded-xl border border-purple-500/40 bg-black/40 px-4 py-3 text-white placeholder-purple-300/50 focus:border-purple-400 focus:outline-none"
              placeholder="z.B. 'Unsere Leistungen'"
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-widest text-purple-300">Titel</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              className="mt-2 w-full rounded-xl border border-purple-500/40 bg-black/40 px-4 py-3 text-white placeholder-purple-300/50 focus:border-purple-400 focus:outline-none"
              placeholder="z.B. 'Was wir bieten'"
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-widest text-purple-300">Beschreibung</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              rows={3}
              className="mt-2 w-full rounded-xl border border-purple-500/40 bg-black/40 px-4 py-3 text-white placeholder-purple-300/50 focus:border-purple-400 focus:outline-none"
              placeholder="Kurze Beschreibung der Services..."
            />
          </div>
        </div>
      </div>

      <button type="button" onClick={handleSave} disabled={isSaving}
        className="inline-flex items-center gap-2 rounded-full bg-purple-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-purple-500 disabled:opacity-50">
        {isSaving ? <ArrowPathIcon className="h-4 w-4 animate-spin" /> : <CheckCircleIcon className="h-4 w-4" />}
        Speichern
      </button>
    </div>
  )
}

