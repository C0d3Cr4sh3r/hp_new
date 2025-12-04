import type { LandingSection } from '@/app/api/landing-sections/route'
import { EnvelopeIcon, PhoneIcon, MapPinIcon } from '@heroicons/react/24/outline'

interface ContactSectionProps {
  section: LandingSection
  id: string
}

export function ContactSection({ section, id }: ContactSectionProps) {
  const bgStyle = section.background_color ? { backgroundColor: section.background_color } : {}
  const textStyle = section.text_color ? { color: section.text_color } : {}
  
  // Parse contact info from content JSONB
  const email = section.content?.email as string | undefined
  const phone = section.content?.phone as string | undefined
  const address = section.content?.address as string | undefined

  return (
    <section id={id} className="py-20 md:py-32" style={bgStyle}>
      <div className="container mx-auto px-6" style={textStyle}>
        <div className="grid md:grid-cols-2 gap-12 items-start max-w-5xl mx-auto">
          {/* Info */}
          <div>
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

            {/* Contact Details */}
            <div className="space-y-4">
              {email && (
                <a href={`mailto:${email}`} className="flex items-center gap-4 text-gray-300 hover:text-white transition">
                  <div className="p-3 rounded-xl bg-purple-600/20 border border-purple-500/30">
                    <EnvelopeIcon className="h-5 w-5 text-purple-400" />
                  </div>
                  <span>{email}</span>
                </a>
              )}
              {phone && (
                <a href={`tel:${phone}`} className="flex items-center gap-4 text-gray-300 hover:text-white transition">
                  <div className="p-3 rounded-xl bg-purple-600/20 border border-purple-500/30">
                    <PhoneIcon className="h-5 w-5 text-purple-400" />
                  </div>
                  <span>{phone}</span>
                </a>
              )}
              {address && (
                <div className="flex items-start gap-4 text-gray-300">
                  <div className="p-3 rounded-xl bg-purple-600/20 border border-purple-500/30">
                    <MapPinIcon className="h-5 w-5 text-purple-400" />
                  </div>
                  <span className="whitespace-pre-line">{address}</span>
                </div>
              )}
            </div>
          </div>

          {/* Contact Form Placeholder */}
          <div className="rounded-2xl border border-purple-500/20 bg-purple-950/20 p-8">
            <h3 className="text-xl font-semibold text-white mb-6">Nachricht senden</h3>
            <form className="space-y-4">
              <div>
                <label className="text-sm text-purple-300 block mb-2">Name</label>
                <input 
                  type="text" 
                  className="w-full rounded-lg border border-purple-500/30 bg-black/40 px-4 py-3 text-white placeholder-gray-500 focus:border-purple-400 focus:outline-none"
                  placeholder="Dein Name"
                />
              </div>
              <div>
                <label className="text-sm text-purple-300 block mb-2">E-Mail</label>
                <input 
                  type="email" 
                  className="w-full rounded-lg border border-purple-500/30 bg-black/40 px-4 py-3 text-white placeholder-gray-500 focus:border-purple-400 focus:outline-none"
                  placeholder="deine@email.de"
                />
              </div>
              <div>
                <label className="text-sm text-purple-300 block mb-2">Nachricht</label>
                <textarea 
                  rows={4}
                  className="w-full rounded-lg border border-purple-500/30 bg-black/40 px-4 py-3 text-white placeholder-gray-500 focus:border-purple-400 focus:outline-none resize-none"
                  placeholder="Deine Nachricht..."
                />
              </div>
              <button 
                type="submit"
                className="w-full rounded-full bg-gradient-to-r from-purple-600 to-pink-500 px-6 py-3 font-semibold text-white shadow-lg transition hover:shadow-purple-500/30"
              >
                Absenden
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}

