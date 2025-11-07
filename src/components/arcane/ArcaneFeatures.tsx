'use client'

import { useState, useEffect } from 'react'
import { CodeBracketIcon, DevicePhoneMobileIcon, UserGroupIcon, ChartBarIcon } from '@heroicons/react/24/outline'
import { Service } from '@/lib/supabase'
import type { ForwardRefExoticComponent, SVGProps } from 'react'

// Fallback services for when API fails or is loading
const fallbackFeatures = [
  {
    name: 'Web-Entwicklung für Fotografen',
    description: 'Maßgeschneiderte Websites und Portfolios für Fotografen. Moderne, responsive Designs mit optimaler Performance.',
    icon: CodeBracketIcon,
    priceInfo: undefined as string | undefined,
  },
  {
    name: 'ShootingHub App',
    description: 'Moderne App zur Verwaltung von Shootings. Organisiere Models, Fotografen und Termine effizient.',
    icon: DevicePhoneMobileIcon,
    priceInfo: undefined as string | undefined,
  },
  {
    name: 'CMS & Admin-Bereiche',
    description: 'Benutzerfreundliche Content-Management-Systeme für einfache Website-Verwaltung ohne technische Kenntnisse.',
    icon: UserGroupIcon,
    priceInfo: undefined as string | undefined,
  },
  {
    name: 'Analytics & Performance',
    description: 'Optimierte Website-Performance, SEO und Analytics für maximale Sichtbarkeit deiner Fotografenwebsite.',
    icon: ChartBarIcon,
    priceInfo: undefined as string | undefined,
  },
]

// Icon mapping for different service categories/types
type IconComponent = ForwardRefExoticComponent<SVGProps<SVGSVGElement>>

const iconMap: Record<string, IconComponent> = {
  '🌐': CodeBracketIcon,
  '📱': DevicePhoneMobileIcon,
  '⚙️': UserGroupIcon,
  '📊': ChartBarIcon,
  development: CodeBracketIcon,
  apps: DevicePhoneMobileIcon,
  systems: UserGroupIcon,
  analytics: ChartBarIcon,
}

const getServiceIcon = (service: Service) => {
  // First try to find icon by emoji
  if (service.icon && iconMap[service.icon]) {
    return iconMap[service.icon]
  }
  // Then try by category
  if (service.category && iconMap[service.category]) {
    return iconMap[service.category]
  }
  // Default fallback
  return CodeBracketIcon
}

export default function ArcaneFeatures() {
  const [services, setServices] = useState<Service[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadServices = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/services')
        
        if (response.ok) {
          const data: Service[] = await response.json()
          // Filter for active services, sorted by sort_order
          const activeServices = data
            .filter(service => service.status === 'active')
            .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
            .slice(0, 8) // Limit to 8 services for grid layout
          
          setServices(activeServices)
          setError(null)
        } else {
          throw new Error('Failed to fetch services')
        }
      } catch (err) {
        console.error('Error loading services:', err)
        setError('Could not load services')
        // Use fallback features when API fails
        setServices([])
      } finally {
        setIsLoading(false)
      }
    }

    loadServices()
  }, [])

  // Use database services if available, show loading state while fetching
  const displayFeatures = isLoading 
    ? [] // Zeige keine Services während des Ladens
    : services.length > 0 
      ? services.map(service => ({
          name: service.title || '',
          description: service.short_description || service.description || '',
          icon: getServiceIcon(service),
          fullDescription: service.description,
          features: service.features,
          priceInfo: service.price_info,
        }))
      : fallbackFeatures

  return (
    <section id="services" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-base font-semibold leading-7 text-purple-400">Unsere Services</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Web-Entwicklung für kreative Professionals
          </p>
          <p className="mt-6 text-lg leading-8 text-purple-200">
            Von maßgeschneiderten Photographer-Websites bis hin zu innovativen Apps - 
            wir entwickeln digitale Lösungen für deine kreativen Projekte.
          </p>
          {isLoading && (
            <p className="mt-4 text-sm text-purple-300">
              Services werden geladen...
            </p>
          )}
          {!isLoading && error && (
            <p className="mt-4 text-sm text-amber-300">
              {error}
            </p>
          )}
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          {isLoading ? (
            // Loading skeleton
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-2 xl:grid-cols-4">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="flex flex-col animate-pulse">
                  <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
                    <div className="h-5 w-5 bg-purple-600 rounded"></div>
                    <div className="h-4 bg-purple-600 rounded w-32"></div>
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-purple-200">
                    <div className="space-y-2">
                      <div className="h-3 bg-purple-700 rounded w-full"></div>
                      <div className="h-3 bg-purple-700 rounded w-3/4"></div>
                      <div className="h-3 bg-purple-700 rounded w-1/2"></div>
                    </div>
                  </dd>
                </div>
              ))}
            </dl>
          ) : (
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-12 lg:max-w-none lg:grid-cols-2 xl:grid-cols-4">
              {displayFeatures.map((feature, index) => (
                <div
                  key={feature.name || index}
                  className="flex flex-col rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-purple-900/20 backdrop-blur transition hover:border-purple-400/40 hover:bg-purple-500/10"
                >
                  <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
                    <feature.icon className="h-6 w-6 flex-none text-purple-300" aria-hidden="true" />
                    {feature.name}
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-purple-100">
                    <p className="flex-auto">{feature.description}</p>
                    {feature.priceInfo && (
                      <p className="mt-3 text-sm font-semibold text-purple-200">
                        {feature.priceInfo}
                      </p>
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </div>
    </section>
  )
}