'use client'

import {
  LockClosedIcon,
  ClipboardDocumentListIcon,
  UsersIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline'

const cards = [
  {
    icon: LockClosedIcon,
    title: 'Gesicherte Arbeitsbereiche',
    description:
      'Der Login schützt sensible Dashboards. Supabase Auth verwaltet Sessions und Rollen.',
  },
  {
    icon: ClipboardDocumentListIcon,
    title: 'CMS & Planung',
    description:
      'Behalte News, Content und Eventplanung separat organisiert, aber weiterhin im selben Projekt.',
  },
  {
    icon: UsersIcon,
    title: 'Teamzugänge',
    description:
      'Weise Admin- und Editorrollen zu und halte ArcanePixels und EventHub klar getrennt.',
  },
]

export function EventHubSection() {
  // Use external EventHub URL when provided via env var, fallback to internal routes
  const eventHubBase = process.env.NEXT_PUBLIC_EVENTHUB_URL ?? ''
  const buildHref = (path: string) => (eventHubBase ? `${eventHubBase.replace(/\/$/, '')}${path}` : path)

  const navigate = (href: string) => {
    window.location.href = href
  }

  return (
    <section className="py-20 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-14 space-y-4">
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-500/40 bg-blue-900/30 px-4 py-2 text-xs uppercase tracking-[0.3em] text-blue-200">
            EventHub Bereich
          </span>
          <h2 className="text-4xl md:text-5xl font-bold">EventHub – Organisieren, sichern, publizieren</h2>
          <p className="text-lg text-blue-100 max-w-3xl mx-auto">
            EventHub bleibt als eigener Bereich bestehen, ist aber über Navigation und Supabase eng mit
            ArcanePixels vernetzt. Mit Login, Dashboard und CMS-Funktionen hältst du Projekte im Blick.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <button
              onClick={() => navigate(buildHref('/eventhub'))}
              className="inline-flex h-12 items-center rounded-full bg-blue-500 px-8 text-sm font-semibold text-white shadow-lg shadow-blue-700/40 transition hover:bg-blue-400"
            >
              Bereich öffnen
            </button>
            <button
              onClick={() => navigate(buildHref('/eventhub/login'))}
              className="inline-flex h-12 items-center rounded-full border border-blue-500/60 px-8 text-sm font-semibold text-blue-100 transition hover:border-blue-300 hover:text-blue-200"
            >
              Direkt zum Login
            </button>
          </div>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {cards.map((card) => (
            <div
              key={card.title}
              className="group rounded-3xl border border-blue-500/30 bg-slate-950/60 p-6 shadow-xl shadow-blue-900/20 transition hover:border-blue-300 hover:bg-slate-950/90 hover:shadow-2xl"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/20 text-blue-200">
                <card.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-xl font-semibold text-white">{card.title}</h3>
              <p className="mt-3 text-sm text-blue-100 leading-relaxed">{card.description}</p>
              <button
                onClick={() => navigate(buildHref('/eventhub'))}
                className="mt-5 inline-flex items-center text-sm font-medium text-blue-200 transition hover:text-white"
              >
                Mehr erfahren
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
