import type { LandingSection } from '@/app/api/landing-sections/route'
import Link from 'next/link'

interface CTASectionProps {
  section: LandingSection
  id: string
}

export function CTASection({ section, id }: CTASectionProps) {
  const bgStyle = section.background_color ? { backgroundColor: section.background_color } : {}
  const textStyle = section.text_color ? { color: section.text_color } : {}

  return (
    <section id={id} className="py-20 md:py-32" style={bgStyle}>
      <div className="container mx-auto px-6">
        <div 
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-900/50 via-purple-800/30 to-pink-900/50 border border-purple-500/30 p-12 md:p-20 text-center"
          style={textStyle}
        >
          {/* Decorative elements */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl" />
          
          <div className="relative z-10">
            {section.subheadline && (
              <p className="text-sm uppercase tracking-widest text-purple-400 mb-4">
                {section.subheadline}
              </p>
            )}
            
            {section.headline && (
              <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                {section.headline}
              </h2>
            )}

            {section.description && (
              <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-8">
                {section.description}
              </p>
            )}

            {/* CTAs */}
            <div className="flex flex-wrap justify-center gap-4">
              {section.cta_label && section.cta_url && (
                <Link
                  href={section.cta_url}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-purple-500/30 transition hover:shadow-purple-500/50 hover:scale-105"
                >
                  {section.cta_label}
                </Link>
              )}
              {section.secondary_cta_label && section.secondary_cta_url && (
                <Link
                  href={section.secondary_cta_url}
                  className="inline-flex items-center gap-2 rounded-full border border-purple-500/50 px-8 py-4 text-lg font-semibold text-purple-200 transition hover:border-purple-400 hover:text-white"
                >
                  {section.secondary_cta_label}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

