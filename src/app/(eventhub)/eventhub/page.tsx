import { EventHubNavigation } from '@/components/eventhub/EventHubNavigation'
import { EventHubHero } from '@/components/eventhub/EventHubHero'
import { EventHubFeatures } from '@/components/eventhub/EventHubFeatures'
import { EventHubSecurity } from '@/components/eventhub/EventHubSecurity'
import { EventHubCTA } from '@/components/eventhub/EventHubCTA'

export default function EventHubPage() {
  return (
    <div className="space-y-16">
      <EventHubNavigation />
      <EventHubHero />
      <EventHubFeatures />
      <EventHubSecurity />
      <EventHubCTA />
    </div>
  )
}
