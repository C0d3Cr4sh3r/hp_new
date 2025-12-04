'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  EyeSlashIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline'
import type { SiteSettings } from '@/lib/supabase'
import { handleAdminUnauthorized } from '@/components/admin/utils/handleUnauthorized'

const ENDPOINT = '/api/site-settings'

type VisibilityKey = 'show_hero' | 'show_features' | 'show_gallery' | 'show_services' | 'show_portfolio' | 'show_shootinghub'
type SortOrderKey = 'hero_sort_order' | 'features_sort_order' | 'gallery_sort_order' | 'services_sort_order' | 'portfolio_sort_order' | 'shootinghub_sort_order'

type GridSection = {
  key: VisibilityKey
  sortKey: SortOrderKey
  label: string
  description: string
}

const GRID_SECTIONS: GridSection[] = [
  { key: 'show_hero', sortKey: 'hero_sort_order', label: 'Hero-Bereich', description: 'Großer Banner oben mit Titel und CTA' },
  { key: 'show_features', sortKey: 'features_sort_order', label: 'Features/Services', description: 'Übersicht der angebotenen Dienstleistungen' },
  { key: 'show_gallery', sortKey: 'gallery_sort_order', label: 'Galerie', description: 'Portfolio-Galerie mit Screenshots' },
  { key: 'show_services', sortKey: 'services_sort_order', label: 'Services-Details', description: 'Detaillierte Service-Beschreibungen' },
  { key: 'show_portfolio', sortKey: 'portfolio_sort_order', label: 'Portfolio', description: 'Projekt-Showcase' },
  { key: 'show_shootinghub', sortKey: 'shootinghub_sort_order', label: 'ShootingHub', description: 'App-Promo Bereich' },
]

type FeedbackState = { variant: 'success' | 'error'; message: string }

type FormState = {
  show_hero: boolean
  show_features: boolean
  show_gallery: boolean
  show_services: boolean
  show_portfolio: boolean
  show_shootinghub: boolean
  hero_sort_order: number
  features_sort_order: number
  gallery_sort_order: number
  services_sort_order: number
  portfolio_sort_order: number
  shootinghub_sort_order: number
}

const defaultForm: FormState = {
  show_hero: true,
  show_features: true,
  show_gallery: true,
  show_services: true,
  show_portfolio: true,
  show_shootinghub: true,
  hero_sort_order: 1,
  features_sort_order: 2,
  gallery_sort_order: 3,
  services_sort_order: 4,
  portfolio_sort_order: 5,
  shootinghub_sort_order: 6,
}

