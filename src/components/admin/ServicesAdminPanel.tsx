'use client'

import React, { useState, useEffect } from 'react'
import { CheckCircleIcon, ExclamationTriangleIcon, TrashIcon, PencilSquareIcon, PlusIcon } from '@heroicons/react/24/outline'
import { DEFAULT_SERVICES_SECTION, Service, type ServicesSectionSettings } from '@/lib/supabase'
import { handleAdminUnauthorized } from '@/components/admin/utils/handleUnauthorized'

const SERVICE_SECTION_ENDPOINT = '/api/service-section'

type ServiceSectionFormState = {
  eyebrow: string
  title: string
  description: string
}

export default function ServicesAdminPanel() {
  const [services, setServices] = useState<Service[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [feedback, setFeedback] = useState<{ variant: 'success' | 'error'; message: string } | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [sectionForm, setSectionForm] = useState<ServiceSectionFormState>({
    eyebrow: DEFAULT_SERVICES_SECTION.eyebrow ?? '',
    title: DEFAULT_SERVICES_SECTION.title ?? '',
    description: DEFAULT_SERVICES_SECTION.description ?? '',
  })
  const [sectionLoading, setSectionLoading] = useState(true)
  const [sectionSaving, setSectionSaving] = useState(false)

  useEffect(() => {
    loadServiceSection()
    loadServices()
  }, [])

  useEffect(() => {
    if (!feedback) return
    const timer = window.setTimeout(() => setFeedback(null), 5000)
    return () => window.clearTimeout(timer)
  }, [feedback])

  const loadServices = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/services')
      if (response.ok) {
        const data = await response.json()
        setServices(data)
      } else {
        setFeedback({
          variant: 'error',
          message: 'Services konnten nicht geladen werden'
        })
      }
    } catch (error) {
      console.error('Error loading services:', error)
      setFeedback({
        variant: 'error',
        message: 'Fehler beim Laden der Services'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadServiceSection = async () => {
    try {
      setSectionLoading(true)
      const response = await fetch(SERVICE_SECTION_ENDPOINT, { cache: 'no-store' })
      if (!response.ok) {
        throw new Error('Service-Abschnitt konnte nicht geladen werden')
      }
      const data = (await response.json()) as ServicesSectionSettings
      setSectionForm({
        eyebrow: data.eyebrow ?? '',
        title: data.title ?? '',
        description: data.description ?? '',
      })
    } catch (error) {
      console.error('Error loading service section:', error)
      setFeedback({
        variant: 'error',
        message: 'Service-Abschnitt konnte nicht geladen werden',
      })
      setSectionForm({
        eyebrow: DEFAULT_SERVICES_SECTION.eyebrow ?? '',
        title: DEFAULT_SERVICES_SECTION.title ?? '',
        description: DEFAULT_SERVICES_SECTION.description ?? '',
      })
    } finally {
      setSectionLoading(false)
    }
  }

  const updateSectionField = <Key extends keyof ServiceSectionFormState>(
    field: Key,
    value: ServiceSectionFormState[Key],
  ) => {
    setSectionForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSaveSection = async () => {
    try {
      setSectionSaving(true)
      const response = await fetch(SERVICE_SECTION_ENDPOINT, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eyebrow: sectionForm.eyebrow,
          title: sectionForm.title,
          description: sectionForm.description,
        }),
      })

      if (handleAdminUnauthorized(response)) {
        return
      }

      if (!response.ok) {
        throw new Error('Service-Abschnitt konnte nicht gespeichert werden')
      }

      const data = (await response.json()) as ServicesSectionSettings
      setSectionForm({
        eyebrow: data.eyebrow ?? '',
        title: data.title ?? '',
        description: data.description ?? '',
      })

      setFeedback({
        variant: 'success',
        message: 'Service-Abschnitt wurde aktualisiert',
      })
    } catch (error) {
      console.error('Error saving service section:', error)
      setFeedback({
        variant: 'error',
        message:
          error instanceof Error ? error.message : 'Service-Abschnitt konnte nicht gespeichert werden',
      })
    } finally {
      setSectionSaving(false)
    }
  }

  const handleCreateService = () => {
    setEditingService({
      title: '',
      description: '',
      short_description: '',
      icon: '',
      features: [],
      category: '',
      price_info: '',
      technologies: [],
      deliverables: [],
      sort_order: services.length + 1,
      is_featured: false,
      status: 'active'
    })
    setIsCreating(true)
  }

  const handleEditService = (service: Service) => {
    setEditingService(service)
    setIsCreating(false)
  }

  const handleSaveService = async () => {
    if (!editingService) return

    try {
      setIsSaving(true)
      const url = isCreating ? '/api/services' : `/api/services/${editingService.id}`
      const method = isCreating ? 'POST' : 'PUT'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingService),
      })

      if (handleAdminUnauthorized(response)) {
        return
      }

      if (response.ok) {
        await loadServices()
        setEditingService(null)
        setIsCreating(false)
        setFeedback({
          variant: 'success',
          message: isCreating ? 'Service wurde erstellt' : 'Service wurde aktualisiert'
        })
      } else {
        setFeedback({
          variant: 'error',
          message: 'Service konnte nicht gespeichert werden'
        })
      }
    } catch (error) {
      console.error('Error saving service:', error)
      setFeedback({
        variant: 'error',
        message: 'Fehler beim Speichern des Services'
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteService = async (id: number) => {
    if (!confirm('Sind Sie sicher, dass Sie diesen Service löschen möchten?')) return

    try {
      setDeletingId(id)
      const response = await fetch(`/api/services/${id}`, {
        method: 'DELETE',
      })

      if (handleAdminUnauthorized(response)) {
        return
      }

      if (response.ok) {
        await loadServices()
        setFeedback({
          variant: 'success',
          message: 'Service wurde gelöscht'
        })
      } else {
        setFeedback({
          variant: 'error',
          message: 'Service konnte nicht gelöscht werden'
        })
      }
    } catch (error) {
      console.error('Error deleting service:', error)
      setFeedback({
        variant: 'error',
        message: 'Fehler beim Löschen des Services'
      })
    } finally {
      setDeletingId(null)
    }
  }

  const updateEditingField = <Key extends keyof Service>(field: Key, value: Service[Key]) => {
    if (editingService) {
      setEditingService({ ...editingService, [field]: value })
    }
  }

  const parseArrayField = (value: string): string[] => {
    return value.split('\n').filter(line => line.trim()).map(line => line.trim())
  }

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="rounded-2xl border border-purple-600/30 bg-purple-950/40 p-6">
          <div className="h-4 bg-purple-500/20 rounded w-1/4 mb-4"></div>
          <div className="h-3 bg-purple-500/20 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">Services Verwaltung</h2>
          <p className="text-sm text-purple-200">
            Verwalte die angebotenen Services auf der Homepage. Services werden dynamisch aus der Datenbank geladen.
          </p>
        </div>
        <button
          onClick={handleCreateService}
          className="inline-flex items-center gap-2 rounded-full border border-purple-500/40 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-purple-200 transition hover:border-purple-300 hover:text-white"
        >
          <PlusIcon className="h-4 w-4" />
          Neuer Service
        </button>
      </header>

      <div className="rounded-2xl border border-purple-600/30 bg-purple-950/40 p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">Texte des Service-Abschnitts</h3>
            <p className="text-sm text-purple-200">
              Passe Eyebrow, Überschrift und Beschreibung an. Änderungen werden sofort auf der Startseite übernommen.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={loadServiceSection}
              disabled={sectionLoading || sectionSaving}
              className="inline-flex items-center gap-2 rounded-full border border-purple-500/40 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-purple-200 transition hover:border-purple-300 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              Neu laden
            </button>
            <button
              type="button"
              onClick={handleSaveSection}
              disabled={sectionSaving || sectionLoading}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 px-5 py-2 text-sm font-semibold text-white shadow-lg transition hover:from-purple-500 hover:to-pink-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {sectionSaving ? 'Speichert...' : 'Änderungen sichern'}
            </button>
          </div>
        </div>

        {sectionLoading ? (
          <div className="mt-6 rounded-xl border border-purple-500/30 bg-black/20 p-4 text-sm text-purple-200">
            Service-Abschnitt wird geladen...
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-purple-300">Eyebrow</label>
              <input
                type="text"
                value={sectionForm.eyebrow}
                onChange={(event) => updateSectionField('eyebrow', event.target.value)}
                className="mt-2 w-full rounded-xl border border-purple-500/40 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-purple-300"
                placeholder="Unsere Services"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-purple-300">Überschrift</label>
              <input
                type="text"
                value={sectionForm.title}
                onChange={(event) => updateSectionField('title', event.target.value)}
                className="mt-2 w-full rounded-xl border border-purple-500/40 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-purple-300"
                placeholder="Web-Entwicklung für kreative Professionals"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-purple-300">Beschreibung</label>
              <textarea
                value={sectionForm.description}
                onChange={(event) => updateSectionField('description', event.target.value)}
                rows={4}
                className="mt-2 w-full rounded-xl border border-purple-500/40 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-purple-300"
                placeholder="Kurzer Teasertext für den Service-Abschnitt"
              />
            </div>
          </div>
        )}
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

        {editingService && (
          <div className="rounded-2xl border border-purple-600/30 bg-purple-950/40 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              {isCreating ? 'Neuen Service erstellen' : 'Service bearbeiten'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-purple-300">Titel</label>
                <input
                  type="text"
                  value={editingService.title || ''}
                  onChange={(e) => updateEditingField('title', e.target.value)}
                  className="mt-2 w-full rounded-xl border border-purple-500/40 bg-black/40 px-4 py-3 text-sm text-white outline-none ring-0 transition focus:border-purple-300"
                  placeholder="Service-Titel"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-purple-300">Kurze Beschreibung</label>
                <input
                  type="text"
                  value={editingService.short_description || ''}
                  onChange={(e) => updateEditingField('short_description', e.target.value)}
                  className="mt-2 w-full rounded-xl border border-purple-500/40 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-purple-300"
                  placeholder="Kurze Beschreibung"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-purple-300">Icon (Emoji)</label>
                <input
                  type="text"
                  value={editingService.icon || ''}
                  onChange={(e) => updateEditingField('icon', e.target.value)}
                  className="mt-2 w-full rounded-xl border border-purple-500/40 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-purple-300"
                  placeholder="🌐"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-purple-300">Kategorie</label>
                <input
                  type="text"
                  value={editingService.category || ''}
                  onChange={(e) => updateEditingField('category', e.target.value)}
                  className="mt-2 w-full rounded-xl border border-purple-500/40 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-purple-300"
                  placeholder="development"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-purple-300">Preis-Info</label>
                <input
                  type="text"
                  value={editingService.price_info || ''}
                  onChange={(e) => updateEditingField('price_info', e.target.value)}
                  className="mt-2 w-full rounded-xl border border-purple-500/40 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-purple-300"
                  placeholder="Ab 2.500€"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="text-xs font-semibold uppercase tracking-widest text-purple-300">Beschreibung</label>
              <textarea
                value={editingService.description || ''}
                onChange={(e) => updateEditingField('description', e.target.value)}
                className="mt-2 w-full rounded-xl border border-purple-500/40 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-purple-300"
                rows={4}
                placeholder="Detaillierte Beschreibung des Services"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-purple-300">Features (eine pro Zeile)</label>
                <textarea
                  value={(editingService.features || []).join('\n')}
                  onChange={(e) => updateEditingField('features', parseArrayField(e.target.value))}
                  className="mt-2 w-full rounded-xl border border-purple-500/40 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-purple-300"
                  rows={6}
                  placeholder="Responsive Design&#10;SEO-Optimierung&#10;Performance"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-purple-300">Technologien (eine pro Zeile)</label>
                <textarea
                  value={(editingService.technologies || []).join('\n')}
                  onChange={(e) => updateEditingField('technologies', parseArrayField(e.target.value))}
                  className="mt-2 w-full rounded-xl border border-purple-500/40 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-purple-300"
                  rows={6}
                  placeholder="Next.js&#10;TypeScript&#10;Tailwind CSS"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-purple-300">Lieferumfang (eine pro Zeile)</label>
                <textarea
                  value={(editingService.deliverables || []).join('\n')}
                  onChange={(e) => updateEditingField('deliverables', parseArrayField(e.target.value))}
                  className="mt-2 w-full rounded-xl border border-purple-500/40 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-purple-300"
                  rows={6}
                  placeholder="Vollständige Website&#10;CMS-Integration&#10;3 Monate Support"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-purple-300">Sortierung</label>
                <input
                  type="number"
                  value={editingService.sort_order || 1}
                  onChange={(e) => updateEditingField('sort_order', parseInt(e.target.value))}
                  className="mt-2 w-full rounded-xl border border-purple-500/40 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-purple-300"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-purple-300">Status</label>
                <select
                  value={editingService.status || 'active'}
                  onChange={(e) => updateEditingField('status', e.target.value as Service['status'])}
                  className="mt-2 w-full rounded-xl border border-purple-500/40 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-purple-300"
                >
                  <option value="active">Aktiv</option>
                  <option value="inactive">Inaktiv</option>
                  <option value="draft">Entwurf</option>
                </select>
              </div>
              <div className="flex items-center">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editingService.is_featured || false}
                    onChange={(e) => updateEditingField('is_featured', e.target.checked)}
                    className="mr-2 h-4 w-4 rounded border border-purple-500/40 bg-black/60 text-purple-500 focus:ring-2 focus:ring-purple-400"
                  />
                  <span className="text-sm font-medium text-purple-100">Featured Service</span>
                </label>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleSaveService}
                disabled={isSaving}
                className="flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 px-5 py-2 text-sm font-semibold text-white shadow-lg transition hover:from-purple-500 hover:to-pink-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <CheckCircleIcon className="h-4 w-4" />
                {isSaving ? 'Wird gespeichert...' : 'Speichern'}
              </button>
              <button
                onClick={() => {
                  setEditingService(null)
                  setIsCreating(false)
                }}
                className="flex items-center gap-2 rounded-full border border-purple-500/40 px-5 py-2 text-sm font-medium text-purple-200 transition hover:border-purple-300 hover:text-white"
              >
                Abbrechen
              </button>
            </div>
          </div>
        )}

      <div className="space-y-4">
        {services.length === 0 && !isLoading ? (
          <div className="rounded-2xl border border-purple-600/30 bg-purple-950/40 p-6 text-center">
            <p className="text-purple-200 mb-4">Keine Services vorhanden.</p>
            <button
              onClick={handleCreateService}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 px-5 py-2 text-sm font-semibold text-white shadow-lg transition hover:from-purple-500 hover:to-pink-400"
            >
              <PlusIcon className="h-4 w-4" />
              Ersten Service erstellen
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((service) => (
              <div key={service.id} className="rounded-2xl border border-purple-600/30 bg-purple-950/40 p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{service.icon}</span>
                    <h3 className="font-semibold text-lg text-white">{service.title}</h3>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditService(service)}
                      className="text-purple-400 hover:text-purple-300 text-sm"
                    >
                      <PencilSquareIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteService(service.id!)}
                      disabled={deletingId === service.id}
                      className="text-red-400 hover:text-red-300 text-sm disabled:opacity-50"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <p className="text-sm text-purple-200 mb-2">{service.short_description}</p>
                <p className="text-sm text-purple-300 mb-3 line-clamp-3">{service.description}</p>
                
                <div className="text-xs text-purple-400 mb-2">
                  <div>Kategorie: {service.category}</div>
                  {service.price_info && <div>Preis: {service.price_info}</div>}
                  <div>Status: {service.status}</div>
                  <div>Sortierung: {service.sort_order}</div>
                  {service.is_featured && <div className="text-yellow-400">⭐ Featured</div>}
                </div>

                {service.features && service.features.length > 0 && (
                  <div className="text-xs">
                    <div className="font-medium mb-1 text-purple-300">Features:</div>
                    <ul className="list-disc list-inside text-purple-400">
                      {service.features.slice(0, 3).map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                      {service.features.length > 3 && <li>... und {service.features.length - 3} weitere</li>}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}