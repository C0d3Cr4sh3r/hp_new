import {
  ShieldCheckIcon,
  ServerStackIcon,
  UsersIcon,
  CommandLineIcon,
  DocumentDuplicateIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline'

const features = [
  {
    icon: ShieldCheckIcon,
    title: 'Geschützte Bereiche',
    description:
      'Supabase Auth mit Session-Cookies sorgt dafür, dass sensible Dashboards und Admin-Funktionen nur nach Login sichtbar sind.',
  },
  {
    icon: UsersIcon,
    title: 'Team-Collaboration',
    description:
      'Rechtemanagement für Fotograf:innen, Models und Admins – perfekt abgestimmt auf den ArcanePixels Workflow.',
  },
  {
    icon: ServerStackIcon,
    title: 'Supabase Integration',
    description:
      'Direkte Verbindung zu Events, Projekten und Benutzerprofilen. Daten bleiben synchron mit dem ArcanePixels-Ökosystem.',
  },
  {
    icon: CommandLineIcon,
    title: 'Server Actions',
    description:
      'Login, Logout und Datenmutationen laufen über moderne Next.js Server Actions – schnell, sicher und testbar.',
  },
  {
    icon: DocumentDuplicateIcon,
    title: 'CMS-Fokus',
    description:
      'Content Blocks, News und Planungslisten behalten eigene Workflows, bleiben aber gestalterisch im neuen Designrahmen.',
  },
  {
    icon: ArrowPathIcon,
    title: 'Getrennt & verbunden',
    description:
      'EventHub bleibt ein eigenständiger Bereich, ist aber über Navigation, Deployments und Supabase mit ArcanePixels verbunden.',
  },
]

export function EventHubFeatures() {
  return (
    <section id="features" className="mt-20 space-y-12">
      <div className="text-center space-y-4">
        <h2 className="text-3xl md:text-4xl font-bold text-white">Was EventHub auszeichnet</h2>
        <p className="text-base md:text-lg text-slate-200 max-w-3xl mx-auto">
          Der EventHub-Bereich übernimmt Login, Dashboard und organisatorische Tools. Alles bleibt
          getrennt, aber fügt sich optisch in die neue Markenwelt ein.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="group rounded-2xl border border-slate-800 bg-slate-900/60 p-6 transition hover:border-blue-400/60 hover:bg-slate-900/90 hover:shadow-xl hover:shadow-blue-500/10"
          >
            <feature.icon className="h-8 w-8 text-blue-300" />
            <h3 className="mt-4 text-xl font-semibold text-white">{feature.title}</h3>
            <p className="mt-3 text-sm text-slate-300 leading-relaxed">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
