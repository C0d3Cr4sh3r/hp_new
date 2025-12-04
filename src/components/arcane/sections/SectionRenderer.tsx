import type { LandingSection } from '@/app/api/landing-sections/route'
import { HeroSection } from './HeroSection'
import { FeaturesSection } from './FeaturesSection'
import { CTASection } from './CTASection'
import { ImageTextSection } from './ImageTextSection'
import { GallerySection } from './GallerySection'
import { TestimonialsSection } from './TestimonialsSection'
import { PricingSection } from './PricingSection'
import { FAQSection } from './FAQSection'
import { ContactSection } from './ContactSection'
import { CustomSection } from './CustomSection'

interface SectionRendererProps {
  section: LandingSection
}

export function SectionRenderer({ section }: SectionRendererProps) {
  if (!section.is_active) return null

  const sectionId = `section-${section.section_key}`
  
  switch (section.section_type) {
    case 'hero':
      return <HeroSection key={section.id} section={section} id={sectionId} />
    case 'features':
      return <FeaturesSection key={section.id} section={section} id={sectionId} />
    case 'cta':
      return <CTASection key={section.id} section={section} id={sectionId} />
    case 'image-text':
      return <ImageTextSection key={section.id} section={section} id={sectionId} />
    case 'gallery':
      return <GallerySection key={section.id} section={section} id={sectionId} />
    case 'testimonials':
      return <TestimonialsSection key={section.id} section={section} id={sectionId} />
    case 'pricing':
      return <PricingSection key={section.id} section={section} id={sectionId} />
    case 'faq':
      return <FAQSection key={section.id} section={section} id={sectionId} />
    case 'contact':
      return <ContactSection key={section.id} section={section} id={sectionId} />
    case 'custom':
    default:
      return <CustomSection key={section.id} section={section} id={sectionId} />
  }
}

