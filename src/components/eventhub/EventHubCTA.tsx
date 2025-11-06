import Link from 'next/link'

export function EventHubCTA() {
  return (
    <section className="mt-24 rounded-3xl border border-blue-500/40 bg-gradient-to-br from-blue-700/40 via-indigo-800/40 to-slate-900/60 p-10 text-center shadow-2xl">
      <h3 className="text-3xl font-semibold text-white">Bereit für die geschützte Arbeitszone?</h3>
      <p className="mt-4 text-base md:text-lg text-slate-200 max-w-3xl mx-auto">
        EventHub ergänzt ArcanePixels mit Login, Dashboard und CMS-Funktionen. Richte Benutzer:innen
        ein, teile Rollen zu und halte deine Eventorganisation direkt im Projekt aktuell.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Link
          href="/eventhub/login"
          className="inline-flex h-12 items-center rounded-full bg-blue-500 px-8 text-sm font-semibold text-white shadow-lg shadow-blue-700/40 transition hover:bg-blue-400"
        >
          Login öffnen
        </Link>
        <Link
          href="/"
          className="inline-flex h-12 items-center rounded-full border border-slate-600 px-8 text-sm font-semibold text-slate-100 transition hover:border-blue-400 hover:text-blue-200"
        >
          Zur Hauptseite
        </Link>
      </div>
    </section>
  )
}
