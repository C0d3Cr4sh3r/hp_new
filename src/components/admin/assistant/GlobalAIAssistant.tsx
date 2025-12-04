'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { SparklesIcon, XMarkIcon, PaperAirplaneIcon, ArrowPathIcon } from '@heroicons/react/24/outline'
import type { AssistantSettings, ChatMessage } from './types'

interface GlobalAIAssistantProps {
  settings: AssistantSettings
  settingsReady: boolean
}

const createMessage = (role: 'user' | 'assistant', content: string): ChatMessage => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
  role,
  content,
  createdAt: Date.now(),
})

export function GlobalAIAssistant({ settings, settingsReady }: GlobalAIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedText, setSelectedText] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const isEnabled = settings.enableGlobalAssistant && settingsReady

  // Markierten Text erfassen
  useEffect(() => {
    if (!isEnabled) return

    const handleSelectionChange = () => {
      const selection = window.getSelection()
      const text = selection?.toString().trim() || ''
      if (text.length > 10 && text.length < 5000) {
        setSelectedText(text)
      }
    }

    document.addEventListener('mouseup', handleSelectionChange)
    document.addEventListener('keyup', handleSelectionChange)

    return () => {
      document.removeEventListener('mouseup', handleSelectionChange)
      document.removeEventListener('keyup', handleSelectionChange)
    }
  }, [isEnabled])

  // Auto-scroll zu neuen Nachrichten
  useEffect(() => {
    if (!isEnabled) return
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isEnabled])

  // Focus auf Input wenn Modal öffnet
  useEffect(() => {
    if (!isEnabled) return
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen, isEnabled])

  const sendMessage = useCallback(async (content: string) => {
    const trimmed = content.trim()
    if (!trimmed || isProcessing) return

    const userMessage = createMessage('user', trimmed)
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsProcessing(true)

    try {
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(({ role, content: text }) => ({ role, content: text })),
          instructions: settings.instructions,
          temperature: settings.temperature,
          model: settings.model,
        }),
      })

      if (!response.ok) {
        throw new Error('Anfrage fehlgeschlagen')
      }

      const payload = await response.json()
      const replyText = payload?.reply?.trim() || 'Keine Antwort erhalten.'
      setMessages(prev => [...prev, createMessage('assistant', replyText)])
    } catch (error) {
      console.error('AI request failed:', error)
      setMessages(prev => [...prev, createMessage('assistant', '❌ Fehler: Konnte keine Antwort generieren.')])
    } finally {
      setIsProcessing(false)
    }
  }, [messages, settings, isProcessing])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const handleUseSelectedText = () => {
    if (selectedText) {
      setInput(`Bitte hilf mir mit folgendem Text:\n\n"${selectedText}"\n\nAufgabe: `)
      setSelectedText('')
      inputRef.current?.focus()
    }
  }

  const handleReset = () => {
    setMessages([])
    setInput('')
  }

  // Nicht anzeigen wenn deaktiviert
  if (!isEnabled) {
    return null
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30 transition-all hover:scale-110 hover:shadow-xl hover:shadow-purple-500/40"
        title="KI-Assistent öffnen"
      >
        <SparklesIcon className="h-6 w-6" />
        {selectedText && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-xs font-bold">
            ✓
          </span>
        )}
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-end p-4 sm:items-center sm:justify-center">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)} />

          {/* Modal Content */}
          <div className="relative flex h-[80vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-purple-500/30 bg-gray-900 shadow-2xl sm:h-[600px]">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-purple-500/30 bg-black/50 px-4 py-3">
              <div className="flex items-center gap-2">
                <SparklesIcon className="h-5 w-5 text-purple-400" />
                <h3 className="font-semibold text-white">KI-Assistent</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleReset}
                  className="rounded-lg p-2 text-purple-400 hover:bg-purple-500/20"
                  title="Chat zurücksetzen"
                >
                  <ArrowPathIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg p-2 text-purple-400 hover:bg-purple-500/20"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Selected Text Hint */}
            {selectedText && (
              <div className="border-b border-purple-500/20 bg-green-500/10 px-4 py-2">
                <button
                  onClick={handleUseSelectedText}
                  className="flex w-full items-center gap-2 text-left text-sm text-green-300 hover:text-green-200"
                >
                  <span className="shrink-0">📝</span>
                  <span className="truncate">Markierten Text verwenden: &quot;{selectedText.slice(0, 50)}...&quot;</span>
                </button>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <div className="rounded-xl border border-purple-500/20 bg-black/40 p-4 text-sm text-purple-300">
                  <p className="font-medium">Hallo! 👋</p>
                  <p className="mt-2">Ich helfe dir beim Erstellen von Texten, Bearbeiten von Inhalten oder Beantworten von Fragen.</p>
                  <p className="mt-2 text-purple-400">💡 Tipp: Markiere Text auf der Seite, dann erscheint ein grüner Button um ihn zu verwenden.</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`rounded-xl px-4 py-3 text-sm ${
                      msg.role === 'assistant'
                        ? 'bg-purple-500/20 text-purple-100'
                        : 'bg-purple-900/30 text-white'
                    }`}
                  >
                    <p className="mb-1 text-xs font-medium uppercase text-purple-400">
                      {msg.role === 'assistant' ? '🤖 Assistent' : '👤 Du'}
                    </p>
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  </div>
                ))
              )}
              {isProcessing && (
                <div className="flex items-center gap-2 text-sm text-purple-400">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-purple-400" />
                  Denke nach...
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="border-t border-purple-500/30 bg-black/50 p-4">
              <div className="flex gap-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSubmit(e)
                    }
                  }}
                  placeholder="Frag mich etwas..."
                  rows={2}
                  className="flex-1 resize-none rounded-xl border border-purple-500/30 bg-black/40 px-4 py-2 text-sm text-white placeholder-purple-400/60 focus:border-purple-400 focus:outline-none"
                  disabled={isProcessing}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isProcessing}
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-600 text-white transition hover:bg-purple-500 disabled:opacity-50"
                >
                  <PaperAirplaneIcon className="h-5 w-5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

