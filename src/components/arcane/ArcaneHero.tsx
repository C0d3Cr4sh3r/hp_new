import Link from 'next/link'
import { unstable_noStore as noStore } from 'next/cache'
import { DatabaseService } from '@/lib/supabase'

const normalize = (value?: string | null) => value?.trim() ?? ''
const isInternalUrl = (url: string) => url.startsWith('/') || url.startsWith('#')

export default async function ArcaneHero() {
  noStore()

  let settings
  try {
    settings = await DatabaseService.getSiteSettings()
    console.log('ArcaneHero loaded settings:', JSON.stringify(settings, null, 2))
  } catch (error) {
    console.error('ArcaneHero failed to load settings:', error)
    // Return empty hero if settings can't be loaded
    return (
      <section className="relative py-24 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 to-pink-900/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-purple-300">Einstellungen konnten nicht geladen werden.</p>
          </div>
        </div>
      </section>
    )
  }

  const heroTitle = normalize(settings.hero_title)
  const heroSubtitle = normalize(settings.hero_subtitle)
  const heroDescription = normalize(settings.hero_description)

  const primaryLabel = normalize(settings.hero_primary_cta_label)
  const primaryUrl = normalize(settings.hero_primary_cta_url)
  const secondaryLabel = normalize(settings.hero_secondary_cta_label)
  const secondaryUrl = normalize(settings.hero_secondary_cta_url)

  const hasPrimaryCta = Boolean(primaryLabel && primaryUrl)
  const hasSecondaryCta = Boolean(secondaryLabel && secondaryUrl)

  return (
    <section className="relative py-24 lg:py-32">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 to-pink-900/20" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {heroTitle && (
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold">
              <span
                className="block"
                style={{
                  background: 'linear-gradient(to right, var(--theme-primary, #a855f7), var(--theme-accent, #ec4899))',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  color: 'transparent',
                }}
              >
                {heroTitle}
              </span>
            </h1>
          )}

          {heroSubtitle && (
            <p className="mt-6 text-xl sm:text-2xl text-purple-200 max-w-3xl mx-auto">
              {heroSubtitle}
            </p>
          )}

          {heroDescription && (
            <p className="mt-4 text-lg text-purple-300 max-w-2xl mx-auto">
              {heroDescription}
            </p>
          )}

          {(hasPrimaryCta || hasSecondaryCta) && (
            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-4">
              {hasPrimaryCta && (
                isInternalUrl(primaryUrl) ? (
                  <Link
                    href={primaryUrl}
                    className="rounded-md bg-theme-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                  >
                    {primaryLabel}
                  </Link>
                ) : (
                  <a
                    href={primaryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-md bg-theme-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                  >
                    {primaryLabel}
                  </a>
                )
              )}

              {hasSecondaryCta && (
                isInternalUrl(secondaryUrl) ? (
                  <Link
                    href={secondaryUrl}
                    className="text-sm font-semibold leading-6 text-purple-300 transition-colors hover:text-purple-100"
                  >
                    {secondaryLabel}
                  </Link>
                ) : (
                  <a
                    href={secondaryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold leading-6 text-purple-300 transition-colors hover:text-purple-100"
                  >
                    {secondaryLabel}
                  </a>
                )
              )}
            </div>
          )}
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
      <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
      <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000" />
    </section>
  )
}