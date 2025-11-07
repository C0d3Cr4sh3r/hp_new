'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { DEFAULT_SHOOTINGHUB_SECTION, type ShootingHubSectionContent, type Screenshot, type Portfolio } from '@/lib/supabase'

const categories = [
  { id: 'all', name: 'Alle' },
  { id: 'app', name: 'ShootingHub' },
  { id: 'portfolio', name: 'Portfolio' },
  { id: 'photography', name: 'Fotografie' },
  { id: 'websites', name: 'Websites' },
  { id: 'apps', name: 'Apps' },
  { id: 'marketing', name: 'Marketing' },
]

// Combined type for gallery items
type GalleryItem = (Screenshot & { source: 'screenshot' }) | (Portfolio & { source: 'portfolio' })

export default function ArcaneGallery() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [selectedImage, setSelectedImage] = useState<number | null>(null)
  const [screenshots, setScreenshots] = useState<Screenshot[]>([])
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [isLoadingScreenshots, setIsLoadingScreenshots] = useState(true)
  const [isLoadingPortfolios, setIsLoadingPortfolios] = useState(true)
  const [shootingHubSection, setShootingHubSection] = useState<ShootingHubSectionContent>(DEFAULT_SHOOTINGHUB_SECTION)
  const [isLoadingShootingHub, setIsLoadingShootingHub] = useState(true)

  const effectiveHeadline = shootingHubSection.headline || DEFAULT_SHOOTINGHUB_SECTION.headline
  const effectiveSubheadline = shootingHubSection.subheadline ?? DEFAULT_SHOOTINGHUB_SECTION.subheadline
  const effectiveDescription = shootingHubSection.description ?? DEFAULT_SHOOTINGHUB_SECTION.description
  const effectiveBullets = shootingHubSection.bullets.length > 0 ? shootingHubSection.bullets : DEFAULT_SHOOTINGHUB_SECTION.bullets

  useEffect(() => {
    const controller = new AbortController()

    const loadSection = async () => {
      try {
        setIsLoadingShootingHub(true)
        const response = await fetch('/api/shootinghub-section', { signal: controller.signal })
        if (!response.ok) {
          throw new Error('ShootingHub-Inhalte konnten nicht geladen werden.')
        }
        const data = (await response.json()) as ShootingHubSectionContent
        if (!controller.signal.aborted) {
          setShootingHubSection({ ...DEFAULT_SHOOTINGHUB_SECTION, ...data })
        }
      } catch (error) {
        console.error('ShootingHub-Section konnte nicht geladen werden:', error)
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingShootingHub(false)
        }
      }
    }

    const loadScreenshots = async () => {
      try {
        setIsLoadingScreenshots(true)
        const response = await fetch('/api/screenshots?t=' + Date.now(), { 
          signal: controller.signal,
          cache: 'no-cache' 
        })
        if (!response.ok) {
          throw new Error('Screenshots konnten nicht geladen werden.')
        }
        const data = (await response.json()) as Screenshot[]
        console.log('Screenshots geladen:', data.length, 'Einträge')
        if (data.length > 0) {
          console.log('Erster Screenshot:', data[0])
        }
        if (!controller.signal.aborted) {
          setScreenshots(data)
        }
      } catch (error) {
        console.error('Screenshots konnten nicht geladen werden:', error)
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingScreenshots(false)
        }
      }
    }

    const loadPortfolios = async () => {
      try {
        setIsLoadingPortfolios(true)
        const response = await fetch('/api/portfolios?t=' + Date.now(), { 
          signal: controller.signal,
          cache: 'no-cache' 
        })
        if (!response.ok) {
          throw new Error('Portfolios konnten nicht geladen werden.')
        }
        const data = await response.json()
        const portfolios = data.portfolios || data
        console.log('Portfolios geladen:', portfolios.length, 'Einträge')
        if (portfolios.length > 0) {
          console.log('Erstes Portfolio:', portfolios[0])
        }
        if (!controller.signal.aborted) {
          setPortfolios(portfolios)
        }
      } catch (error) {
        console.error('Portfolios konnten nicht geladen werden:', error)
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingPortfolios(false)
        }
      }
    }

    loadSection()
    loadScreenshots()
    loadPortfolios()
    return () => controller.abort()
  }, [])

  // Combine screenshots and portfolios into gallery items
  const allItems: GalleryItem[] = [
    ...screenshots.map(s => ({ ...s, source: 'screenshot' as const })),
    ...portfolios.map(p => ({ ...p, source: 'portfolio' as const }))
  ]

  // Filter based on selected category
  const filteredItems = (() => {
    if (activeCategory === 'all') {
      return allItems
    }
    if (activeCategory === 'app') {
      return screenshots.filter(s => s.category === 'app').map(s => ({ ...s, source: 'screenshot' as const }))
    }
    if (activeCategory === 'portfolio') {
      return portfolios.map(p => ({ ...p, source: 'portfolio' as const }))
    }
    // For specific portfolio categories
    if (['photography', 'websites', 'apps', 'marketing'].includes(activeCategory)) {
      return portfolios.filter(p => p.category === activeCategory).map(p => ({ ...p, source: 'portfolio' as const }))
    }
    return allItems.filter(item => item.category === activeCategory)
  })()

  const isLoading = isLoadingScreenshots || isLoadingPortfolios

  return (
    <section id="portfolio" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-base font-semibold leading-7 text-purple-400">Galerie</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Screenshots & Portfolio
          </p>
          <p className="mt-6 text-lg leading-8 text-purple-200">
            Entdecke ShootingHub Features und unsere Web-Entwicklungsprojekte für Fotografen
          </p>
        </div>

        {/* Category Filter */}
        <div className="mt-16 flex justify-center">
          <div className="flex flex-wrap gap-2 rounded-lg bg-black/40 p-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeCategory === category.id
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'text-purple-300 hover:text-white hover:bg-purple-600/50'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Grid */}
        {isLoading ? (
          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="aspect-video bg-black/40 rounded-lg"></div>
                <div className="p-6 space-y-3">
                  <div className="h-4 bg-black/40 rounded w-3/4"></div>
                  <div className="h-3 bg-black/40 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item) => (
              <div
                key={`${item.source}-${item.id}`}
                className="group relative overflow-hidden rounded-lg bg-black/40 hover:bg-black/60 transition-all cursor-pointer"
                onClick={() => setSelectedImage(item.id ?? null)}
              >
                <div className="aspect-video overflow-hidden">
                  {item.image_url ? (
                    <Image
                      src={item.image_url}
                      alt={item.image_alt || item.title}
                      width={item.image_width || 800}
                      height={item.image_height || 600}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-600/20 to-pink-600/20 flex items-center justify-center">
                      <span className="text-purple-300 text-sm">Bild: {item.title}</span>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm text-purple-200">
                    {item.description || 'Keine Beschreibung verfügbar'}
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="inline-flex items-center rounded-md bg-purple-600/20 px-2 py-1 text-xs font-medium text-purple-300">
                      {categories.find(cat => cat.id === item.category)?.name || item.category}
                    </span>
                    {item.source === 'portfolio' && 'client_name' in item && item.client_name && (
                      <span className="inline-flex items-center rounded-md bg-pink-600/20 px-2 py-1 text-xs font-medium text-pink-300">
                        {item.client_name}
                      </span>
                    )}
                    {item.source === 'portfolio' && 'is_featured' in item && item.is_featured && (
                      <span className="inline-flex items-center rounded-md bg-yellow-600/20 px-2 py-1 text-xs font-medium text-yellow-300">
                        Featured
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {!isLoading && filteredItems.length === 0 && (
          <div className="mt-16 text-center">
            <p className="text-purple-300">Keine Einträge in dieser Kategorie gefunden.</p>
          </div>
        )}

        {/* ShootingHub Section */}
        <div id="shootinghub" className="mt-32 rounded-2xl bg-gradient-to-r from-purple-900/40 to-pink-900/40 p-8 lg:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-3xl font-bold text-white mb-6">
                {effectiveHeadline}
              </h3>
              {effectiveSubheadline && (
                <p className="text-sm uppercase tracking-widest text-purple-300 mb-3">
                  {effectiveSubheadline}
                </p>
              )}
              <p className="text-lg text-purple-200 mb-6">
                {effectiveDescription}
              </p>
              <div className="space-y-4">
                {effectiveBullets.map((bullet, index) => (
                  <div key={bullet + index} className="flex items-center text-purple-300">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                    {bullet}
                  </div>
                ))}
              </div>
              {shootingHubSection.cta_label && shootingHubSection.cta_url && (
                <div className="mt-8">
                  <a
                    href={shootingHubSection.cta_url}
                    className="inline-flex items-center rounded-full bg-gradient-to-r from-purple-600 to-pink-500 px-5 py-2 text-sm font-semibold text-white shadow-lg transition hover:from-purple-500 hover:to-pink-400"
                  >
                    {shootingHubSection.cta_label}
                  </a>
                </div>
              )}
            </div>
            <div className="lg:pl-8">
              <div className="overflow-hidden rounded-lg border border-purple-500/20 bg-black/20">
                {shootingHubSection.image_url ? (
                  <Image
                    src={shootingHubSection.image_url}
                    alt={shootingHubSection.image_alt ?? DEFAULT_SHOOTINGHUB_SECTION.image_alt ?? 'ShootingHub App'}
                    width={shootingHubSection.image_width ?? 1600}
                    height={shootingHubSection.image_height ?? 900}
                    className="h-auto w-full object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="aspect-square bg-gradient-to-br from-purple-600/20 to-pink-600/20 flex items-center justify-center">
                    <span className="text-purple-300">
                      {isLoadingShootingHub ? 'ShootingHub wird geladen…' : 'ShootingHub Interface'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="max-w-4xl w-full">
            {(() => {
              const selectedItem = allItems.find(item => item.id === selectedImage)
              return selectedItem ? (
                <div className="relative">
                  {selectedItem.image_url ? (
                    <Image
                      src={selectedItem.image_url}
                      alt={selectedItem.image_alt || selectedItem.title}
                      width={selectedItem.image_width || 1200}
                      height={selectedItem.image_height || 800}
                      className="w-full h-auto rounded-lg"
                    />
                  ) : (
                    <div className="aspect-video bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-lg flex items-center justify-center">
                      <span className="text-purple-300">Bild: {selectedItem.title}</span>
                    </div>
                  )}
                  <div className="mt-4 text-center">
                    <h3 className="text-xl font-semibold text-white">{selectedItem.title}</h3>
                    {selectedItem.description && (
                      <p className="mt-2 text-purple-200">{selectedItem.description}</p>
                    )}
                    {selectedItem.source === 'portfolio' && 'client_name' in selectedItem && selectedItem.client_name && (
                      <p className="mt-1 text-sm text-pink-300">Kunde: {selectedItem.client_name}</p>
                    )}
                    {selectedItem.source === 'portfolio' && 'project_url' in selectedItem && selectedItem.project_url && (
                      <a 
                        href={selectedItem.project_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center text-sm text-purple-400 hover:text-purple-200"
                      >
                        Projekt ansehen →
                      </a>
                    )}
                  </div>
                </div>
              ) : (
                <div className="aspect-video bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-lg flex items-center justify-center">
                  <span className="text-purple-300">Bild nicht gefunden</span>
                </div>
              )
            })()}
          </div>
          <button 
            className="absolute top-4 right-4 text-white text-2xl hover:text-purple-300"
            onClick={() => setSelectedImage(null)}
          >
            ×
          </button>
        </div>
      )}
    </section>
  )
}