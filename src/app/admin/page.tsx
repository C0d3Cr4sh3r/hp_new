'use client'

import dynamic from 'next/dynamic'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { ChangeEvent, FormEvent } from 'react'
import {
  CloudArrowDownIcon,
  PencilSquareIcon,
  ArrowPathIcon,
  Cog6ToothIcon,
  PaintBrushIcon,
  BugAntIcon,
  ArrowUpTrayIcon,
  AdjustmentsHorizontalIcon,
  CheckCircleIcon,
  ClipboardIcon,
  ExclamationTriangleIcon,
  PhotoIcon,
  TrashIcon,
  SparklesIcon,
  CpuChipIcon,
  BriefcaseIcon,
} from '@heroicons/react/24/outline'
import ArcaneNavigation from '@/components/arcane/ArcaneNavigation'
import type { TinyEditorProps } from '@/components/admin/TinyMceEditor'
import { DEFAULT_SITE_SETTINGS } from '@/lib/supabase'
import type { DownloadEntry, NewsArticle, SiteSettings } from '@/lib/supabase'
import { AssistantPanel } from '@/components/admin/assistant/AssistantPanel'
import { AssistantSettingsPanel } from '@/components/admin/assistant/AssistantSettingsPanel'
import { handleAdminUnauthorized } from '@/components/admin/utils/handleUnauthorized'
import {
  ASSISTANT_SETTINGS_STORAGE_KEY,
  DEFAULT_ASSISTANT_SETTINGS,
} from '@/components/admin/assistant/constants'
import type { AssistantSettings } from '@/components/admin/assistant/types'
import { LandingContentPanel } from '@/components/admin/landing/LandingContentPanel'
import ScreenshotsAdminPanel from '@/components/admin/screenshots/ScreenshotsAdminPanel'
import PortfolioAdminPanel from '@/components/admin/portfolio/PortfolioAdminPanel'
import ServicesAdminPanel from '@/components/admin/ServicesAdminPanel'

const TinyEditor = dynamic<TinyEditorProps>(
  () => import('@/components/admin/TinyMceEditor').then((mod) => mod.TinyEditor),
  { ssr: false },
)

type NewsDraft = {
  title: string
  slug: string
  content: string
  status: 'draft' | 'published'
}

type DownloadFormState = {
  title: string
  version: string
  fileUrl: string
  channel: DownloadEntry['channel']
  availableInStore: boolean
  storeUrl: string
  changelogMarkdown: string
  changelogFileName: string
  securityHash: string
}

const DOWNLOAD_FORM_DEFAULT: DownloadFormState = {
  title: '',
  version: '',
  fileUrl: '',
  channel: 'stable',
  availableInStore: false,
  storeUrl: '',
  changelogMarkdown: '',
  changelogFileName: '',
  securityHash: '',
}

const SITE_SETTINGS_ENDPOINT = '/api/site-settings'

const DEFAULT_SITE_SETTINGS_FORM = {
  siteName: DEFAULT_SITE_SETTINGS.site_name,
  tagline: DEFAULT_SITE_SETTINGS.tagline ?? '',
  imprint: DEFAULT_SITE_SETTINGS.imprint ?? '',
  privacy: DEFAULT_SITE_SETTINGS.privacy ?? '',
  supportEmail: DEFAULT_SITE_SETTINGS.support_email ?? '',
}

type ThemeSettings = {
  primaryColor: string
  accentColor: string
  navigationStyle: 'classic' | 'minimal' | 'split'
  footerLayout: 'compact' | 'columns'
}

type BugRecord = {
  id: number
  title: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  createdAt: string
}

const clampTemperature = (value: unknown, fallback: number) => {
  if (typeof value !== 'number' || Number.isNaN(value)) return fallback
  return Math.min(Math.max(value, 0), 1)
}

const sanitizeAssistantSettings = (input: Partial<AssistantSettings> | null | undefined): AssistantSettings => ({
  instructions:
    typeof input?.instructions === 'string'
      ? input.instructions
      : DEFAULT_ASSISTANT_SETTINGS.instructions,
  temperature: clampTemperature(input?.temperature, DEFAULT_ASSISTANT_SETTINGS.temperature),
  enableQuickActions:
    typeof input?.enableQuickActions === 'boolean'
      ? input.enableQuickActions
      : DEFAULT_ASSISTANT_SETTINGS.enableQuickActions,
  model:
    typeof input?.model === 'string' && input.model.trim().length > 0
      ? input.model
      : DEFAULT_ASSISTANT_SETTINGS.model,
})

const TABS = [
  { id: 'downloads', label: 'Downloads', icon: CloudArrowDownIcon },
  { id: 'landing', label: 'Landing Content', icon: PhotoIcon },
  { id: 'screenshots', label: 'Screenshots', icon: PhotoIcon },
  { id: 'portfolio', label: 'Portfolio', icon: BriefcaseIcon },
  { id: 'services', label: 'Services', icon: Cog6ToothIcon },
  { id: 'news', label: 'News & Changelog', icon: PencilSquareIcon },
  { id: 'assistant', label: 'KI-Assistent', icon: SparklesIcon },
  { id: 'assistant-settings', label: 'Assistent Einstellungen', icon: CpuChipIcon },
  { id: 'settings', label: 'Einstellungen', icon: Cog6ToothIcon },
  { id: 'theme', label: 'Theme & Layout', icon: PaintBrushIcon },
  { id: 'bugs', label: 'Bug Tracker', icon: BugAntIcon },
] as const

type TabId = (typeof TABS)[number]['id']

