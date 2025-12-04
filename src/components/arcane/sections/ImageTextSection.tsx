import type { LandingSection } from '@/app/api/landing-sections/route'
import Image from 'next/image'
import Link from 'next/link'

interface ImageTextSectionProps {
  section: LandingSection
  id: string
}

export function ImageTextSection({ section, id }: ImageTextSectionProps) {
  const bgStyle = section.background_color ? { backgroundColor: section.background_color } : {}
  const textStyle = section.text_color ? { color: section.text_color } : {}
  const imageOnLeft = section.image_position === 'left'

  return (
    <section id={id} className="py-20 md:py-32" style={bgStyle}>
      <div className="container mx-auto px-6">
        <div className={`grid md:grid-cols-2 gap-12 items-center ${imageOnLeft ? '' : 'md:flex-row-reverse'}`}>
          {/* Image */}
          {section.image_url && (
            <div className={`relative ${imageOnLeft ? 'md:order-1' : 'md:order-2'}`}>
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-purple-500/20">
                <Image
                  src={section.image_url}
                  alt={section.image_alt || section.headline || ''}
                  fill
                  className="object-cover"
                />
              </div>
              {/* Decorative glow */}
              <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-3xl blur-2xl -z-10" />
            </div>
          )}

          {/* Content */}
          <div className={`${imageOnLeft ? 'md:order-2' : 'md:order-1'}`} style={textStyle}>
            {section.subheadline && (
              <p className="text-sm uppercase tracking-widest text-purple-400 mb-3">
                {section.subheadline}
              </p>
            )}
            
            {section.headline && (
              <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                {section.headline}
              </h2>
            )}

            {section.description && (
              <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                {section.description}
              </p>
            )}

            {/* Bullets from content */}
            {Array.isArray(section.content?.bullets) && section.content.bullets.length > 0 && (
              <ul className="space-y-3 mb-8">
                {section.content.bullets.map((bullet: string, index: number) => (
                  <li key={index} className="flex items-start gap-3 text-gray-300">
                    <span className="mt-1.5 h-2 w-2 rounded-full bg-purple-500 flex-shrink-0" />
                    {bullet}
                  </li>
                ))}
              </ul>
            )}

            {/* CTAs */}
            <div className="flex flex-wrap gap-4">
              {section.cta_label && section.cta_url && (
                <Link
                  href={section.cta_url}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 px-6 py-3 font-semibold text-white shadow-lg transition hover:shadow-purple-500/30"
                >
                  {section.cta_label}
                </Link>
              )}
              {section.secondary_cta_label && section.secondary_cta_url && (
                <Link
                  href={section.secondary_cta_url}
                  className="inline-flex items-center gap-2 rounded-full border border-purple-500/50 px-6 py-3 font-semibold text-purple-200 transition hover:border-purple-400"
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

