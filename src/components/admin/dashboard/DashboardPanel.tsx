'use client'

import { useEffect, useState } from 'react'
import {
  CloudArrowDownIcon,
  PencilSquareIcon,
  BugAntIcon,
  PhotoIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline'

type Stats = {
  downloads: number
  news: number
  bugs: number
  screenshots: number
}

type HealthCheck = {
  status: 'ok' | 'error' | 'warning'
  message: string
}

type HealthStatus = {
  status: 'ok' | 'error' | 'warning'
  timestamp: string
  environment: string
  checks: Record<string, HealthCheck>
}

export function DashboardPanel() {
  const [stats, setStats] = useState<Stats>({ downloads: 0, news: 0, bugs: 0, screenshots: 0 })
  const [loading, setLoading] = useState(true)
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null)
  const [healthLoading, setHealthLoading] = useState(false)

  const fetchHealthStatus = async () => {
    setHealthLoading(true)
    try {
      const res = await fetch('/api/admin/health')
      if (res.ok) {
        const data = await res.json()
        setHealthStatus(data)
      }
    } catch (err) {
      console.error('Failed to load health status:', err)
    } finally {
      setHealthLoading(false)
    }
  }

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [downloadsRes, newsRes, bugsRes, screenshotsRes] = await Promise.all([
          fetch('/api/downloads').then((r) => r.json()).catch(() => []),
          fetch('/api/news').then((r) => r.json()).catch(() => []),
          fetch('/api/screenshots').then((r) => r.json()).catch(() => []),
          fetch('/api/screenshots').then((r) => r.json()).catch(() => []),
        ])
        setStats({
          downloads: Array.isArray(downloadsRes) ? downloadsRes.length : 0,
          news: Array.isArray(newsRes) ? newsRes.length : 0,
          bugs: 0, // Bug API noch nicht implementiert
          screenshots: Array.isArray(screenshotsRes) ? screenshotsRes.length : 0,
        })
      } catch (err) {
        console.error('Failed to load stats:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
    fetchHealthStatus()
  }, [])

  const statCards = [
    { label: 'Downloads', value: stats.downloads, icon: CloudArrowDownIcon, color: 'from-blue-500 to-cyan-500' },
    { label: 'News', value: stats.news, icon: PencilSquareIcon, color: 'from-purple-500 to-pink-500' },
    { label: 'Screenshots', value: stats.screenshots, icon: PhotoIcon, color: 'from-amber-500 to-orange-500' },
    { label: 'Bugs', value: stats.bugs, icon: BugAntIcon, color: 'from-rose-500 to-red-500' },
  ]

  const quickActions = [
    { label: 'Neuen Download erstellen', description: 'Füge eine neue Datei hinzu', tab: 'downloads' },
    { label: 'News veröffentlichen', description: 'Schreibe einen neuen Artikel', tab: 'news' },
    { label: 'Theme anpassen', description: 'Ändere Farben und Design', tab: 'theme-colors' },
    { label: 'Website-Einstellungen', description: 'Name, Tagline & mehr', tab: 'settings-website' },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Dashboard</h2>
        <p className="mt-1 text-purple-300">Willkommen im Admin-Bereich. Hier eine Übersicht deiner Website.</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/30 p-5"
          >
            <div className={`absolute -right-4 -top-4 h-24 w-24 rounded-full bg-gradient-to-br ${stat.color} opacity-20 blur-2xl`} />
            <div className="relative">
              <stat.icon className="h-8 w-8 text-purple-400" />
              <p className="mt-3 text-3xl font-bold text-white">
                {loading ? '...' : stat.value}
              </p>
              <p className="mt-1 text-sm text-purple-300">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-semibold text-white">Schnellaktionen</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {quickActions.map((action) => (
            <button
              key={action.label}
              type="button"
              className="flex items-start gap-4 rounded-xl border border-purple-500/30 bg-purple-500/5 p-4 text-left transition hover:border-purple-400 hover:bg-purple-500/10"
            >
              <div className="rounded-lg bg-purple-500/20 p-2">
                <CheckCircleIcon className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="font-medium text-white">{action.label}</p>
                <p className="mt-0.5 text-sm text-purple-300">{action.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* System Health Check */}
      <div className={`rounded-xl border p-5 ${
        healthStatus?.status === 'error'
          ? 'border-rose-500/30 bg-rose-500/5'
          : healthStatus?.status === 'warning'
          ? 'border-amber-500/30 bg-amber-500/5'
          : 'border-emerald-500/30 bg-emerald-500/5'
      }`}>
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-purple-200">
            <ShieldCheckIcon className="h-4 w-4" />
            System-Gesundheit
          </h3>
          <button
            type="button"
            onClick={fetchHealthStatus}
            disabled={healthLoading}
            className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-purple-300 hover:bg-purple-500/10 disabled:opacity-50"
          >
            <ArrowPathIcon className={`h-4 w-4 ${healthLoading ? 'animate-spin' : ''}`} />
            Prüfen
          </button>
        </div>

        {healthStatus && (
          <div className="mt-4 space-y-2">
            {Object.entries(healthStatus.checks).map(([key, check]) => (
              <div key={key} className="flex items-center justify-between text-sm">
                <span className="text-purple-300">{key.replace(/_/g, ' ')}</span>
                <span className={`flex items-center gap-1 ${
                  check.status === 'ok' ? 'text-emerald-400' :
                  check.status === 'warning' ? 'text-amber-400' : 'text-rose-400'
                }`}>
                  {check.status === 'ok' ? (
                    <CheckCircleIcon className="h-4 w-4" />
                  ) : check.status === 'warning' ? (
                    <ExclamationTriangleIcon className="h-4 w-4" />
                  ) : (
                    <ExclamationTriangleIcon className="h-4 w-4" />
                  )}
                  {check.status === 'ok' ? 'OK' : check.message}
                </span>
              </div>
            ))}
          </div>
        )}

        {!healthStatus && !healthLoading && (
          <p className="mt-4 text-sm text-purple-400">
            Klicke auf &quot;Prüfen&quot; um den System-Status zu überprüfen.
          </p>
        )}
      </div>

      {/* System Info */}
      <div className="rounded-xl border border-purple-500/30 bg-purple-500/5 p-5">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-purple-200">
          <ClockIcon className="h-4 w-4" />
          System-Information
        </h3>
        <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex justify-between">
            <span className="text-purple-400">Framework</span>
            <span className="text-white">Next.js 16</span>
          </div>
          <div className="flex justify-between">
            <span className="text-purple-400">React</span>
            <span className="text-white">19.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-purple-400">Datenbank</span>
            <span className="text-white">Supabase</span>
          </div>
          <div className="flex justify-between">
            <span className="text-purple-400">Hosting</span>
            <span className="text-white">Vercel</span>
          </div>
          <div className="flex justify-between">
            <span className="text-purple-400">Theme-System</span>
            <span className="text-emerald-400">✓ Aktiv</span>
          </div>
          <div className="flex justify-between">
            <span className="text-purple-400">Status</span>
            <span className="text-emerald-400">Online</span>
          </div>
        </div>
      </div>
    </div>
  )
}