export default function ArcaneAdminPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabId>('downloads')
  const [assistantSettings, setAssistantSettings] = useState<AssistantSettings>({ ...DEFAULT_ASSISTANT_SETTINGS })
  const [assistantSettingsReady, setAssistantSettingsReady] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [logoutError, setLogoutError] = useState<string | null>(null)

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(ASSISTANT_SETTINGS_STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<AssistantSettings>
        setAssistantSettings(sanitizeAssistantSettings(parsed))
      }
    } catch (error) {
      console.warn('Konnte gespeicherte Assistent-Einstellungen nicht laden:', error)
      setAssistantSettings({ ...DEFAULT_ASSISTANT_SETTINGS })
    } finally {
      setAssistantSettingsReady(true)
    }
  }, [])

  useEffect(() => {
    if (!assistantSettingsReady) return
    try {
      window.localStorage.setItem(ASSISTANT_SETTINGS_STORAGE_KEY, JSON.stringify(assistantSettings))
    } catch (error) {
      console.warn('Konnte Assistent-Einstellungen nicht speichern:', error)
    }
  }, [assistantSettings, assistantSettingsReady])

  const handleAssistantSettingsChange = (next: AssistantSettings) => {
    setAssistantSettings(sanitizeAssistantSettings(next))
  }

  const handleAssistantSettingsReset = () => {
    setAssistantSettings({ ...DEFAULT_ASSISTANT_SETTINGS })
  }

  const handleLogout = async () => {
    setLogoutError(null)
    try {
      setIsLoggingOut(true)
      const response = await fetch('/api/admin/session', { method: 'DELETE' })
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null
        throw new Error(payload?.error ?? 'Abmelden fehlgeschlagen.')
      }
      router.replace('/admin/login')
      router.refresh()
    } catch (error) {
      console.error('Logout failed:', error)
      setLogoutError(error instanceof Error ? error.message : 'Abmelden fehlgeschlagen.')
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-blue-950 to-indigo-900 text-white">
      <ArcaneNavigation />
      <main className="max-w-7xl mx-auto px-4 pb-16 pt-12">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="uppercase tracking-widest text-xs text-purple-300">Administrator</p>
            <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">ArcanePixels Control Center</h1>
            <p className="mt-2 max-w-2xl text-sm text-purple-200 sm:text-base">
              Pflege Downloads, veröffentliche News, bearbeite das Erscheinungsbild und halte deine Plattform aktuell.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="inline-flex items-center gap-2 rounded-full border border-purple-500/40 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-purple-200 transition hover:border-purple-300 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span>Logout</span>
              {isLoggingOut && <span className="text-[10px] uppercase text-purple-300">…</span>}
            </button>
          </div>
        </div>

        {logoutError && (
          <div className="mt-4 rounded-2xl border border-rose-500/40 bg-rose-600/10 px-4 py-3 text-sm text-rose-100">
            {logoutError}
          </div>
        )}

        <div className="mt-10">
          <div className="flex flex-wrap gap-3">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center rounded-full border px-5 py-2 text-sm font-medium transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-400 ${
                  activeTab === tab.id
                    ? 'border-purple-400 bg-purple-400/20 text-purple-100 shadow-lg shadow-purple-900/40'
                    : 'border-purple-500/40 bg-purple-900/40 text-purple-200 hover:border-purple-300 hover:text-white'
                }`}
              >
                <tab.icon className="mr-2 h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>

          <section className="mt-10 rounded-3xl border border-white/10 bg-black/30 p-6 shadow-2xl shadow-purple-900/30 backdrop-blur">
            {activeTab === 'downloads' && <DownloadsPanel />}
            {activeTab === 'landing' && <LandingContentPanel />}
            {activeTab === 'screenshots' && <ScreenshotsAdminPanel />}
            {activeTab === 'portfolio' && <PortfolioAdminPanel />}
            {activeTab === 'services' && <ServicesAdminPanel />}
            {activeTab === 'news' && <NewsPanel />}
            {activeTab === 'assistant' && (
              <AssistantPanel
                settings={assistantSettings}
                settingsReady={assistantSettingsReady}
                onOpenSettings={() => setActiveTab('assistant-settings')}
              />
            )}
            {activeTab === 'assistant-settings' && (
              <AssistantSettingsPanel
                settings={assistantSettings}
                defaultSettings={{ ...DEFAULT_ASSISTANT_SETTINGS }}
                onChange={handleAssistantSettingsChange}
                onReset={handleAssistantSettingsReset}
                settingsReady={assistantSettingsReady}
              />
            )}
            {activeTab === 'settings' && <SettingsPanel />}
            {activeTab === 'theme' && <ThemePanel />}
            {activeTab === 'bugs' && <BugPanel />}
          </section>
        </div>
      </main>
    </div>
  )
}

function DownloadsPanel() {
  const [downloads, setDownloads] = useState<DownloadEntry[]>([])
  const [form, setForm] = useState<DownloadFormState>({ ...DOWNLOAD_FORM_DEFAULT })
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [activePreviewId, setActivePreviewId] = useState<number | null>(null)
  const [feedback, setFeedback] = useState<{ variant: 'success' | 'error'; message: string } | null>(null)
  const [isHashing, setIsHashing] = useState(false)

  const fetchDownloads = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/downloads', { cache: 'no-store' })
      if (!response.ok) {
        throw new Error('Downloads konnten nicht geladen werden.')
      }
      const data = (await response.json()) as DownloadEntry[]
      setDownloads(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error(error)
      setFeedback({
        variant: 'error',
        message: error instanceof Error ? error.message : 'Beim Laden der Downloads ist ein Fehler aufgetreten.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDownloads()
  }, [])

  useEffect(() => {
    if (!feedback) return
    const timer = window.setTimeout(() => setFeedback(null), 5000)
    return () => window.clearTimeout(timer)
  }, [feedback])

  const resetForm = () => {
    setForm({ ...DOWNLOAD_FORM_DEFAULT })
    setActivePreviewId(null)
  }

  const handleInputChange = <Key extends keyof DownloadFormState>(key: Key, value: DownloadFormState[Key]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleChangelogUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (file.type !== 'text/markdown' && !file.name.toLowerCase().endsWith('.md')) {
      setFeedback({ variant: 'error', message: 'Bitte wähle eine Markdown-Datei (.md).' })
      return
    }
    try {
      const text = await file.text()
      setForm((prev) => ({
        ...prev,
        changelogMarkdown: text,
        changelogFileName: file.name,
      }))
      event.target.value = ''
      setFeedback({
        variant: 'success',
        message: `Changelog ${file.name} wurde geladen.`,
      })
    } catch (error) {
      console.error('Changelog konnte nicht gelesen werden:', error)
      setFeedback({
        variant: 'error',
        message: 'Die Changelog-Datei konnte nicht gelesen werden.',
      })
    }
  }

  const createSha256Hash = async (value: string) => {
    if (!window.crypto?.subtle) {
      throw new Error('SHA-256 steht im aktuellen Browser nicht zur Verfügung.')
    }
    const encoder = new TextEncoder()
    const data = encoder.encode(value)
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map((byte) => byte.toString(16).padStart(2, '0')).join('')
  }

  const handleGenerateSecurityHash = async () => {
    if (!form.changelogMarkdown.trim()) {
      setFeedback({
        variant: 'error',
        message: 'Bitte lade zuerst ein Changelog oder füge Markdown-Text ein.',
      })
      return
    }
    try {
      setIsHashing(true)
      const hash = await createSha256Hash(form.changelogMarkdown)
      setForm((prev) => ({ ...prev, securityHash: hash }))
      setFeedback({
        variant: 'success',
        message: 'SHA-256 Hash wurde aus dem Changelog berechnet.',
      })
    } catch (error) {
      console.error('Hash-Berechnung fehlgeschlagen:', error)
      setFeedback({
        variant: 'error',
        message: 'Der Sicherheitswert konnte nicht berechnet werden.',
      })
    } finally {
      setIsHashing(false)
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFeedback(null)

    if (!form.title.trim() || !form.version.trim() || !form.fileUrl.trim()) {
      setFeedback({
        variant: 'error',
        message: 'Titel, Version und Download-URL sind Pflichtfelder.',
      })
      return
    }

    if (form.availableInStore && !form.storeUrl.trim()) {
      setFeedback({
        variant: 'error',
        message: 'Bitte gib eine Store-URL an oder deaktiviere die Store-Option.',
      })
      return
    }

    const payload = {
      title: form.title.trim(),
      version: form.version.trim(),
      file_url: form.fileUrl.trim(),
      channel: form.channel,
      available_in_store: form.availableInStore,
      store_url: form.availableInStore ? form.storeUrl.trim() || null : null,
      changelog_markdown: form.changelogMarkdown.trim() || null,
      changelog_file_name: form.changelogFileName.trim() || null,
      security_hash: form.securityHash.trim() || null,
    }

    try {
      setIsSubmitting(true)
      const response = await fetch('/api/downloads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (handleAdminUnauthorized(response)) {
        return
      }

      if (!response.ok) {
        const errorBody = (await response.json().catch(() => null)) as { error?: string } | null
        throw new Error(errorBody?.error ?? 'Download konnte nicht gespeichert werden.')
      }

      const created = (await response.json()) as DownloadEntry
      setDownloads((prev) => [created, ...prev])
      resetForm()
      setFeedback({
        variant: 'success',
        message: 'Download wurde gespeichert.',
      })
    } catch (error) {
      console.error('Download konnte nicht gespeichert werden:', error)
      setFeedback({
        variant: 'error',
        message: error instanceof Error ? error.message : 'Beim Speichern ist ein Fehler aufgetreten.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id?: number) => {
    if (!id) return
    const confirmed = window.confirm('Soll dieser Download wirklich gelöscht werden?')
    if (!confirmed) return

    try {
      setDeletingId(id)
      const response = await fetch(`/api/downloads/${id}`, { method: 'DELETE' })

      if (handleAdminUnauthorized(response)) {
        return
      }

      if (!response.ok) {
        const errorBody = (await response.json().catch(() => null)) as { error?: string } | null
        throw new Error(errorBody?.error ?? 'Download konnte nicht gelöscht werden.')
      }
      setDownloads((prev) => prev.filter((entry) => entry.id !== id))
      setFeedback({
        variant: 'success',
        message: 'Download wurde entfernt.',
      })
    } catch (error) {
      console.error('Download konnte nicht gelöscht werden:', error)
      setFeedback({
        variant: 'error',
        message: error instanceof Error ? error.message : 'Beim Löschen ist ein Fehler aufgetreten.',
      })
    } finally {
      setDeletingId(null)
    }
  }

  const handleDownloadChangelog = (entry: DownloadEntry) => {
    if (!entry.changelog_markdown) {
      setFeedback({
        variant: 'error',
        message: 'Für diesen Eintrag ist kein Changelog hinterlegt.',
      })
      return
    }
    try {
      const blob = new Blob([entry.changelog_markdown], { type: 'text/markdown;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = entry.changelog_file_name || `${entry.title}-${entry.version}.md`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Changelog konnte nicht heruntergeladen werden:', error)
      setFeedback({
        variant: 'error',
        message: 'Changelog konnte nicht heruntergeladen werden.',
      })
    }
  }

  const handleCopyHash = async (hash?: string | null) => {
    if (!hash) {
      setFeedback({
        variant: 'error',
        message: 'Kein Sicherheitswert vorhanden.',
      })
      return
    }
    try {
      await navigator.clipboard?.writeText(hash)
      setFeedback({
        variant: 'success',
        message: 'Sicherheitswert in die Zwischenablage kopiert.',
      })
    } catch (error) {
      console.error('Hash konnte nicht kopiert werden:', error)
      setFeedback({
        variant: 'error',
        message: 'Sicherheitswert konnte nicht kopiert werden.',
      })
    }
  }

  const sortedDownloads = useMemo(
    () =>
      [...downloads].sort((a, b) => {
        const left = a.created_at ?? a.updated_at ?? ''
        const right = b.created_at ?? b.updated_at ?? ''
        return right.localeCompare(left)
      }),
    [downloads],
  )

  const formatTimestamp = (value?: string | null) => {
    if (!value) return 'k.A.'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value
    return date.toLocaleDateString('de-DE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Android Downloads</h2>
          <p className="text-sm text-purple-200">
            Verwalte Release-Kanäle, Changelogs und Sicherheitswerte zentral über Supabase.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchDownloads}
          className="inline-flex items-center gap-2 rounded-full border border-purple-500/40 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-purple-200 transition hover:border-purple-300 hover:text-white"
        >
          <ArrowUpTrayIcon className="h-4 w-4" />
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

      <form
        onSubmit={handleSubmit}
        className="grid gap-4 rounded-2xl border border-purple-600/30 bg-purple-950/40 p-5 lg:grid-cols-2"
      >
        <div className="lg:col-span-2">
          <label className="text-xs font-semibold uppercase tracking-widest text-purple-300">Titel</label>
          <input
            value={form.title}
            onChange={(event) => handleInputChange('title', event.target.value)}
            className="mt-2 w-full rounded-xl border border-purple-500/40 bg-black/40 px-4 py-3 text-sm text-white outline-none ring-0 transition focus:border-purple-300"
            placeholder="ArcanePixels Companion App"
          />
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-widest text-purple-300">Version</label>
          <input
            value={form.version}
            onChange={(event) => handleInputChange('version', event.target.value)}
            className="mt-2 w-full rounded-xl border border-purple-500/40 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-purple-300"
            placeholder="2.5.0"
          />
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-widest text-purple-300">Release-Kanal</label>
          <select
            value={form.channel}
            onChange={(event) => handleInputChange('channel', event.target.value as DownloadEntry['channel'])}
            className="mt-2 w-full rounded-xl border border-purple-500/40 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-purple-300"
          >
            <option value="stable">Stable</option>
            <option value="beta">Beta</option>
            <option value="legacy">Legacy</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-widest text-purple-300">Download-URL</label>
          <input
            value={form.fileUrl}
            onChange={(event) => handleInputChange('fileUrl', event.target.value)}
            className="mt-2 w-full rounded-xl border border-purple-500/40 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-purple-300"
            placeholder="https://cdn.arcanepixels.com/app/ArcanePixels-2.5.0.apk"
          />
        </div>

        <div className="lg:col-span-2">
          <label className="text-xs font-semibold uppercase tracking-widest text-purple-300">Store-Veröffentlichung</label>
          <div className="mt-2 rounded-xl border border-purple-500/40 bg-black/40 px-4 py-4">
            <div className="flex items-center gap-3">
              <input
                id="store-availability"
                type="checkbox"
                checked={form.availableInStore}
                onChange={(event) => handleInputChange('availableInStore', event.target.checked)}
                className="h-4 w-4 rounded border border-purple-500/40 bg-black/60 text-purple-500 focus:ring-2 focus:ring-purple-400"
              />
              <label htmlFor="store-availability" className="text-sm font-medium text-purple-100">
                Im Store verfügbar
              </label>
            </div>
            {form.availableInStore && (
              <div className="mt-4">
                <label className="text-xs font-semibold uppercase tracking-widest text-purple-300">
                  Store-Link
                </label>
                <input
                  type="url"
                  value={form.storeUrl}
                  onChange={(event) => handleInputChange('storeUrl', event.target.value)}
                  placeholder="https://play.google.com/store/apps/details?id=com.arcanepixels"
                  className="mt-2 w-full rounded-xl border border-purple-500/40 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-purple-300"
                />
              </div>
            )}
            <p className="mt-3 text-xs text-purple-300/80">
              Optionaler Link in den Store, damit Nutzer direkt zur Veröffentlichung wechseln können.
            </p>
          </div>
        </div>

        <div className="lg:col-span-2">
          <label className="text-xs font-semibold uppercase tracking-widest text-purple-300">Changelog (Markdown)</label>
          <textarea
            value={form.changelogMarkdown}
            onChange={(event) => handleInputChange('changelogMarkdown', event.target.value)}
            rows={6}
            className="mt-2 w-full rounded-xl border border-purple-500/40 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-purple-300"
            placeholder="# Neuer Release\n- Feature 1\n- Bugfixes"
          />
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-purple-500/40 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-purple-200 transition hover:border-purple-300 hover:text-white">
              <input type="file" className="hidden" accept=".md,text/markdown" onChange={handleChangelogUpload} />
              <ArrowUpTrayIcon className="h-4 w-4" />
              Markdown importieren
            </label>
            {form.changelogFileName && (
              <span className="text-xs text-purple-300/80">{form.changelogFileName}</span>
            )}
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-widest text-purple-300">
            Sicherheitswert (SHA-256)
          </label>
          <div className="mt-2 flex flex-col gap-3 rounded-xl border border-purple-500/40 bg-black/40 p-4">
            <input
              value={form.securityHash}
              onChange={(event) => handleInputChange('securityHash', event.target.value)}
              className="w-full rounded-lg border border-purple-500/40 bg-black/50 px-3 py-2 text-xs text-purple-100 outline-none focus:border-purple-300"
              placeholder="Optionaler Hash des Release-Pakets"
            />
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleGenerateSecurityHash}
                disabled={isHashing}
                className="inline-flex items-center gap-2 rounded-full border border-purple-500/40 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-purple-200 transition hover:border-purple-300 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                <AdjustmentsHorizontalIcon className="h-4 w-4" />
                Hash aus Markdown {isHashing ? '...' : 'berechnen'}
              </button>
              <button
                type="button"
                onClick={() => handleCopyHash(form.securityHash)}
                className="inline-flex items-center gap-2 rounded-full border border-purple-500/40 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-purple-200 transition hover:border-purple-300 hover:text-white"
              >
                <ClipboardIcon className="h-4 w-4" />
                Hash kopieren
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={resetForm}
            className="flex items-center gap-2 rounded-full border border-purple-500/40 px-5 py-2 text-sm font-medium text-purple-200 transition hover:border-purple-300 hover:text-white"
          >
            <AdjustmentsHorizontalIcon className="h-4 w-4" /> Formular zurücksetzen
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 px-5 py-2 text-sm font-semibold text-white shadow-lg transition hover:from-purple-500 hover:to-pink-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <ArrowUpTrayIcon className="h-4 w-4" />
            {isSubmitting ? 'Speichern...' : 'Release speichern'}
          </button>
        </div>
      </form>

      <section className="space-y-4">
        {isLoading && (
          <div className="animate-pulse rounded-2xl border border-purple-600/30 bg-purple-950/40 p-6 text-sm text-purple-200/70">
            Downloads werden geladen...
          </div>
        )}

        {!isLoading && sortedDownloads.length === 0 && (
          <div className="rounded-2xl border border-purple-600/30 bg-purple-950/40 p-6 text-sm text-purple-200/80">
            Noch keine Downloads vorhanden. Lege den ersten Release oben an.
          </div>
        )}

        {sortedDownloads.map((entry) => (
          <article
            key={entry.id ?? `${entry.title}-${entry.version}`}
            className="space-y-4 rounded-2xl border border-purple-600/30 bg-purple-950/40 p-6"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-semibold text-white">{entry.title}</h3>
                  <span className="rounded-full border border-purple-400/40 bg-purple-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-purple-100">
                    Version {entry.version}
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-widest ${
                      entry.channel === 'stable'
                        ? 'border border-emerald-400/40 bg-emerald-500/20 text-emerald-100'
                        : entry.channel === 'beta'
                          ? 'border border-amber-400/40 bg-amber-500/20 text-amber-100'
                          : 'border border-slate-400/40 bg-slate-500/20 text-slate-100'
                    }`}
                  >
                    {entry.channel}
                  </span>
                </div>
                <p className="text-xs text-purple-200/70">
                  Aktualisiert am {formatTimestamp(entry.updated_at ?? entry.created_at)}
                </p>
                {entry.available_in_store && entry.store_url && (
                  <a
                    href={entry.store_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-xs font-semibold text-purple-200 underline transition hover:text-white"
                  >
                    Store-Link öffnen
                  </a>
                )}
                <div className="flex flex-wrap gap-3">
                  <a
                    href={entry.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-purple-500/40 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-purple-100 transition hover:border-purple-300 hover:text-white"
                  >
                    <CloudArrowDownIcon className="h-4 w-4" />
                    Direktdownload
                  </a>
                  {entry.available_in_store && !entry.store_url && (
                    <span className="inline-flex items-center rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-100">
                      Im Store gelistet (kein Link hinterlegt)
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(entry.id)}
                    disabled={deletingId === entry.id}
                    className="inline-flex items-center gap-2 rounded-full border border-red-500/40 px-3 py-1.5 text-xs font-semibold text-red-200 transition hover:border-red-400 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <TrashIcon className="h-4 w-4" />
                    {deletingId === entry.id ? 'Löschen...' : 'Entfernen'}
                  </button>
                </div>
              </div>
            </div>

            {entry.security_hash && (
              <div className="rounded-xl border border-purple-500/30 bg-black/40 p-4 text-xs text-purple-100">
                <p className="font-semibold uppercase tracking-widest text-purple-300">Sicherheitswert</p>
                <p className="mt-2 break-all font-mono text-[11px] leading-relaxed">{entry.security_hash}</p>
                <div className="mt-3 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => handleCopyHash(entry.security_hash)}
                    className="inline-flex items-center gap-2 rounded-full border border-purple-500/40 px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-purple-100 transition hover:border-purple-300 hover:text-white"
                  >
                    <ClipboardIcon className="h-4 w-4" />
                    Hash kopieren
                  </button>
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setActivePreviewId((prev) => (prev === entry.id ? null : entry.id ?? null))}
                className="inline-flex items-center gap-2 rounded-full border border-purple-500/40 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-purple-200 transition hover:border-purple-300 hover:text-white"
              >
                <PencilSquareIcon className="h-4 w-4" />
                {activePreviewId === entry.id ? 'Changelog verbergen' : 'Changelog anzeigen'}
              </button>
              {entry.changelog_markdown && (
                <button
                  type="button"
                  onClick={() => handleDownloadChangelog(entry)}
                  className="inline-flex items-center gap-2 rounded-full border border-purple-500/40 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-purple-200 transition hover:border-purple-300 hover:text-white"
                >
                  <ArrowUpTrayIcon className="h-4 w-4" />
                  Markdown herunterladen
                </button>
              )}
            </div>

            {activePreviewId === entry.id && entry.changelog_markdown && (
              <div className="rounded-2xl border border-purple-500/30 bg-black/40 p-4">
                <pre className="max-h-80 overflow-y-auto whitespace-pre-wrap text-xs leading-relaxed text-purple-100">
                  {entry.changelog_markdown}
                </pre>
              </div>
            )}
          </article>
        ))}
      </section>
    </div>
  )
}

