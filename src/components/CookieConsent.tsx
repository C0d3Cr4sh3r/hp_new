'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const COOKIE_CONSENT_KEY = 'ap_cookie_consent'
const COOKIE_CONSENT_VERSION = '1' // Erhöhen bei Änderungen an der Consent-Logik

interface ConsentState {
  essential: boolean // Immer true, können nicht deaktiviert werden
  functional: boolean
  analytics: boolean // Für zukünftige Nutzung
  version: string
  timestamp: string
}

const DEFAULT_CONSENT: ConsentState = {
  essential: true,
  functional: false,
  analytics: false,
  version: COOKIE_CONSENT_VERSION,
  timestamp: new Date().toISOString(),
}

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [consent, setConsent] = useState<ConsentState>(DEFAULT_CONSENT)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Prüfe ob bereits Consent gegeben wurde
    try {
      const stored = localStorage.getItem(COOKIE_CONSENT_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as ConsentState
        // Prüfe ob Version noch aktuell ist
        if (parsed.version === COOKIE_CONSENT_VERSION) {
          setConsent(parsed)
          setShowBanner(false)
          return
        }
      }
      // Kein gültiger Consent vorhanden - Banner anzeigen
      setShowBanner(true)
    } catch {
      setShowBanner(true)
    }
  }, [])

  const saveConsent = (newConsent: ConsentState) => {
    const consentWithMeta = {
      ...newConsent,
      version: COOKIE_CONSENT_VERSION,
      timestamp: new Date().toISOString(),
    }
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consentWithMeta))
    setConsent(consentWithMeta)
    setShowBanner(false)
  }

  const acceptAll = () => {
    saveConsent({
      ...consent,
      essential: true,
      functional: true,
      analytics: true,
    })
  }

  const acceptEssentialOnly = () => {
    saveConsent({
      ...consent,
      essential: true,
      functional: false,
      analytics: false,
    })
  }

  const saveCustom = () => {
    saveConsent(consent)
  }

  // Nicht rendern bis Client-seitig gemountet (verhindert Hydration-Mismatch)
  if (!mounted || !showBanner) {
    return null
  }

  return (
    <div 
      role="dialog" 
      aria-modal="true" 
      aria-labelledby="cookie-banner-title"
      className="fixed bottom-0 left-0 right-0 z-[9998] p-4 md:p-6"
    >
      <div className="mx-auto max-w-4xl rounded-2xl border border-purple-500/30 bg-gray-950/98 backdrop-blur-xl shadow-2xl shadow-purple-900/30">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h2 id="cookie-banner-title" className="text-xl font-bold text-white flex items-center gap-2">
                🍪 Cookie-Einstellungen
              </h2>
              <p className="text-sm text-purple-200/80 mt-1">
                Wir respektieren deine Privatsphäre
              </p>
            </div>
          </div>

          {/* Beschreibung */}
          <div className="text-sm text-purple-200/70 mb-6">
            <p>
              Diese Website verwendet Cookies, um dir die bestmögliche Erfahrung zu bieten. 
              Essentielle Cookies sind für die Grundfunktionen erforderlich und können nicht deaktiviert werden.
              Weitere Informationen findest du in unserer{' '}
              <Link href="/datenschutz" className="text-purple-400 hover:text-purple-300 underline">
                Datenschutzerklärung
              </Link>.
            </p>
          </div>

          {/* Details Toggle */}
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="text-sm text-purple-400 hover:text-purple-300 mb-4 flex items-center gap-1"
            aria-expanded={showDetails}
          >
            {showDetails ? '▼' : '▶'} Cookie-Details {showDetails ? 'ausblenden' : 'anzeigen'}
          </button>

          {/* Cookie Details */}
          {showDetails && (
            <div className="mb-6 space-y-4 rounded-xl border border-purple-500/20 bg-black/40 p-4">
              {/* Essentielle Cookies */}
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="cookie-essential"
                  checked={true}
                  disabled
                  className="mt-1 h-4 w-4 rounded border-purple-500/40 bg-purple-600 text-purple-600"
                />
                <label htmlFor="cookie-essential" className="flex-1">
                  <span className="font-semibold text-white">Essentielle Cookies</span>
                  <span className="ml-2 text-xs bg-purple-500/30 text-purple-300 px-2 py-0.5 rounded">Erforderlich</span>
                  <p className="text-sm text-purple-200/60 mt-1">
                    Diese Cookies sind für die Grundfunktionen der Website notwendig (z.B. Admin-Session, Sicherheit).
                    Sie können nicht deaktiviert werden.
                  </p>
                </label>
              </div>

              {/* Funktionale Cookies */}
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="cookie-functional"
                  checked={consent.functional}
                  onChange={(e) => setConsent({ ...consent, functional: e.target.checked })}
                  className="mt-1 h-4 w-4 rounded border-purple-500/40 bg-black/40 text-purple-600 focus:ring-purple-500 focus:ring-offset-0"
                />
                <label htmlFor="cookie-functional" className="flex-1">
                  <span className="font-semibold text-white">Funktionale Cookies</span>
                  <p className="text-sm text-purple-200/60 mt-1">
                    Ermöglichen erweiterte Funktionen wie personalisierte Einstellungen und Theme-Präferenzen.
                  </p>
                </label>
              </div>

              {/* Analyse Cookies (für Zukunft) */}
              <div className="flex items-start gap-3 opacity-50">
                <input
                  type="checkbox"
                  id="cookie-analytics"
                  checked={consent.analytics}
                  onChange={(e) => setConsent({ ...consent, analytics: e.target.checked })}
                  disabled
                  className="mt-1 h-4 w-4 rounded border-purple-500/40 bg-black/40 text-purple-600"
                />
                <label htmlFor="cookie-analytics" className="flex-1">
                  <span className="font-semibold text-white">Analyse-Cookies</span>
                  <span className="ml-2 text-xs bg-gray-500/30 text-gray-400 px-2 py-0.5 rounded">Nicht verwendet</span>
                  <p className="text-sm text-purple-200/60 mt-1">
                    Derzeit werden keine Analyse-Cookies verwendet. Diese Option ist für zukünftige Erweiterungen reserviert.
                  </p>
                </label>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={acceptAll}
              className="flex-1 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:from-purple-500 hover:to-pink-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-950"
            >
              Alle akzeptieren
            </button>
            
            {showDetails ? (
              <button
                type="button"
                onClick={saveCustom}
                className="flex-1 rounded-xl border border-purple-500/40 bg-purple-500/10 px-6 py-3 text-sm font-semibold text-purple-200 transition hover:bg-purple-500/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
              >
                Auswahl speichern
              </button>
            ) : (
              <button
                type="button"
                onClick={acceptEssentialOnly}
                className="flex-1 rounded-xl border border-purple-500/40 bg-transparent px-6 py-3 text-sm font-semibold text-purple-300 transition hover:bg-purple-500/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
              >
                Nur Essentielle
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Hook um Consent-Status abzufragen
export function useCookieConsent() {
  const [consent, setConsent] = useState<ConsentState | null>(null)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(COOKIE_CONSENT_KEY)
      if (stored) {
        setConsent(JSON.parse(stored))
      }
    } catch {
      setConsent(null)
    }
  }, [])

  return consent
}

export default CookieConsent

