'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import Image from 'next/image'
import {
  ArrowPathIcon,
  ArrowUpTrayIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PhotoIcon,
  TrashIcon,
} from '@heroicons/react/24/outline'
import { DEFAULT_SHOOTINGHUB_SECTION, type ShootingHubSectionContent } from '@/lib/supabase'
import { handleAdminUnauthorized } from '@/components/admin/utils/handleUnauthorized'

type FeedbackState = {
  variant: 'success' | 'error'
  message: string
}

type FormState = {
  headline: string
  subheadline: string
  description: string
  bullets: string[]
  ctaLabel: string
  ctaUrl: string
  imageUrl: string | null
  imageAlt: string
  imageWidth: number | null
  imageHeight: number | null
  imageStoragePath: string | null
}

const SECTION_ENDPOINT = '/api/shootinghub-section'
const UPLOAD_ENDPOINT = '/api/shootinghub-section/upload'

const mapToFormState = (section: ShootingHubSectionContent): FormState => ({
  headline: section.headline,
  subheadline: section.subheadline ?? '',
  description: section.description ?? '',
  bullets: Array.isArray(section.bullets) ? section.bullets : [],
  ctaLabel: section.cta_label ?? '',
  ctaUrl: section.cta_url ?? '',
  imageUrl: section.image_url ?? null,
  imageAlt: section.image_alt ?? 'ShootingHub App',
  imageWidth: section.image_width ?? null,
  imageHeight: section.image_height ?? null,
  imageStoragePath: section.image_storage_path ?? null,
})

const sanitizeBullets = (input: string) =>
  input
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

