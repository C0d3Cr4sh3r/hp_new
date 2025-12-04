'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import {
  PencilSquareIcon,
  TrashIcon,
} from '@heroicons/react/24/outline'
import type { TinyEditorProps } from '@/components/admin/TinyMceEditor'
import type { NewsArticle } from '@/lib/supabase'
import { handleAdminUnauthorized } from '@/components/admin/utils/handleUnauthorized'

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

export function NewsPanel() {
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

