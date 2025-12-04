import type { Metadata } from 'next'
import Link from 'next/link'
import { DatabaseService } from '@/lib/supabase'
import { prepareLegalHtml } from '@/lib/legalContent'

const baseUrl = 'https://hp-new.vercel.app'

export const metadata: Metadata = {
  title: 'Impressum',
  description: 'Impressum und Kontaktinformationen von ArcanePixels.',
  alternates: {
    canonical: '/impressum',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const revalidate = 0

export default async function ImpressumPage() {
  const settings = await DatabaseService.getSiteSettings()
  const imprintHtml = prepareLegalHtml(settings.imprint)
  const supportEmail = (settings.support_email ?? '').trim()

  return (
    <div className="min-h-screen bg-theme-gradient text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-4xl flex-col gap-12 px-6 py-16">
        <header className="space-y-3">
          <p className="text-xs uppercase tracking-[0.35em] text-purple-300">Rechtliches</p>
          <h1 id="impressum" className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Impressum
          </h1>
          <p className="text-sm text-slate-400">
            Diese Angaben stammen aus den aktuellen Site Settings. Du kannst sie jederzeit im Admin-Bereich
            unter „Website Einstellungen&quot; aktualisieren.
          </p>
        </header>

        {imprintHtml ? (
          <section className="space-y-6 rounded-2xl border border-purple-600/30 bg-purple-900/10 p-8 text-sm leading-relaxed text-slate-200">
            <div
              className="legal-content"
              dangerouslySetInnerHTML={{ __html: imprintHtml }}
            />
          </section>
        ) : (
          <section className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-8 text-sm text-amber-200">
            Es wurde noch kein Impressum hinterlegt. Trage die rechtlichen Angaben im Admin-Bereich ein, damit
            sie hier sichtbar werden.
          </section>
        )}

        <footer className="flex flex-wrap items-center gap-4 border-t border-slate-800 pt-6 text-sm text-slate-400">
          {supportEmail && (
            <span>
              Support: <a className="text-purple-300 hover:text-purple-200" href={`mailto:${supportEmail}`}>{supportEmail}</a>
            </span>
          )}
          <span className="text-slate-600">|</span>
          <Link href="/datenschutz" className="text-purple-300 hover:text-purple-200">
            Zur Datenschutzerklärung
          </Link>
          <span className="text-slate-600">|</span>
          <Link href="/" className="text-purple-300 hover:text-purple-200">
            Zur Startseite
          </Link>
        </footer>
      </div>
    </div>
  )
}
