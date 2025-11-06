import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Haupt-Website - Willkommen',
  description: 'Moderne Webanwendung mit Next.js, TypeScript und innovativen Features.',
}

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-white">
      {/* Haupt-Website Layout */}
      {children}
    </div>
  )
}