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
  Edit,
  TrendingUp,
  Check,
  BarChart3,
  Eye,
  EyeOff,
  Copy,
  List,
  LayoutGrid,
} from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { formatEventDate } from "@/lib/date-format";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { WelcomePopup } from "@/components/organizer/WelcomePopup";
import { OrganizerCalendar, CalendarEvent } from "@/components/organizer/OrganizerCalendar";

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
  const deleteEvent = useMutation(api.events.mutations.deleteEvent);
  const publishEvent = useMutation(api.events.mutations.publishEvent);
  const unpublishEvent = useMutation(api.events.mutations.updateEvent);
  const duplicateEvent = useMutation(api.events.mutations.duplicateEvent);
  const markWelcomePopupShown = useMutation(api.users.mutations.markWelcomePopupShown);

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
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
  const [deleteResult, setDeleteResult] = useState<{
    deletedCount: number;
    failedCount: number;
    failedEvents: Array<{ eventId: string; reason: string }>;
  } | null>(null);

  // Single event delete state
  const [showSingleDeleteConfirm, setShowSingleDeleteConfirm] = useState<Id<"events"> | null>(null);
  const [deletingEventId, setDeletingEventId] = useState<Id<"events"> | null>(null);

  // Duplicate event state
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [duplicatingEventId, setDuplicatingEventId] = useState<Id<"events"> | null>(null);

  // Track failed images to show fallback
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  // View mode: list or calendar
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [duplicateOptions, setDuplicateOptions] = useState({
    newName: "",
    copyTickets: true,
    copySeating: true,
    copyStaff: true,
  });
  const [isDuplicating, setIsDuplicating] = useState(false);

  // Show welcome popup for new organizers who haven't seen it
  useEffect(() => {
    if (
      currentUser &&
      !currentUser.welcomePopupShown &&
      credits &&
      credits.creditsRemaining === 1000 &&
      credits.creditsUsed === 0
    ) {
      setShowWelcomePopup(true);
    }
  }, [currentUser, credits]);

  // Handle closing the welcome popup
  const handleCloseWelcomePopup = async () => {
    setShowWelcomePopup(false);
    try {
      await markWelcomePopupShown({});
    } catch (error) {
      console.error("Failed to mark welcome popup as shown:", error);
    }
  };

  // Show loading while Convex queries are loading
  // Layout already handles auth protection via REST API
  // currentUser undefined = still loading from Convex
  // currentUser null = Convex auth not ready yet, but we can proceed with empty events
  // Note: Layout protects this route, so we don't need to redirect
  if (currentUser === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading your events...</p>
        </div>
      </div>
    );
  }

  // At this point, currentUser may be null (Convex auth issue) or defined
  // Events and credits might still be loading (undefined)
  // We'll handle null currentUser by showing no events
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
  // IMPORTANT: Exclude classes - they have their own page at /organizer/classes
  const filteredEvents = events?.filter((event) => {
    // First, exclude classes from this page
    if (event.eventType === "CLASS") return false;

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

  // Default credits if null (for new users or when Convex auth not ready)
  const effectiveCredits = credits || {
    creditsTotal: 1000,
    creditsUsed: 0,
    creditsRemaining: 1000,
    firstEventFreeUsed: false,
    hasFirstEventFree: true,
  };

  // Calculate totals for dashboard (using filtered events)
  const totalTicketsAllocated =
    filteredEvents?.reduce((sum, event) => sum + (event.totalTickets || 0), 0) || 0;
  const totalTicketsSold = filteredEvents?.reduce((sum, event) => sum + (event.ticketsSold || 0), 0) || 0;
  const percentageUsed = effectiveCredits.creditsTotal > 0
    ? (effectiveCredits.creditsUsed / effectiveCredits.creditsTotal) * 100
    : 0;

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

  // Handle single event delete
  const handleSingleDelete = async (eventId: Id<"events">) => {
    setDeletingEventId(eventId);
    try {
      await deleteEvent({ eventId });
      setShowSingleDeleteConfirm(null);
    } catch (error) {
      console.error("Failed to delete event:", error);
      alert(error instanceof Error ? error.message : "Failed to delete event");
    } finally {
      setDeletingEventId(null);
    }
  };

  // Handle opening duplicate dialog
  const handleOpenDuplicate = (eventId: Id<"events">, eventName: string) => {
    setDuplicatingEventId(eventId);
    setDuplicateOptions({
      newName: `${eventName} (Copy)`,
      copyTickets: true,
      copySeating: true,
      copyStaff: true,
    });
    setShowDuplicateDialog(true);
  };

  // Handle duplicate event
  const handleDuplicateEvent = async () => {
    if (!duplicatingEventId) return;

    setIsDuplicating(true);
    try {
      const result = await duplicateEvent({
        eventId: duplicatingEventId,
        options: {
          newName: duplicateOptions.newName || undefined,
          copyTickets: duplicateOptions.copyTickets,
          copySeating: duplicateOptions.copySeating,
          copyStaff: duplicateOptions.copyStaff,
        },
      });

      setShowDuplicateDialog(false);
      setDuplicatingEventId(null);

      // Navigate to the new event
      router.push(`/organizer/events/${result.newEventId}/edit`);
    } catch (error) {
      console.error("Error duplicating event:", error);
      alert(`Error duplicating event: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsDuplicating(false);
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
  //     <div className="min-h-screen bg-card flex items-center justify-center p-4">
  //       <div className="bg-white rounded-lg shadow-md p-8 max-w-md text-center">
  //         <p className="text-muted-foreground mb-4">Please sign in to access your organizer dashboard.</p>
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
        {/* Welcome Popup Modal for First-Time Organizers */}
        <WelcomePopup
          open={showWelcomePopup}
          onClose={handleCloseWelcomePopup}
          creditsRemaining={effectiveCredits?.creditsRemaining || 1000}
        />

        {/* Small Reminder Badge - Shows after popup was dismissed */}
        {currentUser?.welcomePopupShown &&
          effectiveCredits &&
          effectiveCredits.creditsRemaining === 1000 &&
          effectiveCredits.creditsUsed === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-4 md:mb-6"
            >
              <div className="bg-gradient-to-r from-primary/10 via-accent to-primary/10 border border-primary/30 rounded-lg p-3 md:p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <Gift className="w-4 h-4 md:w-5 md:h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm md:text-base font-semibold text-foreground">
                      🎉 You have <span className="text-primary">1,000 FREE tickets</span> to use!
                    </p>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      Create your first event - no charges until you use them all.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

        {/* Credit Dashboard - Mobile Optimized */}
        {effectiveCredits && (
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
                        {effectiveCredits.creditsRemaining.toLocaleString()}
                      </div>
                      <p className="text-base md:text-xl text-white/90">tickets available</p>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5 md:space-y-2">
                      <div className="flex items-center justify-between text-xs md:text-sm">
                        <span>
                          Usage: {effectiveCredits.creditsUsed.toLocaleString()} /{" "}
                          {effectiveCredits.creditsTotal.toLocaleString()}
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
                    {effectiveCredits.creditsTotal === 1000 && effectiveCredits.creditsUsed === 0 && (
                      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-1.5 md:px-4 md:py-2 flex-1 lg:flex-none">
                        <div className="flex items-center justify-center gap-1.5 md:gap-2 text-xs md:text-sm">
                          <Check className="w-3 h-3 md:w-4 md:h-4" />
                          <span className="font-semibold">Welcome Bonus!</span>
                        </div>
                      </div>
                    )}
                    {effectiveCredits.creditsRemaining <= 100 && effectiveCredits.creditsRemaining > 0 && (
                      <div className="bg-primary/50 rounded-lg px-3 py-1.5 md:px-4 md:py-2 flex-1 lg:flex-none">
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
                <p className="text-xs text-muted-foreground">Tickets created across all events</p>
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
                <p className="text-xs text-muted-foreground">Successful ticket sales</p>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-4 md:p-6">
                <div className="flex items-center gap-2.5 md:gap-3 mb-2 md:mb-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-accent rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs md:text-sm text-muted-foreground">Active Events</p>
                    <p className="text-xl md:text-2xl font-bold text-foreground">
                      {events?.filter(e => e.eventType !== "CLASS").length || 0}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">Events with ticket tiers</p>
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
                type="button"
                onClick={() => setDeleteResult(null)}
                className="text-muted-foreground hover:text-muted-foreground"
              >
                ✕
              </button>
            </div>
          </motion.div>
        )}

        {/* My Events Section - Mobile Optimized */}
        <div className="mb-4 md:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3 md:mb-4">
            <div className="flex items-center gap-4">
              <h2 className="text-xl md:text-2xl font-bold text-foreground">My Events</h2>
              {/* View Toggle */}
              <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                <button
                  onClick={() => setViewMode("list")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    viewMode === "list"
                      ? "bg-primary text-white shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
                  }`}
                >
                  <List className="w-4 h-4" />
                  <span className="hidden sm:inline">List</span>
                </button>
                <button
                  onClick={() => setViewMode("calendar")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    viewMode === "calendar"
                      ? "bg-primary text-white shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                  <span className="hidden sm:inline">Calendar</span>
                </button>
              </div>
            </div>
            {selectedEvents.size > 0 && viewMode === "list" && (
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

          {/* Quick Select Buttons - Mobile Optimized - List view only */}
          {filteredEvents.length > 0 && viewMode === "list" && (
            <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-3 md:mb-4 p-3 md:p-4 bg-white rounded-lg border border-border">
              <span className="text-xs md:text-sm font-medium text-foreground w-full sm:w-auto mb-1 sm:mb-0">
                Quick Select:
              </span>
              <button
                type="button"
                onClick={selectAllEvents}
                className="px-2 py-1 md:px-3 md:py-1.5 text-xs md:text-sm bg-accent text-primary rounded-md hover:bg-primary/20 transition-colors"
              >
                All ({filteredEvents.length})
              </button>
              <button
                type="button"
                onClick={selectEventsWithTickets}
                className="px-2 py-1 md:px-3 md:py-1.5 text-xs md:text-sm bg-success/10 text-success rounded-md hover:bg-success/20 transition-colors"
              >
                With Tickets ({filteredEvents.filter((e) => hasTicketsSold(e)).length})
              </button>
              <button
                type="button"
                onClick={selectEventsWithoutTickets}
                className="px-2 py-1 md:px-3 md:py-1.5 text-xs md:text-sm bg-muted text-foreground rounded-md hover:bg-muted/80 transition-colors"
              >
                No Tickets ({filteredEvents.filter((e) => !hasTicketsSold(e)).length})
              </button>
              <button
                type="button"
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

        {filteredEvents.length === 0 ? (
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
        ) : viewMode === "calendar" ? (
          /* Calendar View */
          <OrganizerCalendar
            events={filteredEvents.map((event) => ({
              id: event._id,
              title: event.name,
              start: event.startDate ? new Date(event.startDate) : new Date(),
              end: event.endDate ? new Date(event.endDate) : (event.startDate ? new Date(event.startDate + 2 * 60 * 60 * 1000) : new Date()),
              resource: {
                imageUrl: event.imageUrl,
                status: event.status,
                type: event.eventType || "EVENT",
                ticketsSold: event.ticketsSold || 0,
              },
            }))}
            onEventClick={(calEvent) => {
              router.push(`/organizer/events/${calEvent.id}`);
            }}
            eventType="event"
            colorMap={{
              TICKETED_EVENT: "#3b82f6",
              TABLE_SEATING: "#8b5cf6",
              FREE_EVENT: "#22c55e",
              RSVP_ONLY: "#f59e0b",
            }}
          />
        ) : (
          /* List View */
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
                        className="w-4 h-4 md:w-5 md:h-5 text-primary bg-white border-2 border rounded focus:ring-2 focus:ring-ring cursor-pointer"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>

                    {/* Event Image */}
                    <div className="sm:w-48 h-28 sm:h-auto bg-muted flex-shrink-0">
                      {event.imageUrl && !failedImages.has(event._id) ? (
                        <img
                          src={event.imageUrl}
                          alt={event.name}
                          className="w-full h-full object-cover"
                          onError={() => {
                            setFailedImages(prev => new Set(prev).add(event._id));
                          }}
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
                            <span className="px-1.5 py-0.5 md:px-2 md:py-1 text-xs font-semibold bg-info/20 text-info rounded-full">
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
                          type="button"
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
                          className="hidden md:flex items-center gap-2 px-4 py-2 text-sm border border rounded-lg hover:bg-card transition-colors"
                        >
                          <Calendar className="w-4 h-4" />
                          View Public
                        </Link>

                        {/* Duplicate Event Button */}
                        <button
                          type="button"
                          onClick={() => handleOpenDuplicate(event._id, event.name)}
                          className="flex items-center justify-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm border border-primary/30 bg-primary/5 text-primary rounded-lg hover:bg-primary/10 transition-colors flex-1 sm:flex-none"
                        >
                          <Copy className="w-3.5 h-3.5 md:w-4 md:h-4" />
                          <span>Duplicate</span>
                        </button>

                        {/* Delete Event Button */}
                        <button
                          type="button"
                          onClick={() => setShowSingleDeleteConfirm(event._id)}
                          className="flex items-center justify-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm border border-destructive text-destructive rounded-lg hover:bg-destructive/10 transition-colors flex-1 sm:flex-none"
                        >
                          <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                          <span>Delete</span>
                        </button>

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
                              className="hidden lg:flex items-center gap-2 px-4 py-2 text-sm border border rounded-lg hover:bg-card transition-colors"
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
                              className="hidden lg:flex items-center gap-2 px-4 py-2 text-sm border border-success300 bg-success50 text-success700 rounded-lg hover:bg-success100 transition-colors"
                            >
                              <Package className="w-4 h-4" />
                              Bundles
                            </Link>
                            <Link
                              href={`/organizer/events/${event._id}`}
                              className="hidden md:flex items-center gap-2 px-4 py-2 text-sm border border rounded-lg hover:bg-card transition-colors"
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
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                  className="px-4 py-2 border border-border text-foreground rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
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

        {/* Duplicate Event Dialog */}
        {showDuplicateDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Copy className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-foreground mb-2">Duplicate Event</h3>
                  <p className="text-muted-foreground text-sm">
                    Create a copy of this event with all its configurations.
                  </p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    New Event Name
                  </label>
                  <input
                    type="text"
                    value={duplicateOptions.newName}
                    onChange={(e) =>
                      setDuplicateOptions({ ...duplicateOptions, newName: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="Event name"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    What to Copy
                  </label>
                  <label className="flex items-center gap-3 p-3 bg-muted rounded-lg cursor-pointer hover:bg-muted/80">
                    <input
                      type="checkbox"
                      checked={duplicateOptions.copyTickets}
                      onChange={(e) =>
                        setDuplicateOptions({ ...duplicateOptions, copyTickets: e.target.checked })
                      }
                      className="w-4 h-4 text-primary rounded focus:ring-primary"
                    />
                    <div>
                      <span className="font-medium text-foreground">Ticket Tiers</span>
                      <p className="text-xs text-muted-foreground">Copy all ticket types and pricing</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-3 bg-muted rounded-lg cursor-pointer hover:bg-muted/80">
                    <input
                      type="checkbox"
                      checked={duplicateOptions.copySeating}
                      onChange={(e) =>
                        setDuplicateOptions({ ...duplicateOptions, copySeating: e.target.checked })
                      }
                      className="w-4 h-4 text-primary rounded focus:ring-primary"
                    />
                    <div>
                      <span className="font-medium text-foreground">Seating Chart</span>
                      <p className="text-xs text-muted-foreground">Copy seating layout configuration</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-3 bg-muted rounded-lg cursor-pointer hover:bg-muted/80">
                    <input
                      type="checkbox"
                      checked={duplicateOptions.copyStaff}
                      onChange={(e) =>
                        setDuplicateOptions({ ...duplicateOptions, copyStaff: e.target.checked })
                      }
                      className="w-4 h-4 text-primary rounded focus:ring-primary"
                    />
                    <div>
                      <span className="font-medium text-foreground">Staff Members</span>
                      <p className="text-xs text-muted-foreground">Copy team and seller assignments</p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowDuplicateDialog(false);
                    setDuplicatingEventId(null);
                  }}
                  disabled={isDuplicating}
                  className="px-4 py-2 border border-border text-foreground rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDuplicateEvent}
                  disabled={isDuplicating}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isDuplicating ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Duplicating...
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Duplicate Event
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Single Event Delete Confirmation Dialog */}
        {showSingleDeleteConfirm && (
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
                  <h3 className="text-xl font-bold text-foreground mb-2">Delete Event?</h3>
                  <p className="text-muted-foreground text-sm">
                    This will permanently delete this event and all associated data (tickets, staff, bundles, seating charts, etc.).
                  </p>
                  <p className="text-destructive text-sm font-semibold mt-2">
                    This action cannot be undone!
                  </p>
                  <p className="text-muted-foreground text-xs mt-2">
                    Note: Events with sold tickets cannot be deleted.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowSingleDeleteConfirm(null)}
                  disabled={deletingEventId !== null}
                  className="px-4 py-2 border border-border text-foreground rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSingleDelete(showSingleDeleteConfirm)}
                  disabled={deletingEventId !== null}
                  className="px-4 py-2 bg-destructive text-white rounded-lg hover:bg-destructive/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {deletingEventId === showSingleDeleteConfirm ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Delete Event
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
