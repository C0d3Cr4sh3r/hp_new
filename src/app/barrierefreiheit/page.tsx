import { Metadata } from 'next'
import ArcaneNavigation from '@/components/arcane/ArcaneNavigation'
import ArcaneFooter from '@/components/arcane/ArcaneFooter'
import { AccessibilityStatementContent } from './AccessibilityStatementContent'

export const metadata: Metadata = {
  title: 'Barrierefreiheitserklärung | ArcanePixels',
  description: 'Erklärung zur Barrierefreiheit gemäß BFSG (Barrierefreiheitsstärkungsgesetz) für die Website ArcanePixels.de',
}

export default function BarrierefreiheitPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950">
      <ArcaneNavigation />
      <main id="main-content" tabIndex={-1} className="pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <header className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Erklärung zur Barrierefreiheit
            </h1>
            <p className="text-lg text-purple-200/80">
              Gemäß Barrierefreiheitsstärkungsgesetz (BFSG) – gültig ab 28. Juni 2025
            </p>
          </header>
          
          <AccessibilityStatementContent />
        </div>
      </main>
      <ArcaneFooter />
    </div>
  )
}

