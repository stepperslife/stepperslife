import { Metadata } from 'next'
import Link from 'next/link'
import { getPublishedEvents } from '@/lib/events/queries'
import { Calendar, Plus } from 'lucide-react'
import { getCurrentUser } from '@/lib/auth'
import { EventsListClient } from '@/components/events/events-list-client'
import { EventType } from '@prisma/client'

export const metadata: Metadata = {
  title: 'Events | SteppersLife',
  description: 'Discover and attend amazing events',
}

interface EventsPageProps {
  searchParams: {
    search?: string
    location?: string
    type?: string
    category?: string
    availability?: string
  }
}

export default async function EventsPage({ searchParams }: EventsPageProps) {
  // Await searchParams in Next.js 16
  const params = await searchParams

  // Parse filters
  const filters = {
    search: params.search,
    location: params.location,
    type: params.type as EventType | undefined,
    category: params.category,
  }

  // Fetch events with filters
  const allEvents = await getPublishedEvents(filters)
  const user = await getCurrentUser()

  // Filter by availability if specified (client-side filter)
  let events = allEvents
  if (params.availability) {
    events = allEvents.filter((event) => {
      const availableTickets = event.ticketTypes.reduce(
        (sum, tt) => sum + (tt.quantity - tt.sold),
        0
      )

      if (params.availability === 'available') {
        return event.eventType === 'FREE_EVENT' || availableTickets > 0
      } else if (params.availability === 'sold-out') {
        return event.eventType === 'TICKETED_EVENT' && availableTickets === 0
      }
      return true
    })
  }

  const isEventOrganizer = user?.role === 'ADMIN' || user?.role === 'EVENT_ORGANIZER'

  // Determine the button props based on user role
  const getButtonProps = () => {
    if (!user) {
      return {
        href: '/auth?redirect=/organizer/events/create',
        text: 'Create Event',
      }
    }
    if (isEventOrganizer) {
      return {
        href: '/organizer/events/create',
        text: 'Create Event',
      }
    }
    return {
      href: '/settings',
      text: 'Become an Organizer',
    }
  }

  const buttonProps = getButtonProps()

  const hasFilters = params.search || params.location || params.type || params.category || params.availability

  if (events.length === 0) {
    return (
      <div className="container py-12">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Upcoming Events</h1>
              <p className="mt-2 text-muted-foreground">
                Discover amazing events happening near you
              </p>
            </div>
            <Link
              href={buttonProps.href}
              className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <Plus className="h-4 w-4" />
              {buttonProps.text}
            </Link>
          </div>

          <div className="mx-auto max-w-4xl text-center">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
            <h2 className="mt-4 text-2xl font-bold">
              {hasFilters ? 'No Events Found' : 'No Events Yet'}
            </h2>
            <p className="mt-2 text-muted-foreground">
              {hasFilters
                ? 'Try adjusting your filters to find more events'
                : 'Check back soon for upcoming events!'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Upcoming Events</h1>
            <p className="mt-2 text-muted-foreground">
              Discover amazing events happening near you
            </p>
          </div>
          <Link
            href={buttonProps.href}
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <Plus className="h-4 w-4" />
            {buttonProps.text}
          </Link>
        </div>

        {/* Events List with Filters */}
        <EventsListClient
          events={events.map((event) => ({
            ...event,
            ticketTypes: event.ticketTypes.map((tt) => ({
              ...tt,
              price: Number(tt.price), // Convert Decimal to number
            })),
          }))}
        />
      </div>
    </div>
  )
}
