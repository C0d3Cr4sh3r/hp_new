import { redirect } from 'next/navigation'
import { EventHubNavigation } from '@/components/eventhub/EventHubNavigation'
import { getSessionUser } from '@/lib/session'
import { signOut } from '@/app/(eventhub)/eventhub/actions/auth'

export default async function EventHubDashboardPage() {
  const user = await getSessionUser()
  if (!user) {
    redirect('/eventhub/login')
  }

  return (
    <div className="space-y-12">
      <EventHubNavigation />
      <section className="rounded-3xl border border-slate-800 bg-slate-950/70 p-10 shadow-xl shadow-blue-900/20">
        <div className="flex flex-col gap-2 text-slate-100">
          <span className="text-sm uppercase tracking-[0.25em] text-blue-200/80">Dashboard</span>
          <h1 className="text-3xl font-semibold text-white">Hallo {user.email}</h1>
          <p className="max-w-2xl text-sm text-slate-300">
            Dieser Bereich bleibt ausschließlich für eingeloggte Nutzer:innen reserviert. Von hier
            aus kannst du Eventdaten pflegen, Inhalte koordinieren und zukünftige Module für das
            EventHub-CMS nutzen.
          </p>
        </div>
        <form action={signOut} className="mt-8">
          <button
            type="submit"
            className="inline-flex h-11 items-center rounded-full border border-slate-700 px-6 text-sm font-semibold text-slate-100 transition hover:border-red-400 hover:text-red-200"
          >
            Abmelden
          </button>
        </form>
      </section>
      <section className="grid gap-6 md:grid-cols-2">
        {[
          {
            title: 'Event-Übersicht',
            description:
              'Synchronisiere Eventdaten mit Supabase. In zukünftigen Iterationen binden wir hier Tabellen, Filter und Status-Widgets ein.',
          },
          {
            title: 'CMS-Inhalte',
            description:
              'Pflege Blogposts, News und Portfolio-Inhalte in einem geschützten Rahmen. Die Oberfläche passt sich dem neuen Design an.',
          },
          {
            title: 'Team & Rollen',
            description:
              'Verwalte Benutzer:innen, weise Rollen zu und halte Zugriffsrechte transparent und auditierbar.',
          },
          {
            title: 'Roadmap',
            description:
              'EventHub bleibt getrennt, aber vollständig integriert. Plane Features unabhängig, deploye sie zusammen.',
          },
        ].map((card) => (
          <div
            key={card.title}
            className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 text-slate-200 shadow-lg shadow-slate-950/30"
          >
            <h2 className="text-xl font-semibold text-white">{card.title}</h2>
            <p className="mt-3 text-sm leading-relaxed">{card.description}</p>
          </div>
        ))}
      </section>
    </div>
  )
}