function NewsPanel() {
  const [draft, setDraft] = useState<NewsDraft>({
    title: '',
    slug: '',
    content: '',
    status: 'draft',
  })

  const [history, setHistory] = useState<NewsArticle[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const sortByUpdatedAt = (articles: NewsArticle[]) => {
    const parse = (value?: string) => {
      const timestamp = value ? Date.parse(value) : NaN
      return Number.isNaN(timestamp) ? 0 : timestamp
    }

    return [...articles].sort((a, b) => parse(b.updated_at ?? b.created_at) - parse(a.updated_at ?? a.created_at))
  }

  useEffect(() => {
    let subscribed = true

    const fetchNews = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/news')

        if (!response.ok) {
          throw new Error('Antwort vom Server war nicht erfolgreich.')
        }

        const articles = (await response.json()) as NewsArticle[]
        if (!subscribed) return
        setHistory(sortByUpdatedAt(articles))
        setError(null)
      } catch (err) {
        console.error('News konnten nicht geladen werden:', err)
        if (subscribed) setError('News konnten nicht geladen werden. Bitte später erneut versuchen.')
      } finally {
        if (subscribed) setIsLoading(false)
      }
    }

    fetchNews()
    return () => {
      subscribed = false
    }
  }, [])

  const handleChange = <T extends keyof NewsDraft>(key: T, value: NewsDraft[T]) => {
    setError(null)
    setDraft((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!draft.title.trim() || !draft.slug.trim() || !draft.content.trim()) {
      setError('Titel, Slug und Inhalt werden benötigt.')
      return
    }

    try {
      setIsSaving(true)
      setError(null)
      const response = await fetch('/api/news', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: draft.title.trim(),
          slug: draft.slug.trim(),
          content: draft.content,
          status: draft.status,
        }),
      })

      if (handleAdminUnauthorized(response)) {
        return
      }

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        throw new Error(payload?.error ?? 'Unbekannter Fehler beim Speichern.')
      }

      const article = (await response.json()) as NewsArticle
      setHistory((prev) => sortByUpdatedAt([article, ...prev.filter((item) => item.id !== article.id)]))
      setDraft({ title: '', slug: '', content: '', status: 'draft' })
    } catch (err) {
      console.error('News konnten nicht gespeichert werden:', err)
      setError('Speichern fehlgeschlagen. Bitte später erneut versuchen.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteHistory = async (id?: string | number) => {
    if (id === undefined || id === null) return
    const targetId = typeof id === 'number' ? String(id) : id
    try {
      setDeletingId(targetId)
      setError(null)
      const response = await fetch(`/api/news/${encodeURIComponent(targetId)}`, {
        method: 'DELETE',
      })

      if (handleAdminUnauthorized(response)) {
        return
      }

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        throw new Error(payload?.error ?? 'Unbekannter Fehler beim Löschen.')
      }

      setHistory((prev) => prev.filter((entry) => String(entry.id ?? entry.slug) !== targetId))
    } catch (err) {
      console.error('News konnte nicht gelöscht werden:', err)
      setError('Löschen fehlgeschlagen. Bitte später erneut versuchen.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold">News & Changelog</h2>
        <p className="text-sm text-purple-200">
          Erstelle News-Beiträge, Release Notes oder Entwickler-Updates. Eine TinyMCE-Integration lässt sich später direkt hier einbinden.
        </p>
        {error && (
          <div className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4 rounded-2xl border border-purple-600/30 bg-purple-950/40 p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-xs font-semibold uppercase tracking-widest text-purple-300">Titel</label>
            <input
              value={draft.title}
              onChange={(event) => handleChange('title', event.target.value)}
              className="mt-2 w-full rounded-xl border border-purple-500/40 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-purple-300"
              placeholder="Release 2.4 angekündigt"
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-widest text-purple-300">Slug</label>
            <input
              value={draft.slug}
              onChange={(event) => handleChange('slug', event.target.value)}
              className="mt-2 w-full rounded-xl border border-purple-500/40 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-purple-300"
              placeholder="release-2-4-ankuendigung"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-widest text-purple-300">Inhalt</label>
          <div className="mt-2 overflow-hidden rounded-xl border border-purple-500/40 bg-black/40 px-1 py-1">
            <TinyEditor
              value={draft.content}
              onEditorChange={(value: string) => handleChange('content', value)}
              init={{
                height: 380,
                menubar: false,
                skin: 'oxide-dark',
                content_css: 'dark',
                plugins: ['lists', 'link', 'code', 'table', 'media', 'emoticons', 'autolink', 'preview'],
                toolbar:
                  'undo redo | formatselect | bold italic underline | alignleft aligncenter alignright alignjustify | bullist numlist | link table media | code preview',
                branding: false,
              }}
              apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY ?? ''}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="text-xs font-semibold uppercase tracking-widest text-purple-300">Status</label>
          <select
            value={draft.status}
            onChange={(event) => handleChange('status', event.target.value as NewsDraft['status'])}
            className="rounded-full border border-purple-500/40 bg-black/40 px-4 py-2 text-sm text-white outline-none focus:border-purple-300"
          >
            <option value="draft">Entwurf</option>
            <option value="published">Veröffentlicht</option>
          </select>
          <button
            type="submit"
            disabled={isSaving}
            className="ml-auto flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 px-5 py-2 text-sm font-semibold text-white shadow-lg transition hover:from-purple-500 hover:to-pink-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <PencilSquareIcon className="h-4 w-4" /> {isSaving ? 'Wird gespeichert…' : 'Beitrag speichern'}
          </button>
        </div>
      </form>

      <div>
        <h3 className="text-lg font-semibold text-purple-100">Historie</h3>
        <div className="mt-4 space-y-4">
          {isLoading && (
            <div className="rounded-2xl border border-purple-600/30 bg-black/20 p-5 text-sm text-purple-200">
              News werden geladen…
            </div>
          )}

          {!isLoading && history.length === 0 && (
            <div className="rounded-2xl border border-purple-600/30 bg-black/20 p-5 text-sm text-purple-200">
              Noch keine News vorhanden. Erstelle den ersten Beitrag.
            </div>
          )}

          {history.map((entry) => {
            const entryKey = String(entry.id ?? entry.slug)
            return (
              <article key={entryKey} className="rounded-2xl border border-purple-600/30 bg-black/20 p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h4 className="text-lg font-semibold text-white">{entry.title}</h4>
                  <p className="text-xs uppercase tracking-widest text-purple-300">Slug: {entry.slug}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs sm:justify-end">
                  <span className="rounded-full border border-purple-500/40 px-3 py-1 text-purple-200">
                    {entry.status === 'published' ? 'Veröffentlicht' : 'Entwurf'}
                  </span>
                  <span className="text-purple-200">
                    Stand {entry.updated_at ? new Date(entry.updated_at).toLocaleDateString('de-DE') : 'unbekannt'}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeleteHistory(entryKey)}
                    disabled={deletingId === entryKey}
                    className="inline-flex items-center gap-1.5 rounded-full border border-red-500/40 px-3 py-1.5 text-[11px] font-semibold text-red-200 transition hover:border-red-400 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <TrashIcon className="h-3.5 w-3.5" /> {deletingId === entryKey ? 'Wird entfernt…' : 'Entfernen'}
                  </button>
                </div>
              </div>
              <div
                className="mt-3 text-sm text-purple-100"
                dangerouslySetInnerHTML={{ __html: entry.content ?? '' }}
              />
              </article>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function SettingsPanel() {
  type SiteSettingsForm = {
    siteName: string
    tagline: string
    imprint: string
    privacy: string
    supportEmail: string
  }

  type FeedbackState = {
    variant: 'success' | 'error'
    message: string
  }

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

    if (!settings.siteName.trim()) {
      setFeedback({ variant: 'error', message: 'Bitte gib einen Seitennamen an.' })
      return
    }

    try {
      setIsSaving(true)
      const response = await fetch(SITE_SETTINGS_ENDPOINT, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteName: settings.siteName,
          tagline: settings.tagline,
          imprint: settings.imprint,
          privacy: settings.privacy,
          supportEmail: settings.supportEmail,
        }),
      })

      if (handleAdminUnauthorized(response)) {
        return
      }

      const raw = await response.text()
      let payload: unknown = null

      if (raw.length > 0) {
        try {
          payload = JSON.parse(raw)
        } catch {
          payload = null
        }
      }

      if (!response.ok || !payload || typeof payload !== 'object' || Array.isArray(payload)) {
        const message =
          payload && typeof payload === 'object' && 'error' in payload && typeof (payload as { error?: string }).error === 'string'
            ? (payload as { error?: string }).error!
            : 'Einstellungen konnten nicht gespeichert werden.'
        throw new Error(message)
      }

      setSettings(mapResponseToForm(payload as Partial<SiteSettings>))
      setFeedback({ variant: 'success', message: 'Einstellungen wurden gespeichert.' })
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Seiten-Einstellungen</h2>
        <p className="text-sm text-purple-200">
          Passe Branding, Impressum und Datenschutzinformationen an. Die Werte werden in Supabase gespeichert und stehen öffentlich zur Verfügung.
        </p>
      </div>

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

      {isLoading && (
        <div className="rounded-2xl border border-purple-600/30 bg-purple-950/40 p-4 text-sm text-purple-200">
          Einstellungen werden geladen...
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="text-xs font-semibold uppercase tracking-widest text-purple-300">Seitenname</label>
          <input
            value={settings.siteName}
            onChange={(event) => handleChange('siteName', event.target.value)}
            disabled={isSaving || isLoading}
            className="mt-2 w-full rounded-xl border border-purple-500/40 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-purple-300 disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-widest text-purple-300">Tagline</label>
          <input
            value={settings.tagline}
            onChange={(event) => handleChange('tagline', event.target.value)}
            disabled={isSaving || isLoading}
            className="mt-2 w-full rounded-xl border border-purple-500/40 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-purple-300 disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-widest text-purple-300">Support E-Mail</label>
          <input
            type="email"
            value={settings.supportEmail}
            onChange={(event) => handleChange('supportEmail', event.target.value)}
            disabled={isSaving || isLoading}
            className="mt-2 w-full rounded-xl border border-purple-500/40 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-purple-300 disabled:cursor-not-allowed disabled:opacity-60"
            placeholder="support@arcanepixels.com"
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="text-xs font-semibold uppercase tracking-widest text-purple-300">Impressum</label>
          <textarea
            value={settings.imprint}
            onChange={(event) => handleChange('imprint', event.target.value)}
            rows={6}
            disabled={isSaving || isLoading}
            className="mt-2 w-full rounded-xl border border-purple-500/40 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-purple-300 disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-widest text-purple-300">Datenschutz</label>
          <textarea
            value={settings.privacy}
            onChange={(event) => handleChange('privacy', event.target.value)}
            rows={6}
            disabled={isSaving || isLoading}
            className="mt-2 w-full rounded-xl border border-purple-500/40 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-purple-300 disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3">
        <button
          type="button"
          onClick={fetchSettings}
          disabled={isLoading || isSaving}
          className="inline-flex items-center gap-2 rounded-full border border-purple-500/40 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-purple-200 transition hover:border-purple-300 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          <ArrowPathIcon className="h-4 w-4" /> Neu laden
        </button>
        <button
          type="submit"
          disabled={isSaving || isLoading}
          className="flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 px-5 py-2 text-sm font-semibold text-white shadow-lg transition hover:from-purple-500 hover:to-pink-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <CheckCircleIcon className="h-4 w-4" /> {isSaving ? 'Speichert…' : 'Einstellungen speichern'}
        </button>
      </div>
    </form>
  )
}

function ThemePanel() {
  const [theme, setTheme] = useState<ThemeSettings>({
    primaryColor: '#7f52ff',
    accentColor: '#ff5dbc',
    navigationStyle: 'classic',
    footerLayout: 'columns',
  })

  const previewStyles = useMemo<Record<string, string>>(
    () => ({
      '--preview-primary': theme.primaryColor,
      '--preview-accent': theme.accentColor,
    }),
    [theme.primaryColor, theme.accentColor],
  )

  const handleChange = <T extends keyof ThemeSettings>(key: T, value: ThemeSettings[T]) => {
    setTheme((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    alert('Theme gespeichert (Mock). Hier kann später Supabase / CMS angebunden werden.')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold">Theme & Layout</h2>
        <p className="text-sm text-purple-200">
          Stelle Farben, Navigation und Footer-Layout ein. Die Vorschau aktualisiert sich in Echtzeit.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="text-xs font-semibold uppercase tracking-widest text-purple-300">Primärfarbe</label>
          <input
            type="color"
            value={theme.primaryColor}
            onChange={(event) => handleChange('primaryColor', event.target.value)}
            className="mt-2 h-12 w-full rounded-xl border border-purple-500/40 bg-black/40"
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-widest text-purple-300">Akzentfarbe</label>
          <input
            type="color"
            value={theme.accentColor}
            onChange={(event) => handleChange('accentColor', event.target.value)}
            className="mt-2 h-12 w-full rounded-xl border border-purple-500/40 bg-black/40"
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="text-xs font-semibold uppercase tracking-widest text-purple-300">Navigation</label>
          <select
            value={theme.navigationStyle}
            onChange={(event) => handleChange('navigationStyle', event.target.value as ThemeSettings['navigationStyle'])}
            className="mt-2 w-full rounded-xl border border-purple-500/40 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-purple-300"
          >
            <option value="classic">Classic</option>
            <option value="minimal">Minimal</option>
            <option value="split">Split Navigation</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-widest text-purple-300">Footer Layout</label>
          <select
            value={theme.footerLayout}
            onChange={(event) => handleChange('footerLayout', event.target.value as ThemeSettings['footerLayout'])}
            className="mt-2 w-full rounded-xl border border-purple-500/40 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-purple-300"
          >
            <option value="compact">Kompakt</option>
            <option value="columns">Mehrspaltig</option>
          </select>
        </div>
      </div>

  <div className="rounded-2xl border border-purple-500/30 bg-purple-950/30 p-6" style={previewStyles}>
        <p className="text-xs uppercase tracking-widest text-purple-200">Live Vorschau</p>
        <div className="mt-4 rounded-2xl bg-[color:var(--preview-primary)]/40 p-4">
          <div className="rounded-xl bg-black/30 p-4 text-sm text-white">
            Navigation: <span className="font-semibold">{theme.navigationStyle}</span>
          </div>
        </div>
        <div className="mt-4 rounded-2xl bg-[color:var(--preview-accent)]/40 p-4 text-sm text-white">
          Footer: <span className="font-semibold">{theme.footerLayout}</span>
        </div>
      </div>

      <div className="flex items-center justify-end">
        <button
          type="submit"
          className="flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 px-5 py-2 text-sm font-semibold text-white shadow-lg transition hover:from-purple-500 hover:to-pink-400"
        >
          <PaintBrushIcon className="h-4 w-4" /> Theme speichern
        </button>
      </div>
    </form>
  )
}

function BugPanel() {
  const [records, setRecords] = useState<BugRecord[]>([
    {
      id: 1,
      title: 'Eventliste lädt nicht',
      description: 'Beim Öffnen des Event-Managements bleibt der Loader endlos aktiv.',
      severity: 'high',
      status: 'in_progress',
      createdAt: '2025-09-12',
    },
    {
      id: 2,
      title: 'Darkmode speichert sich nicht',
      description: 'Nach Logout springt das Theme wieder auf Light Mode.',
      severity: 'medium',
      status: 'open',
      createdAt: '2025-09-02',
    },
  ])

  const handleStatusUpdate = (id: number, status: BugRecord['status']) => {
    setRecords((prev) => prev.map((record) => (record.id === id ? { ...record, status } : record)))
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Bug Tracker</h2>
          <p className="text-sm text-purple-200">Überblicke aktuelle Bugs und aktualisiere den Status direkt.</p>
        </div>
      </div>

      <div className="space-y-4">
        {records.map((record) => (
          <article key={record.id} className="rounded-2xl border border-purple-600/30 bg-black/20 p-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-widest text-purple-300">#{record.id}</p>
                <h3 className="text-lg font-semibold text-white">{record.title}</h3>
                <p className="mt-2 text-sm text-purple-100">{record.description}</p>
              </div>
              <div className="flex flex-col gap-2 text-sm text-purple-200 sm:text-right">
                <span>Severity: {record.severity}</span>
                <span>Gemeldet am {record.createdAt}</span>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <label className="text-xs font-semibold uppercase tracking-widest text-purple-300">Status</label>
              <select
                value={record.status}
                onChange={(event) => handleStatusUpdate(record.id, event.target.value as BugRecord['status'])}
                className="rounded-full border border-purple-500/40 bg-black/40 px-4 py-2 text-sm text-white outline-none focus:border-purple-300"
              >
                <option value="open">Offen</option>
                <option value="in_progress">In Arbeit</option>
                <option value="resolved">Gelöst</option>
                <option value="closed">Geschlossen</option>
              </select>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
