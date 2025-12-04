'use client'

import { useEffect, useState } from 'react'

interface AccessibilityStatement {
  id: string
  content: string | null
  conformance_status: 'full' | 'partial' | 'none' | 'unknown'
  last_reviewed: string | null
  statement_date: string | null
  contact_email: string | null
  contact_phone: string | null
  contact_address: string | null
  feedback_mechanism: string | null
  enforcement_procedure_url: string | null
  known_limitations: Array<{ area: string; description: string; remedy?: string }>
  technologies_used: string[]
  assessment_method: string | null
}

// Einfache Markdown zu HTML Konvertierung
function simpleMarkdownToHtml(markdown: string): string {
  return markdown
    // Headers
    .replace(/^### (.*$)/gm, '<h3 class="text-xl font-semibold text-white mt-6 mb-3">$1</h3>')
    .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-bold text-white mt-8 mb-4">$1</h2>')
    .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold text-white mt-8 mb-4">$1</h1>')
    // Bold & Italic
    .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Lists
    .replace(/^- (.*$)/gm, '<li class="ml-4 text-purple-200/80">$1</li>')
    // Paragraphs
    .replace(/\n\n/g, '</p><p class="text-purple-200/80 mb-4">')
    // Line breaks
    .replace(/\n/g, '<br />')
}

const conformanceLabels = {
  full: 'Vollständig konform',
  partial: 'Teilweise konform',
  none: 'Nicht konform',
  unknown: 'Unbekannt',
}

const conformanceColors = {
  full: 'bg-green-500/20 text-green-300 border-green-500/50',
  partial: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50',
  none: 'bg-red-500/20 text-red-300 border-red-500/50',
  unknown: 'bg-gray-500/20 text-gray-300 border-gray-500/50',
}

export function AccessibilityStatementContent() {
  const [statement, setStatement] = useState<AccessibilityStatement | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStatement() {
      try {
        const res = await fetch('/api/accessibility/statement')
        if (res.ok) {
          const data = await res.json()
          setStatement(data)
        }
      } catch (error) {
        console.error('Fehler beim Laden der Barrierefreiheitserklärung:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchStatement()
  }, [])

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-6 bg-purple-500/20 rounded w-3/4"></div>
        <div className="h-4 bg-purple-500/20 rounded w-full"></div>
        <div className="h-4 bg-purple-500/20 rounded w-5/6"></div>
      </div>
    )
  }

  if (!statement) {
    return (
      <div className="text-center py-12">
        <p className="text-purple-200/60">
          Die Barrierefreiheitserklärung konnte nicht geladen werden.
        </p>
      </div>
    )
  }

  return (
    <article className="prose prose-invert prose-purple max-w-none">
      {/* Konformitätsstatus Badge */}
      <div className="not-prose mb-8">
        <span className={`inline-flex items-center px-4 py-2 rounded-full border text-sm font-medium ${conformanceColors[statement.conformance_status]}`}>
          Konformitätsstatus: {conformanceLabels[statement.conformance_status]}
        </span>
        {statement.last_reviewed && (
          <p className="mt-2 text-sm text-purple-300/60">
            Zuletzt überprüft: {new Date(statement.last_reviewed).toLocaleDateString('de-DE')}
          </p>
        )}
      </div>

      {/* Hauptinhalt */}
      {statement.content && (
        <div
          className="mb-12 text-purple-200/80"
          dangerouslySetInnerHTML={{ __html: simpleMarkdownToHtml(statement.content) }}
        />
      )}

      {/* Bekannte Einschränkungen */}
      {statement.known_limitations && statement.known_limitations.length > 0 && (
        <section className="not-prose mb-12">
          <h2 className="text-2xl font-bold text-white mb-4">Bekannte Einschränkungen</h2>
          <div className="space-y-4">
            {statement.known_limitations.map((limitation, index) => (
              <div key={index} className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
                <h3 className="font-semibold text-purple-200">{limitation.area}</h3>
                <p className="text-purple-300/80 mt-1">{limitation.description}</p>
                {limitation.remedy && (
                  <p className="text-sm text-purple-400/60 mt-2">
                    <strong>Geplante Behebung:</strong> {limitation.remedy}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Kontakt */}
      <section className="not-prose mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Feedback & Kontakt</h2>
        <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-6">
          {statement.feedback_mechanism && (
            <p className="text-purple-200 mb-4">{statement.feedback_mechanism}</p>
          )}
          <div className="space-y-2 text-purple-300/80">
            {statement.contact_email && (
              <p><strong>E-Mail:</strong>{' '}
                <a href={`mailto:${statement.contact_email}`} className="text-purple-400 hover:text-purple-300 underline">
                  {statement.contact_email}
                </a>
              </p>
            )}
            {statement.contact_phone && (<p><strong>Telefon:</strong> {statement.contact_phone}</p>)}
            {statement.contact_address && (<p><strong>Adresse:</strong> {statement.contact_address}</p>)}
          </div>
        </div>
      </section>

      {/* Durchsetzungsverfahren */}
      {statement.enforcement_procedure_url && (
        <section className="not-prose">
          <h2 className="text-2xl font-bold text-white mb-4">Durchsetzungsverfahren</h2>
          <p className="text-purple-200/80 mb-4">
            Wenn Sie der Meinung sind, dass wir nicht angemessen auf Ihre Anfrage reagiert haben, können Sie sich an die zuständige Durchsetzungsstelle wenden:
          </p>
          <a href={statement.enforcement_procedure_url} target="_blank" rel="noopener noreferrer" 
             className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors">
            Zur Durchsetzungsstelle (BFIT-Bund)
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </section>
      )}
    </article>
  )
}

