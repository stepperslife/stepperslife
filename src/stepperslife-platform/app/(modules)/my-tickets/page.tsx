import { Metadata } from 'next'
import Link from 'next/link'
import { requireAuth } from '@/lib/auth'
import { getUserTickets } from '@/lib/events/queries'
import { Calendar, MapPin, Ticket } from 'lucide-react'
import { format } from 'date-fns'

export const metadata: Metadata = {
  title: 'My Tickets | SteppersLife',
  description: 'View your purchased tickets',
}

export default async function MyTicketsPage() {
  const user = await requireAuth()
  const tickets = await getUserTickets(user.id)

  return (
    <div className="container py-12">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">My Tickets</h1>
          <p className="mt-2 text-muted-foreground">
            View and manage your purchased tickets
          </p>
        </div>

        {tickets.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <Ticket className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 font-medium">No tickets yet</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Purchase tickets to see them here
            </p>
            <Link
              href="/events"
              className="mt-4 inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
            >
              Browse Events
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="rounded-lg border p-4"
              >
                <div className="flex items-start gap-4">
                  {ticket.event.imageUrl ? (
                    <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md">
                      <img
                        src={ticket.event.imageUrl}
                        alt={ticket.event.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-20 w-20 flex-shrink-0 rounded-md bg-gradient-to-br from-primary/20 to-primary/5" />
                  )}

                  <div className="flex-1">
                    <Link
                      href={`/events/${ticket.event.slug}`}
                      className="font-semibold hover:text-primary"
                    >
                      {ticket.event.title}
                    </Link>

                    <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {format(ticket.event.startDate, 'PPP')}
                      </div>

                      {ticket.event.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {ticket.event.location}
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <Ticket className="h-4 w-4" />
                        {ticket.ticketType.name} - $
                        {(Number(ticket.ticketType.price) / 100).toFixed(2)}
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-3">
                      <span
                        className={`rounded px-2 py-1 text-xs font-medium ${
                          ticket.status === 'VALID'
                            ? 'bg-green-100 text-green-700'
                            : ticket.status === 'SCANNED'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {ticket.status}
                      </span>

                      <span className="text-xs text-muted-foreground">
                        #{ticket.ticketNumber}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
