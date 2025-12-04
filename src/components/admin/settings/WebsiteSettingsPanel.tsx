'use client'

import { useCallback, useEffect, useState } from 'react'
import { ArrowPathIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { DEFAULT_SITE_SETTINGS } from '@/lib/supabase'
import type { SiteSettings } from '@/lib/supabase'
import { handleAdminUnauthorized } from '@/components/admin/utils/handleUnauthorized'

const ENDPOINT = '/api/site-settings'

type FormState = {
  siteName: string
  tagline: string
  supportEmail: string
}

type FeedbackState = { variant: 'success' | 'error'; message: string }

export function WebsiteSettingsPanel() {
  const [form, setForm] = useState<FormState>({
    siteName: DEFAULT_SITE_SETTINGS.site_name,
    tagline: '',
    supportEmail: '',
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
      const data = (await res.json()) as Partial<SiteSettings>
      setForm({
        siteName: data.site_name ?? DEFAULT_SITE_SETTINGS.site_name,
        tagline: data.tagline ?? '',
        supportEmail: data.support_email ?? '',
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
          site_name: form.siteName.trim() || DEFAULT_SITE_SETTINGS.site_name,
          tagline: form.tagline.trim() || null,
          support_email: form.supportEmail.trim() || null,
        }),
      })
      if (handleAdminUnauthorized(res)) return
      if (!res.ok) throw new Error('Speichern fehlgeschlagen')
      setFeedback({ variant: 'success', message: 'Website-Einstellungen gespeichert!' })
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
        <h2 className="text-xl font-semibold text-white">Website-Einstellungen</h2>
        <p className="mt-1 text-sm text-purple-300">Grundlegende Informationen zu deiner Website.</p>
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

      <div className="grid gap-6">
        <div>
          <label className="text-xs font-semibold uppercase tracking-widest text-purple-300">
            Seitenname
          </label>
          <input
            type="text"
            value={form.siteName}
            onChange={(e) => setForm((p) => ({ ...p, siteName: e.target.value }))}
            className="mt-2 w-full rounded-xl border border-purple-500/40 bg-black/40 px-4 py-3 text-white placeholder-purple-300/50 focus:border-purple-400 focus:outline-none"
            placeholder="ArcanePixels"
          />
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-widest text-purple-300">
            Tagline / Slogan
          </label>
          <input
            type="text"
            value={form.tagline}
            onChange={(e) => setForm((p) => ({ ...p, tagline: e.target.value }))}
            className="mt-2 w-full rounded-xl border border-purple-500/40 bg-black/40 px-4 py-3 text-white placeholder-purple-300/50 focus:border-purple-400 focus:outline-none"
            placeholder="Web Development für Fotografen"
          />
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-widest text-purple-300">
            Support E-Mail
          </label>
          <input
            type="email"
            value={form.supportEmail}
            onChange={(e) => setForm((p) => ({ ...p, supportEmail: e.target.value }))}
            className="mt-2 w-full rounded-xl border border-purple-500/40 bg-black/40 px-4 py-3 text-white placeholder-purple-300/50 focus:border-purple-400 focus:outline-none"
            placeholder="support@example.com"
          />
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

