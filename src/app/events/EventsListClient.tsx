"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { Calendar, MapPin, Tag, Search, Filter, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { EventsSubNav } from "@/components/layout/EventsSubNav";
import { PageHero } from "@/components/ui/PageHero";
import { motion, AnimatePresence } from "framer-motion";

export default function EventsListClient() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [showPastEvents, setShowPastEvents] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  const events = useQuery(api.public.queries.getPublishedEvents, {
    searchTerm: searchTerm || undefined,
    category: selectedCategory,
    includePast: showPastEvents,
  });

  const categories = useQuery(api.public.queries.getCategories, {});

  // Timeout fallback - after 10 seconds, show error state
  useEffect(() => {
    if (events === undefined) {
      const timer = setTimeout(() => {
        setLoadingTimeout(true);
      }, 10000);
      return () => clearTimeout(timer);
    } else {
      setLoadingTimeout(false);
    }
  }, [events]);

  // Format date
  function formatEventDate(timestamp: number, timezone?: string): string {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: timezone || "America/New_York",
    });
  }

  // Show timeout error state
  if (loadingTimeout && events === undefined) {
    return (
      <>
        <PublicHeader />
        <EventsSubNav />
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-12">
            <motion.div
              className="text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, repeat: 2 }}
              >
                <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
              </motion.div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Connection Issue
              </h3>
              <p className="text-muted-foreground mb-4">
                Unable to load events. Please check your connection and try again.
              </p>
              <motion.button
                type="button"
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Retry
              </motion.button>
            </motion.div>
          </div>
        </div>
        <PublicFooter />
      </>
    );
  }

  if (events === undefined) {
    return (
      <>
        <PublicHeader />
        <EventsSubNav />
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-12">
            <div className="text-center">
              <motion.div
                className="inline-block rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <motion.p
                className="mt-4 text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Loading events...
              </motion.p>
            </div>
          </div>
        </div>
        <PublicFooter />
      </>
    );
  }

  return (
    <>
      <PublicHeader />
        <EventsSubNav />
      <div data-testid="events-page" className="min-h-screen bg-background">
        {/* Hero Section */}
        <PageHero
          title="All Events"
          subtitle="Discover amazing stepping events, workshops, and socials"
          imageUrl="https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1200&q=80"
          imageAlt="Dancing and stepping events"
        />

        {/* Filters */}
        <motion.div
          className="bg-card border-b border-border sticky top-0 z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <motion.div
                className="flex-1 relative"
                whileFocus={{ scale: 1.01 }}
              >
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search events by name, description, or location..."
                  data-testid="events-search-input"
                  className="w-full pl-10 pr-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground placeholder-muted-foreground transition-shadow"
                />
              </motion.div>

              {/* Category Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <select
                  value={selectedCategory || ""}
                  onChange={(e) => setSelectedCategory(e.target.value || undefined)}
                  data-testid="events-category-filter"
                  className="pl-10 pr-10 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent appearance-none bg-background text-foreground transition-shadow"
                >
                  <option value="">All Categories</option>
                  {categories?.map((cat) => (
                    <option key={cat.name} value={cat.name}>
                      {cat.name} ({cat.count})
                    </option>
                  ))}
                </select>
              </div>

              {/* Past Events Toggle */}
              <motion.label
                className="flex items-center gap-2 cursor-pointer px-4 py-2 bg-muted rounded-lg hover:bg-accent transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <input
                  type="checkbox"
                  checked={showPastEvents}
                  onChange={(e) => setShowPastEvents(e.target.checked)}
                  data-testid="events-past-toggle"
                  className="w-4 h-4 text-primary border-input rounded focus:ring-ring"
                />
                <span className="text-sm font-medium text-foreground">
                  Show past events
                </span>
              </motion.label>
            </div>

            {/* Active Filters Display */}
            <AnimatePresence>
              {(searchTerm || selectedCategory) && (
                <motion.div
                  className="mt-3 flex items-center gap-2"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <span className="text-sm text-muted-foreground">Active filters:</span>
                  {searchTerm && (
                    <motion.span
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-accent text-accent-foreground"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      Search: {searchTerm}
                      <button
                        type="button"
                        onClick={() => setSearchTerm("")}
                        className="ml-2 text-primary hover:text-primary/80"
                      >
                        ×
                      </button>
                    </motion.span>
                  )}
                  {selectedCategory && (
                    <motion.span
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-accent text-accent-foreground"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      Category: {selectedCategory}
                      <button
                        type="button"
                        onClick={() => setSelectedCategory(undefined)}
                        className="ml-2 text-primary hover:text-primary/80"
                      >
                        ×
                      </button>
                    </motion.span>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Events Grid */}
        <div className="container mx-auto px-4 py-8">
          {events.length === 0 ? (
            <motion.div
              data-testid="events-empty-state"
              className="text-center py-12"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              </motion.div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No events found
              </h3>
              <p className="text-muted-foreground">
                {searchTerm || selectedCategory
                  ? "Try adjusting your filters to find more events"
                  : "Check back soon for upcoming events!"}
              </p>
            </motion.div>
          ) : (
            <>
              <motion.div
                className="mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <p data-testid="events-count" className="text-muted-foreground">
                  Showing {events.length} {events.length === 1 ? "event" : "events"}
                </p>
              </motion.div>

              <motion.div
                data-testid="events-grid"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                initial="hidden"
                animate="visible"
                variants={{
                  visible: {
                    transition: {
                      staggerChildren: 0.1,
                    },
                  },
                }}
              >
                {events.map((event, index) => {
                  const isPast = event.endDate && event.endDate < Date.now();

                  return (
                    <motion.div
                      key={event._id}
                      variants={{
                        hidden: { opacity: 0, y: 30 },
                        visible: { opacity: 1, y: 0 },
                      }}
                      transition={{ duration: 0.5 }}
                    >
                      <Link
                        href={`/events/${event._id}`}
                        data-testid={`event-card-${event._id}`}
                        className="group block h-full"
                      >
                        <motion.div
                          className="bg-card rounded-lg shadow-md overflow-hidden h-full"
                          whileHover={{
                            y: -8,
                            boxShadow: "0 20px 40px -10px rgba(0,0,0,0.2)",
                          }}
                          transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        >
                          {/* Event Image */}
                          <div className="relative h-48 bg-gradient-to-br from-primary to-primary/80 overflow-hidden">
                            <img
                              src={event.imageUrl || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80"}
                              alt={event.name}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            {isPast && (
                              <motion.div
                                className="absolute top-2 right-2 bg-foreground/75 text-background px-3 py-1 rounded-full text-sm font-medium"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", delay: 0.2 }}
                              >
                                Past Event
                              </motion.div>
                            )}
                            {/* Gradient overlay on hover */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          </div>

                          {/* Event Details */}
                          <div className="p-5">
                            <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                              {event.name}
                            </h3>

                            <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                              {event.description}
                            </p>

                            {/* Date & Time */}
                            <div className="flex items-start gap-2 mb-2 text-sm text-foreground">
                              <Calendar className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
                              <div>
                                <div className="font-medium">
                                  {event.startDate && formatEventDate(event.startDate, event.timezone)}
                                </div>
                                {event.eventTimeLiteral && (
                                  <div className="text-muted-foreground">
                                    {event.eventTimeLiteral}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Location */}
                            {event.location && (
                              <div className="flex items-center gap-2 mb-3 text-sm text-foreground">
                                <MapPin className="w-4 h-4 shrink-0 text-primary" />
                                <span>
                                  {typeof event.location === 'string'
                                    ? event.location
                                    : `${event.location.venueName ? `${event.location.venueName}, ` : ''}${event.location.city}, ${event.location.state}`
                                  }
                                </span>
                              </div>
                            )}

                            {/* Categories */}
                            {event.categories && event.categories.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {event.categories.slice(0, 3).map((category, idx) => (
                                  <motion.span
                                    key={idx}
                                    className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-accent text-accent-foreground"
                                    whileHover={{ scale: 1.05 }}
                                  >
                                    <Tag className="w-3 h-3" />
                                    {category}
                                  </motion.span>
                                ))}
                                {event.categories.length > 3 && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                                    +{event.categories.length - 3} more
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Footer */}
                          <div className="px-5 py-3 bg-muted/50 border-t border-border">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">
                                by {event.organizerName || "SteppersLife"}
                              </span>
                              <motion.span
                                className="text-primary font-medium"
                                whileHover={{ x: 5 }}
                              >
                                View Details →
                              </motion.span>
                            </div>
                          </div>
                        </motion.div>
                      </Link>
                    </motion.div>
                  );
                })}
              </motion.div>
            </>
          )}
        </div>
      </div>
      <PublicFooter />
    </>
  );
}
