'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'
import { DEFAULT_SITE_SETTINGS } from '@/lib/supabase'
import type { SiteSettings } from '@/lib/supabase'
import { handleAdminUnauthorized } from '@/components/admin/utils/handleUnauthorized'

const SITE_SETTINGS_ENDPOINT = '/api/site-settings'

type SiteSettingsForm = {
  siteName: string
  tagline: string
  imprint: string
  privacy: string
  supportEmail: string
  heroTitle: string
  heroSubtitle: string
  heroDescription: string
  heroPrimaryCtaLabel: string
  heroPrimaryCtaUrl: string
  heroSecondaryCtaLabel: string
  heroSecondaryCtaUrl: string
  servicesSectionEyebrow: string
  servicesSectionTitle: string
  servicesSectionDescription: string
}

type FeedbackState = {
  variant: 'success' | 'error'
  message: string
}

const DEFAULT_SITE_SETTINGS_FORM: SiteSettingsForm = {
  siteName: DEFAULT_SITE_SETTINGS.site_name,
  tagline: DEFAULT_SITE_SETTINGS.tagline ?? '',
  imprint: DEFAULT_SITE_SETTINGS.imprint ?? '',
  privacy: DEFAULT_SITE_SETTINGS.privacy ?? '',
  supportEmail: DEFAULT_SITE_SETTINGS.support_email ?? '',
  heroTitle: DEFAULT_SITE_SETTINGS.hero_title ?? '',
  heroSubtitle: DEFAULT_SITE_SETTINGS.hero_subtitle ?? '',
  heroDescription: DEFAULT_SITE_SETTINGS.hero_description ?? '',
  heroPrimaryCtaLabel: DEFAULT_SITE_SETTINGS.hero_primary_cta_label ?? '',
  heroPrimaryCtaUrl: DEFAULT_SITE_SETTINGS.hero_primary_cta_url ?? '',
  heroSecondaryCtaLabel: DEFAULT_SITE_SETTINGS.hero_secondary_cta_label ?? '',
  heroSecondaryCtaUrl: DEFAULT_SITE_SETTINGS.hero_secondary_cta_url ?? '',
  servicesSectionEyebrow: DEFAULT_SITE_SETTINGS.services_section_eyebrow ?? '',
  servicesSectionTitle: DEFAULT_SITE_SETTINGS.services_section_title ?? '',
  servicesSectionDescription: DEFAULT_SITE_SETTINGS.services_section_description ?? '',
}

