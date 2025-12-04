'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ArrowPathIcon,
  CheckCircleIcon,
  PaintBrushIcon,
  PlusIcon,
} from '@heroicons/react/24/outline'
import { DEFAULT_THEME_SETTINGS } from '@/lib/supabase'
import type { FooterLink, FooterSection, ThemeSettings } from '@/lib/supabase'
import { handleAdminUnauthorized } from '@/components/admin/utils/handleUnauthorized'

const THEME_ENDPOINT = '/api/theme-settings'

type ThemeFeedbackState = { variant: 'success' | 'error'; message: string }

type ThemeSettingsFormState = {
  primaryColor: string
  accentColor: string
  navigationStyle: ThemeSettings['navigationStyle']
  footerLayout: ThemeSettings['footerLayout']
  brandName: string
  brandDescription: string
  badges: string[]
  sections: FooterSection[]
  metaLines: string[]
  showUpdatedAt: boolean
}

const cloneSections = (sections: FooterSection[] = []): FooterSection[] =>
  sections.map((section) => ({
    title: section.title,
    links: section.links.map((link) => ({ ...link })),
  }))

const mapThemeToForm = (settings: ThemeSettings): ThemeSettingsFormState => ({
  primaryColor: settings.primaryColor,
  accentColor: settings.accentColor,
  navigationStyle: settings.navigationStyle,
  footerLayout: settings.footerLayout,
  brandName: settings.footerBrandName,
  brandDescription: settings.footerBrandDescription ?? '',
  badges: [...settings.footerBadges],
  sections: cloneSections(settings.footerSections),
  metaLines: [...settings.footerMetaLines],
  showUpdatedAt: settings.footerShowUpdatedAt,
})

const createPayloadFromForm = (form: ThemeSettingsFormState): ThemeSettings => ({
  id: DEFAULT_THEME_SETTINGS.id,
  primaryColor: form.primaryColor,
  accentColor: form.accentColor,
  navigationStyle: form.navigationStyle,
  footerLayout: form.footerLayout,
  footerBrandName: form.brandName.trim(),
  footerBrandDescription: form.brandDescription.trim() ? form.brandDescription.trim() : null,
  footerBadges: form.badges.map((badge) => badge.trim()).filter((badge) => badge.length > 0),
  footerSections: form.sections
    .map((section) => ({
      title: section.title.trim(),
      links: section.links
        .map((link) => ({
          label: link.label.trim(),
          href: link.href.trim(),
          external: Boolean(link.external),
        }))
        .filter((link) => link.label.length > 0 && link.href.length > 0),
    }))
    .filter((section) => section.title.length > 0 || section.links.length > 0),
  footerMetaLines: form.metaLines.map((line) => line.trim()).filter((line) => line.length > 0),
  footerShowUpdatedAt: form.showUpdatedAt,
})

