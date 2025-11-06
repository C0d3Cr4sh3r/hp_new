import { CameraIcon, DevicePhoneMobileIcon, UserGroupIcon, ChartBarIcon } from '@heroicons/react/24/outline'

const features = [
  {
    name: 'Professionelle Fotografie',
    description: 'Hochwertige Portraits, Fashion- und Eventfotografie mit modernster Ausrüstung und kreativen Konzepten.',
    icon: CameraIcon,
  },
  {
    name: 'TFP-Manager App',
    description: 'Innovative App zur Verwaltung von TFP-Shootings. Organisiere Models, Fotografen und Termine effizient.',
    icon: DevicePhoneMobileIcon,
  },
  {
    name: 'Community Platform',
    description: 'Vernetze dich mit anderen Kreativen. Finde passende Shooting-Partner und teile deine Erfahrungen.',
    icon: UserGroupIcon,
  },
  {
    name: 'Analytics & Tracking',
    description: 'Verfolge deine Shooting-Statistiken, Portfolio-Performance und Community-Engagement in Echtzeit.',
    icon: ChartBarIcon,
  },
]

export default function ArcaneFeatures() {
  return (
    <section id="portfolio" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-base font-semibold leading-7 text-purple-400">Unsere Services</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Alles für deine kreative Fotografie
          </p>
          <p className="mt-6 text-lg leading-8 text-purple-200">
            Von professionellen Shootings bis hin zu innovativen Apps - 
            wir bieten dir die komplette Lösung für deine fotografischen Projekte.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-2 xl:grid-cols-4">
            {features.map((feature) => (
              <div key={feature.name} className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
                  <feature.icon className="h-5 w-5 flex-none text-purple-400" aria-hidden="true" />
                  {feature.name}
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-purple-200">
                  <p className="flex-auto">{feature.description}</p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}