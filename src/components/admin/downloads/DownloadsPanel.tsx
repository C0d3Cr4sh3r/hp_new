'use client'

import { useEffect, useMemo, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import {
  CloudArrowDownIcon,
  PencilSquareIcon,
  ArrowUpTrayIcon,
  AdjustmentsHorizontalIcon,
  CheckCircleIcon,
  ClipboardIcon,
  ExclamationTriangleIcon,
  TrashIcon,
} from '@heroicons/react/24/outline'
import type { DownloadEntry } from '@/lib/supabase'
import { handleAdminUnauthorized } from '@/components/admin/utils/handleUnauthorized'

type DownloadFormState = {
  title: string
  version: string
  fileUrl: string
  fileSize: string
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
  fileSize: '',
  channel: 'stable',
  availableInStore: false,
  storeUrl: '',
  changelogMarkdown: '',
  changelogFileName: '',
  securityHash: '',
}

export function DownloadsPanel() {
  const [downloads, setDownloads] = useState<DownloadEntry[]>([])
  const [form, setForm] = useState<DownloadFormState>({ ...DOWNLOAD_FORM_DEFAULT })
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
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

  const MAX_FILE_SIZE_MB = 50
  const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Größenprüfung vor Upload
    if (file.size > MAX_FILE_SIZE_BYTES) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1)
      setFeedback({
        variant: 'error',
        message: `Datei ist zu groß (${sizeMB} MB). Maximum: ${MAX_FILE_SIZE_MB} MB. Für größere Dateien nutze "Im Store verfügbar" mit einem externen Link.`,
      })
      event.target.value = ''
      return
    }

    try {
      setIsUploading(true)
      setFeedback(null)

      // 1. Signierte Upload-URL von API holen
      const signedUrlResponse = await fetch('/api/downloads/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: file.name, fileType: file.type }),
      })

      if (handleAdminUnauthorized(signedUrlResponse)) {
        return
      }

      if (!signedUrlResponse.ok) {
        const errorBody = (await signedUrlResponse.json().catch(() => null)) as { error?: string } | null
        throw new Error(errorBody?.error ?? 'Upload-URL konnte nicht erstellt werden.')
      }

      const { signedUrl, publicUrl } = await signedUrlResponse.json()

      // 2. Datei direkt zu Supabase Storage hochladen
      // Die signedUrl von createSignedUploadUrl erwartet PUT
      const uploadResponse = await fetch(signedUrl, {
        method: 'PUT',
        body: file,
      })

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text().catch(() => '')
        console.error('Supabase Upload Error:', uploadResponse.status, errorText)
        throw new Error(`Upload zu Supabase fehlgeschlagen: ${uploadResponse.status}`)
      }

      // 3. Dateigröße formatieren
      const fileSizeFormatted = formatFileSize(file.size)

      setForm((prev) => ({
        ...prev,
        fileUrl: publicUrl,
        fileSize: fileSizeFormatted,
      }))
      event.target.value = ''
      setFeedback({
        variant: 'success',
        message: `${file.name} wurde hochgeladen (${fileSizeFormatted}).`,
      })
    } catch (error) {
      console.error('Upload fehlgeschlagen:', error)
      setFeedback({
        variant: 'error',
        message: error instanceof Error ? error.message : 'Upload fehlgeschlagen.',
      })
    } finally {
      setIsUploading(false)
    }
  }

  function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
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

    if (!form.title.trim() || !form.version.trim()) {
      setFeedback({
        variant: 'error',
        message: 'Titel und Version sind Pflichtfelder.',
      })
      return
    }

    // Bei Store-Verfügbarkeit: Store-URL prüfen
    if (form.availableInStore && !form.storeUrl.trim()) {
      setFeedback({
        variant: 'error',
        message: 'Bitte gib einen Store-Link an.',
      })
      return
    }

    // Bei Datei-Upload: fileUrl prüfen
    if (!form.availableInStore && !form.fileUrl.trim()) {
      setFeedback({
        variant: 'error',
        message: 'Bitte lade eine Datei hoch.',
      })
      return
    }

    const payload = {
      title: form.title.trim(),
      version: form.version.trim(),
      file_url: form.availableInStore ? form.storeUrl.trim() : form.fileUrl.trim(),
      channel: form.channel,
      available_in_store: form.availableInStore,
      store_url: form.availableInStore ? form.storeUrl.trim() : null,
      changelog_markdown: form.changelogMarkdown.trim() || null,
      changelog_file_name: form.changelogFileName.trim() || null,
      security_hash: form.securityHash.trim() || null,
      file_size: form.fileSize || null,
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

        {/* Store Toggle */}
        <div className="lg:col-span-2">
          <label className="text-xs font-semibold uppercase tracking-widest text-purple-300">Verfügbarkeit</label>
          <div className="mt-2 flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="availability"
                checked={!form.availableInStore}
                onChange={() => handleInputChange('availableInStore', false)}
                className="h-4 w-4 border-purple-500/40 bg-black/60 text-purple-500 focus:ring-purple-400"
              />
              <span className="text-sm text-purple-100">Datei hochladen</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="availability"
                checked={form.availableInStore}
                onChange={() => handleInputChange('availableInStore', true)}
                className="h-4 w-4 border-purple-500/40 bg-black/60 text-purple-500 focus:ring-purple-400"
              />
              <span className="text-sm text-purple-100">Im Store verfügbar</span>
            </label>
          </div>
        </div>

        {/* Datei Upload ODER Store-Link */}
        <div className="lg:col-span-2">
          {!form.availableInStore ? (
            <div className="rounded-xl border border-purple-500/40 bg-black/40 p-4">
              <label className="text-xs font-semibold uppercase tracking-widest text-purple-300">
                Datei hochladen
              </label>
              <p className="mt-1 text-xs text-purple-300/70">
                APK, IPA, ZIP, EXE, DMG oder andere Installationsdateien (max. 50 MB)
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-4">
                <label className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-5 py-3 text-sm font-semibold transition ${
                  isUploading
                    ? 'border-purple-500/20 bg-purple-500/10 text-purple-300 cursor-wait'
                    : 'border-purple-500/40 bg-purple-600/20 text-purple-100 hover:border-purple-300 hover:bg-purple-600/30'
                }`}>
                  <input
                    type="file"
                    className="hidden"
                    accept=".apk,.ipa,.zip,.exe,.dmg,.msi,.deb,.rpm,.tar.gz"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                  />
                  <ArrowUpTrayIcon className="h-5 w-5" />
                  {isUploading ? 'Wird hochgeladen...' : 'Datei auswählen'}
                </label>
                {form.fileUrl && (
                  <div className="flex items-center gap-2 text-sm text-emerald-300">
                    <CheckCircleIcon className="h-5 w-5" />
                    <span>Datei hochgeladen {form.fileSize && `(${form.fileSize})`}</span>
                  </div>
                )}
              </div>
              {form.fileUrl && (
                <div className="mt-3">
                  <p className="text-xs text-purple-300/70">Download-URL:</p>
                  <p className="mt-1 text-xs text-purple-100 break-all font-mono">{form.fileUrl}</p>
                </div>
              )}

              {/* Manuelle URL für große Dateien */}
              <div className="mt-4 border-t border-purple-500/20 pt-4">
                <p className="text-xs text-purple-300/70 mb-2">
                  Oder externe URL eingeben (für Dateien &gt; 50 MB):
                </p>
                <input
                  type="url"
                  value={form.fileUrl}
                  onChange={(event) => handleInputChange('fileUrl', event.target.value)}
                  placeholder="https://example.com/download/app-beta.apk"
                  className="w-full rounded-xl border border-purple-500/40 bg-black/40 px-4 py-2 text-sm text-white outline-none focus:border-purple-300"
                />
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-purple-500/40 bg-black/40 p-4">
              <label className="text-xs font-semibold uppercase tracking-widest text-purple-300">
                Store-Link
              </label>
              <p className="mt-1 text-xs text-purple-300/70">
                Link zum Play Store, App Store oder anderen Store
              </p>
              <input
                type="url"
                value={form.storeUrl}
                onChange={(event) => {
                  handleInputChange('storeUrl', event.target.value)
                  handleInputChange('fileUrl', event.target.value)
                }}
                placeholder="https://play.google.com/store/apps/details?id=com.arcanepixels"
                className="mt-3 w-full rounded-xl border border-purple-500/40 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-purple-300"
              />
            </div>
          )}
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

