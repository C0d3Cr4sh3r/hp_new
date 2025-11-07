'use client'

import { useCallback, useMemo, useState } from 'react'
import {
  ArrowPathIcon,
  PaperAirplaneIcon,
  SparklesIcon,
  ExclamationTriangleIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline'
import type { AssistantSettings, ChatMessage } from './types'
import { handleAdminUnauthorized } from '@/components/admin/utils/handleUnauthorized'

const QUICK_ACTIONS: Array<{
  id: string
  title: string
  description: string
  prompt: string
}> = [
  {
    id: 'news-draft',
    title: 'News-Entwurf erstellen',
    description: 'Erstelle einen strukturierten News-Beitrag mit Titel-, Teaser- und Body-Vorschlägen.',
    prompt:
      'Erstelle einen strukturierten News-Entwurf für arcanePixels. Gib einen knackigen Titel, einen Slug-Vorschlag und drei Abschnittsüberschriften mit kurzen Beschreibungen zurück. Frage nach weiteren Details, falls Informationen fehlen.',
  },
  {
    id: 'download-changelog',
    title: 'Changelog formulieren',
    description: 'Fasse Feature-Updates und Bugfixes prägnant für den Download-Bereich zusammen.',
    prompt:
      'Formuliere einen strukturierten Changelog-Eintrag mit Stichpunkten zu neuen Features, Verbesserungen und Bugfixes. Erinnere an Versionsnummer und Veröffentlichungsdatum.',
  },
  {
    id: 'bug-triage',
    title: 'Bugbewertung vorbereiten',
    description: 'Analysiere eine Bug-Beschreibung und schlage eine Priorisierung mit nächsten Schritten vor.',
    prompt:
      'Analysiere folgenden Bug-Report, schlage eine Priorität (P0-P3), einen Kurz-Titel und konkrete nächste Schritte vor. Frage nach weiteren Details, falls Angaben fehlen.',
  },
]

function createMessage(role: 'user' | 'assistant', content: string): ChatMessage {
  return {
    id: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${role}-${Date.now()}`,
    role,
    content,
    createdAt: Date.now(),
  }
}

function formatTimestamp(timestamp: number) {
  return new Intl.DateTimeFormat('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(timestamp)
}

type AssistantPanelProps = {
  settings: AssistantSettings
  settingsReady: boolean
  onOpenSettings: () => void
}

export function AssistantPanel({ settings, settingsReady, onOpenSettings }: AssistantPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const disabledReason = useMemo(() => {
    if (!settingsReady) {
      return 'Einstellungen werden geladen...'
    }
    return null
  }, [settingsReady])

  const sendMessage = useCallback(
    async (content: string) => {
      const trimmed = content.trim()
      if (!trimmed) return

      const pendingUserMessage = createMessage('user', trimmed)
      setMessages((prev) => [...prev, pendingUserMessage])
      setInput('')
      setIsProcessing(true)
      setError(null)

      try {
        const response = await fetch('/api/assistant', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: [...messages, pendingUserMessage].map(({ role, content: text }) => ({ role, content: text })),
            instructions: settings.instructions,
            temperature: settings.temperature,
            model: settings.model,
          }),
        })

        if (handleAdminUnauthorized(response)) {
          return
        }

        if (!response.ok) {
          const payload = await response.json().catch(() => ({}))
          throw new Error(payload?.error ?? 'Die Anfrage an den Assistenten ist fehlgeschlagen.')
        }

        const payload = await response.json()
        const replyText = typeof payload?.reply === 'string' && payload.reply.trim().length > 0
          ? payload.reply.trim()
          : 'Ich konnte leider keine sinnvolle Antwort generieren.'

        const assistantMessage = createMessage('assistant', replyText)
        setMessages((prev) => [...prev, assistantMessage])
      } catch (err) {
        console.error('Assistant request failed', err)
        setError('Der Assistent konnte nicht antworten. Bitte später erneut versuchen.')
      } finally {
        setIsProcessing(false)
      }
    },
    [messages, settings.instructions, settings.model, settings.temperature],
  )

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      await sendMessage(input)
    },
    [input, sendMessage],
  )

  const handleQuickAction = useCallback(
    (prompt: string) => {
      if (!settings.enableQuickActions) {
        setInput(prompt)
        return
      }
      void sendMessage(prompt)
    },
    [sendMessage, settings.enableQuickActions],
  )

  const handleResetConversation = useCallback(() => {
    setMessages([])
    setError(null)
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">KI-Assistent</h2>
          <p className="text-sm text-purple-200">
            Nutze Google Gemini, um Content-Entwürfe, Zusammenfassungen oder Priorisierungen direkt im Admin-Bereich vorzubereiten.
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenSettings}
          className="inline-flex items-center gap-2 rounded-full border border-purple-500/40 px-4 py-1.5 text-sm font-medium text-purple-100 transition hover:border-purple-300 hover:text-white"
        >
          <Cog6ToothIcon className="h-4 w-4" /> Einstellungen öffnen
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          <div className="flex items-center gap-2">
            <ExclamationTriangleIcon className="h-4 w-4" />
            <span>{error}</span>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <div className="flex flex-col rounded-2xl border border-purple-600/30 bg-black/30 p-4">
          <div className="flex items-center justify-between border-b border-purple-500/20 pb-3">
            <div className="flex items-center gap-2 text-sm text-purple-200">
              <SparklesIcon className="h-4 w-4" />
              <span>Konversation</span>
            </div>
            <button
              type="button"
              onClick={handleResetConversation}
              className="inline-flex items-center gap-1 rounded-full border border-purple-500/40 px-3 py-1 text-xs text-purple-100 transition hover:border-purple-300 hover:text-white"
              disabled={messages.length === 0}
            >
              <ArrowPathIcon className="h-3.5 w-3.5" /> Zurücksetzen
            </button>
          </div>

          <div className="mt-4 flex-1 space-y-4 overflow-y-auto pr-1 text-sm text-purple-100">
            {messages.length === 0 ? (
              <div className="rounded-xl border border-purple-500/30 bg-black/40 p-4 text-sm text-purple-200">
                {disabledReason ?? 'Stelle eine Frage oder nutze eine Schnellaktion, um zu starten.'}
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex flex-col gap-1 rounded-2xl border px-4 py-3 ${
                    message.role === 'assistant'
                      ? 'border-purple-500/40 bg-purple-900/20'
                      : 'border-purple-500/20 bg-purple-950/20 text-purple-100'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs uppercase tracking-widest text-purple-300/80">
                    <span>{message.role === 'assistant' ? 'Assistent' : 'Du'}</span>
                    <span>{formatTimestamp(message.createdAt)}</span>
                  </div>
                  <div className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                    {message.content}
                  </div>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleSubmit} className="mt-4 space-y-3">
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={disabledReason ?? 'Beschreibe deine Aufgabe oder füge Kontext ein...'}
              disabled={!settingsReady || isProcessing}
              rows={4}
              className="w-full rounded-2xl border border-purple-500/40 bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-purple-300 disabled:cursor-not-allowed"
            />
            <div className="flex items-center justify-between gap-3 text-xs text-purple-300">
              <span>Temperatur: {settings.temperature.toFixed(1)}</span>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 px-4 py-2 text-sm font-semibold text-white transition hover:from-purple-500 hover:to-pink-400 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={!settingsReady || isProcessing || input.trim().length === 0}
              >
                {isProcessing ? (
                  <ArrowPathIcon className="h-4 w-4 animate-spin" />
                ) : (
                  <PaperAirplaneIcon className="h-4 w-4" />
                )}
                {isProcessing ? 'Verarbeite...' : 'Senden'}
              </button>
            </div>
          </form>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-purple-600/30 bg-black/30 p-4">
            <h3 className="text-sm font-semibold text-purple-100">Schnellaktionen</h3>
            <p className="mt-1 text-xs text-purple-300">
              {settings.enableQuickActions
                ? 'Starte mit vordefinierten Aufgaben. Anpassungen sind jederzeit möglich.'
                : 'Schnellaktionen sind in den Einstellungen deaktiviert.'}
            </p>
            <div className="mt-3 space-y-3">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action.id}
                  type="button"
                  onClick={() => handleQuickAction(action.prompt)}
                  className="w-full rounded-xl border border-purple-500/30 bg-purple-950/30 px-4 py-3 text-left text-sm text-purple-100 transition hover:border-purple-400 hover:bg-purple-900/30 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={!settingsReady || isProcessing}
                >
                  <p className="font-medium">{action.title}</p>
                  <p className="mt-1 text-xs text-purple-300">{action.description}</p>
                  {!settings.enableQuickActions && (
                    <p className="mt-1 text-[11px] uppercase tracking-widest text-purple-400">
                      Aktivieren in den Einstellungen
                    </p>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-purple-600/30 bg-black/30 p-4 text-xs text-purple-300">
            <p>
              Der Assistent führt aktuell keine automatischen Änderungen im System durch. Nutze die Vorschläge als Grundlage für deine Workflows oder übertrage Ergebnisse manuell in die entsprechenden Panels.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
