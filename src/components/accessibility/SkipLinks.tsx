'use client'

import { useEffect, useState } from 'react'

interface SkipLink {
  id: number
  label: string
  target_id: string
  sort_order: number
}

/**
 * Skip-Links Komponente für Tastaturnavigation (WCAG 2.4.1)
 * Wird nur bei Fokus sichtbar und ermöglicht das Überspringen von Navigationsblöcken
 */
export function SkipLinks() {
  const [links, setLinks] = useState<SkipLink[]>([
    // Default-Links falls API nicht erreichbar
    { id: 1, label: 'Zum Hauptinhalt springen', target_id: 'main-content', sort_order: 1 },
    { id: 2, label: 'Zur Navigation springen', target_id: 'main-navigation', sort_order: 2 },
    { id: 3, label: 'Zum Footer springen', target_id: 'footer', sort_order: 3 },
  ])

  useEffect(() => {
    async function fetchSkipLinks() {
      try {
        const res = await fetch('/api/accessibility/skip-links')
        if (res.ok) {
          const data = await res.json()
          if (Array.isArray(data) && data.length > 0) {
            setLinks(data)
          }
        }
      } catch (error) {
        console.warn('Skip-Links konnten nicht geladen werden, verwende Defaults')
      }
    }
    fetchSkipLinks()
  }, [])

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault()
    const target = document.getElementById(targetId)
    if (target) {
      target.focus()
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <nav aria-label="Skip-Links" className="sr-only focus-within:not-sr-only fixed top-0 left-0 z-[9999]">
      {links.map((link, index) => (
        <a
          key={link.id}
          href={`#${link.target_id}`}
          onClick={(e) => handleClick(e, link.target_id)}
          className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:px-6 focus:py-4 focus:bg-purple-600 focus:text-white focus:font-semibold focus:no-underline focus:rounded-br-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-black focus:whitespace-nowrap"
          style={{ left: index === 0 ? 0 : `${index * 240}px` }}
        >
          {link.label}
        </a>
      ))}
    </nav>
  )
}

export default SkipLinks

