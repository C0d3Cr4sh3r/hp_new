import type { LandingSection } from '@/app/api/landing-sections/route'
import Image from 'next/image'

interface TestimonialsSectionProps {
  section: LandingSection
  id: string
}

interface Testimonial {
  quote: string
  author: string
  role?: string
  company?: string
  avatar?: string
}

export function TestimonialsSection({ section, id }: TestimonialsSectionProps) {
  const bgStyle = section.background_color ? { backgroundColor: section.background_color } : {}
  const textStyle = section.text_color ? { color: section.text_color } : {}
  
  // Parse testimonials from content JSONB
  const testimonials: Testimonial[] = Array.isArray(section.content?.testimonials) 
    ? section.content.testimonials 
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

        {/* Testimonials Grid */}
        {testimonials.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="rounded-2xl border border-purple-500/20 bg-purple-950/20 p-6 transition hover:border-purple-500/40"
              >
                {/* Quote */}
                <blockquote className="text-gray-300 mb-6 leading-relaxed">
                  &ldquo;{testimonial.quote}&rdquo;
                </blockquote>
                
                {/* Author */}
                <div className="flex items-center gap-4">
                  {testimonial.avatar ? (
                    <div className="relative h-12 w-12 rounded-full overflow-hidden border border-purple-500/30">
                      <Image
                        src={testimonial.avatar}
                        alt={testimonial.author}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center text-white font-bold">
                      {testimonial.author.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-white">{testimonial.author}</p>
                    {(testimonial.role || testimonial.company) && (
                      <p className="text-sm text-gray-400">
                        {testimonial.role}{testimonial.role && testimonial.company && ' · '}{testimonial.company}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

