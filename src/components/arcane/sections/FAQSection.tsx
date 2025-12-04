'use client'

import { useState } from 'react'
import type { LandingSection } from '@/app/api/landing-sections/route'
import { ChevronDownIcon } from '@heroicons/react/24/outline'

interface FAQSectionProps {
  section: LandingSection
  id: string
}

interface FAQItem {
  question: string
  answer: string
}

export function FAQSection({ section, id }: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  
  const bgStyle = section.background_color ? { backgroundColor: section.background_color } : {}
  const textStyle = section.text_color ? { color: section.text_color } : {}
  
  // Parse FAQs from content JSONB
  const faqs: FAQItem[] = Array.isArray(section.content?.faqs) 
    ? section.content.faqs 
    : []

  return (
    <section id={id} className="py-20 md:py-32" style={bgStyle}>
      <div className="container mx-auto px-6 max-w-4xl" style={textStyle}>
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

        {/* FAQ Accordion */}
        {faqs.length > 0 && (
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="rounded-xl border border-purple-500/20 bg-purple-950/20 overflow-hidden"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full flex items-center justify-between p-6 text-left transition hover:bg-purple-950/40"
                >
                  <span className="font-semibold text-white pr-4">{faq.question}</span>
                  <ChevronDownIcon 
                    className={`h-5 w-5 text-purple-400 flex-shrink-0 transition-transform ${
                      openIndex === index ? 'rotate-180' : ''
                    }`} 
                  />
                </button>
                {openIndex === index && (
                  <div className="px-6 pb-6 text-gray-300 leading-relaxed">
                    {faq.answer}
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

