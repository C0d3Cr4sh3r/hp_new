'use client'

import { useState, useEffect } from 'react'
import { GlobalAIAssistant } from './GlobalAIAssistant'
import type { AssistantSettings } from './types'
import { ASSISTANT_SETTINGS_STORAGE_KEY, DEFAULT_ASSISTANT_SETTINGS } from './constants'

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

export function GlobalAIAssistantWrapper() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [settings, setSettings] = useState<AssistantSettings>({ ...DEFAULT_ASSISTANT_SETTINGS })
  const [settingsReady, setSettingsReady] = useState(false)

  // Prüfen ob Admin eingeloggt ist
  useEffect(() => {
    const checkAdminSession = async () => {
      try {
        const response = await fetch('/api/admin/session', {
          method: 'GET',
          credentials: 'include',
        })
        if (response.ok) {
          const data = await response.json()
          setIsAdmin(data.authenticated === true)
        } else {
          setIsAdmin(false)
        }
      } catch {
        setIsAdmin(false)
      }
    }

    checkAdminSession()

    // Alle 5 Minuten erneut prüfen
    const interval = setInterval(checkAdminSession, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  // Einstellungen aus LocalStorage laden
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(ASSISTANT_SETTINGS_STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<AssistantSettings>
        setSettings(sanitizeAssistantSettings(parsed))
      }
    } catch (error) {
      console.warn('Konnte Assistent-Einstellungen nicht laden:', error)
    } finally {
      setSettingsReady(true)
    }
  }, [])

  // Storage-Event listener für Änderungen von anderen Tabs/Fenstern
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === ASSISTANT_SETTINGS_STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue) as Partial<AssistantSettings>
          setSettings(sanitizeAssistantSettings(parsed))
        } catch {
          // Ignorieren
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  // Nicht anzeigen wenn kein Admin oder nicht aktiviert
  if (!isAdmin || !settings.enableGlobalAssistant) {
    return null
  }

  return (
    <GlobalAIAssistant 
      settings={settings} 
      settingsReady={settingsReady} 
    />
  )
}

