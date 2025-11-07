'use client'

import { useState, useEffect } from 'react'
import ArcaneNavigation from '@/components/arcane/ArcaneNavigation'
import type { NewsArticle } from '@/lib/supabase'

type PublicNewsArticle = NewsArticle & { excerpt?: string }

export default function NewsPage() {
  const [news, setNews] = useState<PublicNewsArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    const loadNews = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch('/api/news', { signal: controller.signal })

        if (!response.ok) {
          throw new Error('Antwort des Servers war nicht erfolgreich')
        }

        const data = (await response.json()) as NewsArticle[]
        const published = data.filter((article) => article.status !== 'draft')
        const sorted = published.sort((a, b) => {
          const left = Date.parse(b.updated_at ?? b.created_at ?? '')
          const right = Date.parse(a.updated_at ?? a.created_at ?? '')
          return (Number.isNaN(left) ? 0 : left) - (Number.isNaN(right) ? 0 : right)
        })

        setNews(
          sorted.map((article) => ({
            ...article,
            excerpt: createExcerpt(article.content),
          })),
        )
      } catch (err) {
        console.error('News konnten nicht geladen werden:', err)
        if (!controller.signal.aborted) {
          setError('News konnten nicht geladen werden. Bitte versuche es später erneut.')
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    loadNews()
    return () => controller.abort()
  }, [])

  return (
    <>
      <ArcaneNavigation />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">ArcanePixels News</h1>
          <p className="text-purple-200 text-lg">
            Aktuelle Updates und Neuigkeiten rund um unsere Apps und Services
          </p>
          {error && (
            <p className="mt-4 text-sm text-red-300">
              {error}
            </p>
          )}
        </div>

        {loading ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-purple-500"></div>
              <p className="mt-4 text-purple-300">News werden geladen…</p>
            </div>
          </div>
        ) : news.length === 0 ? (
          <div className="rounded-2xl border border-purple-500/30 bg-black/30 p-8 text-center text-purple-200">
            Noch keine veröffentlichten News. Schau später wieder vorbei.
          </div>
        ) : (
          <div className="space-y-8">
            {news.map((article) => (
              <NewsCard key={article.id ?? article.slug} article={article} />
            ))}
          </div>
        )}

        <div className="mt-16 rounded-2xl bg-gradient-to-r from-purple-900/40 to-pink-900/40 p-8 text-center">
          <h3 className="mb-4 text-2xl font-bold text-white">Newsletter abonnieren</h3>
          <p className="mb-6 text-purple-200">
            Verpasse keine Updates und erfahre als Erste/r von neuen Features!
          </p>
          <div className="mx-auto flex max-w-md flex-col gap-4 sm:flex-row">
            <input
              type="email"
              placeholder="Deine E-Mail-Adresse"
              className="flex-1 rounded-md border border-purple-500/30 bg-black/50 px-4 py-2 text-white placeholder-purple-400 focus:border-purple-500 focus:outline-none"
            />
            <button className="rounded-md bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-2 font-semibold text-white transition-all hover:from-purple-500 hover:to-pink-500">
              Abonnieren
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

function createExcerpt(html: string) {
  const plain = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  return plain.length > 220 ? `${plain.slice(0, 220)}…` : plain
}

function NewsCard({ article }: { article: PublicNewsArticle }) {
  const [expanded, setExpanded] = useState(false)

  const updated = article.updated_at ?? article.created_at ?? ''
  const displayDate = updated ? new Date(updated).toLocaleDateString('de-DE') : 'Unbekannt'

  return (
    <article className="rounded-lg border border-purple-500/20 bg-black/40 p-6 backdrop-blur-sm transition-all hover:border-purple-500/40">
      <div className="mb-4">
        <div className="mb-2 flex items-start justify-between">
          <h2 className="text-2xl font-bold text-white">{article.title}</h2>
          <span className="text-sm text-purple-300">{displayDate}</span>
        </div>
        <p className="text-xs uppercase tracking-widest text-purple-400">Slug: {article.slug}</p>
      </div>

      <div className="text-purple-200">
        {expanded ? (
          <div
            className="prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        ) : (
          <p>{article.excerpt || 'Keine Vorschau verfügbar.'}</p>
        )}
      </div>

      <div className="mt-4">
        <button
          onClick={() => setExpanded((prev) => !prev)}
          className="text-sm font-medium text-purple-400 transition-colors hover:text-purple-300"
        >
          {expanded ? 'Weniger anzeigen' : 'Weiterlesen'} →
        </button>
      </div>
    </article>
  )
}
