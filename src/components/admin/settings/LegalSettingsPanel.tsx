'use client'

import { useCallback, useEffect, useState } from 'react'
import { ArrowPathIcon, CheckCircleIcon, ExclamationTriangleIcon, EyeIcon, CodeBracketIcon } from '@heroicons/react/24/outline'
import { DEFAULT_SITE_SETTINGS } from '@/lib/supabase'
import type { SiteSettings } from '@/lib/supabase'
import { handleAdminUnauthorized } from '@/components/admin/utils/handleUnauthorized'
import { TinyEditor } from '@/components/admin/TinyMceEditor'

const ENDPOINT = '/api/site-settings'

type FormState = {
  imprint: string
  privacy: string
}

type FeedbackState = { variant: 'success' | 'error'; message: string }
type ViewMode = 'editor' | 'preview' | 'source'

export function LegalSettingsPanel() {
  const [form, setForm] = useState<FormState>({ imprint: '', privacy: '' })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [feedback, setFeedback] = useState<FeedbackState | null>(null)
  const [activeTab, setActiveTab] = useState<'imprint' | 'privacy'>('imprint')
  const [viewMode, setViewMode] = useState<ViewMode>('editor')

  const fetchSettings = useCallback(async () => {
    try {
      setIsLoading(true)
      const res = await fetch(ENDPOINT, { cache: 'no-store' })
      if (handleAdminUnauthorized(res)) return
      if (!res.ok) throw new Error('Laden fehlgeschlagen')
      const data = (await res.json()) as Partial<SiteSettings>
      setForm({
        imprint: data.imprint ?? '',
        privacy: data.privacy ?? '',
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
          imprint: form.imprint.trim() || null,
          privacy: form.privacy.trim() || null,
        }),
      })
      if (handleAdminUnauthorized(res)) return
      if (!res.ok) throw new Error('Speichern fehlgeschlagen')
      setFeedback({ variant: 'success', message: 'Rechtliche Texte gespeichert!' })
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
        <h2 className="text-xl font-semibold text-white">Rechtliches</h2>
        <p className="mt-1 text-sm text-purple-300">
          Impressum und Datenschutzerklärung. HTML-Formatierung wird unterstützt.
        </p>
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

      {/* Tab Buttons */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('imprint')}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
            activeTab === 'imprint'
              ? 'bg-purple-500/30 text-white'
              : 'text-purple-300 hover:bg-purple-500/10'
          }`}
        >
          Impressum
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('privacy')}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
            activeTab === 'privacy'
              ? 'bg-purple-500/30 text-white'
              : 'text-purple-300 hover:bg-purple-500/10'
          }`}
        >
          Datenschutz
        </button>
      </div>

      {/* View Mode Toggle */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setViewMode('editor')}
          className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
            viewMode === 'editor'
              ? 'bg-purple-500/30 text-white'
              : 'text-purple-300 hover:bg-purple-500/10'
          }`}
        >
          Editor
        </button>
        <button
          type="button"
          onClick={() => setViewMode('preview')}
          className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
            viewMode === 'preview'
              ? 'bg-purple-500/30 text-white'
              : 'text-purple-300 hover:bg-purple-500/10'
          }`}
        >
          <EyeIcon className="h-4 w-4" />
          Vorschau
        </button>
        <button
          type="button"
          onClick={() => setViewMode('source')}
          className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
            viewMode === 'source'
              ? 'bg-purple-500/30 text-white'
              : 'text-purple-300 hover:bg-purple-500/10'
          }`}
        >
          <CodeBracketIcon className="h-4 w-4" />
          HTML-Quellcode
        </button>
      </div>

      {/* Content */}
      <div>
        <label className="text-xs font-semibold uppercase tracking-widest text-purple-300">
          {activeTab === 'imprint' ? 'Impressum' : 'Datenschutzerklärung'}
        </label>

        {viewMode === 'editor' && (
          <div className="mt-2 rounded-xl border border-purple-500/40 overflow-hidden">
            <TinyEditor
              value={activeTab === 'imprint' ? form.imprint : form.privacy}
              onEditorChange={(content) =>
                setForm((p) => ({
                  ...p,
                  [activeTab === 'imprint' ? 'imprint' : 'privacy']: content,
                }))
              }
              init={{
                height: 500,
                menubar: true,
                plugins: [
                  'advlist', 'autolink', 'lists', 'link', 'charmap',
                  'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                  'insertdatetime', 'table', 'preview', 'help', 'wordcount'
                ],
                toolbar: 'undo redo | blocks | ' +
                  'bold italic forecolor | alignleft aligncenter ' +
                  'alignright alignjustify | bullist numlist outdent indent | ' +
                  'removeformat | help',
                content_style: 'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 14px; }',
              }}
            />
          </div>
        )}

        {viewMode === 'preview' && (
          <div
            className="mt-2 min-h-[500px] rounded-xl border border-purple-500/40 bg-white p-6 prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{
              __html: activeTab === 'imprint' ? form.imprint : form.privacy
            }}
          />
        )}

        {viewMode === 'source' && (
          <textarea
            value={activeTab === 'imprint' ? form.imprint : form.privacy}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                [activeTab === 'imprint' ? 'imprint' : 'privacy']: e.target.value,
              }))
            }
            rows={20}
            className="mt-2 w-full rounded-xl border border-purple-500/40 bg-black/40 px-4 py-3 font-mono text-sm text-white placeholder-purple-300/50 focus:border-purple-400 focus:outline-none"
            placeholder={
              activeTab === 'imprint'
                ? 'Impressum hier eingeben (HTML erlaubt)...'
                : 'Datenschutzerklärung hier eingeben (HTML erlaubt)...'
            }
          />
        )}

        {viewMode === 'source' && (
          <p className="mt-2 text-xs text-purple-400">
            Du kannst HTML-Tags wie &lt;h2&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;li&gt; verwenden.
          </p>
        )}
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

