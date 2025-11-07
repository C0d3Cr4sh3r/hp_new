'use client'

import { useCallback } from 'react'
import {
  AdjustmentsHorizontalIcon,
  ArrowPathIcon,
  InformationCircleIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'
import type { AssistantSettings } from './types'
import { AVAILABLE_GEMINI_MODELS } from './constants'

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
  const handleFieldChange = useCallback(
    <Key extends keyof AssistantSettings>(key: Key, value: AssistantSettings[Key]) => {
      onChange({ ...settings, [key]: value })
    },
    [onChange, settings],
  )

  const handleReset = useCallback(() => {
    onReset()
  }, [onReset])

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
              <label className="text-xs font-semibold uppercase tracking-widest text-purple-300">Gemini-Modell</label>
              <select
                value={settings.model}
                onChange={(event) => handleFieldChange('model', event.target.value)}
                className="mt-2 w-full rounded-xl border border-purple-500/40 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-purple-300"
                disabled={!settingsReady}
              >
                {AVAILABLE_GEMINI_MODELS.map((model) => (
                  <option key={model.value} value={model.value}>
                    {model.label}
                    {model.recommended ? ' (Empfohlen)' : ''}
                  </option>
                ))}
              </select>
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