export function GridVisibilityPanel() {
  const [form, setForm] = useState<FormState>(defaultForm)
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
        show_hero: data.show_hero ?? true,
        show_features: data.show_features ?? true,
        show_gallery: data.show_gallery ?? true,
        show_services: data.show_services ?? true,
        show_portfolio: data.show_portfolio ?? true,
        show_shootinghub: data.show_shootinghub ?? true,
        hero_sort_order: data.hero_sort_order ?? 1,
        features_sort_order: data.features_sort_order ?? 2,
        gallery_sort_order: data.gallery_sort_order ?? 3,
        services_sort_order: data.services_sort_order ?? 4,
        portfolio_sort_order: data.portfolio_sort_order ?? 5,
        shootinghub_sort_order: data.shootinghub_sort_order ?? 6,
      })
    } catch (err) {
      setFeedback({ variant: 'error', message: err instanceof Error ? err.message : 'Fehler' })
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { fetchSettings() }, [fetchSettings])

  const handleSave = async () => {
    try {
      setIsSaving(true)
      setFeedback(null)
      const res = await fetch(ENDPOINT, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (handleAdminUnauthorized(res)) return
      if (!res.ok) throw new Error('Speichern fehlgeschlagen')
      setFeedback({ variant: 'success', message: 'Grid-Einstellungen gespeichert!' })
    } catch (err) {
      setFeedback({ variant: 'error', message: err instanceof Error ? err.message : 'Fehler' })
    } finally {
      setIsSaving(false)
    }
  }

  const toggleVisibility = (key: keyof FormState) => {
    if (typeof form[key] === 'boolean') {
      setForm((p) => ({ ...p, [key]: !p[key] }))
    }
  }

  const moveSection = (sortKey: keyof FormState, direction: 'up' | 'down') => {
    const currentOrder = form[sortKey] as number
    const newOrder = direction === 'up' ? currentOrder - 1 : currentOrder + 1
    if (newOrder < 1 || newOrder > 6) return
    
    // Finde die Section mit der Ziel-Position und tausche
    const otherKey = Object.entries(form).find(
      ([k, v]) => k.endsWith('_sort_order') && v === newOrder
    )?.[0] as keyof FormState | undefined
    
    if (otherKey) {
      setForm((p) => ({
        ...p,
        [sortKey]: newOrder,
        [otherKey]: currentOrder,
      }))
    }
  }

  // Sortiere Sections nach sort_order
  const sortedSections = [...GRID_SECTIONS].sort(
    (a, b) => (form[a.sortKey] as number) - (form[b.sortKey] as number)
  )

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
        <h2 className="text-xl font-semibold text-white">Landing Page Bereiche</h2>
        <p className="mt-1 text-sm text-purple-300">
          Aktiviere oder deaktiviere einzelne Bereiche und ändere ihre Reihenfolge.
        </p>
      </div>

      {feedback && (
        <div className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm ${
          feedback.variant === 'success'
            ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-100'
            : 'border-rose-500/40 bg-rose-500/10 text-rose-100'
        }`}>
          {feedback.variant === 'success' ? (
            <CheckCircleIcon className="h-5 w-5" />
          ) : (
            <ExclamationTriangleIcon className="h-5 w-5" />
          )}
          {feedback.message}
        </div>
      )}

      <div className="space-y-2">
        {sortedSections.map((section) => {
          const isVisible = form[section.key] as boolean
          const sortOrder = form[section.sortKey] as number

          return (
            <div
              key={section.key}
              className={`flex items-center justify-between gap-4 rounded-xl border p-4 transition ${
                isVisible
                  ? 'border-purple-500/30 bg-purple-950/30'
                  : 'border-gray-600/30 bg-gray-900/30 opacity-60'
              }`}
            >
              <div className="flex items-center gap-4">
                {/* Sortierung */}
                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => moveSection(section.sortKey as keyof FormState, 'up')}
                    disabled={sortOrder === 1}
                    className="rounded p-1 text-purple-300 hover:bg-purple-500/20 disabled:opacity-30"
                    title="Nach oben"
                  >
                    <ChevronUpIcon className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveSection(section.sortKey as keyof FormState, 'down')}
                    disabled={sortOrder === 6}
                    className="rounded p-1 text-purple-300 hover:bg-purple-500/20 disabled:opacity-30"
                    title="Nach unten"
                  >
                    <ChevronDownIcon className="h-4 w-4" />
                  </button>
                </div>

                {/* Info */}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-purple-400 font-mono">{sortOrder}.</span>
                    <h3 className="font-medium text-white">{section.label}</h3>
                  </div>
                  <p className="text-sm text-purple-300/70">{section.description}</p>
                </div>
              </div>

              {/* Toggle */}
              <button
                type="button"
                onClick={() => toggleVisibility(section.key as keyof FormState)}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
                  isVisible
                    ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                    : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'
                }`}
              >
                {isVisible ? (
                  <>
                    <EyeIcon className="h-5 w-5" />
                    <span>Sichtbar</span>
                  </>
                ) : (
                  <>
                    <EyeSlashIcon className="h-5 w-5" />
                    <span>Versteckt</span>
                  </>
                )}
              </button>
            </div>
          )
        })}
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
