'use client'

import { useCallback, useEffect, useState } from 'react'
import { ArrowPathIcon, CheckCircleIcon, ExclamationTriangleIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { DEFAULT_THEME_SETTINGS } from '@/lib/supabase'
import type { FooterSection, FooterLink, ThemeSettings } from '@/lib/supabase'
import { handleAdminUnauthorized } from '@/components/admin/utils/handleUnauthorized'

const ENDPOINT = '/api/theme-settings'

type FormState = {
  brandName: string
  brandDescription: string
  badges: string[]
  sections: FooterSection[]
  metaLines: string[]
  showUpdatedAt: boolean
}

type FeedbackState = { variant: 'success' | 'error'; message: string }

export function FooterSettingsPanel() {
  const [form, setForm] = useState<FormState>({
    brandName: '',
    brandDescription: '',
    badges: [],
    sections: [],
    metaLines: [],
    showUpdatedAt: true,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [feedback, setFeedback] = useState<FeedbackState | null>(null)
  const [badgeInput, setBadgeInput] = useState('')
  const [metaInput, setMetaInput] = useState('')
  const [newSectionTitle, setNewSectionTitle] = useState('')

  const fetchSettings = useCallback(async () => {
    try {
      setIsLoading(true)
      const res = await fetch(ENDPOINT, { cache: 'no-store' })
      if (handleAdminUnauthorized(res)) return
      if (!res.ok) throw new Error('Laden fehlgeschlagen')
      const data = (await res.json()) as Partial<ThemeSettings>
      setForm({
        brandName: data.footerBrandName ?? '',
        brandDescription: data.footerBrandDescription ?? '',
        badges: data.footerBadges ?? [],
        sections: data.footerSections ?? [],
        metaLines: data.footerMetaLines ?? [],
        showUpdatedAt: data.footerShowUpdatedAt ?? true,
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
          footerBrandName: form.brandName.trim(),
          footerBrandDescription: form.brandDescription.trim() || null,
          footerBadges: form.badges,
          footerSections: form.sections,
          footerMetaLines: form.metaLines,
          footerShowUpdatedAt: form.showUpdatedAt,
        }),
      })
      if (handleAdminUnauthorized(res)) return
      if (!res.ok) throw new Error('Speichern fehlgeschlagen')
      setFeedback({ variant: 'success', message: 'Footer-Einstellungen gespeichert!' })
    } catch (err) {
      setFeedback({ variant: 'error', message: err instanceof Error ? err.message : 'Fehler beim Speichern' })
    } finally {
      setIsSaving(false)
    }
  }

  const addBadge = () => {
    if (badgeInput.trim()) {
      setForm((p) => ({ ...p, badges: [...p.badges, badgeInput.trim()] }))
      setBadgeInput('')
    }
  }

  const removeBadge = (index: number) => {
    setForm((p) => ({ ...p, badges: p.badges.filter((_, i) => i !== index) }))
  }

  const addMetaLine = () => {
    if (metaInput.trim()) {
      setForm((p) => ({ ...p, metaLines: [...p.metaLines, metaInput.trim()] }))
      setMetaInput('')
    }
  }

  const removeMetaLine = (index: number) => {
    setForm((p) => ({ ...p, metaLines: p.metaLines.filter((_, i) => i !== index) }))
  }

  // Section Management
  const addSection = () => {
    if (newSectionTitle.trim()) {
      setForm((p) => ({
        ...p,
        sections: [...p.sections, { title: newSectionTitle.trim(), links: [] }],
      }))
      setNewSectionTitle('')
    }
  }

  const removeSection = (sectionIndex: number) => {
    setForm((p) => ({
      ...p,
      sections: p.sections.filter((_, i) => i !== sectionIndex),
    }))
  }

  const updateSectionTitle = (sectionIndex: number, title: string) => {
    setForm((p) => ({
      ...p,
      sections: p.sections.map((s, i) => (i === sectionIndex ? { ...s, title } : s)),
    }))
  }

  const addLinkToSection = (sectionIndex: number) => {
    setForm((p) => ({
      ...p,
      sections: p.sections.map((s, i) =>
        i === sectionIndex ? { ...s, links: [...s.links, { label: 'Neuer Link', href: '#', external: false }] } : s
      ),
    }))
  }

  const updateLink = (sectionIndex: number, linkIndex: number, field: keyof FooterLink, value: string | boolean) => {
    setForm((p) => ({
      ...p,
      sections: p.sections.map((s, i) =>
        i === sectionIndex
          ? { ...s, links: s.links.map((l, li) => (li === linkIndex ? { ...l, [field]: value } : l)) }
          : s
      ),
    }))
  }

  const removeLink = (sectionIndex: number, linkIndex: number) => {
    setForm((p) => ({
      ...p,
      sections: p.sections.map((s, i) =>
        i === sectionIndex ? { ...s, links: s.links.filter((_, li) => li !== linkIndex) } : s
      ),
    }))
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
        <h2 className="text-xl font-semibold text-white">Footer</h2>
        <p className="mt-1 text-sm text-purple-300">Gestalte den Footer deiner Website.</p>
      </div>

      {feedback && (
        <div className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm ${
          feedback.variant === 'success' ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-100' : 'border-rose-500/40 bg-rose-500/10 text-rose-100'
        }`}>
          {feedback.variant === 'success' ? <CheckCircleIcon className="h-5 w-5" /> : <ExclamationTriangleIcon className="h-5 w-5" />}
          {feedback.message}
        </div>
      )}

      <div className="grid gap-6">
        {/* Brand Info */}
        <div className="rounded-xl border border-purple-500/30 bg-purple-500/5 p-4">
          <h3 className="text-sm font-semibold text-purple-200">Marke</h3>
          <div className="mt-4 grid gap-4">
            <InputField label="Brand Name" value={form.brandName} onChange={(v) => setForm((p) => ({ ...p, brandName: v }))} placeholder="ArcanePixels" />
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-purple-300">Beschreibung</label>
              <textarea value={form.brandDescription} onChange={(e) => setForm((p) => ({ ...p, brandDescription: e.target.value }))} rows={2}
                className="mt-2 w-full rounded-xl border border-purple-500/40 bg-black/40 px-4 py-3 text-white placeholder-purple-300/50 focus:border-purple-400 focus:outline-none"
                placeholder="Kurze Beschreibung..." />
            </div>
          </div>
        </div>

        {/* Badges */}
        <div className="rounded-xl border border-purple-500/30 bg-purple-500/5 p-4">
          <h3 className="text-sm font-semibold text-purple-200">Badges / Tags</h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {form.badges.map((badge, i) => (
              <span key={i} className="inline-flex items-center gap-1 rounded-full bg-purple-500/20 px-3 py-1 text-sm text-purple-200">
                {badge}
                <button type="button" onClick={() => removeBadge(i)} className="hover:text-white"><XMarkIcon className="h-4 w-4" /></button>
              </span>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <input type="text" value={badgeInput} onChange={(e) => setBadgeInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addBadge()}
              className="flex-1 rounded-xl border border-purple-500/40 bg-black/40 px-4 py-2 text-sm text-white" placeholder="Neuer Badge..." />
            <button type="button" onClick={addBadge} className="rounded-xl bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-500">
              <PlusIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Footer Sections (Link-Spalten) */}
        <div className="rounded-xl border border-purple-500/30 bg-purple-500/5 p-4">
          <h3 className="text-sm font-semibold text-purple-200">Link-Sektionen</h3>
          <p className="mt-1 text-xs text-purple-400">Erstelle Link-Spalten für den Footer (z.B. "Navigation", "Rechtliches")</p>

          <div className="mt-4 space-y-4">
            {form.sections.map((section, sIndex) => (
              <div key={sIndex} className="rounded-lg border border-purple-500/20 bg-black/20 p-3">
                <div className="flex items-center gap-2 mb-3">
                  <input
                    type="text"
                    value={section.title}
                    onChange={(e) => updateSectionTitle(sIndex, e.target.value)}
                    className="flex-1 rounded-lg border border-purple-500/40 bg-black/40 px-3 py-2 text-sm font-medium text-white"
                    placeholder="Sektions-Titel..."
                  />
                  <button type="button" onClick={() => removeSection(sIndex)} className="text-rose-400 hover:text-rose-300">
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                {/* Links in dieser Section */}
                <div className="space-y-2 ml-2">
                  {section.links.map((link, lIndex) => (
                    <div key={lIndex} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={link.label}
                        onChange={(e) => updateLink(sIndex, lIndex, 'label', e.target.value)}
                        className="w-1/3 rounded-lg border border-purple-500/30 bg-black/30 px-2 py-1.5 text-xs text-white"
                        placeholder="Label"
                      />
                      <input
                        type="text"
                        value={link.href}
                        onChange={(e) => updateLink(sIndex, lIndex, 'href', e.target.value)}
                        className="flex-1 rounded-lg border border-purple-500/30 bg-black/30 px-2 py-1.5 text-xs text-white font-mono"
                        placeholder="/pfad oder https://..."
                      />
                      <label className="flex items-center gap-1 text-xs text-purple-300">
                        <input
                          type="checkbox"
                          checked={link.external}
                          onChange={(e) => updateLink(sIndex, lIndex, 'external', e.target.checked)}
                          className="h-3 w-3 rounded border-purple-500/40 bg-black/40"
                        />
                        Extern
                      </label>
                      <button type="button" onClick={() => removeLink(sIndex, lIndex)} className="text-rose-400 hover:text-rose-300">
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addLinkToSection(sIndex)}
                    className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
                  >
                    <PlusIcon className="h-3 w-3" /> Link hinzufügen
                  </button>
                </div>
              </div>
            ))}

            {/* Neue Sektion hinzufügen */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newSectionTitle}
                onChange={(e) => setNewSectionTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addSection()}
                className="flex-1 rounded-xl border border-purple-500/40 bg-black/40 px-4 py-2 text-sm text-white"
                placeholder="Neue Sektion (z.B. 'Navigation')..."
              />
              <button type="button" onClick={addSection} className="rounded-xl bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-500">
                <PlusIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Meta Lines */}
        <div className="rounded-xl border border-purple-500/30 bg-purple-500/5 p-4">
          <h3 className="text-sm font-semibold text-purple-200">Meta-Zeilen</h3>
          <p className="mt-1 text-xs text-purple-400">Zusätzliche Zeilen ganz unten im Footer</p>
          <div className="mt-4 space-y-2">
            {form.metaLines.map((line, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="text"
                  value={line}
                  onChange={(e) => {
                    const newLines = [...form.metaLines]
                    newLines[i] = e.target.value
                    setForm((p) => ({ ...p, metaLines: newLines }))
                  }}
                  className="flex-1 rounded-lg border border-purple-500/40 bg-black/40 px-3 py-2 text-sm text-white"
                />
                <button type="button" onClick={() => removeMetaLine(i)} className="text-rose-400 hover:text-rose-300">
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <input type="text" value={metaInput} onChange={(e) => setMetaInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addMetaLine()}
              className="flex-1 rounded-xl border border-purple-500/40 bg-black/40 px-4 py-2 text-sm text-white" placeholder="Neue Meta-Zeile..." />
            <button type="button" onClick={addMetaLine} className="rounded-xl bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-500">
              <PlusIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Options */}
        <label className="flex items-center gap-3">
          <input type="checkbox" checked={form.showUpdatedAt} onChange={(e) => setForm((p) => ({ ...p, showUpdatedAt: e.target.checked }))}
            className="h-5 w-5 rounded border-purple-500/40 bg-black/40 text-purple-600 focus:ring-purple-500" />
          <span className="text-sm text-purple-200">"Zuletzt aktualisiert" anzeigen</span>
        </label>
      </div>

      <button type="button" onClick={handleSave} disabled={isSaving}
        className="inline-flex items-center gap-2 rounded-full bg-purple-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-purple-500 disabled:opacity-50">
        {isSaving ? <ArrowPathIcon className="h-4 w-4 animate-spin" /> : <CheckCircleIcon className="h-4 w-4" />}
        Speichern
      </button>
    </div>
  )
}

function InputField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-widest text-purple-300">{label}</label>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-xl border border-purple-500/40 bg-black/40 px-4 py-3 text-white placeholder-purple-300/50 focus:border-purple-400 focus:outline-none" placeholder={placeholder} />
    </div>
  )
}

