'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Calendar, MapPin, Ticket, Tag } from 'lucide-react'
import { format } from 'date-fns'
import { EventFilters } from './event-filters'

type ViewMode = 'grid' | 'list' | 'masonry'

interface Event {
  id: string
  title: string
  slug: string
  imageUrl: string | null
  startDate: Date
  location: string | null
  eventType: string
  categories: string[] | null
  ticketTypes: Array<{
    quantity: number
    sold: number
    price: number
  }>
}

interface EventsListClientProps {
  events: Event[]
}

export function EventsListClient({ events }: EventsListClientProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('masonry')

  return (
    <div className="space-y-8">
      {/* Filters */}
      <EventFilters viewMode={viewMode} onViewModeChange={setViewMode} />

      {/* Events Grid/List/Masonry */}
      {viewMode === 'masonry' ? (
        <>
          {/* Desktop: 4 columns */}
          <div
            className="hidden md:block"
            style={{
              columnCount: 4,
              columnGap: '24px',
            }}
          >
            {events.map((event) => {
              const availableTickets = event.ticketTypes.reduce(
                (sum, tt) => sum + (tt.quantity - tt.sold),
                0
              )
              const minPrice =
                event.ticketTypes.length > 0
                  ? Math.min(...event.ticketTypes.map((tt) => tt.price))
                  : 0

              return (
                <div
                  key={event.id}
                  style={{
                    breakInside: 'avoid',
                    marginBottom: '24px',
                  }}
                >
                  <Link
                    href={`/events/${event.slug}`}
                    className="group block overflow-hidden rounded-lg border transition-all hover:border-primary hover:shadow-lg"
                  >
                    {event.imageUrl ? (
                      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                        <img
                          src={event.imageUrl}
                          alt={event.title}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                      </div>
                    ) : (
                      <div className="aspect-[4/3] bg-gradient-to-br from-primary/20 to-primary/5" />
                    )}

                    <div className="p-4">
                      <h3 className="font-semibold group-hover:text-primary">
                        {event.title}
                      </h3>

                      <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {format(event.startDate, 'PPP')}
                        </div>

                        {event.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {event.location}
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <Ticket className="h-4 w-4" />
                          {event.eventType === 'FREE_EVENT'
                            ? 'Free Event'
                            : minPrice === 0
                              ? 'Free'
                              : `From $${(minPrice / 100).toFixed(2)}`}
                        </div>
                      </div>

                      {event.categories && event.categories.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {event.categories.slice(0, 2).map((category, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 rounded-full bg-accent px-2 py-1 text-xs font-medium text-accent-foreground"
                            >
                              <Tag className="h-3 w-3" />
                              {category}
                            </span>
                          ))}
                        </div>
                      )}

                      {event.eventType === 'TICKETED_EVENT' && (
                        <div className="mt-3 text-sm">
                          {availableTickets > 0 ? (
                            <span className="text-green-600 dark:text-green-400">
                              {availableTickets} tickets available
                            </span>
                          ) : (
                            <span className="text-destructive">Sold Out</span>
                          )}
                        </div>
                      )}
                    </div>
                  </Link>
                </div>
              )
            })}
          </div>

          {/* Tablet: 3 columns */}
          <div
            className="hidden sm:block md:hidden"
            style={{
              columnCount: 3,
              columnGap: '16px',
            }}
          >
            {events.map((event) => {
              const availableTickets = event.ticketTypes.reduce(
                (sum, tt) => sum + (tt.quantity - tt.sold),
                0
              )
              const minPrice =
                event.ticketTypes.length > 0
                  ? Math.min(...event.ticketTypes.map((tt) => tt.price))
                  : 0

              return (
                <div
                  key={event.id}
                  style={{
                    breakInside: 'avoid',
                    marginBottom: '16px',
                  }}
                >
                  <Link
                    href={`/events/${event.slug}`}
                    className="group block overflow-hidden rounded-lg border transition-all hover:border-primary hover:shadow-lg"
                  >
                    {event.imageUrl ? (
                      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                        <img
                          src={event.imageUrl}
                          alt={event.title}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                      </div>
                    ) : (
                      <div className="aspect-[4/3] bg-gradient-to-br from-primary/20 to-primary/5" />
                    )}

                    <div className="p-3">
                      <h3 className="text-sm font-semibold group-hover:text-primary">
                        {event.title}
                      </h3>

                      <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(event.startDate, 'PP')}
                        </div>

                        {event.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {event.location}
                          </div>
                        )}
                      </div>

                      {event.categories && event.categories.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {event.categories.slice(0, 1).map((category, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground"
                            >
                              <Tag className="h-2 w-2" />
                              {category}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </Link>
                </div>
              )
            })}
          </div>

          {/* Mobile: 2 columns */}
          <div
            className="block sm:hidden"
            style={{
              columnCount: 2,
              columnGap: '12px',
            }}
          >
            {events.map((event) => {
              const minPrice =
                event.ticketTypes.length > 0
                  ? Math.min(...event.ticketTypes.map((tt) => tt.price))
                  : 0

              return (
                <div
                  key={event.id}
                  style={{
                    breakInside: 'avoid',
                    marginBottom: '12px',
                  }}
                >
                  <Link
                    href={`/events/${event.slug}`}
                    className="group block overflow-hidden rounded-lg border transition-all hover:border-primary"
                  >
                    {event.imageUrl ? (
                      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                        <img
                          src={event.imageUrl}
                          alt={event.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="aspect-[4/3] bg-gradient-to-br from-primary/20 to-primary/5" />
                    )}

                    <div className="p-2">
                      <h3 className="text-xs font-semibold line-clamp-2">
                        {event.title}
                      </h3>
                      <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-2 w-2" />
                        {format(event.startDate, 'MMM d')}
                      </div>
                    </div>
                  </Link>
                </div>
              )
            })}
          </div>
        </>
      ) : (
        <div
          className={
            viewMode === 'grid'
              ? 'grid gap-6 sm:grid-cols-2 lg:grid-cols-3'
              : 'space-y-4'
          }
        >
        {events.map((event) => {
          const availableTickets = event.ticketTypes.reduce(
            (sum, tt) => sum + (tt.quantity - tt.sold),
            0
          )

          const minPrice =
            event.ticketTypes.length > 0
              ? Math.min(...event.ticketTypes.map((tt) => tt.price))
              : 0

          if (viewMode === 'list') {
            return (
              <Link
                key={event.id}
                href={`/events/${event.slug}`}
                className="group flex overflow-hidden rounded-lg border transition-colors hover:border-primary"
              >
                {/* Image */}
                {event.imageUrl ? (
                  <div className="aspect-video w-48 shrink-0 overflow-hidden bg-muted">
                    <img
                      src={event.imageUrl}
                      alt={event.title}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="aspect-video w-48 shrink-0 bg-gradient-to-br from-primary/20 to-primary/5" />
                )}

                {/* Content */}
                <div className="flex flex-1 flex-col justify-between p-4">
                  <div>
                    <h3 className="font-semibold group-hover:text-primary">
                      {event.title}
                    </h3>

                    <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {format(event.startDate, 'PPP')}
                      </div>

                      {event.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {event.location}
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <Ticket className="h-4 w-4" />
                        {event.eventType === 'FREE_EVENT'
                          ? 'Free Event'
                          : minPrice === 0
                            ? 'Free'
                            : `From $${(minPrice / 100).toFixed(2)}`}
                      </div>
                    </div>
                  </div>

                  {/* Categories */}
                  {event.categories && event.categories.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {event.categories.slice(0, 3).map((category, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 rounded-full bg-accent px-2 py-1 text-xs font-medium text-accent-foreground"
                        >
                          <Tag className="h-3 w-3" />
                          {category}
                        </span>
                      ))}
                      {event.categories.length > 3 && (
                        <span className="inline-flex items-center rounded-full bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
                          +{event.categories.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Availability */}
                  {event.eventType === 'TICKETED_EVENT' && (
                    <div className="mt-3 text-sm">
                      {availableTickets > 0 ? (
                        <span className="text-green-600 dark:text-green-400">
                          {availableTickets} tickets available
                        </span>
                      ) : (
                        <span className="text-destructive">Sold Out</span>
                      )}
                    </div>
                  )}
                </div>
              </Link>
            )
          }

          // Grid View
          return (
            <Link
              key={event.id}
              href={`/events/${event.slug}`}
              className="group overflow-hidden rounded-lg border transition-colors hover:border-primary"
            >
              {event.imageUrl ? (
                <div className="aspect-video w-full overflow-hidden bg-muted">
                  <img
                    src={event.imageUrl}
                    alt={event.title}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                </div>
              ) : (
                <div className="aspect-video w-full bg-gradient-to-br from-primary/20 to-primary/5" />
              )}

              <div className="p-4">
                <h3 className="font-semibold group-hover:text-primary">
                  {event.title}
                </h3>

                <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {format(event.startDate, 'PPP')}
                  </div>

                  {event.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {event.location}
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Ticket className="h-4 w-4" />
                    {event.eventType === 'FREE_EVENT'
                      ? 'Free Event'
                      : minPrice === 0
                        ? 'Free'
                        : `From $${(minPrice / 100).toFixed(2)}`}
                  </div>
                </div>

                {/* Categories */}
                {event.categories && event.categories.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {event.categories.slice(0, 3).map((category, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 rounded-full bg-accent px-2 py-1 text-xs font-medium text-accent-foreground"
                      >
                        <Tag className="h-3 w-3" />
                        {category}
                      </span>
                    ))}
                    {event.categories.length > 3 && (
                      <span className="inline-flex items-center rounded-full bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
                        +{event.categories.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                {event.eventType === 'TICKETED_EVENT' && (
                  <div className="mt-3 text-sm">
                    {availableTickets > 0 ? (
                      <span className="text-green-600 dark:text-green-400">
                        {availableTickets} tickets available
                      </span>
                    ) : (
                      <span className="text-destructive">Sold Out</span>
                    )}
                  </div>
                )}
              </div>
            </Link>
          )
        })}
        </div>
      )}
    </div>
  )
}
