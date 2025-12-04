import type { Metadata } from 'next'
import Link from 'next/link'
import { DatabaseService } from '@/lib/supabase'
import { prepareLegalHtml } from '@/lib/legalContent'

const baseUrl = 'https://hp-new.vercel.app'

export const metadata: Metadata = {
  title: 'Datenschutzerklärung',
  description: 'Informationen zum Datenschutz bei ArcanePixels.',
  alternates: {
    canonical: '/datenschutz',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const revalidate = 0

export default async function DatenschutzPage() {
  const settings = await DatabaseService.getSiteSettings()
  const privacyHtml = prepareLegalHtml(settings.privacy)
  const imprintAnchor = prepareLegalHtml(settings.imprint) ? '/impressum#impressum' : undefined

  return (
    <div className="min-h-screen bg-theme-gradient text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-4xl flex-col gap-12 px-6 py-16">
        <header className="space-y-3">
          <p className="text-xs uppercase tracking-[0.35em] text-purple-300">Rechtliches</p>
          <h1 id="datenschutz" className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Datenschutzerklärung
          </h1>
          <p className="text-sm text-slate-400">
            Die Inhalte werden aus den Site Settings geladen. Aktualisiere sie im Admin-Bereich, um diese Seite zu pflegen.
          </p>
        </header>

        {privacyHtml ? (
          <section className="space-y-6 rounded-2xl border border-purple-600/30 bg-purple-900/10 p-8 text-sm leading-relaxed text-slate-200">
            <div
              className="legal-content"
              dangerouslySetInnerHTML={{ __html: privacyHtml }}
            />
          </section>
        ) : (
          <section className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-8 text-sm text-amber-200">
            Es wurde noch keine Datenschutzerklärung hinterlegt. Pfleg die Inhalte im Admin-Bereich, damit sie hier erscheinen.
          </section>
        )}

        <footer className="flex flex-wrap items-center gap-4 border-t border-slate-800 pt-6 text-sm text-slate-400">
          <Link href="/impressum" className="text-purple-300 hover:text-purple-200">
            Zum Impressum
          </Link>
          <span className="text-slate-600">|</span>
          <Link href="/" className="text-purple-300 hover:text-purple-200">
            Zur Startseite
          </Link>
          {imprintAnchor && (
            <>
              <span className="text-slate-600">|</span>
              <a className="text-purple-300 hover:text-purple-200" href={imprintAnchor}>
                Rechtliche Angaben ankern
              </a>
            </>
          )}
        </footer>
      </div>
    </div>
  )
}
