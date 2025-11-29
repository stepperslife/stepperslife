"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Tag, ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState } from "react";

interface Event {
  _id: string;
  name: string;
  description: string;
  eventType: string;
  eventDateLiteral: string;
  eventTimeLiteral?: string;
  location: {
    venueName?: string;
    city: string;
    state: string;
  };
  categories?: string[];
  imageUrl?: string;
  isFeatured?: boolean;
}

interface EventsGridProps {
  events: Event[];
}

export function EventsGrid({ events }: EventsGridProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Manual scroll functions
  const scroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = direction === "left" ? -350 : 350;
    scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  if (events.length === 0) {
    return null;
  }

  return (
    <section className="bg-muted/30 py-16">
      <div className="container px-4 mx-auto">
        <div className="mb-10 flex flex-wrap items-start justify-between gap-4">
          <div className="flex-1 min-w-[250px]">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Upcoming Events
            </h2>
            <p className="mt-2 text-muted-foreground">
              Don&apos;t miss out on the hottest steppin events
            </p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => scroll("left")}
                className="p-2 rounded-full bg-card shadow-md hover:bg-background transition-colors"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => scroll("right")}
                className="p-2 rounded-full bg-card shadow-md hover:bg-background transition-colors"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            <Button asChild variant="outline">
              <Link href="/events">View All Events</Link>
            </Button>
          </div>
        </div>

        <div
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-muted-foreground scrollbar-track-muted"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          style={{ scrollbarWidth: "thin" }}
        >
          {events.slice(0, 12).map((event) => {
            if (!event || !event.location) {
              return null;
            }

            const locationDisplay = event.location.venueName
              || `${event.location.city}, ${event.location.state}`;

            const eventTypeBadge = event.eventType === "FREE_EVENT"
              ? "Free"
              : event.eventType === "TICKETED_EVENT"
              ? "Tickets Available"
              : "Save the Date";

            const description = event.description && event.description.length > 120
              ? event.description.substring(0, 120) + "..."
              : event.description || "";

            const imageUrl = event.imageUrl || "/images/event-placeholder.jpg";

            return (
              <Link
                key={event._id}
                href={`/events/${event._id}`}
                className="group flex-none w-[300px] md:w-[350px] snap-start"
              >
                <article className="overflow-hidden rounded-lg border bg-card transition-all hover:shadow-xl h-full flex flex-col">
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <Image
                      src={imageUrl}
                      alt={event.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      unoptimized={true}
                    />
                    {event.isFeatured && (
                      <div className="absolute right-3 top-3">
                        <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                          Featured
                        </span>
                      </div>
                    )}
                    <div className="absolute left-3 top-3">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        event.eventType === "FREE_EVENT"
                          ? "bg-success text-white"
                          : "bg-primary text-white"
                      }`}>
                        {eventTypeBadge}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="mb-2 text-xl font-bold group-hover:text-primary line-clamp-2">
                      {event.name}
                    </h3>
                    <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
                      {description}
                    </p>

                    <div className="space-y-2 text-sm mt-auto">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4 flex-shrink-0" />
                        <span>{event.eventDateLiteral}</span>
                      </div>
                      {event.eventTimeLiteral && (
                        <div className="flex items-center gap-2 text-muted-foreground text-xs pl-6">
                          <span>{event.eventTimeLiteral}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4 flex-shrink-0" />
                        <span className="line-clamp-1">{locationDisplay}</span>
                      </div>
                      {event.categories && event.categories.length > 0 && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Tag className="h-4 w-4 flex-shrink-0" />
                          <span className="line-clamp-1">{event.categories[0]}</span>
                        </div>
                      )}
                    </div>

                    <Button className="mt-4 w-full" size="sm">
                      View Details
                    </Button>
                  </div>
                </article>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
