import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ArcanePixels - Digital Art & Photography',
  description: 'Professional photography services and digital art portfolio. Specializing in TFP-Manager app development and creative visual solutions.',
  keywords: 'photography, digital art, TFP, portfolio, creative, professional photos',
}

export default function ArcaneLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* ArcanePixels spezifisches Layout */}
      <div className="container mx-auto px-4">
        {children}
      </div>
    </div>
  )
}