'use client'

import { useEffect, useState } from 'react'
import type { ChangeEvent } from 'react'
import Image from 'next/image'
import {
  ArrowPathIcon,
  ArrowUpTrayIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PencilIcon,
  PhotoIcon,
  TrashIcon,
} from '@heroicons/react/24/outline'
import type { Screenshot } from '@/lib/supabase'
import { handleAdminUnauthorized } from '@/components/admin/utils/handleUnauthorized'

type FeedbackState = {
  variant: 'success' | 'error'
  message: string
}

type FormState = {
  id?: number
  title: string
  description: string
  category: string
  imageUrl: string | null
  imageAlt: string
  imageWidth: number | null
  imageHeight: number | null
  imageStoragePath: string | null
  sortOrder: number
  status: 'active' | 'inactive'
}

const CATEGORIES = [
  { value: 'app', label: 'ShootingHub App' },
  { value: 'portfolio', label: 'Portfolio' },
  { value: 'websites', label: 'Websites' },
  { value: 'misc', label: 'Sonstiges' },
]

const INITIAL_FORM: FormState = {
  title: '',
  description: '',
  category: 'app',
  imageUrl: null,
  imageAlt: '',
  imageWidth: null,
  imageHeight: null,
  imageStoragePath: null,
  sortOrder: 0,
  status: 'active',
}

