'use client'

import { useCallback, useEffect, useState } from 'react'
import { ArrowPathIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { DEFAULT_SITE_SETTINGS } from '@/lib/supabase'
import type { SiteSettings } from '@/lib/supabase'
import { handleAdminUnauthorized } from '@/components/admin/utils/handleUnauthorized'

const ENDPOINT = '/api/site-settings'

type FormState = {
  heroTitle: string
  heroSubtitle: string
  heroDescription: string
  heroPrimaryCtaLabel: string
  heroPrimaryCtaUrl: string
  heroSecondaryCtaLabel: string
  heroSecondaryCtaUrl: string
}

type FeedbackState = { variant: 'success' | 'error'; message: string }

export function HeroSettingsPanel() {
  const [form, setForm] = useState<FormState>({
    heroTitle: '',
    heroSubtitle: '',
    heroDescription: '',
    heroPrimaryCtaLabel: '',
    heroPrimaryCtaUrl: '',
    heroSecondaryCtaLabel: '',
    heroSecondaryCtaUrl: '',
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
        heroTitle: data.hero_title ?? '',
        heroSubtitle: data.hero_subtitle ?? '',
        heroDescription: data.hero_description ?? '',
        heroPrimaryCtaLabel: data.hero_primary_cta_label ?? '',
        heroPrimaryCtaUrl: data.hero_primary_cta_url ?? '',
        heroSecondaryCtaLabel: data.hero_secondary_cta_label ?? '',
        heroSecondaryCtaUrl: data.hero_secondary_cta_url ?? '',
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
          hero_title: form.heroTitle.trim() || null,
          hero_subtitle: form.heroSubtitle.trim() || null,
          hero_description: form.heroDescription.trim() || null,
          hero_primary_cta_label: form.heroPrimaryCtaLabel.trim() || null,
          hero_primary_cta_url: form.heroPrimaryCtaUrl.trim() || null,
          hero_secondary_cta_label: form.heroSecondaryCtaLabel.trim() || null,
          hero_secondary_cta_url: form.heroSecondaryCtaUrl.trim() || null,
        }),
      })
      if (handleAdminUnauthorized(res)) return
      if (!res.ok) throw new Error('Speichern fehlgeschlagen')
      setFeedback({ variant: 'success', message: 'Hero-Einstellungen gespeichert!' })
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
        <h2 className="text-xl font-semibold text-white">Hero-Bereich</h2>
        <p className="mt-1 text-sm text-purple-300">Der erste Eindruck zählt - gestalte deinen Hero-Bereich.</p>
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
        <h3 className="text-sm font-semibold text-purple-200">Hero Texte</h3>
        <div className="mt-4 grid gap-4">
          <InputField label="Titel" value={form.heroTitle} onChange={(v) => setForm((p) => ({ ...p, heroTitle: v }))} placeholder="Willkommen bei ArcanePixels" />
          <InputField label="Untertitel" value={form.heroSubtitle} onChange={(v) => setForm((p) => ({ ...p, heroSubtitle: v }))} placeholder="Web Development für Fotografen" />
          <div>
            <label className="text-xs font-semibold uppercase tracking-widest text-purple-300">Beschreibung</label>
            <textarea
              value={form.heroDescription}
              onChange={(e) => setForm((p) => ({ ...p, heroDescription: e.target.value }))}
              rows={3}
              className="mt-2 w-full rounded-xl border border-purple-500/40 bg-black/40 px-4 py-3 text-white placeholder-purple-300/50 focus:border-purple-400 focus:outline-none"
              placeholder="Beschreibe kurz, was du anbietest..."
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-purple-500/30 bg-purple-500/5 p-4">
        <h3 className="text-sm font-semibold text-purple-200">Call-to-Action Buttons</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <InputField label="Primär Button Text" value={form.heroPrimaryCtaLabel} onChange={(v) => setForm((p) => ({ ...p, heroPrimaryCtaLabel: v }))} placeholder="Jetzt starten" />
          <InputField label="Primär Button URL" value={form.heroPrimaryCtaUrl} onChange={(v) => setForm((p) => ({ ...p, heroPrimaryCtaUrl: v }))} placeholder="/kontakt" />
          <InputField label="Sekundär Button Text" value={form.heroSecondaryCtaLabel} onChange={(v) => setForm((p) => ({ ...p, heroSecondaryCtaLabel: v }))} placeholder="Mehr erfahren" />
          <InputField label="Sekundär Button URL" value={form.heroSecondaryCtaUrl} onChange={(v) => setForm((p) => ({ ...p, heroSecondaryCtaUrl: v }))} placeholder="/leistungen" />
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

function InputField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-widest text-purple-300">{label}</label>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-xl border border-purple-500/40 bg-black/40 px-4 py-3 text-white placeholder-purple-300/50 focus:border-purple-400 focus:outline-none"
        placeholder={placeholder} />
    </div>
  )
}

