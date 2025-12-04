'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  ArrowPathIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  EyeSlashIcon,
  PencilSquareIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { handleAdminUnauthorized } from '@/components/admin/utils/handleUnauthorized'
import type { LandingSection } from '@/app/api/landing-sections/route'

const SECTION_TYPES = [
  { value: 'hero', label: 'Hero Banner' },
  { value: 'features', label: 'Features / Services' },
  { value: 'cta', label: 'Call to Action' },
  { value: 'image-text', label: 'Bild + Text' },
  { value: 'gallery', label: 'Galerie' },
  { value: 'testimonials', label: 'Testimonials' },
  { value: 'pricing', label: 'Preise' },
  { value: 'faq', label: 'FAQ' },
  { value: 'contact', label: 'Kontakt' },
  { value: 'custom', label: 'Benutzerdefiniert' },
] as const

type FeedbackState = { variant: 'success' | 'error'; message: string }

export function LandingSectionsPanel() {
  const [sections, setSections] = useState<LandingSection[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState<FeedbackState | null>(null)
  const [editingSection, setEditingSection] = useState<LandingSection | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    loadSections()
  }, [])

  useEffect(() => {
    if (feedback) {
      const t = setTimeout(() => setFeedback(null), 5000)
      return () => clearTimeout(t)
    }
  }, [feedback])

  const loadSections = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/landing-sections?all=true')
      if (!res.ok) throw new Error('Laden fehlgeschlagen')
      const data = await res.json()
      setSections(data)
    } catch (err) {
      console.error(err)
      setFeedback({ variant: 'error', message: 'Sections konnten nicht geladen werden.' })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (section: Partial<LandingSection>) => {
    try {
      setSaving(true)
      const isNew = !section.id
      const method = isNew ? 'POST' : 'PUT'
      const url = isNew ? '/api/landing-sections' : `/api/landing-sections/${section.id}`
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(section),
      })
      
      if (handleAdminUnauthorized(res)) return
      if (!res.ok) throw new Error('Speichern fehlgeschlagen')
      
      setFeedback({ variant: 'success', message: isNew ? 'Section erstellt!' : 'Section gespeichert!' })
      setEditingSection(null)
      setIsCreating(false)
      await loadSections()
    } catch (err) {
      console.error(err)
      setFeedback({ variant: 'error', message: 'Speichern fehlgeschlagen.' })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Section wirklich löschen?')) return
    try {
      const res = await fetch(`/api/landing-sections/${id}`, { method: 'DELETE' })
      if (handleAdminUnauthorized(res)) return
      if (!res.ok) throw new Error('Löschen fehlgeschlagen')
      setFeedback({ variant: 'success', message: 'Section gelöscht!' })
      await loadSections()
    } catch (err) {
      console.error(err)
      setFeedback({ variant: 'error', message: 'Löschen fehlgeschlagen.' })
    }
  }

  const handleToggleActive = async (section: LandingSection) => {
    await handleSave({ id: section.id, is_active: !section.is_active })
  }

  const handleMoveUp = async (index: number) => {
    if (index === 0) return
    const current = sections[index]
    const prev = sections[index - 1]
    await Promise.all([
      handleSave({ id: current.id, sort_order: prev.sort_order }),
      handleSave({ id: prev.id, sort_order: current.sort_order }),
    ])
  }

  const handleMoveDown = async (index: number) => {
    if (index === sections.length - 1) return
    const current = sections[index]
    const next = sections[index + 1]
    await Promise.all([
      handleSave({ id: current.id, sort_order: next.sort_order }),
      handleSave({ id: next.id, sort_order: current.sort_order }),
    ])
  }

  const newSection: Partial<LandingSection> = {
    section_key: '',
    section_type: 'custom',
    headline: '',
    subheadline: '',
    description: '',
    content: {},
    is_active: true,
    sort_order: sections.length,
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Landing Sections</h2>
          <p className="text-sm text-purple-200">Verwalte die Bereiche deiner Landing Page.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={loadSections} disabled={loading}
            className="inline-flex items-center gap-2 rounded-full border border-purple-500/40 px-4 py-2 text-xs font-semibold uppercase text-purple-200 hover:border-purple-300">
            <ArrowPathIcon className="h-4 w-4" /> Aktualisieren
          </button>
          <button onClick={() => { setIsCreating(true); setEditingSection(null) }}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 px-5 py-2 text-sm font-semibold text-white shadow-lg">
            <PlusIcon className="h-4 w-4" /> Neue Section
          </button>
        </div>
      </header>

      {feedback && (
        <div className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm ${
          feedback.variant === 'success' ? 'border-emerald-500/40 bg-emerald-600/10 text-emerald-100' : 'border-rose-500/40 bg-rose-600/10 text-rose-100'
        }`}>
          {feedback.variant === 'success' ? <CheckCircleIcon className="h-5 w-5" /> : <ExclamationTriangleIcon className="h-5 w-5" />}
          {feedback.message}
        </div>
      )}

      {/* Section Editor Modal */}
      {(editingSection || isCreating) && (
        <SectionEditor
          section={editingSection || newSection}
          onSave={handleSave}
          onCancel={() => { setEditingSection(null); setIsCreating(false) }}
          saving={saving}
        />
      )}

      {/* Sections Liste */}
      {loading ? (
        <div className="text-purple-200 text-center py-8">Lade Sections...</div>
      ) : sections.length === 0 ? (
        <div className="text-purple-200/60 text-center py-12 border border-purple-500/20 rounded-xl bg-purple-950/20">
          Noch keine Sections vorhanden. Klicke auf &quot;Neue Section&quot; um zu beginnen.
        </div>
      ) : (
        <div className="space-y-3">
          {sections.map((section, index) => (
            <div key={section.id} className={`rounded-xl border p-4 transition ${
              section.is_active ? 'border-purple-500/30 bg-purple-950/30' : 'border-gray-600/30 bg-gray-900/30 opacity-60'
            }`}>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col gap-1">
                    <button onClick={() => handleMoveUp(index)} disabled={index === 0} className="p-1 text-purple-400 hover:text-white disabled:opacity-30">
                      <ChevronUpIcon className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleMoveDown(index)} disabled={index === sections.length - 1} className="p-1 text-purple-400 hover:text-white disabled:opacity-30">
                      <ChevronDownIcon className="h-4 w-4" />
                    </button>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">{section.headline || section.section_key}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-purple-600/30 text-purple-200">
                        {SECTION_TYPES.find(t => t.value === section.section_type)?.label || section.section_type}
                      </span>
                    </div>
                    <p className="text-xs text-purple-300/60 mt-1">Key: {section.section_key} · Sort: {section.sort_order}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleToggleActive(section)} className="p-2 text-purple-400 hover:text-white" title={section.is_active ? 'Deaktivieren' : 'Aktivieren'}>
                    {section.is_active ? <EyeIcon className="h-5 w-5" /> : <EyeSlashIcon className="h-5 w-5" />}
                  </button>
                  <button onClick={() => setEditingSection(section)} className="p-2 text-purple-400 hover:text-white" title="Bearbeiten">
                    <PencilSquareIcon className="h-5 w-5" />
                  </button>
                  <button onClick={() => handleDelete(section.id)} className="p-2 text-red-400 hover:text-red-300" title="Löschen">
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Section Editor Component - verwendet Portal für korrektes Z-Index Verhalten
function SectionEditor({ section, onSave, onCancel, saving }: {
  section: Partial<LandingSection>
  onSave: (s: Partial<LandingSection>) => void
  onCancel: () => void
  saving: boolean
}) {
  const [form, setForm] = useState(section)
  const [mounted, setMounted] = useState(false)
  const isNew = !section.id

  useEffect(() => {
    setMounted(true)
    // Body-Scroll deaktivieren wenn Modal offen
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  const handleChange = (key: keyof LandingSection, value: unknown) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-8">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onCancel} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border border-purple-500/40 bg-gray-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-purple-500/20 shrink-0">
          <h3 className="text-xl font-semibold text-white">{isNew ? 'Neue Section erstellen' : 'Section bearbeiten'}</h3>
          <button onClick={onCancel} className="p-2 text-purple-300 hover:text-white rounded-lg hover:bg-purple-500/20">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Content - scrollbar */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold uppercase text-purple-300">Section Key *</label>
              <input value={form.section_key || ''} onChange={e => handleChange('section_key', e.target.value)}
                className="mt-1 w-full rounded-lg border border-purple-500/40 bg-black/40 px-3 py-2 text-sm text-white"
                placeholder="z.B. hero, about-us" disabled={!isNew} />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-purple-300">Typ *</label>
              <select value={form.section_type || 'custom'} onChange={e => handleChange('section_type', e.target.value)}
                className="mt-1 w-full rounded-lg border border-purple-500/40 bg-black/40 px-3 py-2 text-sm text-white">
                {SECTION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase text-purple-300">Headline</label>
            <input value={form.headline || ''} onChange={e => handleChange('headline', e.target.value)}
              className="mt-1 w-full rounded-lg border border-purple-500/40 bg-black/40 px-3 py-2 text-sm text-white" />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase text-purple-300">Subheadline</label>
            <input value={form.subheadline || ''} onChange={e => handleChange('subheadline', e.target.value)}
              className="mt-1 w-full rounded-lg border border-purple-500/40 bg-black/40 px-3 py-2 text-sm text-white" />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase text-purple-300">Beschreibung</label>
            <textarea value={form.description || ''} onChange={e => handleChange('description', e.target.value)} rows={3}
              className="mt-1 w-full rounded-lg border border-purple-500/40 bg-black/40 px-3 py-2 text-sm text-white" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold uppercase text-purple-300">CTA Label</label>
              <input value={form.cta_label || ''} onChange={e => handleChange('cta_label', e.target.value)}
                className="mt-1 w-full rounded-lg border border-purple-500/40 bg-black/40 px-3 py-2 text-sm text-white" />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-purple-300">CTA URL</label>
              <input value={form.cta_url || ''} onChange={e => handleChange('cta_url', e.target.value)}
                className="mt-1 w-full rounded-lg border border-purple-500/40 bg-black/40 px-3 py-2 text-sm text-white" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold uppercase text-purple-300">Bild URL</label>
              <input value={form.image_url || ''} onChange={e => handleChange('image_url', e.target.value)}
                className="mt-1 w-full rounded-lg border border-purple-500/40 bg-black/40 px-3 py-2 text-sm text-white" />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-purple-300">Bild Position</label>
              <select value={form.image_position || 'right'} onChange={e => handleChange('image_position', e.target.value)}
                className="mt-1 w-full rounded-lg border border-purple-500/40 bg-black/40 px-3 py-2 text-sm text-white">
                <option value="left">Links</option>
                <option value="right">Rechts</option>
                <option value="top">Oben</option>
                <option value="bottom">Unten</option>
                <option value="background">Hintergrund</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.is_active ?? true} onChange={e => handleChange('is_active', e.target.checked)}
                className="rounded border-purple-500" />
              <span className="text-sm text-purple-200">Aktiv (sichtbar auf der Website)</span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-purple-500/20 flex justify-end gap-3 shrink-0">
          <button onClick={onCancel} className="px-4 py-2 text-sm text-purple-200 hover:text-white">Abbrechen</button>
          <button onClick={() => onSave(form)} disabled={saving || !form.section_key}
            className="px-5 py-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 text-sm font-semibold text-white disabled:opacity-50">
            {saving ? 'Speichern...' : (isNew ? 'Erstellen' : 'Speichern')}
          </button>
        </div>
      </div>
    </div>
  )

  // Portal erst rendern wenn Client-Side mounted
  if (!mounted) return null

  return createPortal(modalContent, document.body)
}

