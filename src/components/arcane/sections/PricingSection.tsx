import type { LandingSection } from '@/app/api/landing-sections/route'
import Link from 'next/link'
import { CheckIcon } from '@heroicons/react/24/outline'

interface PricingSectionProps {
  section: LandingSection
  id: string
}

interface PricingPlan {
  name: string
  price: string
  period?: string
  description?: string
  features: string[]
  cta_label?: string
  cta_url?: string
  highlighted?: boolean
}

export function PricingSection({ section, id }: PricingSectionProps) {
  const bgStyle = section.background_color ? { backgroundColor: section.background_color } : {}
  const textStyle = section.text_color ? { color: section.text_color } : {}
  
  // Parse plans from content JSONB
  const plans: PricingPlan[] = Array.isArray(section.content?.plans) 
    ? section.content.plans 
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

        {/* Pricing Cards */}
        {plans.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`rounded-2xl border p-8 transition ${
                  plan.highlighted 
                    ? 'border-purple-500 bg-gradient-to-b from-purple-900/40 to-purple-950/40 scale-105 shadow-xl shadow-purple-500/20' 
                    : 'border-purple-500/20 bg-purple-950/20 hover:border-purple-500/40'
                }`}
              >
                <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                {plan.description && (
                  <p className="text-gray-400 text-sm mb-4">{plan.description}</p>
                )}
                
                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  {plan.period && (
                    <span className="text-gray-400 ml-2">/{plan.period}</span>
                  )}
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-start gap-3 text-gray-300">
                      <CheckIcon className="h-5 w-5 text-purple-400 flex-shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {plan.cta_label && plan.cta_url && (
                  <Link
                    href={plan.cta_url}
                    className={`block text-center rounded-full px-6 py-3 font-semibold transition ${
                      plan.highlighted
                        ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg hover:shadow-purple-500/30'
                        : 'border border-purple-500/50 text-purple-200 hover:border-purple-400 hover:text-white'
                    }`}
                  >
                    {plan.cta_label}
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

