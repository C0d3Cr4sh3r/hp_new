'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import ArcaneNavigation from '@/components/arcane/ArcaneNavigation'
import { AdminSidebar, type AdminTabId } from '@/components/admin/AdminSidebar'

// Panels
import { DashboardPanel } from '@/components/admin/dashboard/DashboardPanel'
import { DownloadsPanel } from '@/components/admin/downloads/DownloadsPanel'
import { NewsPanel } from '@/components/admin/news/NewsPanel'
import { LandingContentPanel } from '@/components/admin/landing/LandingContentPanel'
import { LandingSectionsPanel } from '@/components/admin/landing/LandingSectionsPanel'
import ScreenshotsAdminPanel from '@/components/admin/screenshots/ScreenshotsAdminPanel'
import PortfolioAdminPanel from '@/components/admin/portfolio/PortfolioAdminPanel'
import ServicesAdminPanel from '@/components/admin/ServicesAdminPanel'
import { ThemeColorsPanel } from '@/components/admin/theme/ThemeColorsPanel'
import { FooterSettingsPanel } from '@/components/admin/theme/FooterSettingsPanel'
import { NavigationPanel } from '@/components/admin/navigation/NavigationPanel'
import { WebsiteSettingsPanel } from '@/components/admin/settings/WebsiteSettingsPanel'
import { HeroSettingsPanel } from '@/components/admin/settings/HeroSettingsPanel'
import { ServicesSettingsPanel } from '@/components/admin/settings/ServicesSettingsPanel'
import { LegalSettingsPanel } from '@/components/admin/settings/LegalSettingsPanel'
import { GridVisibilityPanel } from '@/components/admin/settings/GridVisibilityPanel'
import { SeoPanel } from '@/components/admin/seo/SeoPanel'
import { AssistantPanel } from '@/components/admin/assistant/AssistantPanel'
import { AssistantSettingsPanel } from '@/components/admin/assistant/AssistantSettingsPanel'
import { BugPanel } from '@/components/admin/bugs/BugPanel'

import {
  ASSISTANT_SETTINGS_STORAGE_KEY,
  DEFAULT_ASSISTANT_SETTINGS,
} from '@/components/admin/assistant/constants'
import type { AssistantSettings } from '@/components/admin/assistant/types'

const clampTemperature = (value: unknown, fallback: number) => {
  if (typeof value !== 'number' || Number.isNaN(value)) return fallback
  return Math.min(Math.max(value, 0), 1)
}

const sanitizeAssistantSettings = (input: Partial<AssistantSettings> | null | undefined): AssistantSettings => ({
  instructions:
    typeof input?.instructions === 'string'
      ? input.instructions
      : DEFAULT_ASSISTANT_SETTINGS.instructions,
  temperature: clampTemperature(input?.temperature, DEFAULT_ASSISTANT_SETTINGS.temperature),
  enableQuickActions:
    typeof input?.enableQuickActions === 'boolean'
      ? input.enableQuickActions
      : DEFAULT_ASSISTANT_SETTINGS.enableQuickActions,
  model:
    typeof input?.model === 'string' && input.model.trim().length > 0
      ? input.model
      : DEFAULT_ASSISTANT_SETTINGS.model,
  enableGlobalAssistant:
    typeof input?.enableGlobalAssistant === 'boolean'
      ? input.enableGlobalAssistant
      : DEFAULT_ASSISTANT_SETTINGS.enableGlobalAssistant,
})

