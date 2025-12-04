import type { LandingSection } from '@/app/api/landing-sections/route'
import { CheckCircleIcon, SparklesIcon, RocketLaunchIcon, ShieldCheckIcon, CubeIcon, BoltIcon } from '@heroicons/react/24/outline'

interface FeaturesSectionProps {
  section: LandingSection
  id: string
}

// Icon mapping for features
const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  check: CheckCircleIcon,
  sparkles: SparklesIcon,
  rocket: RocketLaunchIcon,
  shield: ShieldCheckIcon,
  cube: CubeIcon,
  bolt: BoltIcon,
}

interface Feature {
  title: string
  description?: string
  icon?: string
}

export function FeaturesSection({ section, id }: FeaturesSectionProps) {
  const bgStyle = section.background_color ? { backgroundColor: section.background_color } : {}
  const textStyle = section.text_color ? { color: section.text_color } : {}
  
  // Parse features from content JSONB
  const features: Feature[] = Array.isArray(section.content?.features) 
    ? section.content.features 
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

        {/* Features Grid */}
        {features.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const IconComponent = ICONS[feature.icon || 'check'] || CheckCircleIcon
              return (
                <div
                  key={index}
                  className="group rounded-2xl border border-purple-500/20 bg-purple-950/20 p-6 transition hover:border-purple-500/40 hover:bg-purple-950/40"
                >
                  <div className="mb-4 inline-flex rounded-xl bg-gradient-to-br from-purple-600/20 to-pink-600/20 p-3">
                    <IconComponent className="h-6 w-6 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                  {feature.description && (
                    <p className="text-gray-400">{feature.description}</p>
                  )}
                </div>
              )
            })}
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

