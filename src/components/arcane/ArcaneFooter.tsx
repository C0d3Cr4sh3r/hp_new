'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline'
import type { ThemeSettings } from '@/types/settings'

export default function ArcaneFooter() {
  const [settings, setSettings] = useState<ThemeSettings | null>(null)
  const currentYear = new Date().getFullYear()

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch('/api/theme-settings')
        if (response.ok) {
          const data = await response.json()
          setSettings(data)
        }
      } catch (error) {
        console.error('Footer-Einstellungen konnten nicht geladen werden:', error)
      }
    }
    loadSettings()
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Fallback wenn keine Einstellungen geladen wurden
  const brandName = settings?.footerBrandName || 'ArcanePixels'
  const brandDescription = settings?.footerBrandDescription || 'Web-Entwicklung für kreative Professionals'
  const badges = settings?.footerBadges || []
  const sections = settings?.footerSections || []
  const metaLines = settings?.footerMetaLines || []
  const showUpdatedAt = settings?.footerShowUpdatedAt ?? true

  return (
    <footer id="footer" aria-label="Fußzeile" className="bg-gray-900 border-t border-purple-500/20">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Column */}
          <div className="md:col-span-1">
            <button
              onClick={scrollToTop}
              aria-label="Nach oben scrollen"
              className="text-2xl font-bold hover:opacity-80 transition-all duration-200 mb-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 rounded"
              style={{
                background: 'linear-gradient(to right, var(--theme-primary, #a855f7), var(--theme-accent, #ec4899))',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                color: 'transparent',
              }}
            >
              {brandName}
            </button>
            {brandDescription && (
              <p className="text-purple-200/70 text-sm leading-relaxed mb-4">
                {brandDescription}
              </p>
            )}
            {badges.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {badges.map((badge, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Links Columns */}
          {sections.map((section, index) => (
            <nav key={index} aria-label={`Footer-Links: ${section.title}`}>
              <h3 className="text-white font-semibold mb-4">{section.title}</h3>
              <ul className="space-y-2" role="list">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${link.label} (öffnet in neuem Tab)`}
                        className="text-purple-300/70 hover:text-purple-200 transition-colors duration-200 text-sm flex items-center gap-1 group focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 rounded"
                      >
                        <span>{link.label}</span>
                        <ArrowTopRightOnSquareIcon className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200" aria-hidden="true" />
                        <span className="sr-only">(öffnet in neuem Tab)</span>
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-purple-300/70 hover:text-purple-200 transition-colors duration-200 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 rounded"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-purple-500/20">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-purple-300/60 text-sm">
              © {currentYear} {brandName}. Alle Rechte vorbehalten.
            </div>
            
            <nav aria-label="Rechtliche Links" className="flex items-center gap-6">
              <Link
                href="/impressum"
                className="text-purple-300/60 hover:text-purple-200 transition-colors duration-200 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 rounded"
              >
                Impressum
              </Link>
              <Link
                href="/datenschutz"
                className="text-purple-300/60 hover:text-purple-200 transition-colors duration-200 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 rounded"
              >
                Datenschutz
              </Link>
              <Link
                href="/barrierefreiheit"
                className="text-purple-300/60 hover:text-purple-200 transition-colors duration-200 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 rounded"
              >
                Barrierefreiheit
              </Link>
            </nav>
          </div>
        </div>

        {/* Meta Lines */}
        {(metaLines.length > 0 || showUpdatedAt) && (
          <div className="mt-8 pt-6 border-t border-purple-500/10 text-center">
            <div className="text-xs text-purple-400/50 space-y-1">
              {metaLines.map((line, index) => (
                <div key={index}>{line}</div>
              ))}
              {showUpdatedAt && (
                <div>Letzte Aktualisierung: {new Date().toLocaleDateString('de-DE')}</div>
              )}
            </div>
          </div>
        )}
      </div>
    </footer>
  )
}

