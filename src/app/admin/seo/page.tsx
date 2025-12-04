import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline'

export const metadata: Metadata = {
  title: 'SEO-Übersicht',
  description: 'Übersicht über implementierte SEO-Features und -Optimierungen',
}

export default function SeoOverviewPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link
            href="/admin"
            className="text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300 font-medium"
          >
            ← Zurück zum Admin
          </Link>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-8 mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            SEO-Übersicht
          </h1>
          <p className="text-slate-600 dark:text-slate-300 text-lg">
            Hier findest du eine Übersicht aller implementierten SEO-Features für bessere Google-Rankings.
          </p>
        </div>

        {/* Implementierte Features */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center">
            <CheckCircleIcon className="w-8 h-8 text-green-500 mr-3" />
            Implementierte SEO-Features
          </h2>

          <div className="space-y-6">
            {/* Structured Data */}
            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                1. Structured Data (JSON-LD)
              </h3>
              <p className="text-slate-600 dark:text-slate-300 mb-3">
                Schema.org Markup für bessere Google-Darstellung in Suchergebnissen.
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300">
                <li>
                  <strong>Organisation Schema:</strong> Firmendetails, Logo, Kontaktinformationen
                </li>
                <li>
                  <strong>WebSite Schema:</strong> Suchfunktion und Website-Informationen
                </li>
                <li>
                  <strong>Service Schema:</strong> Angebotene Dienstleistungen (vorbereitet)
                </li>
                <li>
                  <strong>Breadcrumb Schema:</strong> Navigation (vorbereitet)
                </li>
                <li>
                  <strong>Article Schema:</strong> News-Beiträge (vorbereitet)
                </li>
              </ul>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                📍 Implementiert in: <code className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">src/lib/structuredData.ts</code> und <code className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">src/app/layout.tsx</code>
              </p>
            </div>

            {/* Canonical URLs */}
            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                2. Canonical URLs
              </h3>
              <p className="text-slate-600 dark:text-slate-300 mb-3">
                Vermeidung von Duplicate Content durch eindeutige Seiten-URLs.
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300">
                <li>Alle Seiten haben canonical-Links</li>
                <li>metadataBase in Root-Layout konfiguriert</li>
                <li>Automatische Generierung für alle Unterseiten</li>
              </ul>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                📍 Implementiert in: Alle <code className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">page.tsx</code> Dateien
              </p>
            </div>

            {/* Erweiterte Sitemap */}
            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                3. Erweiterte Sitemap
              </h3>
              <p className="text-slate-600 dark:text-slate-300 mb-3">
                Vollständige Übersicht aller Seiten für Suchmaschinen.
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300">
                <li>Alle statischen Seiten (Home, Impressum, Datenschutz, etc.)</li>
                <li>ArcanePixels-Unterseiten (News, Downloads, Bugs)</li>
                <li>EventHub-Seiten</li>
                <li>Priority und Changefrequency optimiert</li>
                <li>Vorbereitet für dynamische Inhalte aus Datenbank</li>
              </ul>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                📍 Implementiert in: <code className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">src/app/sitemap.ts</code>
              </p>
              <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
                🔗 Verfügbar unter: <a href="https://hp-new.vercel.app/sitemap.xml" target="_blank" rel="noopener noreferrer" className="underline">https://hp-new.vercel.app/sitemap.xml</a>
              </p>
            </div>

            {/* Web Manifest */}
            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                4. Web Manifest (PWA)
              </h3>
              <p className="text-slate-600 dark:text-slate-300 mb-3">
                Progressive Web App Features für Installation auf Mobilgeräten.
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300">
                <li>App-Name und Beschreibung</li>
                <li>Theme-Colors für einheitliche Darstellung</li>
                <li>Icons vorbereitet (192x192 und 512x512)</li>
                <li>Standalone-Display-Modus</li>
                <li>App-Kategorien definiert</li>
              </ul>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                📍 Implementiert in: <code className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">src/app/manifest.ts</code>
              </p>
              <p className="text-sm text-amber-600 dark:text-amber-400 mt-2">
                ⚠️ Icons müssen noch erstellt werden: <code className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">/icon-192.png</code> und <code className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">/icon-512.png</code>
              </p>
            </div>

            {/* OpenGraph & Twitter Cards */}
            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                5. OpenGraph & Twitter Cards
              </h3>
              <p className="text-slate-600 dark:text-slate-300 mb-3">
                Optimierte Darstellung beim Teilen auf Social Media.
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300">
                <li>OpenGraph-Tags für Facebook, LinkedIn, etc.</li>
                <li>Twitter Card (summary_large_image)</li>
                <li>Titel, Beschreibung und Bild-URLs</li>
                <li>Locale (de_DE) und URL angegeben</li>
              </ul>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                📍 Implementiert in: <code className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">src/app/layout.tsx</code>
              </p>
              <p className="text-sm text-amber-600 dark:text-amber-400 mt-2">
                ⚠️ OG-Image muss noch erstellt werden: <code className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">/og-image.jpg</code> (1200x630px)
              </p>
            </div>

            {/* Robots & Meta Tags */}
            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                6. Robots & Meta-Tags
              </h3>
              <p className="text-slate-600 dark:text-slate-300 mb-3">
                Optimale Crawler-Steuerung und Meta-Informationen.
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300">
                <li>robots.txt mit korrekten Regeln</li>
                <li>Meta-Tags: index, follow für alle wichtigen Seiten</li>
                <li>Google-Bot Spezifikationen (max-image-preview, max-snippet)</li>
                <li>Keywords auf allen Seiten</li>
                <li>Autor- und Creator-Informationen</li>
              </ul>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                📍 Implementiert in: <code className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">src/app/robots.ts</code> und alle Seiten
              </p>
            </div>

            {/* Performance Features */}
            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                7. Performance-Optimierungen
              </h3>
              <p className="text-slate-600 dark:text-slate-300 mb-3">
                Schnellere Ladezeiten durch Preloading und Optimierungen.
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300">
                <li>Preconnect zu Google Fonts</li>
                <li>Next.js Image-Optimierung aktiviert</li>
                <li>Font-Subsetting (nur Latin)</li>
                <li>Scroll-smooth für bessere UX</li>
              </ul>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                📍 Implementiert in: <code className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">src/app/layout.tsx</code> und <code className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">next.config.ts</code>
              </p>
            </div>
          </div>
        </div>

        {/* Nächste Schritte */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center">
            <InformationCircleIcon className="w-8 h-8 text-blue-500 mr-3" />
            Nächste Schritte
          </h2>
          
          <div className="space-y-4 text-slate-700 dark:text-slate-300">
            <div>
              <h3 className="font-semibold text-lg mb-2">1. Bilder erstellen</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><code className="bg-white dark:bg-slate-800 px-2 py-1 rounded">/public/icon-192.png</code> - 192x192px App-Icon</li>
                <li><code className="bg-white dark:bg-slate-800 px-2 py-1 rounded">/public/icon-512.png</code> - 512x512px App-Icon</li>
                <li><code className="bg-white dark:bg-slate-800 px-2 py-1 rounded">/public/og-image.jpg</code> - 1200x630px Social Media Vorschaubild</li>
                <li><code className="bg-white dark:bg-slate-800 px-2 py-1 rounded">/public/logo.png</code> - Firmenlogo für Schema.org</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">2. Google Search Console einrichten</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Website bei <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline">Google Search Console</a> anmelden</li>
                <li>Verification-Code im Layout hinzufügen (metadata.verification.google)</li>
                <li>Sitemap manuell einreichen: <code className="bg-white dark:bg-slate-800 px-2 py-1 rounded">https://hp-new.vercel.app/sitemap.xml</code></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">3. Structured Data testen</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Google Rich Results Test: <a href="https://search.google.com/test/rich-results" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline">https://search.google.com/test/rich-results</a></li>
                <li>Schema Markup Validator: <a href="https://validator.schema.org/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline">https://validator.schema.org/</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">4. Performance testen</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Google PageSpeed Insights: <a href="https://pagespeed.web.dev/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline">https://pagespeed.web.dev/</a></li>
                <li>Lighthouse in Chrome DevTools ausführen</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">5. Soziale Netzwerke verknüpfen</h3>
              <p className="ml-4">
                Füge deine Social-Media-Links im <code className="bg-white dark:bg-slate-800 px-2 py-1 rounded">layout.tsx</code> zum <code className="bg-white dark:bg-slate-800 px-2 py-1 rounded">organizationSchema</code> hinzu (sameAs-Array).
              </p>
            </div>
          </div>
        </div>

        {/* Tools & Ressourcen */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
            Nützliche SEO-Tools
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-3">Google Tools</h3>
              <ul className="space-y-2 text-slate-600 dark:text-slate-300">
                <li>
                  <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer" className="text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300 underline">
                    Google Search Console
                  </a> - Monitoring & Indexierung
                </li>
                <li>
                  <a href="https://pagespeed.web.dev/" target="_blank" rel="noopener noreferrer" className="text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300 underline">
                    PageSpeed Insights
                  </a> - Performance-Analyse
                </li>
                <li>
                  <a href="https://search.google.com/test/rich-results" target="_blank" rel="noopener noreferrer" className="text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300 underline">
                    Rich Results Test
                  </a> - Structured Data Test
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-3">Weitere Tools</h3>
              <ul className="space-y-2 text-slate-600 dark:text-slate-300">
                <li>
                  <a href="https://validator.schema.org/" target="_blank" rel="noopener noreferrer" className="text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300 underline">
                    Schema.org Validator
                  </a> - Schema Markup prüfen
                </li>
                <li>
                  <a href="https://cards-dev.twitter.com/validator" target="_blank" rel="noopener noreferrer" className="text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300 underline">
                    Twitter Card Validator
                  </a> - Twitter Cards testen
                </li>
                <li>
                  <a href="https://www.opengraph.xyz/" target="_blank" rel="noopener noreferrer" className="text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300 underline">
                    OpenGraph Debugger
                  </a> - OG-Tags prüfen
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
