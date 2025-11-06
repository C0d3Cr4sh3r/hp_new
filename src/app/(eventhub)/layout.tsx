import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'EventHub – Eventverwaltung & CMS',
  description:
    'EventHub bündelt Eventverwaltung, CMS-Funktionen und geschützte Arbeitsbereiche für dein Team.',
  keywords: ['EventHub', 'Events', 'CMS', 'TFP', 'Management'],
}

export default function EventHubLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-slate-950 to-indigo-900 text-white">
      <div className="container mx-auto px-4 py-8">{children}</div>
    </div>
  )
}
