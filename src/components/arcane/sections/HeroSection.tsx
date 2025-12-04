import type { LandingSection } from '@/app/api/landing-sections/route'
import Link from 'next/link'
import Image from 'next/image'

interface HeroSectionProps {
  section: LandingSection
  id: string
}

export function HeroSection({ section, id }: HeroSectionProps) {
  const bgStyle = section.background_color ? { backgroundColor: section.background_color } : {}
  const textStyle = section.text_color ? { color: section.text_color } : {}

  return (
    <section
      id={id}
      className="relative min-h-[80vh] flex items-center justify-center overflow-hidden"
      style={bgStyle}
    >
      {/* Background Image */}
      {section.image_url && section.image_position === 'background' && (
        <div className="absolute inset-0 z-0">
          <Image
            src={section.image_url}
            alt={section.image_alt || ''}
            fill
            className="object-cover opacity-30"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
        </div>
      )}

      <div className="relative z-10 container mx-auto px-6 py-20 text-center" style={textStyle}>
        {section.subheadline && (
          <p className="text-sm md:text-base uppercase tracking-widest text-purple-400 mb-4">
            {section.subheadline}
          </p>
        )}
        
        {section.headline && (
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
            {section.headline}
          </h1>
        )}

        {section.description && (
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-8">
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
    </section>
  )
}

