'use client'

import { useState, useEffect } from 'react'
import ArcaneNavigation from '@/components/arcane/ArcaneNavigation'

interface NewsItem {
  id: number
  title: string
  content: string
  excerpt?: string
  published: boolean
  featured_image?: string
  tags: string[]
  created_at: string
}

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)

  // Mock news data
  useEffect(() => {
    setTimeout(() => {
      setNews([
        {
          id: 1,
          title: 'TFP-Manager App Update v2.1',
          content: 'Wir haben ein großes Update für unsere TFP-Manager App veröffentlicht. Die neue Version bringt verbesserte Performance, ein moderneres UI und neue Features für die Verwaltung von Shooting-Terminen.',
          excerpt: 'Großes Update mit neuen Features und verbesserter Performance',
          published: true,
          tags: ['app', 'update', 'tfp-manager'],
          created_at: '2024-01-15'
        },
        {
          id: 2,
          title: 'Neue Portfolio-Integration',
          content: 'Ab sofort könnt ihr eure Portfolios direkt in der App verwalten und mit anderen Nutzern teilen. Das macht die Suche nach passenden Models und Fotografen noch einfacher.',
          excerpt: 'Portfolio-Verwaltung direkt in der App verfügbar',
          published: true,
          tags: ['portfolio', 'feature', 'community'],
          created_at: '2024-01-10'
        },
        {
          id: 3,
          title: 'Community-Event im Februar',
          content: 'Wir planen ein großes Community-Event für alle ArcanePixels-Nutzer. Freut euch auf Workshops, Networking und spannende Preise!',
          excerpt: 'Community-Event mit Workshops und Networking',
          published: true,
          tags: ['event', 'community', 'workshop'],
          created_at: '2024-01-05'
        }
      ])
      setLoading(false)
    }, 1000)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-purple-300">Loading news...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <ArcaneNavigation />
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">ArcanePixels News</h1>
          <p className="text-purple-200 text-lg">
            Aktuelle Updates und Neuigkeiten rund um unsere Apps und Services
          </p>
        </div>

        {/* News Articles */}
        <div className="space-y-8">
          {news.map((article) => (
            <NewsCard key={article.id} article={article} />
          ))}
        </div>

        {/* Newsletter Signup */}
        <div className="mt-16 bg-gradient-to-r from-purple-900/40 to-pink-900/40 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">
            Newsletter abonnieren
          </h3>
          <p className="text-purple-200 mb-6">
            Verpasse keine Updates und erfahre als Erste/r von neuen Features!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Deine E-Mail-Adresse"
              className="flex-1 px-4 py-2 bg-black/50 border border-purple-500/30 rounded-md text-white placeholder-purple-400 focus:outline-none focus:border-purple-500"
            />
            <button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-6 py-2 rounded-md font-semibold transition-all">
              Abonnieren
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

function NewsCard({ article }: { article: NewsItem }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <article className="bg-black/40 backdrop-blur-sm rounded-lg p-6 border border-purple-500/20 hover:border-purple-500/40 transition-all">
      {/* Header */}
      <div className="mb-4">
        <div className="flex justify-between items-start mb-2">
          <h2 className="text-2xl font-bold text-white">{article.title}</h2>
          <span className="text-sm text-purple-300">
            {new Date(article.created_at).toLocaleDateString('de-DE')}
          </span>
        </div>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {article.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 bg-purple-600/20 text-purple-300 text-xs rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="text-purple-200">
        {expanded ? (
          <div className="prose prose-invert max-w-none">
            {article.content.split('\n').map((paragraph, index) => (
              <p key={index} className="mb-4 last:mb-0">
                {paragraph}
              </p>
            ))}
          </div>
        ) : (
          <p>{article.excerpt || article.content.substring(0, 200) + '...'}</p>
        )}
      </div>

      {/* Read More Button */}
      <div className="mt-4">
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-purple-400 hover:text-purple-300 font-medium text-sm transition-colors"
        >
          {expanded ? 'Weniger anzeigen' : 'Weiterlesen'} →
        </button>
      </div>
    </article>
  )
}