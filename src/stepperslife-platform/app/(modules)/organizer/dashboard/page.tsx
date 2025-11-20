import { Metadata } from 'next'
import Link from 'next/link'
import { requireEventOrganizer } from '@/lib/auth'
import { getOrganizerEvents } from '@/lib/events/queries'
import { Calendar, Plus, Ticket, DollarSign } from 'lucide-react'
import { format } from 'date-fns'

export const metadata: Metadata = {
  title: 'Organizer Dashboard | SteppersLife',
  description: 'Manage your events',
}

export default async function OrganizerDashboardPage() {
  const user = await requireEventOrganizer()
  const events = await getOrganizerEvents(user.id)

  const totalEvents = events.length
  const publishedEvents = events.filter(e => e.status === 'PUBLISHED').length
  const totalTicketsSold = events.reduce((sum, e) => sum + e._count.tickets, 0)
  const totalRevenue = events.reduce((sum, e) => {
    return sum + e.ticketTypes.reduce((ticketSum, tt) => {
      return ticketSum + (Number(tt.price) * tt.sold)
    }, 0)
  }, 0)

  return (
    <div className="container py-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Organizer Dashboard</h1>
            <p className="mt-2 text-muted-foreground">
              Manage your events and track sales
            </p>
          </div>

          <Link
            href="/organizer/events/create"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Create Event
          </Link>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Total Events
            </div>
            <p className="mt-2 text-2xl font-bold">{totalEvents}</p>
            <p className="text-xs text-muted-foreground">
              {publishedEvents} published
            </p>
          </div>

          <div className="rounded-lg border p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Ticket className="h-4 w-4" />
              Tickets Sold
            </div>
            <p className="mt-2 text-2xl font-bold">{totalTicketsSold}</p>
          </div>

          <div className="rounded-lg border p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              Total Revenue
            </div>
            <p className="mt-2 text-2xl font-bold">
              ${(totalRevenue / 100).toFixed(2)}
            </p>
          </div>

          <div className="rounded-lg border p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Draft Events
            </div>
            <p className="mt-2 text-2xl font-bold">
              {events.filter(e => e.status === 'DRAFT').length}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Your Events</h2>

          {events.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 font-medium">No events yet</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Create your first event to get started
              </p>
              <Link
                href="/organizer/events/create"
                className="mt-4 inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
              >
                Create Event
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((event) => {
                const ticketsSold = event._count.tickets
                const totalTickets = event.ticketTypes.reduce((sum, tt) => sum + tt.quantity, 0)
                const revenue = event.ticketTypes.reduce((sum, tt) => {
                  return sum + (Number(tt.price) * tt.sold)
                }, 0)

                return (
                  <Link
                    key={event.id}
                    href={`/organizer/events/${event.id}`}
                    className="block rounded-lg border p-4 transition-colors hover:border-primary"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{event.title}</h3>
                          <span
                            className={`rounded px-2 py-1 text-xs font-medium ${
                              event.status === 'PUBLISHED'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}
                          >
                            {event.status}
                          </span>
                        </div>

                        <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <span>{format(event.startDate, 'PPP')}</span>
                          {event.location && <span>{event.location}</span>}
                        </div>

                        <div className="mt-3 flex gap-6 text-sm">
                          <div>
                            <span className="text-muted-foreground">Tickets: </span>
                            <span className="font-medium">
                              {ticketsSold} / {totalTickets}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Revenue: </span>
                            <span className="font-medium">${(revenue / 100).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