export default function ScreenshotsAdminPanel() {
  const [screenshots, setScreenshots] = useState<Screenshot[]>([])
  const [form, setForm] = useState<FormState>(INITIAL_FORM)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [feedback, setFeedback] = useState<FeedbackState | null>(null)

  useEffect(() => {
    loadScreenshots()
  }, [])

  const loadScreenshots = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/screenshots', { cache: 'no-store' })
      if (!response.ok) {
        throw new Error('Screenshots konnten nicht geladen werden.')
      }
      const data = (await response.json()) as Screenshot[]
      setScreenshots(data)
    } catch (error) {
      console.error('Screenshots konnten nicht geladen werden:', error)
      setFeedback({ variant: 'error', message: 'Screenshots konnten nicht geladen werden.' })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (screenshot: Screenshot) => {
    setForm({
      id: screenshot.id,
      title: screenshot.title,
      description: screenshot.description || '',
      category: screenshot.category,
      imageUrl: screenshot.image_url,
      imageAlt: screenshot.image_alt || '',
      imageWidth: screenshot.image_width || null,
      imageHeight: screenshot.image_height || null,
      imageStoragePath: screenshot.image_storage_path || null,
      sortOrder: screenshot.sort_order || 0,
      status: screenshot.status,
    })
    setIsEditing(true)
  }

  const handleReset = () => {
    setForm(INITIAL_FORM)
    setIsEditing(false)
    setFeedback(null)
  }

  const handleSave = async () => {
    if (!form.title.trim()) {
      setFeedback({ variant: 'error', message: 'Titel ist erforderlich.' })
      return
    }

    if (!form.imageUrl) {
      setFeedback({ variant: 'error', message: 'Bild ist erforderlich.' })
      return
    }

    try {
      setSaving(true)
      setFeedback(null)

      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        category: form.category,
        image_url: form.imageUrl,
        image_alt: form.imageAlt.trim() || form.title.trim(),
        image_width: form.imageWidth,
        image_height: form.imageHeight,
        image_storage_path: form.imageStoragePath,
        sort_order: form.sortOrder,
        status: form.status,
      }

      const url = isEditing ? `/api/screenshots/${form.id}` : '/api/screenshots'
      const method = isEditing ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (handleAdminUnauthorized(response)) {
        return
      }

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null
        throw new Error(body?.error ?? 'Screenshot konnte nicht gespeichert werden.')
      }

      setFeedback({ variant: 'success', message: isEditing ? 'Screenshot aktualisiert.' : 'Screenshot erstellt.' })
      handleReset()
      await loadScreenshots()
    } catch (error) {
      console.error('Speichern fehlgeschlagen:', error)
      setFeedback({
        variant: 'error',
        message: error instanceof Error ? error.message : 'Screenshot konnte nicht gespeichert werden.',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Screenshot wirklich löschen?')) return

    try {
      setFeedback(null)
      console.log('Attempting to delete screenshot with ID:', id)
      
      const response = await fetch(`/api/screenshots/${id}`, { method: 'DELETE' })
      
      if (handleAdminUnauthorized(response)) {
        return
      }

      console.log('Delete response status:', response.status)
      console.log('Delete response ok:', response.ok)

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null
        console.error('Delete failed with response:', body)
        throw new Error(body?.error ?? 'Screenshot konnte nicht gelöscht werden.')
      }

      const result = await response.json()
      console.log('Delete result:', result)

      setFeedback({ variant: 'success', message: 'Screenshot gelöscht.' })
      await loadScreenshots()
    } catch (error) {
      console.error('Löschen fehlgeschlagen:', error)
      setFeedback({
        variant: 'error',
        message: error instanceof Error ? error.message : 'Screenshot konnte nicht gelöscht werden.',
      })
    }
  }

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)
      setFeedback(null)

      const formData = new FormData()
      formData.append('file', file)
      formData.append('category', form.category)
      
      // Wenn wir einen Titel haben, direkt Screenshot erstellen
      if (form.title.trim()) {
        formData.append('title', form.title.trim())
        formData.append('description', form.description.trim())
        formData.append('createScreenshot', 'true')
      }
      
      if (form.imageStoragePath) {
        formData.append('previousPath', form.imageStoragePath)
      }

      const response = await fetch('/api/screenshots/upload', {
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

      const data = await response.json()
      
      // Wenn direkt ein Screenshot erstellt wurde, Liste neu laden
      if (data.screenshot) {
        setFeedback({ variant: 'success', message: 'Screenshot erfolgreich erstellt und hochgeladen.' })
        handleReset()
        await loadScreenshots()
      } else {
        // Nur Upload, Formular mit Daten füllen
        setForm((prev) => ({
          ...prev,
          imageUrl: data.image_url,
          imageStoragePath: data.image_storage_path,
          imageWidth: data.image_width,
          imageHeight: data.image_height,
          imageAlt: prev.imageAlt || prev.title,
        }))
        setFeedback({ variant: 'success', message: 'Bild erfolgreich hochgeladen. Jetzt speichern um Screenshot zu erstellen.' })
      }
    } catch (error) {
      console.error('Upload fehlgeschlagen:', error)
      setFeedback({
        variant: 'error',
        message: error instanceof Error ? error.message : 'Upload fehlgeschlagen.',
      })
    } finally {
      setUploading(false)
      if (event.target) {
        event.target.value = ''
      }
    }
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Screenshots Management</h2>
          <p className="text-sm text-purple-200">
            Verwalte die Screenshot-Galerie für Portfolio und App-Präsentation.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-2 rounded-full border border-purple-500/40 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-purple-200 transition hover:border-purple-300 hover:text-white"
          >
            <ArrowPathIcon className="h-4 w-4" />
            Neu
          </button>
          <button
            type="button"
            onClick={loadScreenshots}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-full bg-purple-600 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition hover:bg-purple-700 disabled:opacity-50"
          >
            <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Laden
          </button>
        </div>
      </header>

      {feedback && (
        <div
          className={`flex items-center gap-2 rounded-lg px-4 py-3 text-sm ${
            feedback.variant === 'success'
              ? 'bg-green-500/10 text-green-400 border border-green-500/20'
              : 'bg-red-500/10 text-red-400 border border-red-500/20'
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold">{isEditing ? 'Screenshot bearbeiten' : 'Screenshot hinzufügen'}</h3>

          <div>
            <label className="block text-sm font-medium text-purple-300 mb-2">Titel *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              className="w-full rounded-lg border border-purple-500/30 bg-black/30 px-3 py-2 text-white placeholder-purple-400 focus:border-purple-400 focus:outline-none"
              placeholder="Screenshot Titel"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-purple-300 mb-2">Beschreibung</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              className="w-full rounded-lg border border-purple-500/30 bg-black/30 px-3 py-2 text-white placeholder-purple-400 focus:border-purple-400 focus:outline-none"
              placeholder="Beschreibung des Screenshots"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-purple-300 mb-2">Kategorie</label>
              <select
                value={form.category}
                onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                className="w-full rounded-lg border border-purple-500/30 bg-black/30 px-3 py-2 text-white focus:border-purple-400 focus:outline-none"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value} className="bg-black">
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-purple-300 mb-2">Reihenfolge</label>
              <input
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm((prev) => ({ ...prev, sortOrder: parseInt(e.target.value, 10) || 0 }))}
                className="w-full rounded-lg border border-purple-500/30 bg-black/30 px-3 py-2 text-white placeholder-purple-400 focus:border-purple-400 focus:outline-none"
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-purple-300 mb-2">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value as 'active' | 'inactive' }))}
              className="w-full rounded-lg border border-purple-500/30 bg-black/30 px-3 py-2 text-white focus:border-purple-400 focus:outline-none"
            >
              <option value="active" className="bg-black">Aktiv</option>
              <option value="inactive" className="bg-black">Inaktiv</option>
            </select>
          </div>

          {/* Image Upload */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-purple-300">Bild *</label>
            <div className="flex items-center gap-4">
              <label className="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50">
                <ArrowUpTrayIcon className="h-4 w-4" />
                {uploading ? 'Uploading...' : 'Bild hochladen'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="sr-only"
                />
              </label>
            </div>

            {form.imageUrl && (
              <div className="relative rounded-lg overflow-hidden bg-black/20">
                <Image
                  src={form.imageUrl}
                  alt={form.imageAlt || 'Screenshot'}
                  width={form.imageWidth || 400}
                  height={form.imageHeight || 300}
                  className="w-full h-48 object-cover"
                />
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !form.title.trim() || !form.imageUrl}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <ArrowPathIcon className="h-4 w-4 animate-spin" />
                  Speichern...
                </>
              ) : (
                <>
                  <CheckCircleIcon className="h-4 w-4" />
                  {isEditing ? 'Aktualisieren' : 'Erstellen'}
                </>
              )}
            </button>
            {isEditing && (
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 text-sm font-medium text-purple-300 border border-purple-500/30 rounded-lg hover:bg-purple-500/10"
              >
                Abbrechen
              </button>
            )}
          </div>
        </div>

        {/* Screenshot List */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Vorhandene Screenshots ({screenshots.length})</h3>
          
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <ArrowPathIcon className="h-6 w-6 animate-spin text-purple-400" />
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {screenshots.map((screenshot) => (
                <div
                  key={screenshot.id}
                  className="flex items-center gap-3 rounded-lg bg-black/20 p-3 border border-purple-500/20"
                >
                  {screenshot.image_url && (
                    <Image
                      src={screenshot.image_url}
                      alt={screenshot.image_alt || screenshot.title}
                      width={60}
                      height={40}
                      className="rounded object-cover"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-white truncate">{screenshot.title}</h4>
                    <p className="text-xs text-purple-300">
                      {screenshot.category} • Reihenfolge: {screenshot.sort_order || 0} • {screenshot.status}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleEdit(screenshot)}
                      className="p-1 text-purple-300 hover:text-white"
                      title="Bearbeiten"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(screenshot.id!)}
                      className="p-1 text-red-400 hover:text-red-300"
                      title="Löschen"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
              {screenshots.length === 0 && (
                <div className="text-center py-8 text-purple-300">
                  <PhotoIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Keine Screenshots vorhanden</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}