export default function ArcaneAdminPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<AdminTabId>('dashboard')
  const [assistantSettings, setAssistantSettings] = useState<AssistantSettings>({ ...DEFAULT_ASSISTANT_SETTINGS })
  const [assistantSettingsReady, setAssistantSettingsReady] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [logoutError, setLogoutError] = useState<string | null>(null)

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(ASSISTANT_SETTINGS_STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<AssistantSettings>
        setAssistantSettings(sanitizeAssistantSettings(parsed))
      }
    } catch (error) {
      console.warn('Konnte gespeicherte Assistent-Einstellungen nicht laden:', error)
      setAssistantSettings({ ...DEFAULT_ASSISTANT_SETTINGS })
    } finally {
      setAssistantSettingsReady(true)
    }
  }, [])

  useEffect(() => {
    if (!assistantSettingsReady) return
    try {
      window.localStorage.setItem(ASSISTANT_SETTINGS_STORAGE_KEY, JSON.stringify(assistantSettings))
    } catch (error) {
      console.warn('Konnte Assistent-Einstellungen nicht speichern:', error)
    }
  }, [assistantSettings, assistantSettingsReady])

  const handleAssistantSettingsChange = (next: AssistantSettings) => {
    setAssistantSettings(sanitizeAssistantSettings(next))
  }

  const handleAssistantSettingsReset = () => {
    setAssistantSettings({ ...DEFAULT_ASSISTANT_SETTINGS })
  }

  const handleLogout = async () => {
    setLogoutError(null)
    try {
      setIsLoggingOut(true)
      const response = await fetch('/api/admin/session', { method: 'DELETE' })
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null
        throw new Error(payload?.error ?? 'Abmelden fehlgeschlagen.')
      }
      router.replace('/admin/login')
      router.refresh()
    } catch (error) {
      console.error('Logout failed:', error)
      setLogoutError(error instanceof Error ? error.message : 'Abmelden fehlgeschlagen.')
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-blue-950 to-indigo-900 text-white">
      <ArcaneNavigation />
      <div className="mx-auto max-w-[1600px] px-4 pb-16 pt-8">
        {/* Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-purple-300">Administrator</p>
            <h1 className="mt-2 text-2xl font-bold sm:text-3xl">Control Center</h1>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="inline-flex items-center gap-2 rounded-full border border-purple-500/40 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-purple-200 transition hover:border-purple-300 hover:text-white disabled:opacity-60"
          >
            Logout {isLoggingOut && '...'}
          </button>
        </div>

        {logoutError && (
          <div className="mt-4 rounded-xl border border-rose-500/40 bg-rose-600/10 px-4 py-3 text-sm text-rose-100">
            {logoutError}
          </div>
        )}

        {/* Main Layout: Sidebar + Content */}
        <div className="mt-8 flex gap-6">
          <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />

          <main className="min-w-0 flex-1">
            <section className="rounded-2xl border border-white/10 bg-black/30 p-6 shadow-2xl shadow-purple-900/30 backdrop-blur">
              {activeTab === 'dashboard' && <DashboardPanel />}
              {activeTab === 'downloads' && <DownloadsPanel />}
              {activeTab === 'news' && <NewsPanel />}
              {activeTab === 'landing' && <LandingContentPanel />}
              {activeTab === 'landing-sections' && <LandingSectionsPanel />}
              {activeTab === 'screenshots' && <ScreenshotsAdminPanel />}
              {activeTab === 'portfolio' && <PortfolioAdminPanel />}
              {activeTab === 'services' && <ServicesAdminPanel />}
              {activeTab === 'theme-colors' && <ThemeColorsPanel />}
              {activeTab === 'theme-navigation' && <NavigationPanel />}
              {activeTab === 'theme-footer' && <FooterSettingsPanel />}
              {activeTab === 'settings-website' && <WebsiteSettingsPanel />}
              {activeTab === 'settings-hero' && <HeroSettingsPanel />}
              {activeTab === 'settings-services' && <ServicesSettingsPanel />}
              {activeTab === 'settings-legal' && <LegalSettingsPanel />}
              {activeTab === 'settings-grid' && <GridVisibilityPanel />}
              {activeTab === 'settings-seo' && <SeoPanel />}
              {activeTab === 'assistant' && (
                <AssistantPanel
                  settings={assistantSettings}
                  settingsReady={assistantSettingsReady}
                  onOpenSettings={() => setActiveTab('assistant-settings')}
                />
              )}
              {activeTab === 'assistant-settings' && (
                <AssistantSettingsPanel
                  settings={assistantSettings}
                  defaultSettings={{ ...DEFAULT_ASSISTANT_SETTINGS }}
                  onChange={handleAssistantSettingsChange}
                  onReset={handleAssistantSettingsReset}
                  settingsReady={assistantSettingsReady}
                />
              )}
              {activeTab === 'bugs' && <BugPanel />}
            </section>
          </main>
        </div>
      </div>
    </div>
  )
}