export function SettingsPanel() {
  const [settings, setSettings] = useState<SiteSettingsForm>(DEFAULT_SITE_SETTINGS_FORM)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [feedback, setFeedback] = useState<FeedbackState | null>(null)

  const mapResponseToForm = useCallback(
    (data: Partial<SiteSettings> | null | undefined): SiteSettingsForm => ({
      siteName: data?.site_name ?? DEFAULT_SITE_SETTINGS.site_name,
      tagline: data?.tagline ?? '',
      imprint: data?.imprint ?? '',
      privacy: data?.privacy ?? '',
      supportEmail: data?.support_email ?? '',
      heroTitle: data?.hero_title ?? '',
      heroSubtitle: data?.hero_subtitle ?? '',
      heroDescription: data?.hero_description ?? '',
      heroPrimaryCtaLabel: data?.hero_primary_cta_label ?? '',
      heroPrimaryCtaUrl: data?.hero_primary_cta_url ?? '',
      heroSecondaryCtaLabel: data?.hero_secondary_cta_label ?? '',
      heroSecondaryCtaUrl: data?.hero_secondary_cta_url ?? '',
      servicesSectionEyebrow: data?.services_section_eyebrow ?? '',
      servicesSectionTitle: data?.services_section_title ?? '',
      servicesSectionDescription: data?.services_section_description ?? '',
    }),
    [],
  )

  const fetchSettings = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch(SITE_SETTINGS_ENDPOINT, { cache: 'no-store' })
      const raw = await response.text()
      let payload: unknown = null

      if (raw.length > 0) {
        try {
          payload = JSON.parse(raw)
        } catch {
          payload = null
        }
      }

      if (!response.ok) {
        const message =
          payload && typeof payload === 'object' && !Array.isArray(payload) && 'error' in payload &&
          typeof (payload as { error?: string }).error === 'string'
            ? (payload as { error?: string }).error!
            : 'Einstellungen konnten nicht geladen werden.'
        throw new Error(message)
      }

      setSettings(mapResponseToForm(payload as Partial<SiteSettings>))
      setFeedback(null)
    } catch (error) {
      console.error('Site settings load failed:', error)
      setFeedback({
        variant: 'error',
        message: error instanceof Error ? error.message : 'Einstellungen konnten nicht geladen werden.',
      })
      setSettings(mapResponseToForm(null))
    } finally {
      setIsLoading(false)
    }
  }, [mapResponseToForm])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  useEffect(() => {
    if (!feedback) return
    const timer = window.setTimeout(() => setFeedback(null), 5000)
    return () => window.clearTimeout(timer)
  }, [feedback])

  const handleChange = <T extends keyof SiteSettingsForm>(key: T, value: SiteSettingsForm[T]) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFeedback(null)

    const payload: Partial<SiteSettings> = {
      site_name: settings.siteName.trim() || DEFAULT_SITE_SETTINGS.site_name,
      tagline: settings.tagline.trim() || null,
      imprint: settings.imprint.trim() || null,
      privacy: settings.privacy.trim() || null,
      support_email: settings.supportEmail.trim() || null,
      hero_title: settings.heroTitle.trim() || null,
      hero_subtitle: settings.heroSubtitle.trim() || null,
      hero_description: settings.heroDescription.trim() || null,
      hero_primary_cta_label: settings.heroPrimaryCtaLabel.trim() || null,
      hero_primary_cta_url: settings.heroPrimaryCtaUrl.trim() || null,
      hero_secondary_cta_label: settings.heroSecondaryCtaLabel.trim() || null,
      hero_secondary_cta_url: settings.heroSecondaryCtaUrl.trim() || null,
      services_section_eyebrow: settings.servicesSectionEyebrow.trim() || null,
      services_section_title: settings.servicesSectionTitle.trim() || null,
      services_section_description: settings.servicesSectionDescription.trim() || null,
    }

    try {
      setIsSaving(true)
      const response = await fetch(SITE_SETTINGS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (handleAdminUnauthorized(response)) {
        return
      }

      if (!response.ok) {
        const errorBody = (await response.json().catch(() => null)) as { error?: string } | null
        throw new Error(errorBody?.error ?? 'Einstellungen konnten nicht gespeichert werden.')
      }

      const saved = (await response.json()) as SiteSettings
      setSettings(mapResponseToForm(saved))
      setFeedback({
        variant: 'success',
        message: 'Einstellungen wurden gespeichert.',
      })
    } catch (error) {
      console.error('Site settings save failed:', error)
      setFeedback({
        variant: 'error',
        message: error instanceof Error ? error.message : 'Einstellungen konnten nicht gespeichert werden.',
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Einstellungen</h2>
          <p className="text-sm text-purple-200">
            Allgemeine Seiten-Einstellungen, Hero-Bereich und Services-Sektion.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchSettings}
          className="inline-flex items-center gap-2 rounded-full border border-purple-500/40 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-purple-200 transition hover:border-purple-300 hover:text-white"
        >
          <ArrowPathIcon className="h-4 w-4" />
          Neu laden
        </button>
      </header>

      {feedback && (
        <div
          className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm ${
            feedback.variant === 'success'
              ? 'border-emerald-500/40 bg-emerald-600/10 text-emerald-100'
              : 'border-rose-500/40 bg-rose-600/10 text-rose-100'
          }`}
        >
          {feedback.variant === 'success' ? (
            <CheckCircleIcon className="mt-0.5 h-5 w-5" />
          ) : (
            <ExclamationTriangleIcon className="mt-0.5 h-5 w-5" />
          )}
          <p className="leading-relaxed">{feedback.message}</p>
        </div>
      )}

      {isLoading ? (
        <div className="animate-pulse rounded-2xl border border-purple-600/30 bg-purple-950/40 p-6 text-sm text-purple-200/70">
          Einstellungen werden geladen...
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="grid gap-6 rounded-2xl border border-purple-600/30 bg-purple-950/40 p-5"
        >
          <fieldset className="grid gap-4 lg:grid-cols-2">
            <legend className="col-span-full mb-2 text-xs font-semibold uppercase tracking-widest text-purple-300">
              Allgemein
            </legend>
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-purple-300">Seitenname</label>
              <input
                value={settings.siteName}
                onChange={(e) => handleChange('siteName', e.target.value)}
                className="mt-2 w-full rounded-xl border border-purple-500/40 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-purple-300"
                placeholder="ArcanePixels"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-purple-300">Tagline</label>
              <input
                value={settings.tagline}
                onChange={(e) => handleChange('tagline', e.target.value)}
                className="mt-2 w-full rounded-xl border border-purple-500/40 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-purple-300"
                placeholder="Webentwicklung für Fotografen"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-purple-300">Support E-Mail</label>
              <input
                type="email"
                value={settings.supportEmail}
                onChange={(e) => handleChange('supportEmail', e.target.value)}
                className="mt-2 w-full rounded-xl border border-purple-500/40 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-purple-300"
                placeholder="support@arcanepixels.com"
              />
            </div>
          </fieldset>

          <fieldset className="grid gap-4 lg:grid-cols-2">
            <legend className="col-span-full mb-2 text-xs font-semibold uppercase tracking-widest text-purple-300">
              Hero-Bereich
            </legend>
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-purple-300">Hero Titel</label>
              <input
                value={settings.heroTitle}
                onChange={(e) => handleChange('heroTitle', e.target.value)}
                className="mt-2 w-full rounded-xl border border-purple-500/40 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-purple-300"
                placeholder="Willkommen bei ArcanePixels"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-purple-300">Hero Untertitel</label>
              <input
                value={settings.heroSubtitle}
                onChange={(e) => handleChange('heroSubtitle', e.target.value)}
                className="mt-2 w-full rounded-xl border border-purple-500/40 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-purple-300"
                placeholder="Dein Partner für Webentwicklung"
              />
            </div>
            <div className="lg:col-span-2">
              <label className="text-xs font-semibold uppercase tracking-widest text-purple-300">Hero Beschreibung</label>
              <textarea
                value={settings.heroDescription}
                onChange={(e) => handleChange('heroDescription', e.target.value)}
                rows={3}
                className="mt-2 w-full rounded-xl border border-purple-500/40 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-purple-300"
                placeholder="Beschreibung für den Hero-Bereich..."
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-purple-300">Primärer CTA Label</label>
              <input
                value={settings.heroPrimaryCtaLabel}
                onChange={(e) => handleChange('heroPrimaryCtaLabel', e.target.value)}
                className="mt-2 w-full rounded-xl border border-purple-500/40 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-purple-300"
                placeholder="Jetzt starten"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-purple-300">Primärer CTA URL</label>
              <input
                value={settings.heroPrimaryCtaUrl}
                onChange={(e) => handleChange('heroPrimaryCtaUrl', e.target.value)}
                className="mt-2 w-full rounded-xl border border-purple-500/40 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-purple-300"
                placeholder="/kontakt"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-purple-300">Sekundärer CTA Label</label>
              <input
                value={settings.heroSecondaryCtaLabel}
                onChange={(e) => handleChange('heroSecondaryCtaLabel', e.target.value)}
                className="mt-2 w-full rounded-xl border border-purple-500/40 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-purple-300"
                placeholder="Mehr erfahren"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-purple-300">Sekundärer CTA URL</label>
              <input
                value={settings.heroSecondaryCtaUrl}
                onChange={(e) => handleChange('heroSecondaryCtaUrl', e.target.value)}
                className="mt-2 w-full rounded-xl border border-purple-500/40 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-purple-300"
                placeholder="/leistungen"
              />
            </div>
          </fieldset>

          <fieldset className="grid gap-4 lg:grid-cols-2">
            <legend className="col-span-full mb-2 text-xs font-semibold uppercase tracking-widest text-purple-300">
              Services-Sektion
            </legend>
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-purple-300">Eyebrow</label>
              <input
                value={settings.servicesSectionEyebrow}
                onChange={(e) => handleChange('servicesSectionEyebrow', e.target.value)}
                className="mt-2 w-full rounded-xl border border-purple-500/40 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-purple-300"
                placeholder="Unsere Leistungen"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-purple-300">Titel</label>
              <input
                value={settings.servicesSectionTitle}
                onChange={(e) => handleChange('servicesSectionTitle', e.target.value)}
                className="mt-2 w-full rounded-xl border border-purple-500/40 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-purple-300"
                placeholder="Was wir bieten"
              />
            </div>
            <div className="lg:col-span-2">
              <label className="text-xs font-semibold uppercase tracking-widest text-purple-300">Beschreibung</label>
              <textarea
                value={settings.servicesSectionDescription}
                onChange={(e) => handleChange('servicesSectionDescription', e.target.value)}
                rows={3}
                className="mt-2 w-full rounded-xl border border-purple-500/40 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-purple-300"
                placeholder="Beschreibung der Services-Sektion..."
              />
            </div>
          </fieldset>

          <fieldset className="grid gap-4 lg:grid-cols-2">
            <legend className="col-span-full mb-2 text-xs font-semibold uppercase tracking-widest text-purple-300">
              Rechtliches
            </legend>
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-purple-300">Impressum URL</label>
              <input
                value={settings.imprint}
                onChange={(e) => handleChange('imprint', e.target.value)}
                className="mt-2 w-full rounded-xl border border-purple-500/40 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-purple-300"
                placeholder="/impressum"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-purple-300">Datenschutz URL</label>
              <input
                value={settings.privacy}
                onChange={(e) => handleChange('privacy', e.target.value)}
                className="mt-2 w-full rounded-xl border border-purple-500/40 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-purple-300"
                placeholder="/datenschutz"
              />
            </div>
          </fieldset>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 px-5 py-2 text-sm font-semibold text-white shadow-lg transition hover:from-purple-500 hover:to-pink-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? 'Speichern...' : 'Einstellungen speichern'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

