"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { Calendar, MapPin, Tag, Search, Filter, AlertCircle, Ticket, Music, Users, Star } from "lucide-react";
import { useState, useEffect } from "react";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { EventsSubNav } from "@/components/layout/EventsSubNav";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ViewToggle, ViewMode, getViewClasses } from "@/components/ui/ViewToggle";
import { PortfolioGrid } from "@/components/shadcn-studio/blocks/portfolio-01/portfolio-01";

export default function EventsListClient() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [showPastEvents, setShowPastEvents] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

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
        {/* Epic Hero Section */}
        <section className="relative min-h-[500px] md:min-h-[600px] w-full overflow-hidden">
          {/* Animated Gradient Background */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-sky-900 via-primary to-sky-800"
            animate={{
              background: [
                "linear-gradient(135deg, #0c4a6e 0%, #0284c7 50%, #075985 100%)",
                "linear-gradient(135deg, #0284c7 0%, #075985 50%, #0c4a6e 100%)",
                "linear-gradient(135deg, #075985 0%, #0c4a6e 50%, #0284c7 100%)",
                "linear-gradient(135deg, #0c4a6e 0%, #0284c7 50%, #075985 100%)",
              ],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          />

          {/* Background Image with Parallax */}
          <motion.div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1920&q=80')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.5 }}
          />

          {/* Floating Icons */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Ticket Icon */}
            <motion.div
              className="absolute top-20 left-[10%] text-white/20"
              animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            >
              <Ticket className="w-16 h-16 md:w-24 md:h-24" />
            </motion.div>

            {/* Calendar Icon */}
            <motion.div
              className="absolute top-32 right-[15%] text-white/15"
              animate={{ y: [0, 15, 0], rotate: [0, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            >
              <Calendar className="w-12 h-12 md:w-20 md:h-20" />
            </motion.div>

            {/* Music Icon */}
            <motion.div
              className="absolute bottom-32 left-[20%] text-white/10"
              animate={{ y: [0, -15, 0], rotate: [0, 15, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            >
              <Music className="w-14 h-14 md:w-16 md:h-16" />
            </motion.div>

            {/* Users Icon */}
            <motion.div
              className="absolute bottom-40 right-[10%] text-white/15"
              animate={{ y: [0, 20, 0], rotate: [0, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            >
              <Users className="w-10 h-10 md:w-14 md:h-14" />
            </motion.div>

            {/* Star Icons */}
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                style={{
                  left: `${10 + Math.random() * 80}%`,
                  top: `${10 + Math.random() * 80}%`,
                }}
                animate={{
                  opacity: [0.1, 0.4, 0.1],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              >
                <Star className="w-3 h-3 md:w-4 md:h-4 text-warning/30 fill-yellow-400/30" />
              </motion.div>
            ))}
          </div>

          {/* Content */}
          <div className="relative z-10 container mx-auto px-4 h-full flex items-center py-16 md:py-24">
            <div className="max-w-3xl">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-6"
              >
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-sm font-medium">
                  <Ticket className="w-4 h-4" />
                  {events.length} Events Available
                </span>
              </motion.div>

              {/* Main Title */}
              <motion.h1
                className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
              >
                Find Your Next{" "}
                <motion.span
                  className="inline-block bg-gradient-to-r from-sky-300 via-pink-300 to-yellow-300 bg-clip-text text-transparent"
                  animate={{
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                  }}
                  transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                  style={{ backgroundSize: "200% 200%" }}
                >
                  Stepping Event
                </motion.span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
              >
                Discover workshops, socials, competitions, and unforgettable nights.
                Join the Chicago Steppin community and make memories that last.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                className="flex flex-wrap gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
              >
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    size="lg"
                    className="text-lg px-8 py-6 bg-white !text-primary hover:bg-white/90 shadow-xl shadow-sky-900/30"
                    onClick={() => document.getElementById('events-grid')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    <Calendar className="w-5 h-5 mr-2 text-primary" />
                    Browse Events
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="text-lg px-8 py-6 bg-white/10 border-white/30 !text-white hover:bg-white/20 backdrop-blur-sm"
                  >
                    <Link href="/organizer/events/create">
                      <Ticket className="w-5 h-5 mr-2 text-white" />
                      Host an Event
                    </Link>
                  </Button>
                </motion.div>
              </motion.div>

              {/* Stats */}
              <motion.div
                className="mt-12 flex flex-wrap gap-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.5 }}
              >
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-white">{events.length}+</div>
                  <div className="text-sm text-white/60">Active Events</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-white">1000+</div>
                  <div className="text-sm text-white/60">Happy Steppers</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-white">50+</div>
                  <div className="text-sm text-white/60">Cities</div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Bottom Gradient Fade */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
        </section>

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

              {/* View Toggle */}
              <ViewToggle view={viewMode} onViewChange={setViewMode} />
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
        <div id="events-grid" className="container mx-auto px-4 py-8">
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
              {viewMode === "list" ? (
                /* List View - Image on left */
                <div data-testid="events-grid" className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {events.map((event) => (
                    <Link
                      key={event._id}
                      href={`/events/${event._id}`}
                      data-testid={`event-card-${event._id}`}
                      className="group block"
                    >
                      <img
                        src={event.imageUrl || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80"}
                        alt={event.name}
                        className="h-auto max-w-full w-full rounded-lg shadow-md hover:shadow-xl transition-all duration-300 group-hover:scale-[1.02]"
                      />
                    </Link>
                  ))}
                </div>
              ) : (
                /* Masonry Image Gallery */
                <div data-testid="events-grid" className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[0, 1, 2, 3].map((columnIndex) => (
                    <div key={columnIndex} className="grid gap-4">
                      {events
                        .filter((_, index) => index % 4 === columnIndex)
                        .map((event) => (
                          <div key={event._id}>
                            <Link
                              href={`/events/${event._id}`}
                              data-testid={`event-card-${event._id}`}
                              className="group block"
                            >
                              <img
                                src={event.imageUrl || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80"}
                                alt={event.name}
                                className="h-auto max-w-full w-full rounded-lg shadow-md hover:shadow-xl transition-all duration-300 group-hover:scale-[1.02]"
                              />
                            </Link>
                          </div>
                        ))}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <PublicFooter />
    </>
  );
}
