import type { ForwardRefExoticComponent, SVGProps } from 'react'
import { unstable_noStore as noStore } from 'next/cache'
import { CodeBracketIcon, DevicePhoneMobileIcon, UserGroupIcon, ChartBarIcon } from '@heroicons/react/24/outline'
import { DatabaseService, type Service } from '@/lib/supabase'

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
  if (service.icon && iconMap[service.icon]) {
    return iconMap[service.icon]
  }
  if (service.category && iconMap[service.category]) {
    return iconMap[service.category]
  }
  return CodeBracketIcon
}

const normalize = (value?: string | null) => value?.trim() ?? ''

export default async function ArcaneFeatures() {
  noStore()

  const [sectionSettings, services] = await Promise.all([
    DatabaseService.getServicesSectionSettings(),
    DatabaseService.getServices(),
  ])

  const eyebrow = normalize(sectionSettings.eyebrow)
  const title = normalize(sectionSettings.title)
  const description = normalize(sectionSettings.description)

  const displayFeatures = services
    .filter((service) => service.status === 'active')
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
    .slice(0, 8)
    .map((service) => ({
      name: service.title || '',
      description: service.short_description || service.description || '',
      icon: getServiceIcon(service),
      priceInfo: service.price_info,
    }))

  return (
    <section id="services" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          {eyebrow && (
            <h2 className="text-base font-semibold leading-7 text-purple-400">{eyebrow}</h2>
          )}
          {title && (
            <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {title}
            </p>
          )}
          {description && (
            <p className="mt-6 text-lg leading-8 text-purple-200">{description}</p>
          )}
          {displayFeatures.length === 0 && (
            <p className="mt-4 text-sm text-purple-300">Noch keine Services veröffentlicht.</p>
          )}
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
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
                    <p className="mt-3 text-sm font-semibold text-purple-200">{feature.priceInfo}</p>
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}