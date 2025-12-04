import type { LandingSection } from '@/app/api/landing-sections/route'
import Image from 'next/image'
import Link from 'next/link'

interface CustomSectionProps {
  section: LandingSection
  id: string
}

export function CustomSection({ section, id }: CustomSectionProps) {
  const bgStyle = section.background_color ? { backgroundColor: section.background_color } : {}
  const textStyle = section.text_color ? { color: section.text_color } : {}
  
  // Custom HTML content from JSONB
  const htmlContent = section.content?.html as string | undefined

  return (
    <section id={id} className="py-20 md:py-32" style={bgStyle}>
      <div className="container mx-auto px-6" style={textStyle}>
        {/* Standard Layout */}
        <div className="max-w-4xl mx-auto text-center">
          {section.subheadline && (
            <p className="text-sm uppercase tracking-widest text-purple-400 mb-3">
              {section.subheadline}
            </p>
          )}
          
          {section.headline && (
            <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              {section.headline}
            </h2>
          )}

          {section.description && (
            <p className="text-lg text-gray-300 mb-8 leading-relaxed">
              {section.description}
            </p>
          )}

          {/* Image */}
          {section.image_url && section.image_position !== 'background' && (
            <div className="relative aspect-video rounded-2xl overflow-hidden border border-purple-500/20 mb-8">
              <Image
                src={section.image_url}
                alt={section.image_alt || section.headline || ''}
                fill
                className="object-cover"
              />
            </div>
          )}

          {/* Custom HTML Content */}
          {htmlContent && (
            <div 
              className="prose prose-invert prose-purple max-w-none mb-8"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
          )}

          {/* CTAs */}
          <div className="flex flex-wrap justify-center gap-4">
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
    </section>
  )
}

