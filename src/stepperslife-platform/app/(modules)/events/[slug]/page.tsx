import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getEventBySlug } from '@/lib/events/queries'
import { getCurrentUser } from '@/lib/auth'
import { Calendar, MapPin, User } from 'lucide-react'
import { format } from 'date-fns'
import { TicketPurchaseForm } from '@/components/events/ticket-purchase-form'

interface EventPageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  const event = await getEventBySlug(params.slug)

  if (!event) {
    return {
      title: 'Event Not Found',
    }
  }

  return {
    title: `${event.title} | SteppersLife Events`,
    description: event.description || undefined,
  }
}

export default async function EventPage({ params }: EventPageProps) {
  const [event, user] = await Promise.all([
    getEventBySlug(params.slug),
    getCurrentUser(),
  ])

  if (!event) {
    notFound()
  }

  const isOrganizer = user && (user.id === event.organizerId || user.role === 'ADMIN')

  return (
    <div className="container py-12">
      <div className="mx-auto max-w-4xl">
        {event.imageUrl && (
          <div className="mb-8 aspect-video w-full overflow-hidden rounded-lg">
            <img
              src={event.imageUrl}
              alt={event.title}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{event.title}</h1>
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {format(event.startDate, 'PPP p')}
              </div>

              {event.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {event.location}
                </div>
              )}

              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                {event.organizer.name}
              </div>
            </div>
          </div>

          {event.description && (
            <div className="prose max-w-none">
              <p className="text-muted-foreground">{event.description}</p>
            </div>
          )}

          {isOrganizer && (
            <div className="rounded-md border border-primary bg-primary/5 p-4">
              <p className="text-sm font-medium text-primary">
                You are the organizer of this event
              </p>
            </div>
          )}

          {event.status === 'PUBLISHED' && event.ticketTypes.length > 0 && (
            <div className="rounded-lg border p-6">
              <h2 className="text-xl font-semibold">Get Tickets</h2>
              <TicketPurchaseForm event={event} user={user} />
            </div>
          )}

          {event.status === 'DRAFT' && (
            <div className="rounded-md border border-yellow-200 bg-yellow-50 p-4 text-yellow-800">
              This event is currently in draft mode and not visible to the public.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
