import type { LandingSection } from '@/app/api/landing-sections/route'
import Image from 'next/image'

interface GallerySectionProps {
  section: LandingSection
  id: string
}

interface GalleryImage {
  url: string
  alt?: string
  caption?: string
}

export function GallerySection({ section, id }: GallerySectionProps) {
  const bgStyle = section.background_color ? { backgroundColor: section.background_color } : {}
  const textStyle = section.text_color ? { color: section.text_color } : {}
  
  // Parse images from content JSONB
  const images: GalleryImage[] = Array.isArray(section.content?.images) 
    ? section.content.images 
    : []

  return (
    <section id={id} className="py-20 md:py-32" style={bgStyle}>
      <div className="container mx-auto px-6" style={textStyle}>
        {/* Header */}
        <div className="text-center mb-16">
          {section.subheadline && (
            <p className="text-sm uppercase tracking-widest text-purple-400 mb-3">
              {section.subheadline}
            </p>
          )}
          {section.headline && (
            <h2 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              {section.headline}
            </h2>
          )}
          {section.description && (
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              {section.description}
            </p>
          )}
        </div>

        {/* Gallery Grid */}
        {images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <div
                key={index}
                className="group relative aspect-square rounded-xl overflow-hidden border border-purple-500/20 transition hover:border-purple-500/40"
              >
                <Image
                  src={image.url}
                  alt={image.alt || `Gallery image ${index + 1}`}
                  fill
                  className="object-cover transition group-hover:scale-105"
                />
                {image.caption && (
                  <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition">
                    <p className="p-4 text-sm text-white">{image.caption}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        {section.cta_label && section.cta_url && (
          <div className="text-center mt-12">
            <a
              href={section.cta_url}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 px-6 py-3 font-semibold text-white shadow-lg transition hover:shadow-purple-500/30"
            >
              {section.cta_label}
            </a>
          </div>
        )}
      </div>
    </section>
  )
}

