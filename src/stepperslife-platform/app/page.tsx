import { Suspense } from 'react'
import { getPublishedEvents } from '@/lib/events/queries'
import { getFeaturedProducts } from '@/lib/store'
import { HeroSection } from '@/components/homepage/HeroSection'
import { EventsSection } from '@/components/homepage/EventsSection'
import { MarketplaceSection } from '@/components/homepage/MarketplaceSection'
import { ClassesSection } from '@/components/homepage/ClassesSection'
import { RestaurantsSection } from '@/components/homepage/RestaurantsSection'
import { CTASection } from '@/components/homepage/CTASection'

// Force dynamic rendering to always show fresh data
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function HomePage() {
  // Fetch data in parallel
  const [events, products] = await Promise.all([
    getPublishedEvents().catch(() => []),
    getFeaturedProducts(12).catch(() => []),
  ])

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection />

      {/* Events Section */}
      <Suspense fallback={<div className="py-24" />}>
        <EventsSection events={events} />
      </Suspense>

      {/* Marketplace Section */}
      <Suspense fallback={<div className="py-24" />}>
        <MarketplaceSection products={products} />
      </Suspense>

      {/* Classes Section (Coming Soon) */}
      <Suspense fallback={<div className="py-24" />}>
        <ClassesSection />
      </Suspense>

      {/* Restaurants Section (Coming Soon) */}
      <Suspense fallback={<div className="py-24" />}>
        <RestaurantsSection />
      </Suspense>

      {/* Call to Action Section */}
      <Suspense fallback={<div className="py-24" />}>
        <CTASection />
      </Suspense>
    </div>
  )
}
