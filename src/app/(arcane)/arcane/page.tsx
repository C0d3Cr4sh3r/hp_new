import ArcaneNavigation from '@/components/arcane/ArcaneNavigation'
import ArcaneHero from '@/components/arcane/ArcaneHero'
import ArcaneFeatures from '@/components/arcane/ArcaneFeatures'
import ArcaneGallery from '@/components/arcane/ArcaneGallery'

export default function ArcanePage() {
  return (
    <>
      <ArcaneNavigation />
      <main>
        <ArcaneHero />
        <ArcaneFeatures />
        <ArcaneGallery />
      </main>
    </>
  )
}
