import Link from 'next/link'

export function EventHubHero() {
  return (
    <section className="mt-12 grid gap-10 lg:grid-cols-[1.2fr_1fr] items-center">
      <div className="space-y-6">
        <span className="inline-flex items-center gap-2 rounded-full border border-blue-500/40 bg-blue-900/30 px-4 py-2 text-xs uppercase tracking-[0.3em] text-blue-200">
          Event Management
        </span>
        <h1 className="text-4xl md:text-5xl font-bold leading-tight text-white">
          EventHub bündelt CMS, Teamwork und sichere Bereiche in einer Oberfläche
        </h1>
        <p className="text-lg text-slate-200 max-w-2xl">
          Verwalte Events, veröffentliche Inhalte und arbeite mit deinem Team – dank Supabase-Auth
          und Next.js App Router sicher und in Echtzeit. EventHub ergänzt ArcanePixels als
          dedizierte Plattform für organisatorische Aufgaben.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/eventhub/login"
            className="inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-500"
          >
            Zum Login
          </Link>
          <Link
            href="/eventhub/dashboard"
            className="inline-flex items-center justify-center rounded-full border border-slate-700 px-6 py-3 text-sm font-semibold text-slate-100 transition hover:border-blue-400 hover:text-blue-200"
          >
            Dashboard ansehen
          </Link>
        </div>
      </div>
      <div className="relative overflow-hidden rounded-3xl border border-blue-500/30 bg-slate-900/70 p-8 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-indigo-500/10 to-transparent" />
        <div className="relative space-y-6 text-slate-100">
          <h2 className="text-xl font-semibold">Security Snapshot</h2>
          <ul className="space-y-3 text-sm text-slate-200">
            <li>• Supabase Auth mit geschützten Cookies</li>
            <li>• Server Actions für Login, Logout und Sessions</li>
            <li>• Rollenbasierte Bereiche für Administrator:innen</li>
            <li>• Separater Arbeitsbereich neben ArcanePixels</li>
          </ul>
          <p className="text-xs text-slate-400">
            Alle Komponenten werden visuell an den aktuellen Auftritt angepasst und bleiben dennoch
            klar vom ArcanePixels-Bereich getrennt.
          </p>
        </div>
      </div>
    </section>
  )
}