export function LandingContentPanel() {
  const [form, setForm] = useState<FormState>(mapToFormState(DEFAULT_SHOOTINGHUB_SECTION))
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [feedback, setFeedback] = useState<FeedbackState | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const bulletsText = useMemo(() => form.bullets.join('\n'), [form.bullets])

  useEffect(() => {
    const controller = new AbortController()

    const loadSection = async () => {
      try {
        setLoading(true)
        const response = await fetch(SECTION_ENDPOINT, { signal: controller.signal, cache: 'no-store' })
        if (!response.ok) {
          throw new Error('ShootingHub-Section konnte nicht geladen werden.')
        }
        const data = (await response.json()) as ShootingHubSectionContent
        if (!controller.signal.aborted) {
          setForm(mapToFormState(data))
        }
      } catch (error) {
        console.error('ShootingHub-Section konnte nicht geladen werden:', error)
        if (!controller.signal.aborted) {
          setFeedback({ variant: 'error', message: 'ShootingHub-Section konnte nicht geladen werden.' })
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    loadSection()
    return () => controller.abort()
  }, [])

  useEffect(() => {
    if (!feedback) return
    const timeout = window.setTimeout(() => setFeedback(null), 5000)
    return () => window.clearTimeout(timeout)
  }, [feedback])

  const handleInputChange = <Key extends keyof FormState>(key: Key, value: FormState[Key]) => {
    setForm((previous) => ({ ...previous, [key]: value }))
  }

  const handleBulletsChange = (value: string) => {
    const sanitized = sanitizeBullets(value)
    setForm((previous) => ({ ...previous, bullets: sanitized }))
  }

  const handleFileButtonClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setFeedback({ variant: 'error', message: 'Bitte wähle eine Bilddatei aus.' })
      event.target.value = ''
      return
    }

    const formData = new FormData()
    formData.append('file', file)
    if (form.imageStoragePath) {
      formData.append('previousPath', form.imageStoragePath)
    }

    try {
      setUploading(true)
      const response = await fetch(UPLOAD_ENDPOINT, {
        method: 'POST',
        body: formData,
      })

      if (handleAdminUnauthorized(response)) {
        return
      }

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null
        throw new Error(body?.error ?? 'Upload fehlgeschlagen.')
      }

      const data = (await response.json()) as {
        image_url: string | null
        image_storage_path: string | null
        image_width: number | null
        image_height: number | null
      }

      handleInputChange('imageUrl', data.image_url)
      handleInputChange('imageStoragePath', data.image_storage_path)
      handleInputChange('imageWidth', data.image_width)
      handleInputChange('imageHeight', data.image_height)

      setFeedback({ variant: 'success', message: 'Bild wurde optimiert und gespeichert.' })
    } catch (error) {
      console.error('Upload fehlgeschlagen:', error)
      setFeedback({
        variant: 'error',
        message: error instanceof Error ? error.message : 'Upload fehlgeschlagen.',
      })
    } finally {
      setUploading(false)
      event.target.value = ''
    }
  }

  const handleRemoveImage = () => {
    handleInputChange('imageUrl', null)
    handleInputChange('imageStoragePath', null)
    handleInputChange('imageWidth', null)
    handleInputChange('imageHeight', null)
  }

  const handleReset = () => {
    setForm(mapToFormState(DEFAULT_SHOOTINGHUB_SECTION))
    setFeedback({ variant: 'success', message: 'Standardinhalte wurden wiederhergestellt. Vergiss nicht zu speichern.' })
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const payload = {
        headline: form.headline.trim() || DEFAULT_SHOOTINGHUB_SECTION.headline,
        subheadline: form.subheadline.trim() || null,
        description: form.description.trim() || null,
        bullets: form.bullets,
        cta_label: form.ctaLabel.trim() || null,
        cta_url: form.ctaUrl.trim() || null,
        image_url: form.imageUrl,
        image_alt: form.imageAlt.trim() || null,
        image_width: form.imageWidth,
        image_height: form.imageHeight,
        image_storage_path: form.imageStoragePath,
      }

      const response = await fetch(SECTION_ENDPOINT, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (handleAdminUnauthorized(response)) {
        return
      }

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null
        throw new Error(body?.error ?? 'Änderungen konnten nicht gespeichert werden.')
      }

      const data = (await response.json()) as ShootingHubSectionContent
      setForm(mapToFormState(data))
      setFeedback({ variant: 'success', message: 'Inhalte wurden gespeichert.' })
    } catch (error) {
      console.error('Speichern fehlgeschlagen:', error)
      setFeedback({
        variant: 'error',
        message: error instanceof Error ? error.message : 'Änderungen konnten nicht gespeichert werden.',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">ShootingHub Landing</h2>
          <p className="text-sm text-purple-200">
            Steuere Überschriften, Beschreibung, Stichpunkte und das Hero-Bild für die öffentliche ShootingHub Sektion.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-2 rounded-full border border-purple-500/40 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-purple-200 transition hover:border-purple-300 hover:text-white"
          >
            <ArrowPathIcon className="h-4 w-4" />
            Standard laden
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || loading}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 px-5 py-2 text-sm font-semibold text-white shadow-lg transition hover:from-purple-500 hover:to-pink-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <CheckCircleIcon className="h-4 w-4" />
            {saving ? 'Speichern...' : 'Änderungen sichern'}
          </button>
        </div>
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

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3 space-y-5">
          <div>
            <label className="text-xs font-semibold uppercase tracking-widest text-purple-300">Headline</label>
            <input
              value={form.headline}
              onChange={(event) => handleInputChange('headline', event.target.value)}
              className="mt-2 w-full rounded-xl border border-purple-500/40 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-purple-300"
              placeholder="ShootingHub App"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-widest text-purple-300">Subheadline</label>
            <input
              value={form.subheadline}
              onChange={(event) => handleInputChange('subheadline', event.target.value)}
              className="mt-2 w-full rounded-xl border border-purple-500/40 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-purple-300"
              placeholder="Organisiere deine Fotoshootings..."
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-widest text-purple-300">Beschreibung</label>
            <textarea
              value={form.description}
              onChange={(event) => handleInputChange('description', event.target.value)}
              rows={5}
              className="mt-2 w-full rounded-xl border border-purple-500/40 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-purple-300"
              placeholder="Kurzer Teasertext für die App"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-widest text-purple-300">Stichpunkte</label>
            <textarea
              value={bulletsText}
              onChange={(event) => handleBulletsChange(event.target.value)}
              rows={4}
              className="mt-2 w-full rounded-xl border border-purple-500/40 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-purple-300"
              placeholder={'Projekt- und Terminverwaltung\nModel- und Fotografen-Matching'}
            />
            <p className="mt-2 text-xs text-purple-300/80">Ein Stichpunkt pro Zeile.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-purple-300">CTA Label</label>
              <input
                value={form.ctaLabel}
                onChange={(event) => handleInputChange('ctaLabel', event.target.value)}
                className="mt-2 w-full rounded-xl border border-purple-500/40 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-purple-300"
                placeholder="Mehr erfahren"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-purple-300">CTA Link</label>
              <input
                value={form.ctaUrl}
                onChange={(event) => handleInputChange('ctaUrl', event.target.value)}
                className="mt-2 w-full rounded-xl border border-purple-500/40 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-purple-300"
                placeholder="https://..."
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-5">
          <div className="rounded-2xl border border-purple-600/30 bg-purple-950/40 p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-purple-100">Hero-Bild</h3>
              <button
                type="button"
                onClick={handleFileButtonClick}
                disabled={uploading}
                className="inline-flex items-center gap-2 rounded-full border border-purple-500/40 px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-purple-200 transition hover:border-purple-300 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                <ArrowUpTrayIcon className="h-4 w-4" />
                {uploading ? 'Lädt...' : 'Bild hochladen'}
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            <div className="mt-4 overflow-hidden rounded-xl border border-purple-500/20 bg-black/30">
              {form.imageUrl ? (
                <Image
                  src={form.imageUrl}
                  alt={form.imageAlt || 'ShootingHub App'}
                  width={600}
                  height={360}
                  className="h-auto w-full object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-purple-600/20 to-pink-600/20 text-purple-200">
                  <div className="flex flex-col items-center gap-2 text-xs uppercase tracking-widest">
                    <PhotoIcon className="h-6 w-6" />
                    Kein Bild hinterlegt
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-purple-300">ALT-Text</label>
                <input
                  value={form.imageAlt}
                  onChange={(event) => handleInputChange('imageAlt', event.target.value)}
                  className="mt-2 w-full rounded-xl border border-purple-500/40 bg-black/40 px-4 py-2 text-sm text-white outline-none focus:border-purple-300"
                  placeholder="Beschreibung für Screenreader"
                />
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs text-purple-300/80">
                <div>
                  <span className="block font-semibold uppercase tracking-widest text-purple-300">Breite</span>
                  {form.imageWidth ? `${form.imageWidth}px` : 'n/a'}
                </div>
                <div>
                  <span className="block font-semibold uppercase tracking-widest text-purple-300">Höhe</span>
                  {form.imageHeight ? `${form.imageHeight}px` : 'n/a'}
                </div>
              </div>
              {form.imageUrl && (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="inline-flex items-center gap-2 rounded-full border border-red-500/40 px-3 py-1.5 text-xs font-semibold text-red-200 transition hover:border-red-400 hover:text-white"
                >
                  <TrashIcon className="h-4 w-4" />
                  Bild entfernen
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {loading && (
        <div className="rounded-2xl border border-purple-600/30 bg-purple-950/40 p-4 text-sm text-purple-200">
          Inhalte werden geladen...
        </div>
      )}
    </div>
  )
}
