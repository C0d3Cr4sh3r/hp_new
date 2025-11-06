'use client'

import { useState } from 'react'

const galleryItems = [
  {
    id: 1,
    title: 'TFP-Manager Dashboard',
    description: 'Übersichtliche Verwaltung aller TFP-Projekte',
    image: '/api/placeholder/600/400',
    category: 'app'
  },
  {
    id: 2,
    title: 'Portrait Session',
    description: 'Professionelle Portraitfotografie im Studio',
    image: '/api/placeholder/600/400',
    category: 'photography'
  },
  {
    id: 3,
    title: 'Event Management',
    description: 'Shooting-Kalender und Terminplanung',
    image: '/api/placeholder/600/400',
    category: 'app'
  },
  {
    id: 4,
    title: 'Fashion Shoot',
    description: 'Kreative Fashion-Fotografie mit Models',
    image: '/api/placeholder/600/400',
    category: 'photography'
  },
  {
    id: 5,
    title: 'Community Features',
    description: 'Vernetze dich mit anderen Fotografen',
    image: '/api/placeholder/600/400',
    category: 'app'
  },
  {
    id: 6,
    title: 'Digital Art',
    description: 'Kreative digitale Nachbearbeitung',
    image: '/api/placeholder/600/400',
    category: 'art'
  },
]

const categories = [
  { id: 'all', name: 'Alle' },
  { id: 'app', name: 'TFP-Manager' },
  { id: 'photography', name: 'Fotografie' },
  { id: 'art', name: 'Digital Art' },
]

export default function ArcaneGallery() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [selectedImage, setSelectedImage] = useState<number | null>(null)

  const filteredItems = activeCategory === 'all' 
    ? galleryItems 
    : galleryItems.filter(item => item.category === activeCategory)

  return (
    <section id="screenshots" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-base font-semibold leading-7 text-purple-400">Galerie</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Screenshots & Portfolio
          </p>
          <p className="mt-6 text-lg leading-8 text-purple-200">
            Entdecke unsere App-Features und photographische Arbeiten
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
        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="group relative overflow-hidden rounded-lg bg-black/40 hover:bg-black/60 transition-all cursor-pointer"
              onClick={() => setSelectedImage(item.id)}
            >
              <div className="aspect-video overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-purple-600/20 to-pink-600/20 flex items-center justify-center">
                  <span className="text-purple-300 text-sm">Bild: {item.title}</span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-purple-200">
                  {item.description}
                </p>
                <div className="mt-3">
                  <span className="inline-flex items-center rounded-md bg-purple-600/20 px-2 py-1 text-xs font-medium text-purple-300">
                    {categories.find(cat => cat.id === item.category)?.name}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* TFP-Manager Section */}
        <div id="tfp-manager" className="mt-32 rounded-2xl bg-gradient-to-r from-purple-900/40 to-pink-900/40 p-8 lg:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-3xl font-bold text-white mb-6">
                TFP-Manager App
              </h3>
              <p className="text-lg text-purple-200 mb-6">
                Die innovative App für TFP-Shootings (Time for Prints). Verwalte deine Projekte, 
                finde passende Models und Fotografen, und organisiere deine Termine effizient.
              </p>
              <div className="space-y-4">
                <div className="flex items-center text-purple-300">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                  Projekt- und Terminverwaltung
                </div>
                <div className="flex items-center text-purple-300">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                  Model- und Fotografen-Matching
                </div>
                <div className="flex items-center text-purple-300">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                  Portfolio-Integration
                </div>
                <div className="flex items-center text-purple-300">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                  Community-Features
                </div>
              </div>
            </div>
            <div className="lg:pl-8">
              <div className="aspect-square bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-lg flex items-center justify-center">
                <span className="text-purple-300">TFP-Manager Interface</span>
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
            <div className="aspect-video bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-lg flex items-center justify-center">
              <span className="text-purple-300">Lightbox: {galleryItems.find(item => item.id === selectedImage)?.title}</span>
            </div>
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