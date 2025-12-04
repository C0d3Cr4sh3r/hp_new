'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'

// Fallback Navigation wenn DB nicht erreichbar
const defaultNavigation = [
  { name: 'Home', href: '/', external: false },
  { name: 'Services', href: '/#services', external: false },
  { name: 'Portfolio', href: '/#portfolio', external: false },
  { name: 'News', href: '/arcane/news', external: false },
  { name: 'Admin', href: '/admin', external: false },
]

interface NavigationLink {
  label: string
  href: string
  external: boolean
}

interface ArcaneNavigationProps {
  siteName?: string
  tagline?: string
}

export default function ArcaneNavigation({ siteName: initialSiteName, tagline: initialTagline }: ArcaneNavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [siteName, setSiteName] = useState(initialSiteName || 'ArcanePixels')
  const [tagline, setTagline] = useState(initialTagline || '')
  const [navLinks, setNavLinks] = useState<NavigationLink[]>([])

  // Lade Site-Settings und Navigation
  useEffect(() => {
    // Site Name und Tagline laden
    if (!initialSiteName) {
      fetch('/api/site-settings')
        .then(res => res.json())
        .then(data => {
          if (data?.site_name) {
            setSiteName(data.site_name)
          }
          if (data?.tagline) {
            setTagline(data.tagline)
          }
        })
        .catch(() => {})
    }

    // Navigation Links laden
    fetch('/api/navigation')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setNavLinks(data.filter(link => link.visible).map(link => ({
            label: link.label,
            href: link.href,
            external: link.external,
          })))
        } else {
          setNavLinks(defaultNavigation.map(n => ({ label: n.name, href: n.href, external: n.external })))
        }
      })
      .catch(() => {
        setNavLinks(defaultNavigation.map(n => ({ label: n.name, href: n.href, external: n.external })))
      })
  }, [initialSiteName])

  // Body-Scroll deaktivieren wenn mobiles Menü offen ist
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileMenuOpen])

  return (
    <header className="sticky top-0 z-50 bg-black/95 backdrop-blur-md border-b border-purple-500/20">
      <nav
        id="main-navigation"
        aria-label="Hauptnavigation"
        className="mx-auto flex max-w-7xl items-center justify-between p-4 lg:px-8"
      >
        <div className="flex lg:flex-1">
          <Link href="/" className="p-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded-lg">
            <span
              className="text-xl sm:text-2xl font-bold"
              style={{
                background: 'linear-gradient(to right, var(--theme-primary, #a855f7), var(--theme-accent, #ec4899))',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                color: 'transparent',
              }}
            >
              {siteName}
            </span>
            {tagline && (
              <span className="block text-xs text-purple-300/70 font-normal mt-0.5">
                {tagline}
              </span>
            )}
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex lg:gap-x-8" role="list">
          {navLinks.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              target={item.external ? '_blank' : undefined}
              rel={item.external ? 'noopener noreferrer' : undefined}
              aria-label={item.external ? `${item.label} (öffnet in neuem Tab)` : undefined}
              className="text-sm font-semibold text-purple-300 hover:text-purple-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded px-2 py-1"
            >
              {item.label}
              {item.external && (
                <span className="sr-only"> (öffnet in neuem Tab)</span>
              )}
            </Link>
          ))}
        </div>

        {/* Mobile Menu Button */}
        <div className="lg:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Menü öffnen"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            className="p-3 text-purple-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded-lg"
          >
            <Bars3Icon className="h-7 w-7" aria-hidden="true" />
          </button>
        </div>
      </nav>

      {/* Mobile Menu - Simple Fullscreen Overlay */}
      {mobileMenuOpen && (
        <div
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation"
          className="lg:hidden"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            backgroundColor: '#0a0a0a',
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            width: '100vw',
          }}
        >
          {/* Header mit Schließen-Button */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px',
              borderBottom: '1px solid rgba(168, 85, 247, 0.3)',
              flexShrink: 0,
            }}
          >
            <div>
              <span
                style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  background: 'linear-gradient(to right, var(--theme-primary, #a855f7), var(--theme-accent, #ec4899))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {siteName}
              </span>
              {tagline && (
                <span style={{ display: 'block', fontSize: '11px', color: 'rgba(168, 85, 247, 0.7)', marginTop: '2px' }}>
                  {tagline}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Menü schließen"
              style={{
                padding: '12px',
                color: '#a855f7',
                backgroundColor: 'rgba(168, 85, 247, 0.2)',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
              }}
              className="focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
            >
              <XMarkIcon style={{ height: '28px', width: '28px' }} aria-hidden="true" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav
            aria-label="Mobile Navigation"
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            {navLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                target={item.external ? '_blank' : undefined}
                rel={item.external ? 'noopener noreferrer' : undefined}
                aria-label={item.external ? `${item.label} (öffnet in neuem Tab)` : undefined}
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '16px',
                  fontSize: '18px',
                  fontWeight: 600,
                  color: '#e9d5ff',
                  backgroundColor: 'rgba(168, 85, 247, 0.1)',
                  borderRadius: '12px',
                  border: '1px solid rgba(168, 85, 247, 0.2)',
                  textDecoration: 'none',
                }}
                className="focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                {item.label}
                {item.external && (
                  <>
                    <span style={{ marginLeft: '8px', color: '#a855f7' }} aria-hidden="true">↗</span>
                    <span className="sr-only"> (öffnet in neuem Tab)</span>
                  </>
                )}
              </Link>
            ))}
          </nav>

          {/* Footer */}
          <div
            style={{
              padding: '16px',
              borderTop: '1px solid rgba(168, 85, 247, 0.3)',
              textAlign: 'center',
              fontSize: '14px',
              color: 'rgba(168, 85, 247, 0.6)',
              flexShrink: 0,
            }}
          >
            © {new Date().getFullYear()} {siteName}
          </div>
        </div>
      )}
    </header>
  )
}