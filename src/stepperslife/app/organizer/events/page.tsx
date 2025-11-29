"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import {
  Calendar,
  Plus,
  Settings,
  Users,
  TicketCheck,
  DollarSign,
  Ticket,
  Armchair,
  Package,
  Trash2,
  Gift,
  Sparkles,
  X,
  Edit,
  TrendingUp,
  Check,
  BarChart3,
  Eye,
  EyeOff,
} from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { formatEventDate } from "@/lib/date-format";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Id } from "@/convex/_generated/dataModel";

export default function OrganizerEventsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const statusFilter = searchParams.get("status") || "all"; // Get status from URL

  // Verify user authentication
  const currentUser = useQuery(api.users.queries.getCurrentUser);

  // Fetch events - pass userId if currentUser exists, otherwise pass undefined
  // The query will return empty array if no userId is provided
  const events = useQuery(api.events.queries.getOrganizerEvents, {
    userId: currentUser?._id,
  });

  const credits = useQuery(api.credits.queries.getMyCredits);
  const bulkDeleteEvents = useMutation(api.events.mutations.bulkDeleteEvents);
  const publishEvent = useMutation(api.events.mutations.publishEvent);
  const unpublishEvent = useMutation(api.events.mutations.updateEvent);

  // Helper: Check if event needs tickets
  const needsTickets = (event: any) => {
    return (
      event.eventType === "TICKETED_EVENT" &&
      (!event.ticketTierCount || event.ticketTierCount === 0)
    );
  };

  const [selectedEvents, setSelectedEvents] = useState<Set<Id<"events">>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(true);
  const [deleteResult, setDeleteResult] = useState<{
    deletedCount: number;
    failedCount: number;
    failedEvents: Array<{ eventId: string; reason: string }>;
  } | null>(null);

  // Show loading while Convex queries are loading
  // Layout already handles auth protection via REST API
  // currentUser undefined = still loading from Convex
  // currentUser null = Convex auth not ready yet, wait for it
  // Note: Layout protects this route, so we don't need to redirect
  if (currentUser === undefined || currentUser === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading your events...</p>
        </div>
      </div>
    );
  }

  // At this point, currentUser exists, but events might still be loading
  const isLoading = events === undefined || credits === undefined;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading your events...</p>
        </div>
      </div>
    );
  }

  // Filter events based on status
  const filteredEvents = events?.filter((event) => {
    if (statusFilter === "all") return true;
    if (statusFilter === "active") {
      // Active events are those that haven't happened yet
      return event.startDate && event.startDate > Date.now();
    }
    if (statusFilter === "past") {
      // Past events are those that have already happened
      return event.startDate && event.startDate <= Date.now();
    }
    if (statusFilter === "draft") {
      // Draft events are those with DRAFT status
      return event.status === "DRAFT";
    }
    return true;
  }) || [];

  // Calculate totals for dashboard (using filtered events)
  const totalTicketsAllocated =
    filteredEvents?.reduce((sum, event) => sum + (event.totalTickets || 0), 0) || 0;
  const totalTicketsSold = filteredEvents?.reduce((sum, event) => sum + (event.ticketsSold || 0), 0) || 0;
  const percentageUsed = credits ? (credits.creditsUsed / credits.creditsTotal) * 100 : 0;

  // Helper: Check if event has tickets sold
  const hasTicketsSold = (event: any) => {
    return event.ticketsSold > 0;
  };

  // Quick select functions (use filteredEvents for current view)
  const selectAllEvents = () => {
    if (!filteredEvents) return;
    setSelectedEvents(new Set(filteredEvents.map((e) => e._id)));
  };

  const selectEventsWithTickets = () => {
    if (!filteredEvents) return;
    const eventsWithTickets = filteredEvents.filter((e) => hasTicketsSold(e));
    setSelectedEvents(new Set(eventsWithTickets.map((e) => e._id)));
  };

  const selectEventsWithoutTickets = () => {
    if (!filteredEvents) return;
    const eventsWithoutTickets = filteredEvents.filter((e) => !hasTicketsSold(e));
    setSelectedEvents(new Set(eventsWithoutTickets.map((e) => e._id)));
  };

  // Handle checkbox selection
  const toggleEventSelection = (eventId: Id<"events">) => {
    const newSelection = new Set(selectedEvents);
    if (newSelection.has(eventId)) {
      newSelection.delete(eventId);
    } else {
      newSelection.add(eventId);
    }
    setSelectedEvents(newSelection);
  };

  // Handle select all (use filteredEvents for current view)
  const toggleSelectAll = () => {
    if (!filteredEvents) return;
    if (selectedEvents.size === filteredEvents.length) {
      setSelectedEvents(new Set());
    } else {
      setSelectedEvents(new Set(filteredEvents.map((e) => e._id)));
    }
  };

  // Handle publish/unpublish event
  const handleTogglePublish = async (eventId: Id<"events">, currentStatus: string) => {
    try {
      if (currentStatus === "PUBLISHED") {
        // Unpublish by setting to DRAFT
        await unpublishEvent({
          eventId,
          status: "DRAFT",
        });
      } else {
        // Publish
        await publishEvent({ eventId });
      }
    } catch (error) {
      console.error("Failed to toggle publish status:", error);
      alert(error instanceof Error ? error.message : "Failed to update event status");
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedEvents.size === 0) return;

    setIsDeleting(true);
    try {
      const result = await bulkDeleteEvents({
        eventIds: Array.from(selectedEvents),
      });

      setDeleteResult(result);
      setSelectedEvents(new Set());
      setShowDeleteConfirm(false);

      // Show result message for a few seconds
      setTimeout(() => {
        setDeleteResult(null);
      }, 5000);
    } catch (error) {
      console.error("Error deleting events:", error);
      alert(`Error deleting events: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // TESTING MODE: Skip auth check
  // if (!currentUser) {
  //   return (
  //     <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
  //       <div className="bg-white rounded-lg shadow-md p-8 max-w-md text-center">
  //         <p className="text-gray-600 mb-4">Please sign in to access your organizer dashboard.</p>
  //         <Link href="/login" className="text-primary hover:underline font-medium">
  //           Sign In
  //         </Link>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen bg-muted">
      {/* Header - Mobile Optimized */}
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white shadow-sm border-b"
      >
        <div className="container mx-auto px-4 py-4 md:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">My Events</h1>
              <p className="text-sm md:text-base text-muted-foreground mt-1">
                Manage your events and ticket sales
              </p>
            </motion.div>
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto"
            >
              <Link
                href="/organizer/events/create"
                className="flex items-center justify-center gap-2 px-4 py-2.5 md:px-6 md:py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors shadow-md hover:shadow-lg w-full sm:w-auto"
              >
                <Plus className="w-5 h-5" />
                Create Event
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Main Content - Mobile Optimized */}
      <main className="container mx-auto px-4 py-4 md:py-8">
        {/* Welcome Banner for New Organizers - Mobile Optimized */}
        {credits &&
          credits.creditsRemaining === 300 &&
          credits.creditsUsed === 0 &&
          showWelcomeBanner && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-4 md:mb-6"
            >
              <div className="bg-accent border-2 border-primary rounded-lg p-4 md:p-6 shadow-lg">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-10 h-10 md:w-14 md:h-14 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-5 h-5 md:w-8 md:h-8 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg md:text-2xl font-bold text-foreground mb-1 md:mb-2 flex items-center gap-1 md:gap-2">
                        <span className="truncate">Welcome to SteppersLife!</span>
                        <span className="text-lg md:text-2xl">🎉</span>
                      </h3>
                      <p className="text-sm md:text-lg text-foreground mb-2 md:mb-3">
                        You've received{" "}
                        <span className="font-bold text-primary">300 FREE tickets</span> to get
                        started!
                      </p>
                      <div className="bg-white/70 rounded-lg p-3 md:p-4 border border-primary/20">
                        <p className="text-xs md:text-sm text-muted-foreground mb-1.5 md:mb-2">
                          <strong>Here's what you can do:</strong>
                        </p>
                        <ul className="text-xs md:text-sm text-foreground space-y-0.5 md:space-y-1 list-disc list-inside">
                          <li>Create your first event</li>
                          <li>Use 300 free tickets - no charges!</li>
                          <li>After free tickets: $0.30 per ticket</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowWelcomeBanner(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 p-1"
                    aria-label="Close welcome banner"
                  >
                    <X className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

        {/* Credit Dashboard - Mobile Optimized */}
        {credits && (
          <div className="mb-4 md:mb-8 space-y-3 md:space-y-6">
            {/* Main Credit Balance Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="bg-primary rounded-lg shadow-lg p-4 md:p-8 text-white">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 md:gap-6">
                  <div className="flex-1 w-full">
                    <div className="flex items-center gap-2 mb-1 md:mb-2">
                      <Gift className="w-5 h-5 md:w-6 md:h-6" />
                      <h2 className="text-lg md:text-2xl font-bold">Available Credits</h2>
                    </div>
                    <p className="text-sm md:text-base text-white/90 mb-3 md:mb-4">
                      Ready to use for ticket creation
                    </p>

                    <div className="mb-4 md:mb-6">
                      <div className="text-3xl md:text-5xl lg:text-6xl font-bold mb-1 md:mb-2">
                        {credits.creditsRemaining.toLocaleString()}
                      </div>
                      <p className="text-base md:text-xl text-white/90">tickets available</p>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5 md:space-y-2">
                      <div className="flex items-center justify-between text-xs md:text-sm">
                        <span>
                          Usage: {credits.creditsUsed.toLocaleString()} /{" "}
                          {credits.creditsTotal.toLocaleString()}
                        </span>
                        <span>{percentageUsed.toFixed(1)}% used</span>
                      </div>
                      <div className="w-full bg-white/20 backdrop-blur-sm rounded-full h-2 md:h-3">
                        <div
                          className="bg-white rounded-full h-2 md:h-3 transition-all duration-500"
                          style={{ width: `${Math.min(percentageUsed, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-row lg:flex-col gap-2 md:gap-3 w-full lg:w-auto">
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1.5 md:px-4 md:py-2 flex-1 lg:flex-none">
                      <p className="text-xs md:text-sm font-medium text-center">$0.30 per ticket</p>
                    </div>
                    {credits.creditsTotal === 300 && credits.creditsUsed === 0 && (
                      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-1.5 md:px-4 md:py-2 flex-1 lg:flex-none">
                        <div className="flex items-center justify-center gap-1.5 md:gap-2 text-xs md:text-sm">
                          <Check className="w-3 h-3 md:w-4 md:h-4" />
                          <span className="font-semibold">Welcome Bonus!</span>
                        </div>
                      </div>
                    )}
                    {credits.creditsRemaining <= 100 && credits.creditsRemaining > 0 && (
                      <div className="bg-orange-500 rounded-lg px-3 py-1.5 md:px-4 md:py-2 flex-1 lg:flex-none">
                        <p className="text-xs md:text-sm font-semibold text-center">Running low!</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Statistics Cards - Mobile Optimized */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4"
            >
              <div className="bg-white rounded-lg shadow-sm border p-4 md:p-6">
                <div className="flex items-center gap-2.5 md:gap-3 mb-2 md:mb-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-accent rounded-lg flex items-center justify-center flex-shrink-0">
                    <Ticket className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs md:text-sm text-muted-foreground">Total Allocated</p>
                    <p className="text-xl md:text-2xl font-bold text-foreground">
                      {totalTicketsAllocated.toLocaleString()}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-gray-500">Tickets created across all events</p>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-4 md:p-6">
                <div className="flex items-center gap-2.5 md:gap-3 mb-2 md:mb-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-success/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-success" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs md:text-sm text-muted-foreground">Tickets Sold</p>
                    <p className="text-xl md:text-2xl font-bold text-foreground">
                      {totalTicketsSold.toLocaleString()}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-gray-500">Successful ticket sales</p>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-4 md:p-6">
                <div className="flex items-center gap-2.5 md:gap-3 mb-2 md:mb-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-accent rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs md:text-sm text-muted-foreground">Active Events</p>
                    <p className="text-xl md:text-2xl font-bold text-foreground">
                      {events?.length || 0}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-gray-500">Events with ticket tiers</p>
              </div>
            </motion.div>
          </div>
        )}

        {/* Delete Result Notification */}
        {deleteResult && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`mb-4 p-4 rounded-lg ${
              deleteResult.failedCount > 0
                ? "bg-warning/10 border border-warning"
                : "bg-success/10 border border-success"
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <p className="font-semibold text-foreground">
                  {deleteResult.deletedCount > 0 && (
                    <span className="text-success">
                      Successfully deleted {deleteResult.deletedCount} event
                      {deleteResult.deletedCount !== 1 ? "s" : ""}
                    </span>
                  )}
                </p>
                {deleteResult.failedCount > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-semibold text-warning mb-1">
                      Failed to delete {deleteResult.failedCount} event
                      {deleteResult.failedCount !== 1 ? "s" : ""}:
                    </p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {deleteResult.failedEvents.map((failed, i) => (
                        <li key={i}>• {failed.reason}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <button
                onClick={() => setDeleteResult(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
          </motion.div>
        )}

        {/* My Events Section - Mobile Optimized */}
        <div className="mb-4 md:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3 md:mb-4">
            <h2 className="text-xl md:text-2xl font-bold text-foreground">My Events</h2>
            {selectedEvents.size > 0 && (
              <motion.button
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isDeleting}
                className="flex items-center justify-center gap-2 px-3 py-2 md:px-4 md:py-2 bg-destructive text-white rounded-lg hover:bg-destructive/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm w-full sm:w-auto"
              >
                <Trash2 className="w-4 h-4" />
                Delete Selected ({selectedEvents.size})
              </motion.button>
            )}
          </div>

          {/* Quick Select Buttons - Mobile Optimized */}
          {events.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-3 md:mb-4 p-3 md:p-4 bg-white rounded-lg border border-border">
              <span className="text-xs md:text-sm font-medium text-foreground w-full sm:w-auto mb-1 sm:mb-0">
                Quick Select:
              </span>
              <button
                onClick={selectAllEvents}
                className="px-2 py-1 md:px-3 md:py-1.5 text-xs md:text-sm bg-accent text-primary rounded-md hover:bg-primary/20 transition-colors"
              >
                All ({events.length})
              </button>
              <button
                onClick={selectEventsWithTickets}
                className="px-2 py-1 md:px-3 md:py-1.5 text-xs md:text-sm bg-success/10 text-success rounded-md hover:bg-success/20 transition-colors"
              >
                With Tickets ({events.filter((e) => hasTicketsSold(e)).length})
              </button>
              <button
                onClick={selectEventsWithoutTickets}
                className="px-2 py-1 md:px-3 md:py-1.5 text-xs md:text-sm bg-muted text-foreground rounded-md hover:bg-muted/80 transition-colors"
              >
                No Tickets ({events.filter((e) => !hasTicketsSold(e)).length})
              </button>
              <button
                onClick={() => setSelectedEvents(new Set())}
                className="px-2 py-1 md:px-3 md:py-1.5 text-xs md:text-sm bg-destructive/10 text-destructive rounded-md hover:bg-destructive/20 transition-colors"
              >
                Clear
              </button>
              {selectedEvents.size > 0 && (
                <span className="ml-auto text-xs md:text-sm font-medium text-foreground">
                  {selectedEvents.size} selected
                </span>
              )}
            </div>
          )}
        </div>

        {events.length === 0 ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-lg shadow-md p-12 text-center"
          >
            <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">No events yet</h3>
            <p className="text-muted-foreground mb-6">Create your first event to start selling tickets</p>
            <Link
              href="/organizer/events/create"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create Your First Event
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {filteredEvents.map((event, index) => {
              const isUpcoming = event.startDate ? event.startDate > Date.now() : false;
              const isPast = event.endDate ? event.endDate < Date.now() : false;

              return (
                <motion.div
                  key={event._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 * index }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="relative bg-white rounded-lg shadow-md border border-border overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row">
                    {/* Selection Checkbox */}
                    <div className="absolute top-3 left-3 md:top-4 md:left-4 z-10">
                      <input
                        type="checkbox"
                        checked={selectedEvents.has(event._id)}
                        onChange={() => toggleEventSelection(event._id)}
                        className="w-4 h-4 md:w-5 md:h-5 text-primary bg-white border-2 border-gray-300 rounded focus:ring-2 focus:ring-ring cursor-pointer"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>

                    {/* Event Image */}
                    <div className="sm:w-48 h-28 sm:h-auto bg-muted flex-shrink-0">
                      {event.imageUrl ? (
                        <img
                          src={event.imageUrl}
                          alt={event.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary">
                          <Calendar className="w-10 h-10 md:w-12 md:h-12 text-white opacity-50" />
                        </div>
                      )}
                    </div>

                    {/* Event Details */}
                    <div className="flex-1 p-4 md:p-6">
                      <div className="mb-2 md:mb-3">
                        <h3 className="text-lg md:text-xl font-bold text-foreground mb-1.5 md:mb-2 pr-6">
                          {event.name}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm text-muted-foreground">
                          {event.startDate && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 md:w-4 md:h-4" />
                              <span className="text-xs md:text-sm">
                                {formatEventDate(event.startDate, event.timezone)}
                              </span>
                            </span>
                          )}
                          {event.eventType && (
                            <span className="px-1.5 py-0.5 md:px-2 md:py-1 text-xs font-semibold bg-muted rounded-full">
                              {event.eventType.replace("_", " ")}
                            </span>
                          )}
                          {/* Status Badge */}
                          {event.status === "PUBLISHED" ? (
                            <span className="px-1.5 py-0.5 md:px-2 md:py-1 text-xs font-semibold bg-success/10 text-success rounded-full flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              Published
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 md:px-2 md:py-1 text-xs font-semibold bg-warning/10 text-warning rounded-full flex items-center gap-1">
                              <EyeOff className="w-3 h-3" />
                              Draft
                            </span>
                          )}
                          {isPast && (
                            <span className="px-1.5 py-0.5 md:px-2 md:py-1 text-xs font-semibold bg-muted text-muted-foreground rounded-full">
                              Ended
                            </span>
                          )}
                          {isUpcoming && (
                            <span className="px-1.5 py-0.5 md:px-2 md:py-1 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full">
                              Upcoming
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons - Mobile Optimized */}
                      <div className="flex flex-wrap gap-2 md:gap-3 mt-3 md:mt-4">
                        {/* Primary Actions - Always Visible */}
                        <Link
                          href={`/organizer/events/${event._id}/edit`}
                          className="flex items-center justify-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex-1 sm:flex-none"
                        >
                          <Edit className="w-3.5 h-3.5 md:w-4 md:h-4" />
                          <span>Edit</span>
                        </Link>

                        <Link
                          href={`/organizer/events/${event._id}/tickets`}
                          className={`flex items-center justify-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm rounded-lg transition-all flex-1 sm:flex-none relative ${
                            needsTickets(event)
                              ? "bg-warning hover:bg-warning/90 text-white shadow-lg animate-pulse-glow"
                              : "bg-primary hover:bg-primary/90 text-white"
                          }`}
                        >
                          <TicketCheck className="w-3.5 h-3.5 md:w-4 md:h-4" />
                          <span>Tickets</span>
                          {needsTickets(event) ? (
                            <span className="ml-0.5 md:ml-1 px-1.5 py-0.5 bg-destructive text-white rounded-full text-xs font-semibold">
                              Required
                            </span>
                          ) : event.ticketTierCount !== undefined && event.ticketTierCount > 0 ? (
                            <span className="ml-0.5 md:ml-1 px-1.5 py-0.5 bg-white/20 rounded-full text-xs font-semibold">
                              {event.ticketTierCount}
                            </span>
                          ) : null}
                        </Link>

                        {/* Publish/Unpublish Button - Prominent */}
                        <button
                          onClick={() => handleTogglePublish(event._id, event.status || "DRAFT")}
                          className={`flex items-center justify-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm rounded-lg transition-all flex-1 sm:flex-none font-semibold shadow-md ${
                            event.status === "PUBLISHED"
                              ? "bg-success hover:bg-success/90 text-white"
                              : "bg-warning hover:bg-warning/90 text-white animate-pulse"
                          }`}
                        >
                          {event.status === "PUBLISHED" ? (
                            <>
                              <Eye className="w-3.5 h-3.5 md:w-4 md:h-4" />
                              <span>Published</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3.5 h-3.5 md:w-4 md:h-4" />
                              <span>Publish Now</span>
                            </>
                          )}
                        </button>

                        {/* View Public - Desktop Only */}
                        <Link
                          href={`/events/${event._id}`}
                          className="hidden md:flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <Calendar className="w-4 h-4" />
                          View Public
                        </Link>

                        {/* Setup Payment - Prominent if needed */}
                        {!event.paymentModelSelected && event.eventType === "TICKETED_EVENT" && (
                          <Link
                            href={`/organizer/events/${event._id}/payment-setup`}
                            className="flex items-center justify-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm bg-warning text-white rounded-lg hover:bg-warning/90 transition-colors flex-1 sm:flex-none"
                          >
                            <Settings className="w-3.5 h-3.5 md:w-4 md:h-4" />
                            <span className="hidden sm:inline">Setup Payment</span>
                            <span className="sm:hidden">Payment</span>
                          </Link>
                        )}

                        {/* Secondary Actions - Desktop Only */}
                        {event.paymentModelSelected && (
                          <>
                            <Link
                              href={`/organizer/events/${event._id}/staff`}
                              className="hidden lg:flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              <Users className="w-4 h-4" />
                              Staff
                            </Link>
                            <Link
                              href={`/organizer/events/${event._id}/seating`}
                              className="hidden lg:flex items-center gap-2 px-4 py-2 text-sm border border-primary bg-accent text-primary rounded-lg hover:bg-accent transition-colors"
                            >
                              <Armchair className="w-4 h-4" />
                              Seating
                            </Link>
                            <Link
                              href={`/organizer/events/${event._id}#bundles`}
                              className="hidden lg:flex items-center gap-2 px-4 py-2 text-sm border border-emerald-300 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors"
                            >
                              <Package className="w-4 h-4" />
                              Bundles
                            </Link>
                            <Link
                              href={`/organizer/events/${event._id}`}
                              className="hidden md:flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              <BarChart3 className="w-4 h-4" />
                              Dashboard
                            </Link>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Confirmation Dialog */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Trash2 className="w-6 h-6 text-destructive" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    Delete {selectedEvents.size} Event{selectedEvents.size !== 1 ? "s" : ""}?
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    This will permanently delete the selected event
                    {selectedEvents.size !== 1 ? "s" : ""} and all associated data (tickets, staff,
                    bundles, seating charts, etc.).
                  </p>
                  <p className="text-destructive text-sm font-semibold mt-2">
                    This action cannot be undone!
                  </p>
                  <p className="text-muted-foreground text-xs mt-2">
                    Note: Events with sold tickets cannot be deleted and will be skipped.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                  className="px-4 py-2 border border-border text-foreground rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-destructive text-white rounded-lg hover:bg-destructive/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Delete {selectedEvents.size} Event{selectedEvents.size !== 1 ? "s" : ""}
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
}
