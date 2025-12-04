'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  AdjustmentsHorizontalIcon,
  ArrowPathIcon,
  InformationCircleIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'
import type { AssistantSettings } from './types'
import { AVAILABLE_GEMINI_MODELS } from './constants'

type GeminiModel = {
  value: string
  label: string
  description?: string
  recommended?: boolean
  free?: boolean
  pricing?: {
    inputPer1M?: number
    outputPer1M?: number
    note?: string
  }
}

type AssistantSettingsPanelProps = {
  settings: AssistantSettings
  defaultSettings: AssistantSettings
  onChange: (nextSettings: AssistantSettings) => void
  onReset: () => void
  settingsReady: boolean
}

export function AssistantSettingsPanel({
  settings,
  defaultSettings,
  onChange,
  onReset,
  settingsReady,
}: AssistantSettingsPanelProps) {
  const [availableModels, setAvailableModels] = useState<GeminiModel[]>(AVAILABLE_GEMINI_MODELS)
  const [modelsLoading, setModelsLoading] = useState(false)
  const [modelsError, setModelsError] = useState<string | null>(null)

  // Modelle dynamisch von Google API laden
  useEffect(() => {
    const loadModels = async () => {
      setModelsLoading(true)
      setModelsError(null)
      try {
        const response = await fetch('/api/assistant/models')
        if (response.ok) {
          const data = await response.json()
          if (data.models && data.models.length > 0) {
            setAvailableModels(data.models)
          }
        } else {
          setModelsError('Konnte Modelle nicht laden')
        }
      } catch (error) {
        console.warn('Fehler beim Laden der Modelle:', error)
        setModelsError('Netzwerkfehler')
      } finally {
        setModelsLoading(false)
      }
    }

    loadModels()
  }, [])

  const handleFieldChange = useCallback(
    <Key extends keyof AssistantSettings>(key: Key, value: AssistantSettings[Key]) => {
      onChange({ ...settings, [key]: value })
    },
    [onChange, settings],
  )

  const handleReset = useCallback(() => {
    onReset()
  }, [onReset])

  const handleRefreshModels = useCallback(async () => {
    setModelsLoading(true)
    setModelsError(null)
    try {
      const response = await fetch('/api/assistant/models')
      if (response.ok) {
        const data = await response.json()
        if (data.models && data.models.length > 0) {
          setAvailableModels(data.models)
        }
      }
    } catch (error) {
      console.warn('Fehler beim Aktualisieren der Modelle:', error)
    } finally {
      setModelsLoading(false)
    }
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Assistent-Einstellungen</h2>
          <p className="text-sm text-purple-200">
            Definiere das Standardverhalten des KI-Assistenten, passe die Tonalität an und aktiviere optionale Schnellaktionen.
          </p>
        </div>
        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-2 rounded-full border border-purple-500/40 px-4 py-1.5 text-sm text-purple-100 transition hover:border-purple-300 hover:text-white"
          disabled={!settingsReady}
        >
          <ArrowPathIcon className="h-4 w-4" /> Auf Standard zurücksetzen
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-4 rounded-2xl border border-purple-600/30 bg-black/30 p-5">
          <header className="flex items-center gap-2 text-sm text-purple-200">
            <SparklesIcon className="h-4 w-4" />
            <span>System-Prompt</span>
          </header>
          <p className="text-xs text-purple-300">
            Ergänze Vorgaben zur Sprache, zum Stil oder zu wiederkehrenden Aufgaben. Der Wert wird bei jeder Anfrage als Systeminstruktion an Gemini übergeben.
          </p>
          <textarea
            value={settings.instructions}
            onChange={(event) => handleFieldChange('instructions', event.target.value)}
            rows={8}
            className="w-full rounded-2xl border border-purple-500/40 bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-purple-300"
            placeholder={defaultSettings.instructions}
            disabled={!settingsReady}
          />
        </section>

        <section className="space-y-4 rounded-2xl border border-purple-600/30 bg-black/30 p-5">
          <header className="flex items-center gap-2 text-sm text-purple-200">
            <AdjustmentsHorizontalIcon className="h-4 w-4" />
            <span>Generierungs-Parameter</span>
          </header>

          <div className="space-y-4 text-sm text-purple-200">
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-purple-300">Temperatur</label>
              <input
                type="range"
                min={0}
                max={1}
                step={0.1}
                value={settings.temperature}
                onChange={(event) => handleFieldChange('temperature', Number(event.target.value))}
                className="mt-2 w-full accent-purple-500"
                disabled={!settingsReady}
              />
              <p className="mt-1 text-xs text-purple-300">
                {settings.temperature.toFixed(1)} – Niedrige Werte liefern präzisere, höhere Werte kreativere Antworten.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-widest text-purple-300">Gemini-Modell</label>
                <button
                  type="button"
                  onClick={handleRefreshModels}
                  disabled={modelsLoading}
                  className="inline-flex items-center gap-1 text-xs text-purple-400 hover:text-purple-200 transition disabled:opacity-50"
                  title="Modelle aktualisieren"
                >
                  <ArrowPathIcon className={`h-3 w-3 ${modelsLoading ? 'animate-spin' : ''}`} />
                  {modelsLoading ? 'Lädt...' : 'Aktualisieren'}
                </button>
              </div>
              <select
                value={settings.model}
                onChange={(event) => handleFieldChange('model', event.target.value)}
                className="mt-2 w-full rounded-xl border border-purple-500/40 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-purple-300"
                disabled={!settingsReady || modelsLoading}
              >
                {availableModels.map((model) => (
                  <option key={model.value} value={model.value}>
                    {model.free === false ? '💰 ' : '✅ '}
                    {model.label}
                    {model.recommended ? ' ⭐' : ''}
                  </option>
                ))}
              </select>

              {/* Preisinfo für ausgewähltes Modell */}
              {(() => {
                const selectedModel = availableModels.find(m => m.value === settings.model)
                if (!selectedModel) return null

                return (
                  <div className={`mt-2 rounded-lg p-2 text-xs ${selectedModel.free === false ? 'bg-yellow-500/10 border border-yellow-500/30' : 'bg-green-500/10 border border-green-500/30'}`}>
                    {selectedModel.free === false ? (
                      <>
                        <p className="font-medium text-yellow-300">💰 Kostenpflichtiges Modell</p>
                        <p className="text-yellow-200/80 mt-1">
                          ~${selectedModel.pricing?.inputPer1M?.toFixed(2) || '?'}/1M Input-Tokens •
                          ~${selectedModel.pricing?.outputPer1M?.toFixed(2) || '?'}/1M Output-Tokens
                        </p>
                        <p className="text-yellow-200/60 mt-1">
                          ≈ 0,001-0,01$ pro Anfrage (je nach Länge)
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="font-medium text-green-300">✅ Kostenloses Modell</p>
                        <p className="text-green-200/80 mt-1">
                          {selectedModel.pricing?.note || 'Mit Fair-Use-Limit (ausreichend für normale Nutzung)'}
                        </p>
                      </>
                    )}
                  </div>
                )
              })()}

              {modelsError && (
                <p className="mt-1 text-xs text-yellow-400">
                  ⚠️ {modelsError} – verwende Fallback-Liste
                </p>
              )}
              <p className="mt-2 text-xs text-purple-400">
                ✅ = Kostenlos • 💰 = Kostenpflichtig • ⭐ = Empfohlen
              </p>
              <a
                href="https://ai.google.dev/pricing"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-purple-400 hover:text-purple-200 underline"
              >
                → Aktuelle Google-Preise ansehen
              </a>
            </div>

            <div className="flex items-center gap-3">
              <input
                id="assistant-quick-actions"
                type="checkbox"
                checked={settings.enableQuickActions}
                onChange={(event) => handleFieldChange('enableQuickActions', event.target.checked)}
                className="h-4 w-4 rounded border border-purple-400 bg-black/40 text-purple-500 focus:ring-purple-400"
                disabled={!settingsReady}
              />
              <label htmlFor="assistant-quick-actions" className="text-xs text-purple-200">
                Schnellaktionen aktivieren (Auswahl von vordefinierten Aufgaben direkt im Chat)
              </label>
            </div>

            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-purple-500/20">
              <input
                id="assistant-global"
                type="checkbox"
                checked={settings.enableGlobalAssistant}
                onChange={(event) => handleFieldChange('enableGlobalAssistant', event.target.checked)}
                className="h-4 w-4 rounded border border-purple-400 bg-black/40 text-purple-500 focus:ring-purple-400"
                disabled={!settingsReady}
              />
              <label htmlFor="assistant-global" className="text-xs text-purple-200">
                <span className="font-medium text-purple-100">Globaler Assistent</span> – Zeigt einen Floating-Button auf allen Admin-Seiten.
                Du kannst Text markieren und die KI hilft dir beim Bearbeiten.
              </label>
            </div>
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-purple-600/30 bg-black/30 p-5 text-sm text-purple-200">
        <header className="flex items-center gap-2 text-xs uppercase tracking-widest text-purple-300">
          <InformationCircleIcon className="h-4 w-4" />
          <span>Integration & Sicherheit</span>
        </header>
        <ul className="mt-3 list-inside space-y-2 text-xs">
          <li>
            Setze die Umgebungsvariable <code>GEMINI_API_KEY</code> (oder <code>GOOGLE_API_KEY</code>) auf Server- und Build-Umgebungen.
          </li>
          <li>
            Optional kannst du mit <code>GEMINI_MODEL</code> ein alternatives Standardmodell definieren. Die Auswahlliste in diesem Panel überschreibt den Wert temporär.
          </li>
          <li>
            Der Assistent arbeitet read-only: Ergebnisse müssen manuell übernommen werden. Für automatische Aktionen sollten API-Routen mit Authentifizierung ergänzt werden.
          </li>
        </ul>
      </section>
    </div>
  )
}
