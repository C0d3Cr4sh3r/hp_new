'use client'

import { useCallback, useEffect, useState } from 'react'
import { ArrowPathIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { DEFAULT_THEME_SETTINGS, type ThemeSettings } from '@/lib/supabase'
import { handleAdminUnauthorized } from '@/components/admin/utils/handleUnauthorized'

const ENDPOINT = '/api/theme-settings'

type FormState = {
  primaryColor: string
  accentColor: string
}

type FeedbackState = { variant: 'success' | 'error'; message: string }

export function ThemeColorsPanel() {
  const [form, setForm] = useState<FormState>({
    primaryColor: DEFAULT_THEME_SETTINGS.primaryColor,
    accentColor: DEFAULT_THEME_SETTINGS.accentColor,
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
      const data = (await res.json()) as Partial<ThemeSettings>
      setForm({
        primaryColor: data.primaryColor ?? DEFAULT_THEME_SETTINGS.primaryColor,
        accentColor: data.accentColor ?? DEFAULT_THEME_SETTINGS.accentColor,
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
          primaryColor: form.primaryColor,
          accentColor: form.accentColor,
        }),
      })
      if (handleAdminUnauthorized(res)) return
      if (!res.ok) throw new Error('Speichern fehlgeschlagen')
      setFeedback({ variant: 'success', message: 'Theme gespeichert! Seite neu laden für Änderungen.' })
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
        <h2 className="text-xl font-semibold text-white">Farben & Theme</h2>
        <p className="mt-1 text-sm text-purple-300">Definiere die Hauptfarben deiner Website.</p>
      </div>

      {feedback && (
        <div
          className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm ${
            feedback.variant === 'success'
              ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-100'
              : 'border-rose-500/40 bg-rose-500/10 text-rose-100'
          }`}
        >
          {feedback.variant === 'success' ? (
            <CheckCircleIcon className="h-5 w-5" />
          ) : (
            <ExclamationTriangleIcon className="h-5 w-5" />
          )}
          {feedback.message}
        </div>
      )}

      {/* Live Preview */}
      <div
        className="rounded-xl border border-purple-500/30 p-6"
        style={{
          background: `linear-gradient(to bottom right, ${form.primaryColor}, #1e1b4b, ${form.accentColor}20)`,
        }}
      >
        <p className="text-xs uppercase tracking-widest text-purple-300">Live Vorschau</p>
        <h3 className="mt-2 text-2xl font-bold text-white">Dein Theme</h3>
        <div className="mt-4 flex gap-3">
          <button
            type="button"
            className="rounded-full px-4 py-2 text-sm font-medium text-white"
            style={{ backgroundColor: form.primaryColor }}
          >
            Primär Button
          </button>
          <button
            type="button"
            className="rounded-full px-4 py-2 text-sm font-medium text-white"
            style={{ backgroundColor: form.accentColor }}
          >
            Akzent Button
          </button>
        </div>
      </div>

      {/* Color Pickers */}
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="text-xs font-semibold uppercase tracking-widest text-purple-300">
            Primärfarbe
          </label>
          <div className="mt-2 flex items-center gap-3">
            <input
              type="color"
              value={form.primaryColor}
              onChange={(e) => setForm((p) => ({ ...p, primaryColor: e.target.value }))}
              className="h-12 w-20 cursor-pointer rounded-xl border border-purple-500/40 bg-black/40"
            />
            <input
              type="text"
              value={form.primaryColor}
              onChange={(e) => setForm((p) => ({ ...p, primaryColor: e.target.value }))}
              className="flex-1 rounded-xl border border-purple-500/40 bg-black/40 px-4 py-3 font-mono text-sm text-white"
              placeholder="#6366f1"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-widest text-purple-300">
            Akzentfarbe
          </label>
          <div className="mt-2 flex items-center gap-3">
            <input
              type="color"
              value={form.accentColor}
              onChange={(e) => setForm((p) => ({ ...p, accentColor: e.target.value }))}
              className="h-12 w-20 cursor-pointer rounded-xl border border-purple-500/40 bg-black/40"
            />
            <input
              type="text"
              value={form.accentColor}
              onChange={(e) => setForm((p) => ({ ...p, accentColor: e.target.value }))}
              className="flex-1 rounded-xl border border-purple-500/40 bg-black/40 px-4 py-3 font-mono text-sm text-white"
              placeholder="#ec4899"
            />
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={isSaving}
        className="inline-flex items-center gap-2 rounded-full bg-purple-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-purple-500 disabled:opacity-50"
      >
        {isSaving ? <ArrowPathIcon className="h-4 w-4 animate-spin" /> : <CheckCircleIcon className="h-4 w-4" />}
        Speichern
      </button>
    </div>
  )
}

