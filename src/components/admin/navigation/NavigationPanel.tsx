'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  PlusIcon,
  TrashIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ArrowTopRightOnSquareIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/outline'

interface NavigationLink {
  id: number
  label: string
  href: string
  external: boolean
  sort_order: number
  visible: boolean
}

export function NavigationPanel() {
  const [links, setLinks] = useState<NavigationLink[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const loadLinks = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/navigation')
      if (!res.ok) throw new Error('Fehler beim Laden')
      const data = await res.json()
      setLinks(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadLinks()
  }, [loadLinks])

  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)
      const res = await fetch('/api/navigation', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(links),
      })
      if (!res.ok) throw new Error('Fehler beim Speichern')
      const data = await res.json()
      setLinks(data)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Speichern fehlgeschlagen')
    } finally {
      setSaving(false)
    }
  }

  const addLink = () => {
    const newLink: NavigationLink = {
      id: Date.now(),
      label: 'Neuer Link',
      href: '/',
      external: false,
      sort_order: links.length,
      visible: true,
    }
    setLinks([...links, newLink])
  }

  const updateLink = (id: number, field: keyof NavigationLink, value: string | boolean) => {
    setLinks(links.map(l => l.id === id ? { ...l, [field]: value } : l))
  }

  const removeLink = (id: number) => {
    setLinks(links.filter(l => l.id !== id))
  }

  const moveLink = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= links.length) return
    const newLinks = [...links]
    ;[newLinks[index], newLinks[newIndex]] = [newLinks[newIndex], newLinks[index]]
    setLinks(newLinks)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <ArrowPathIcon className="h-8 w-8 animate-spin text-purple-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Navigation</h2>
          <p className="mt-1 text-purple-300">Verwalte die Links in der Hauptnavigation</p>
        </div>
        <div className="flex gap-2">
          <button onClick={addLink}
            className="inline-flex items-center gap-2 rounded-full bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-500">
            <PlusIcon className="h-4 w-4" /> Link hinzufügen
          </button>
          <button onClick={handleSave} disabled={saving}
            className="inline-flex items-center gap-2 rounded-full bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-500 disabled:opacity-50">
            {saving ? <ArrowPathIcon className="h-4 w-4 animate-spin" /> : <CheckCircleIcon className="h-4 w-4" />}
            Speichern
          </button>
        </div>
      </div>

      {error && <div className="rounded-lg bg-red-500/20 p-3 text-red-300">{error}</div>}
      {success && <div className="rounded-lg bg-green-500/20 p-3 text-green-300">✓ Navigation gespeichert!</div>}

      <div className="space-y-3">
        {links.map((link, index) => (
          <div key={link.id} className={`rounded-xl border p-4 ${link.visible ? 'border-purple-500/30 bg-purple-500/5' : 'border-gray-500/30 bg-gray-500/5 opacity-60'}`}>
            <div className="flex items-center gap-3">
              <div className="flex flex-col gap-1">
                <button onClick={() => moveLink(index, 'up')} disabled={index === 0}
                  className="rounded p-1 hover:bg-white/10 disabled:opacity-30"><ArrowUpIcon className="h-4 w-4 text-purple-300" /></button>
                <button onClick={() => moveLink(index, 'down')} disabled={index === links.length - 1}
                  className="rounded p-1 hover:bg-white/10 disabled:opacity-30"><ArrowDownIcon className="h-4 w-4 text-purple-300" /></button>
              </div>
              <div className="grid flex-1 gap-3 md:grid-cols-3">
                <input type="text" value={link.label} onChange={(e) => updateLink(link.id, 'label', e.target.value)} placeholder="Label"
                  className="rounded-lg border border-purple-500/40 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-purple-300" />
                <input type="text" value={link.href} onChange={(e) => updateLink(link.id, 'href', e.target.value)} placeholder="URL"
                  className="rounded-lg border border-purple-500/40 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-purple-300" />
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm text-purple-200">
                    <input type="checkbox" checked={link.external} onChange={(e) => updateLink(link.id, 'external', e.target.checked)}
                      className="h-4 w-4 rounded border-purple-400 bg-black/40" />
                    <ArrowTopRightOnSquareIcon className="h-4 w-4" /> Extern
                  </label>
                </div>
              </div>
              <button onClick={() => updateLink(link.id, 'visible', !link.visible)}
                className="rounded p-2 hover:bg-white/10" title={link.visible ? 'Ausblenden' : 'Einblenden'}>
                {link.visible ? <EyeIcon className="h-5 w-5 text-green-400" /> : <EyeSlashIcon className="h-5 w-5 text-gray-400" />}
              </button>
              <button onClick={() => removeLink(link.id)} className="rounded p-2 text-red-400 hover:bg-red-500/20">
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}
        {links.length === 0 && (
          <div className="rounded-xl border border-dashed border-purple-500/30 p-8 text-center text-purple-300">
            Keine Links vorhanden. Klicke auf &quot;Link hinzufügen&quot; um zu starten.
          </div>
        )}
      </div>
    </div>
  )
}