export function ThemePanel() {
  const [form, setForm] = useState<ThemeSettingsFormState>(() => mapThemeToForm(DEFAULT_THEME_SETTINGS))
  const [feedback, setFeedback] = useState<ThemeFeedbackState | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [badgeInput, setBadgeInput] = useState('')
  const [metaLineInput, setMetaLineInput] = useState('')

  const previewStyles = useMemo<Record<string, string>>(
    () => ({
      '--preview-primary': form.primaryColor,
      '--preview-accent': form.accentColor,
    }),
    [form.primaryColor, form.accentColor],
  )

  const fetchThemeSettings = useCallback(async () => {
    try {
      setLoading(true)
      setFeedback(null)

      const response = await fetch(THEME_ENDPOINT, { cache: 'no-store' })

      if (handleAdminUnauthorized(response)) {
        return
      }

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null
        throw new Error(body?.error ?? 'Theme-Einstellungen konnten nicht geladen werden.')
      }

      const data = (await response.json()) as ThemeSettings
      setForm(mapThemeToForm(data))
    } catch (error) {
      console.error('Theme settings load failed:', error)
      setFeedback({
        variant: 'error',
        message: error instanceof Error ? error.message : 'Theme-Einstellungen konnten nicht geladen werden.',
      })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchThemeSettings()
  }, [fetchThemeSettings])

  const updateSection = (index: number, updater: (section: FooterSection) => FooterSection) => {
    setForm((prev) => ({
      ...prev,
      sections: prev.sections.map((section, idx) => (idx === index ? updater(section) : section)),
    }))
  }

  const addSection = () => {
    setForm((prev) => ({
      ...prev,
      sections: [
        ...prev.sections,
        {
          title: 'Neue Sektion',
          links: [],
        },
      ],
    }))
  }

  const removeSection = (index: number) => {
    setForm((prev) => {
      const nextSections = prev.sections.filter((_, idx) => idx !== index)
      return {
        ...prev,
        sections: nextSections,
      }
    })
  }

  const addLink = (sectionIndex: number) => {
    updateSection(sectionIndex, (section) => ({
      ...section,
      links: [
        ...section.links,
        { label: 'Neuer Link', href: '#', external: false } satisfies FooterLink,
      ],
    }))
  }

  const updateLink = <K extends keyof FooterLink>(sectionIndex: number, linkIndex: number, key: K, value: FooterLink[K]) => {
    updateSection(sectionIndex, (section) => ({
      ...section,
      links: section.links.map((link, idx) => (idx === linkIndex ? { ...link, [key]: value } : link)),
    }))
  }

  const removeLink = (sectionIndex: number, linkIndex: number) => {
    updateSection(sectionIndex, (section) => ({
      ...section,
      links: section.links.filter((_, idx) => idx !== linkIndex),
    }))
  }

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    try {
      setSaving(true)
      setFeedback(null)

      const payload = createPayloadFromForm(form)

      const response = await fetch(THEME_ENDPOINT, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (handleAdminUnauthorized(response)) {
        return
      }

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null
        throw new Error(body?.error ?? 'Theme-Einstellungen konnten nicht gespeichert werden.')
      }

      const data = (await response.json()) as ThemeSettings
      setForm(mapThemeToForm(data))
      setFeedback({ variant: 'success', message: 'Theme-Einstellungen wurden gespeichert.' })
    } catch (error) {
      console.error('Theme settings save failed:', error)
      setFeedback({
        variant: 'error',
        message: error instanceof Error ? error.message : 'Theme-Einstellungen konnten nicht gespeichert werden.',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    setForm(mapThemeToForm(DEFAULT_THEME_SETTINGS))
    setFeedback({ variant: 'success', message: 'Standardwerte wurden geladen. Vergiss nicht zu speichern.' })
  }

  const handleBadgeAdd = () => {
    const value = badgeInput.trim()
    if (!value) return

    setForm((prev) => ({
      ...prev,
      badges: prev.badges.includes(value) ? prev.badges : [...prev.badges, value],
    }))
    setBadgeInput('')
  }

  const handleBadgeRemove = (index: number) => {
    setForm((prev) => ({
      ...prev,
      badges: prev.badges.filter((_, idx) => idx !== index),
    }))
  }

  const handleMetaLineAdd = () => {
    const value = metaLineInput.trim()
    if (!value) return

    setForm((prev) => ({
      ...prev,
      metaLines: [...prev.metaLines, value],
    }))
    setMetaLineInput('')
  }

  const handleMetaLineUpdate = (index: number, value: string) => {
    setForm((prev) => ({
      ...prev,
      metaLines: prev.metaLines.map((line, idx) => (idx === index ? value : line)),
    }))
  }

  const handleMetaLineRemove = (index: number) => {
    setForm((prev) => ({
      ...prev,
      metaLines: prev.metaLines.filter((_, idx) => idx !== index),
    }))
  }

  return (
    <form onSubmit={handleSave} className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Theme & Layout</h2>
          <p className="text-sm text-purple-200">
            Stelle Farben, Navigation und Footer-Inhalte ein. Die Vorschau aktualisiert sich in Echtzeit.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-2 rounded-full border border-purple-500/40 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-purple-200 transition hover:border-purple-300 hover:text-white"
          >
            <ArrowPathIcon className="h-4 w-4" /> Standard laden
          </button>
          <button
            type="button"
            onClick={fetchThemeSettings}
            disabled={loading || saving}
            className="inline-flex items-center gap-2 rounded-full border border-purple-500/40 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-purple-200 transition hover:border-purple-300 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            <ArrowPathIcon className="h-4 w-4" /> Neu laden
          </button>
          <button
            type="submit"
            disabled={saving || loading}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 px-5 py-2 text-sm font-semibold text-white shadow-lg transition hover:from-purple-500 hover:to-pink-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <PaintBrushIcon className="h-4 w-4" /> {saving ? 'Speichert…' : 'Änderungen sichern'}
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm ${
            feedback.variant === 'success'
              ? 'border-emerald-500/40 bg-emerald-600/10 text-emerald-100'
              : 'border-rose-500/40 bg-rose-600/10 text-rose-100'
          }`}
        >
          <CheckCircleIcon className={`h-4 w-4 ${feedback.variant === 'success' ? 'text-emerald-300' : 'text-rose-300'}`} />
          <span>{feedback.message}</span>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="text-xs font-semibold uppercase tracking-widest text-purple-300">Primärfarbe</label>
          <input
            type="color"
            value={form.primaryColor}
            onChange={(event) => setForm((prev) => ({ ...prev, primaryColor: event.target.value }))}
            className="mt-2 h-12 w-full rounded-xl border border-purple-500/40 bg-black/40"
            disabled={loading}
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-widest text-purple-300">Akzentfarbe</label>
          <input
            type="color"
            value={form.accentColor}
            onChange={(event) => setForm((prev) => ({ ...prev, accentColor: event.target.value }))}
            className="mt-2 h-12 w-full rounded-xl border border-purple-500/40 bg-black/40"
            disabled={loading}
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="text-xs font-semibold uppercase tracking-widest text-purple-300">Navigation</label>
          <select
            value={form.navigationStyle}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, navigationStyle: event.target.value as ThemeSettings['navigationStyle'] }))
            }
            className="mt-2 w-full rounded-xl border border-purple-500/40 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-purple-300 disabled:opacity-70"
            disabled={loading}
          >
            <option value="classic">Classic</option>
            <option value="minimal">Minimal</option>
            <option value="split">Split Navigation</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-widest text-purple-300">Footer Layout</label>
          <select
            value={form.footerLayout}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, footerLayout: event.target.value as ThemeSettings['footerLayout'] }))
            }
            className="mt-2 w-full rounded-xl border border-purple-500/40 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-purple-300 disabled:opacity-70"
            disabled={loading}
          >
            <option value="compact">Kompakt</option>
            <option value="columns">Mehrspaltig</option>
          </select>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <div>
            <label className="text-xs font-semibold uppercase tracking-widest text-purple-300">Footer Brand</label>
            <input
              type="text"
              value={form.brandName}
              onChange={(event) => setForm((prev) => ({ ...prev, brandName: event.target.value }))}
              placeholder="HP New"
              className="mt-2 w-full rounded-xl border border-purple-500/40 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-purple-300"
              disabled={loading}
            />
            <textarea
              value={form.brandDescription}
              onChange={(event) => setForm((prev) => ({ ...prev, brandDescription: event.target.value }))}
              placeholder="Kurze Beschreibung, die im Footer angezeigt wird."
              rows={3}
              className="mt-3 w-full rounded-xl border border-purple-500/40 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-purple-300"
              disabled={loading}
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-widest text-purple-300">Badges</label>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {form.badges.map((badge, index) => (
                <span
                  key={`${badge}-${index}`}
                  className="inline-flex items-center gap-2 rounded-full border border-purple-500/40 bg-purple-500/10 px-3 py-1 text-xs text-purple-100"
                >
                  {badge}
                  <button
                    type="button"
                    onClick={() => handleBadgeRemove(index)}
                    className="text-purple-300 transition hover:text-white"
                    aria-label={`Badge ${badge} entfernen`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                value={badgeInput}
                onChange={(event) => setBadgeInput(event.target.value)}
                placeholder="Beispiel: Next.js 16"
                className="flex-1 rounded-xl border border-purple-500/40 bg-black/40 px-4 py-2 text-sm text-white outline-none focus:border-purple-300"
                disabled={loading}
              />
              <button
                type="button"
                onClick={handleBadgeAdd}
                className="rounded-xl border border-purple-500/40 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-purple-200 transition hover:border-purple-300 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                disabled={loading}
              >
                Hinzufügen
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-purple-200">Footer Sektionen</h3>
            <button
              type="button"
              onClick={addSection}
              className="inline-flex items-center gap-2 rounded-full border border-purple-500/40 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-purple-200 transition hover:border-purple-300 hover:text-white"
              disabled={loading}
            >
              <PlusIcon className="h-4 w-4" /> Sektion
            </button>
          </div>

          <div className="space-y-4">
            {form.sections.map((section, sectionIndex) => (
              <div key={`section-${sectionIndex}`} className="rounded-2xl border border-purple-500/30 bg-black/20 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={section.title}
                      onChange={(event) =>
                        updateSection(sectionIndex, (prevSection) => ({ ...prevSection, title: event.target.value }))
                      }
                      placeholder="Titel der Sektion"
                      className="w-full rounded-xl border border-purple-500/40 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-purple-300"
                      disabled={loading}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeSection(sectionIndex)}
                    className="rounded-full border border-rose-500/30 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-rose-200 transition hover:border-rose-300 hover:text-white"
                    disabled={loading || form.sections.length === 1}
                  >
                    Entfernen
                  </button>
                </div>

                <div className="mt-4 space-y-3">
                  {section.links.map((link, linkIndex) => (
                    <div key={`link-${sectionIndex}-${linkIndex}`} className="rounded-xl border border-purple-500/20 bg-black/10 p-3">
                      <div className="grid gap-3 md:grid-cols-2">
                        <input
                          type="text"
                          value={link.label}
                          onChange={(event) => updateLink(sectionIndex, linkIndex, 'label', event.target.value)}
                          placeholder="Linktext"
                          className="rounded-xl border border-purple-500/40 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-purple-300"
                          disabled={loading}
                        />
                        <input
                          type="text"
                          value={link.href}
                          onChange={(event) => updateLink(sectionIndex, linkIndex, 'href', event.target.value)}
                          placeholder="https://… oder #anker"
                          className="rounded-xl border border-purple-500/40 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-purple-300"
                          disabled={loading}
                        />
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-purple-300">
                          <input
                            type="checkbox"
                            checked={link.external}
                            onChange={(event) => updateLink(sectionIndex, linkIndex, 'external', event.target.checked)}
                            className="h-4 w-4 rounded border border-purple-500/40 bg-black/40 text-purple-500 focus:ring-purple-400"
                            disabled={loading}
                          />
                          Externer Link
                        </label>
                        <button
                          type="button"
                          onClick={() => removeLink(sectionIndex, linkIndex)}
                          className="rounded-full border border-rose-500/30 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-rose-200 transition hover:border-rose-300 hover:text-white"
                          disabled={loading}
                        >
                          Link löschen
                        </button>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => addLink(sectionIndex)}
                    className="w-full rounded-xl border border-purple-500/30 px-3 py-2 text-xs font-semibold uppercase tracking-widest text-purple-200 transition hover:border-purple-300 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={loading}
                  >
                    Link hinzufügen
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <div>
            <label className="text-xs font-semibold uppercase tracking-widest text-purple-300">Footer Hinweise</label>
            <p className="mt-2 text-xs text-purple-200/80">
              Zeilen werden im unteren Footer-Band angezeigt. Leerzeilen werden automatisch entfernt.
            </p>
            <div className="mt-4 space-y-3">
              {form.metaLines.map((line, index) => (
                <div key={`meta-line-${index}`} className="flex gap-2">
                  <input
                    type="text"
                    value={line}
                    onChange={(event) => handleMetaLineUpdate(index, event.target.value)}
                    className="flex-1 rounded-xl border border-purple-500/40 bg-black/40 px-4 py-2 text-sm text-white outline-none focus:border-purple-300"
                    placeholder="z. B. Deployed mit Vercel"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => handleMetaLineRemove(index)}
                    className="rounded-xl border border-rose-500/30 px-3 py-2 text-xs font-semibold uppercase tracking-widest text-rose-200 transition hover:border-rose-300 hover:text-white"
                    disabled={loading}
                  >
                    Entfernen
                  </button>
                </div>
              ))}
              {form.metaLines.length === 0 && (
                <div className="rounded-xl border border-purple-500/30 bg-black/20 px-4 py-3 text-xs text-purple-200/80">
                  Noch keine Hinweise konfiguriert.
                </div>
              )}
            </div>
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                value={metaLineInput}
                onChange={(event) => setMetaLineInput(event.target.value)}
                className="flex-1 rounded-xl border border-purple-500/40 bg-black/40 px-4 py-2 text-sm text-white outline-none focus:border-purple-300"
                placeholder="Neue Hinweisezeile"
                disabled={loading}
              />
              <button
                type="button"
                onClick={handleMetaLineAdd}
                className="rounded-xl border border-purple-500/40 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-purple-200 transition hover:border-purple-300 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                disabled={loading}
              >
                Hinzufügen
              </button>
            </div>
          </div>

          <label className="flex items-center gap-3 rounded-2xl border border-purple-500/30 bg-black/20 p-4 text-sm text-purple-100">
            <input
              type="checkbox"
              checked={form.showUpdatedAt}
              onChange={(event) => setForm((prev) => ({ ...prev, showUpdatedAt: event.target.checked }))}
              className="h-4 w-4 rounded border border-purple-500/40 bg-black/40 text-purple-500 focus:ring-purple-400"
              disabled={loading}
            />
            Aktualisierungsdatum im Footer anzeigen
          </label>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-purple-500/30 bg-purple-950/20 p-4 text-sm text-purple-100">
            <p className="text-xs uppercase tracking-widest text-purple-200">Vorschau Footer-Band</p>
            <div className="mt-3 space-y-2 text-xs text-purple-100/80">
              {form.metaLines.length > 0 ? (
                form.metaLines.map((line, index) => (
                  <div key={`preview-meta-${index}`}>{line || 'Hinweiszeile'}</div>
                ))
              ) : (
                <div className="italic text-purple-300/70">Noch keine Hinweise konfiguriert</div>
              )}
              {form.showUpdatedAt && (
                <div className="italic text-purple-200/80">Letzte Aktualisierung wird automatisch ergänzt.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-purple-500/30 bg-purple-950/30 p-6" style={previewStyles}>
        <p className="text-xs uppercase tracking-widest text-purple-200">Live Vorschau</p>
        <div className="mt-6 space-y-4">
          <div className="rounded-2xl bg-[color:var(--preview-primary)]/30 p-4">
            <p className="text-xs uppercase tracking-widest text-purple-100">Navigation</p>
            <p className="mt-2 text-sm text-white">Aktueller Stil: <span className="font-semibold">{form.navigationStyle}</span></p>
          </div>
          <div className="rounded-2xl bg-[color:var(--preview-accent)]/30 p-4 text-white">
            <div className="text-lg font-semibold">{form.brandName || 'Footer Brand'}</div>
            <p className="mt-2 text-sm text-purple-100">
              {form.brandDescription || 'Hier erscheint die Footer-Beschreibung.'}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {form.badges.map((badge, index) => (
                <span key={`preview-badge-${index}`} className="rounded-full bg-black/20 px-3 py-1 text-xs">
                  {badge}
                </span>
              ))}
            </div>
            <div className={`mt-6 grid gap-4 ${form.footerLayout === 'columns' ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
              {form.sections.map((section, index) => (
                <div key={`preview-section-${index}`} className="rounded-xl bg-black/20 p-3 text-sm">
                  <p className="font-semibold text-white">{section.title || 'Sektion'}</p>
                  <ul className="mt-2 space-y-1 text-purple-100">
                    {section.links.map((link, linkIndex) => (
                      <li key={`preview-link-${index}-${linkIndex}`}>{link.label || 'Link'}</li>
                    ))}
                    {section.links.length === 0 && <li className="italic text-purple-300/70">Noch keine Links</li>}
                  </ul>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-xl bg-black/10 p-3 text-xs text-purple-100/80 space-y-1">
              {form.metaLines.length > 0 ? (
                form.metaLines.map((line, index) => (
                  <div key={`preview-meta-footer-${index}`}>{line || 'Hinweiszeile'}</div>
                ))
              ) : (
                <div className="italic text-purple-300/70">Hinweisbereich leer</div>
              )}
              {form.showUpdatedAt && (
                <div className="italic text-purple-200/80">Automatischer Aktualisierungs-Hinweis aktiv</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}

