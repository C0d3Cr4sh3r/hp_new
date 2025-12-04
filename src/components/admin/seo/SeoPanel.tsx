'use client'

import { useRouter } from 'next/navigation'
import {
  AdjustmentsHorizontalIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'

export function SeoPanel() {
  const router = useRouter()
  
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">SEO-Übersicht</h2>
          <p className="text-sm text-purple-200">
            Detaillierte Dokumentation aller implementierten SEO-Features und Tools.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-purple-600/30 bg-purple-950/40 p-8">
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <CheckCircleIcon className="h-8 w-8 flex-shrink-0 text-green-500" />
            <div>
              <h3 className="text-lg font-semibold text-white">Alle SEO-Features wurden implementiert</h3>
              <p className="mt-2 text-sm text-purple-200">
                Die Webseite verfügt jetzt über Structured Data (JSON-LD), Canonical URLs, erweiterte Sitemap,
                Web Manifest, Twitter Cards und optimierte Meta-Tags für bessere Google-Rankings.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-4">
              <h4 className="text-sm font-semibold text-green-100">Structured Data</h4>
              <p className="mt-1 text-xs text-green-200/80">
                Organisation, WebSite, Service, Breadcrumb und Article Schema.org Markup
              </p>
            </div>
            <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-4">
              <h4 className="text-sm font-semibold text-green-100">Canonical URLs</h4>
              <p className="mt-1 text-xs text-green-200/80">
                Alle Seiten haben eindeutige canonical-Links
              </p>
            </div>
            <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-4">
              <h4 className="text-sm font-semibold text-green-100">Erweiterte Sitemap</h4>
              <p className="mt-1 text-xs text-green-200/80">
                Alle statischen und ArcanePixels/EventHub-Seiten
              </p>
            </div>
            <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-4">
              <h4 className="text-sm font-semibold text-green-100">Web Manifest</h4>
              <p className="mt-1 text-xs text-green-200/80">
                PWA-Features für Mobile-Installation
              </p>
            </div>
            <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-4">
              <h4 className="text-sm font-semibold text-green-100">Social Media Tags</h4>
              <p className="mt-1 text-xs text-green-200/80">
                OpenGraph und Twitter Card Optimierung
              </p>
            </div>
            <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-4">
              <h4 className="text-sm font-semibold text-green-100">Performance</h4>
              <p className="mt-1 text-xs text-green-200/80">
                Preloading und Image-Optimierung
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => router.push('/admin/seo')}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:from-purple-500 hover:to-pink-400"
            >
              <AdjustmentsHorizontalIcon className="h-5 w-5" />
              Vollständige SEO-Dokumentation öffnen
            </button>
            <a
              href="https://search.google.com/search-console"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-purple-500/40 px-5 py-3 text-sm font-semibold text-purple-200 transition hover:border-purple-300 hover:text-white"
            >
              Google Search Console
            </a>
            <a
              href="https://pagespeed.web.dev/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-purple-500/40 px-5 py-3 text-sm font-semibold text-purple-200 transition hover:border-purple-300 hover:text-white"
            >
              PageSpeed Insights
            </a>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6">
        <div className="flex items-start gap-4">
          <ExclamationTriangleIcon className="h-6 w-6 flex-shrink-0 text-amber-400" />
          <div>
            <h3 className="text-lg font-semibold text-amber-100">Nächste Schritte</h3>
            <ul className="mt-3 space-y-2 text-sm text-amber-200/90">
              <li>• Erstelle die fehlenden Bilder: /icon-192.png, /icon-512.png, /og-image.jpg, /logo.png</li>
              <li>• Melde die Website bei Google Search Console an</li>
              <li>• Teste Structured Data mit dem Google Rich Results Test</li>
              <li>• Prüfe Performance mit PageSpeed Insights</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

