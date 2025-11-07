'use client'

import { useEffect, useState } from 'react'
import { CloudArrowDownIcon, ClipboardIcon, DocumentTextIcon } from '@heroicons/react/24/outline'
import ArcaneNavigation from '@/components/arcane/ArcaneNavigation'
import type { DownloadEntry } from '@/lib/supabase'

export default function DownloadsPage() {
  const [downloads, setDownloads] = useState<DownloadEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeChangelogId, setActiveChangelogId] = useState<number | null>(null)
  const [clipboardMessage, setClipboardMessage] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    const loadDownloads = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch('/api/downloads', { signal: controller.signal })
        if (!response.ok) {
          throw new Error('Antwort des Servers war nicht erfolgreich')
        }

        const data = (await response.json()) as DownloadEntry[]
        const sorted = [...(data ?? [])].sort((a, b) => {
          const left = a.created_at ?? a.updated_at ?? ''
          const right = b.created_at ?? b.updated_at ?? ''
          return right.localeCompare(left)
        })

        setDownloads(sorted)
      } catch (err) {
        console.error('Downloads konnten nicht geladen werden:', err)
        if (!controller.signal.aborted) {
          setError('Downloads konnten nicht geladen werden. Bitte versuche es später erneut.')
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    loadDownloads()
    return () => controller.abort()
  }, [])

  useEffect(() => {
    if (!clipboardMessage) return
    const timer = window.setTimeout(() => setClipboardMessage(null), 3000)
    return () => window.clearTimeout(timer)
  }, [clipboardMessage])

  const handleCopyHash = async (hash?: string | null) => {
    if (!hash) return
    try {
      await navigator.clipboard?.writeText(hash)
      setClipboardMessage('Sicherheitswert kopiert.')
    } catch (err) {
      console.error('Zwischenablage nicht verfügbar:', err)
      setClipboardMessage('Konnte Sicherheitswert nicht kopieren.')
    }
  }

  const toggleChangelog = (id?: number) => {
    if (!id) return
    setActiveChangelogId((prev) => (prev === id ? null : id))
  }

  return (
    <>
      <ArcaneNavigation />
      <div className="mx-auto max-w-5xl px-4 py-10">
        <header className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-white">ArcanePixels Downloads</h1>
          <p className="text-purple-200 text-lg">
            Lade die neuesten Companion-Builds herunter und prüfe Prüfsummen sowie Changelogs.
          </p>
          {error && <p className="mt-4 text-sm text-red-300">{error}</p>}
        </header>

        {clipboardMessage && (
          <div className="mb-6 rounded-xl border border-purple-500/30 bg-purple-900/30 px-4 py-3 text-center text-sm text-purple-100">
            {clipboardMessage}
          </div>
        )}

        {loading ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-purple-500"></div>
              <p className="mt-4 text-purple-300">Downloads werden geladen…</p>
            </div>
          </div>
        ) : downloads.length === 0 ? (
          <div className="rounded-2xl border border-purple-500/30 bg-black/30 p-8 text-center text-purple-200">
            Noch keine öffentlichen Downloads verfügbar. Schau später wieder vorbei.
          </div>
        ) : (
          <ul className="space-y-6">
            {downloads.map((entry) => (
              <li
                key={entry.id ?? `${entry.title || entry.description}-${entry.version}`}
                className="rounded-2xl border border-purple-500/30 bg-black/40 p-6 backdrop-blur"
              >
                <article className="space-y-4">
                  <header className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-2xl font-semibold text-white">{entry.title || entry.description || 'ShootingHub'}</h2>
                        <span className="rounded-full border border-purple-400/40 bg-purple-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-purple-100">
                          Version {entry.version}
                        </span>
                        {entry.channel && (
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
                        )}
                      </div>
                      <p className="mt-2 text-xs text-purple-300">
                        Zuletzt aktualisiert: {formatTimestamp(entry.updated_at ?? entry.created_at)}
                      </p>
                      {entry.available_in_store && entry.store_url && (
                        <a
                          href={entry.store_url}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-purple-200 underline transition hover:text-white"
                        >
                          Store-Version ansehen
                        </a>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <a
                        href={entry.file_url || entry.download_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-full border border-purple-500/40 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-purple-100 transition hover:border-purple-300 hover:text-white"
                      >
                        <CloudArrowDownIcon className="h-4 w-4" />
                        Download starten
                      </a>
                      {entry.available_in_store && !entry.store_url && (
                        <span className="inline-flex items-center rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-100">
                          Im Store gelistet
                        </span>
                      )}
                    </div>
                  </header>

                  {entry.security_hash && (
                    <section className="rounded-xl border border-purple-500/30 bg-black/40 p-4 text-xs text-purple-100">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="font-semibold uppercase tracking-widest text-purple-300">SHA-256 Prüfsumme</p>
                        <button
                          type="button"
                          onClick={() => handleCopyHash(entry.security_hash)}
                          className="inline-flex items-center gap-2 rounded-full border border-purple-500/40 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-purple-100 transition hover:border-purple-300 hover:text-white"
                        >
                          <ClipboardIcon className="h-4 w-4" /> Kopieren
                        </button>
                      </div>
                      <p className="mt-3 break-all font-mono text-[11px] leading-relaxed">{entry.security_hash}</p>
                    </section>
                  )}

                  {entry.changelog_markdown && (
                    <section className="rounded-xl border border-purple-500/30 bg-black/40">
                      <button
                        type="button"
                        onClick={() => toggleChangelog(entry.id)}
                        className="flex w-full items-center justify-between px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-purple-200 transition hover:text-white"
                      >
                        <span className="inline-flex items-center gap-2">
                          <DocumentTextIcon className="h-4 w-4" /> Changelog anzeigen
                        </span>
                        <span>{activeChangelogId === entry.id ? '−' : '+'}</span>
                      </button>
                      {activeChangelogId === entry.id && (
                        <div className="border-t border-purple-500/20 px-4 py-4">
                          <pre className="max-h-80 overflow-y-auto whitespace-pre-wrap text-xs leading-relaxed text-purple-100">
                            {entry.changelog_markdown}
                          </pre>
                        </div>
                      )}
                    </section>
                  )}
                </article>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  )
}

function formatTimestamp(value?: string | null) {
  if (!value) return 'k.A.'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('de-DE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}
