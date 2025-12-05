"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import Link from "next/link";
import {
  Calendar,
  Ticket,
  MapPin,
  Download,
  ArrowLeft,
  QrCode,
  Share2,
  Send,
  X,
  Armchair,
  Edit,
  Trash2,
  Package,
  PackageOpen,
  Check,
  ChevronDown,
  ChevronUp,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { useState, useEffect } from "react";
import { formatEventLocation } from "@/lib/location-format";
import toast from "react-hot-toast";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";

// Type for the ticket data - extending what the query returns with optional schema fields
type TicketData = {
  _id: Id<"tickets">;
  ticketCode: string | undefined;
  status: "CANCELLED" | "PENDING" | "VALID" | "SCANNED" | "REFUNDED" | "PENDING_ACTIVATION" | undefined;
  scannedAt: number | undefined;
  createdAt: number;
  eventId?: Id<"events">; // Added for bundle filtering
  attendeeEmail?: string; // From schema but not in current query
  attendeeName?: string; // From schema but not in current query
  bundleId?: string; // From schema but not in current query
  bundleName?: string; // From schema but not in current query
  event: {
    _id: Id<"events">;
    name: string;
    startDate: number | undefined;
    endDate: number | undefined;
    location?: string | { // Can be either string or object
      venueName?: string;
      address?: string;
      zipCode?: string;
      city: string;
      state: string;
      country: string;
    };
    imageUrl: string | undefined;
    eventType: string | undefined;
  } | null;
  tier: {
    name: string;
    price: number;
  } | null;
  order: {
    _id: Id<"orders">;
    totalCents: number;
    paidAt: number | undefined;
  } | null;
  seat: {
    sectionName: string;
    rowLabel: string;
    seatNumber: number;
  } | null;
};

export default function MyTicketsPage() {
  // Check authentication status first
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [shouldFetch, setShouldFetch] = useState(false);

  // Only fetch tickets if authenticated - use skip pattern
  const tickets = useQuery(
    api.tickets.queries.getMyTickets,
    shouldFetch ? {} : "skip"
  );

  // expandedTicket state removed - QR codes now always visible for VALID tickets
  const [transferModalTicket, setTransferModalTicket] = useState<TicketData | null>(null);
  const [transferEmail, setTransferEmail] = useState("");
  const [transferName, setTransferName] = useState("");
  const [isTransferring, setIsTransferring] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => {
        setIsAuthenticated(res.ok);
        if (res.ok) {
          setShouldFetch(true);
        }
      })
      .catch(() => setIsAuthenticated(false));
  }, []);

  // CRUD state management
  const [editModalTicket, setEditModalTicket] = useState<TicketData | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [selectedTickets, setSelectedTickets] = useState<string[]>([]);
  const [bundleName, setBundleName] = useState("");
  const [showBundleModal, setShowBundleModal] = useState(false);
  const [deleteConfirmTicket, setDeleteConfirmTicket] = useState<TicketData | null>(null);

  // Mutations
  const initiateTransfer = useMutation(api.transfers.mutations.initiateTransfer);
  const updateTicket = useMutation(api.tickets.mutations.updateTicket);
  const deleteTicket = useMutation(api.tickets.mutations.deleteTicket);
  const bundleTickets = useMutation(api.tickets.mutations.bundleTickets);
  const unbundleTickets = useMutation(api.tickets.mutations.unbundleTickets);

  // Group tickets by event
  // Cast tickets to TicketData[] for proper typing
  const ticketsData = tickets as unknown as TicketData[] | undefined;
  const groupedTickets = ticketsData?.reduce(
    (acc, ticket) => {
      if (!ticket.event) return acc;

      const eventId = ticket.event._id;
      if (!acc[eventId]) {
        acc[eventId] = {
          event: ticket.event,
          tickets: [],
        };
      }
      acc[eventId].tickets.push(ticket);
      return acc;
    },
    {} as Record<string, { event: NonNullable<TicketData["event"]>; tickets: TicketData[] }>
  );

  // Separate upcoming and past events, filtering out cancelled/refunded from main view
  const now = Date.now();

  // For upcoming events, filter out CANCELLED and REFUNDED tickets
  const upcomingEvents = groupedTickets
    ? Object.values(groupedTickets)
        .filter((group) => group.event.startDate && group.event.startDate >= now)
        .map((group) => ({
          ...group,
          tickets: group.tickets.filter(
            (t) => t.status !== "CANCELLED" && t.status !== "REFUNDED"
          ),
        }))
        .filter((group) => group.tickets.length > 0)
    : [];

  // For past events, show all except cancelled/refunded
  const pastEvents = groupedTickets
    ? Object.values(groupedTickets)
        .filter((group) => !group.event.startDate || group.event.startDate < now)
        .map((group) => ({
          ...group,
          tickets: group.tickets.filter(
            (t) => t.status !== "CANCELLED" && t.status !== "REFUNDED"
          ),
        }))
        .filter((group) => group.tickets.length > 0)
    : [];

  // Archived tickets (CANCELLED and REFUNDED) - grouped by event
  const archivedTickets = ticketsData?.filter(
    (t) => t.status === "CANCELLED" || t.status === "REFUNDED"
  ) || [];
  const [showArchived, setShowArchived] = useState(false);

  const handleDownloadTicket = (ticketCode: string, eventName: string) => {
    // Create a simple download by opening the ticket in a new window
    window.print();
  };

  const handleShareTicket = (ticketCode: string, eventName: string) => {
    if (navigator.share) {
      navigator.share({
        title: `Ticket for ${eventName}`,
        text: `My ticket code: ${ticketCode}`,
      });
    } else {
      navigator.clipboard.writeText(ticketCode);
      toast.success("Ticket code copied to clipboard!");
    }
  };

  const handleTransferTicket = (ticket: TicketData) => {
    setTransferModalTicket(ticket);
    setTransferEmail("");
    setTransferName("");
  };

  const handleSubmitTransfer = async () => {
    if (!transferModalTicket || !transferEmail || !transferName) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsTransferring(true);
    try {
      await initiateTransfer({
        ticketId: transferModalTicket._id,
        toEmail: transferEmail,
        toName: transferName,
      });

      toast.success(
        `Transfer initiated! An email has been sent to ${transferEmail} to accept the ticket.`
      );
      setTransferModalTicket(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to transfer ticket";
      toast.error(errorMessage);
    } finally {
      setIsTransferring(false);
    }
  };

  // Edit ticket functionality
  const handleEditTicket = (ticket: TicketData) => {
    setEditModalTicket(ticket);
    setEditName(ticket.attendeeName || "");
    setEditEmail(ticket.attendeeEmail || "");
  };

  const handleSubmitEdit = async () => {
    if (!editModalTicket) return;

    try {
      await updateTicket({
        ticketId: editModalTicket._id,
        attendeeName: editName,
        attendeeEmail: editEmail,
      });

      toast.success("Ticket updated successfully!");
      setEditModalTicket(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update ticket";
      toast.error(errorMessage);
    }
  };

  // Delete ticket functionality
  const handleDeleteTicket = async (ticket: TicketData) => {
    setDeleteConfirmTicket(ticket);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmTicket) return;

    try {
      await deleteTicket({
        ticketId: deleteConfirmTicket._id,
      });

      toast.success("Ticket cancelled successfully");
      setDeleteConfirmTicket(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to cancel ticket";
      toast.error(errorMessage);
    }
  };

  // Bundle functionality
  const handleToggleTicketSelection = (ticketId: string) => {
    setSelectedTickets((prev) =>
      prev.includes(ticketId) ? prev.filter((id) => id !== ticketId) : [...prev, ticketId]
    );
  };

  const handleCreateBundle = async () => {
    if (!bundleName.trim()) {
      toast.error("Please enter a bundle name");
      return;
    }

    if (selectedTickets.length < 2) {
      toast.error("Select at least 2 tickets to bundle");
      return;
    }

    try {
      await bundleTickets({
        ticketIds: selectedTickets as Id<"tickets">[],
        bundleName: bundleName.trim(),
      });

      toast.success(`Bundle "${bundleName}" created successfully!`);
      setSelectedTickets([]);
      setBundleName("");
      setShowBundleModal(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create bundle";
      toast.error(errorMessage);
    }
  };

  const handleUnbundle = async (ticketIds: string[]) => {
    try {
      await unbundleTickets({
        ticketIds: ticketIds as Id<"tickets">[],
      });

      toast.success("Tickets unbundled successfully!");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to unbundle tickets";
      toast.error(errorMessage);
    }
  };

  // Check if ticket is editable
  const isTicketEditable = (ticket: TicketData) => {
    if (ticket.status === "SCANNED" || ticket.status === "CANCELLED") return false;
    if (ticket.event?.startDate && Date.now() >= ticket.event.startDate) return false;
    return true;
  };

  // Show loading while checking authentication
  if (isAuthenticated === null) {
    return (
      <>
        <PublicHeader showCreateButton={false} />
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </>
    );
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <>
        <PublicHeader showCreateButton={false} />
        <div className="min-h-screen bg-muted flex items-center justify-center p-4">
          <div className="text-center">
            <Ticket className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2 text-foreground">Please sign in</h2>
            <p className="text-muted-foreground mb-4">
              You need to be logged in to view your tickets
            </p>
            <Link
              href="/login"
              className="inline-block bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90"
            >
              Sign In
            </Link>
          </div>
        </div>
      </>
    );
  }

  // Show loading while fetching tickets
  if (!tickets) {
    return (
      <>
        <PublicHeader showCreateButton={false} />
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </>
    );
  }

  if (tickets.length === 0) {
    return (
      <>
        <PublicHeader showCreateButton={false} />
        <div className="min-h-screen bg-muted flex items-center justify-center p-4">
          <div className="text-center">
            <Ticket className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2 text-foreground">No tickets yet</h2>
            <p className="text-muted-foreground mb-4">
              Your purchased tickets will appear here
            </p>
            <Link
              href="/"
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90"
            >
              Browse Events
            </Link>
          </div>
        </div>
      </>
    );
  }

  // Group bundled tickets
  const bundledTickets: Record<string, TicketData[]> = {};
  ticketsData?.forEach((ticket) => {
    if (ticket.bundleId) {
      if (!bundledTickets[ticket.bundleId]) {
        bundledTickets[ticket.bundleId] = [];
      }
      bundledTickets[ticket.bundleId].push(ticket);
    }
  });

  return (
    <>
      <PublicHeader showCreateButton={false} />
      <div className="min-h-screen bg-muted">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">My Tickets</h1>
              <p className="text-muted-foreground mt-1">
                View and manage your event tickets
              </p>
            </div>

            {/* Bundle Actions */}
            {selectedTickets.length > 0 && (
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">
                  {selectedTickets.length} ticket{selectedTickets.length !== 1 ? "s" : ""} selected
                </span>
                <button
                  type="button"
                  onClick={() => setShowBundleModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                >
                  <Package className="w-4 h-4" />
                  Create Bundle
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedTickets([])}
                  className="px-4 py-2 border border-border rounded-lg hover:bg-muted"
                >
                  Clear Selection
                </button>
              </div>
            )}
          </div>

          {/* Upcoming Events Section */}
          {upcomingEvents.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">Upcoming Events</h2>
              <div className="space-y-6">
                {upcomingEvents.map(({ event, tickets: eventTickets }) => (
                  <motion.div
                    key={event._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card rounded-xl shadow-lg overflow-hidden border border-border"
                  >
                    {/* Event Header with Image - Eventbrite Style */}
                    <div className="relative">
                      {/* Event Image */}
                      <div className="h-48 md:h-56 bg-gradient-to-br from-primary/20 to-primary/5 relative overflow-hidden">
                        {event.imageUrl ? (
                          <img
                            src={event.imageUrl}
                            alt={event.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Ticket className="w-16 h-16 text-primary/30" />
                          </div>
                        )}
                        {/* Gradient overlay for text readability */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      </div>

                      {/* Event Info Overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 text-white">
                        <div className="flex justify-between items-end">
                          <div>
                            <h3 className="text-xl md:text-2xl font-bold drop-shadow-lg">{event.name}</h3>
                            <div className="flex flex-wrap items-center gap-3 mt-2 text-white/90 text-sm">
                              {event.startDate && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  {format(new Date(event.startDate), "EEE, MMM d, yyyy 'at' h:mm a")}
                                </span>
                              )}
                            </div>
                            {event.location && (
                              <span className="flex items-center gap-1 mt-1 text-white/80 text-sm">
                                <MapPin className="w-4 h-4" />
                                {formatEventLocation(event.location)}
                              </span>
                            )}
                          </div>
                          <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-semibold">
                            {eventTickets.length} ticket{eventTickets.length !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Tickets List - Eventbrite Style with Prominent QR */}
                    <div className="p-4 md:p-6">
                      <div className="space-y-4">
                        {eventTickets.map((ticket) => {
                          const editable = isTicketEditable(ticket);

                          return (
                            <div
                              key={ticket._id}
                              className={`border-2 rounded-xl overflow-hidden transition-all ${
                                selectedTickets.includes(ticket._id)
                                  ? "border-primary bg-accent/30"
                                  : ticket.status === "VALID"
                                    ? "border-success/30 bg-success/5"
                                    : "border-border bg-card"
                              }`}
                            >
                              {/* Ticket Card - Side by Side Layout */}
                              <div className="flex flex-col md:flex-row">
                                {/* Left Side - QR Code (Always Visible for VALID) */}
                                <div className="md:w-48 flex-shrink-0 bg-white p-4 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-dashed border-border">
                                  {ticket.status === "VALID" && ticket.ticketCode ? (
                                    <>
                                      <QRCodeSVG
                                        value={`https://stepperslife.com/ticket/${ticket.ticketCode}`}
                                        size={140}
                                        level="H"
                                        includeMargin={true}
                                        bgColor="#ffffff"
                                        fgColor="#000000"
                                      />
                                      <p className="text-[10px] text-muted-foreground mt-2 font-mono">
                                        {ticket.ticketCode}
                                      </p>
                                    </>
                                  ) : ticket.status === "PENDING" ? (
                                    <div className="text-center p-2">
                                      <div className="w-24 h-24 bg-warning/10 rounded-lg flex items-center justify-center mb-2">
                                        <AlertCircle className="w-10 h-10 text-warning" />
                                      </div>
                                      <p className="text-xs text-warning font-medium">Awaiting Payment</p>
                                    </div>
                                  ) : ticket.status === "PENDING_ACTIVATION" ? (
                                    <div className="text-center p-2">
                                      <div className="w-24 h-24 bg-orange-100 rounded-lg flex items-center justify-center mb-2">
                                        <AlertCircle className="w-10 h-10 text-orange-500" />
                                      </div>
                                      <Link
                                        href="/activate"
                                        className="text-xs text-orange-600 font-medium hover:underline"
                                      >
                                        Tap to Activate
                                      </Link>
                                    </div>
                                  ) : (
                                    <div className="text-center p-2">
                                      <div className="w-24 h-24 bg-muted rounded-lg flex items-center justify-center mb-2">
                                        <QrCode className="w-10 h-10 text-muted-foreground" />
                                      </div>
                                      <p className="text-xs text-muted-foreground">Not Available</p>
                                    </div>
                                  )}
                                </div>

                                {/* Right Side - Ticket Info */}
                                <div className="flex-1 p-4">
                                  <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                      {/* Attendee Name & Status */}
                                      <div className="flex items-center gap-2 flex-wrap mb-1">
                                        <span className="font-semibold text-foreground text-lg">
                                          {ticket.attendeeName || "Guest"}
                                        </span>
                                        {ticket.status === "VALID" && (
                                          <span className="px-2 py-0.5 bg-success text-white text-xs rounded-full font-medium">
                                            Ready
                                          </span>
                                        )}
                                        {ticket.status === "PENDING" && (
                                          <span className="px-2 py-0.5 bg-warning text-white text-xs rounded-full font-medium">
                                            Pending
                                          </span>
                                        )}
                                        {ticket.status === "PENDING_ACTIVATION" && (
                                          <span className="px-2 py-0.5 bg-orange-500 text-white text-xs rounded-full font-medium">
                                            Activate
                                          </span>
                                        )}
                                      </div>

                                      {/* Email */}
                                      <p className="text-sm text-muted-foreground">
                                        {ticket.attendeeEmail}
                                      </p>

                                      {/* Tier & Bundle */}
                                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                                        {ticket.tier?.name && (
                                          <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded font-medium">
                                            {ticket.tier.name}
                                          </span>
                                        )}
                                        {ticket.bundleId && (
                                          <span className="px-2 py-1 bg-accent text-primary text-xs rounded">
                                            {ticket.bundleName || "Bundle"}
                                          </span>
                                        )}
                                      </div>

                                      {/* Seat Info if available */}
                                      {ticket.seat && (
                                        <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                                          <Armchair className="w-4 h-4" />
                                          <span>
                                            {ticket.seat.sectionName} • Row {ticket.seat.rowLabel} • Seat {ticket.seat.seatNumber}
                                          </span>
                                        </div>
                                      )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-col items-end gap-2">
                                      {/* Selection checkbox for bundling */}
                                      {editable && (
                                        <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                                          <input
                                            type="checkbox"
                                            checked={selectedTickets.includes(ticket._id)}
                                            onChange={() => handleToggleTicketSelection(ticket._id)}
                                            className="rounded"
                                          />
                                          Select
                                        </label>
                                      )}
                                    </div>
                                  </div>

                                  {/* Bottom Actions */}
                                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                                    <div className="flex items-center gap-2">
                                      {ticket.status === "VALID" && (
                                        <>
                                          <button
                                            type="button"
                                            onClick={() => handleShareTicket(ticket.ticketCode || "", event.name)}
                                            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                          >
                                            <Share2 className="w-4 h-4" />
                                            Share
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => handleDownloadTicket(ticket.ticketCode || "", event.name)}
                                            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted rounded-lg transition-colors"
                                          >
                                            <Download className="w-4 h-4" />
                                            Save
                                          </button>
                                        </>
                                      )}
                                    </div>

                                    {editable && (
                                      <div className="flex items-center gap-1">
                                        <button
                                          type="button"
                                          onClick={() => handleEditTicket(ticket)}
                                          className="p-2 text-muted-foreground hover:bg-muted rounded-lg transition-colors"
                                          title="Edit ticket"
                                        >
                                          <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleTransferTicket(ticket)}
                                          className="p-2 text-muted-foreground hover:bg-muted rounded-lg transition-colors"
                                          title="Transfer ticket"
                                        >
                                          <Send className="w-4 h-4" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleDeleteTicket(ticket)}
                                          className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                                          title="Cancel ticket"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Unbundle action for bundled tickets */}
                      {Object.entries(bundledTickets).map(([bundleId, bundleTickets]) => {
                        const bundleInThisEvent = bundleTickets.filter(
                          (t) => t.eventId === event._id
                        );
                        if (bundleInThisEvent.length === 0) return null;

                        return (
                          <div key={bundleId} className="mt-4 p-3 bg-accent rounded-lg">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <Package className="w-4 h-4 text-primary" />
                                <span className="text-sm font-medium text-primary">
                                  Bundle: {bundleInThisEvent[0].bundleName}
                                </span>
                                <span className="text-sm text-primary">
                                  ({bundleInThisEvent.length} tickets)
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleUnbundle(bundleInThisEvent.map((t) => t._id))}
                                className="flex items-center gap-1 px-3 py-1 text-sm text-primary hover:bg-accent rounded-lg transition-colors"
                              >
                                <PackageOpen className="w-4 h-4" />
                                Unbundle
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Past Events Section */}
          {pastEvents.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">Past Events</h2>
              <div className="space-y-6">
                {pastEvents.map(({ event, tickets: eventTickets }) => (
                  <motion.div
                    key={event._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card rounded-xl shadow-md overflow-hidden border border-border opacity-75"
                  >
                    {/* Event Header with Image */}
                    <div className="relative">
                      <div className="h-32 md:h-40 bg-gradient-to-br from-muted to-muted/50 relative overflow-hidden">
                        {event.imageUrl ? (
                          <img
                            src={event.imageUrl}
                            alt={event.name}
                            className="w-full h-full object-cover grayscale-[30%]"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Ticket className="w-12 h-12 text-muted-foreground/30" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                        <h3 className="text-lg md:text-xl font-bold">{event.name}</h3>
                        <div className="flex items-center gap-3 mt-1 text-white/80 text-sm">
                          {event.startDate && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {format(new Date(event.startDate), "PPP")}
                            </span>
                          )}
                          {event.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {formatEventLocation(event.location)}
                            </span>
                          )}
                        </div>
                        <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
                          {eventTickets.length} ticket{eventTickets.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>

                    {/* Tickets List */}
                    <div className="p-4">
                      <div className="space-y-3">
                        {eventTickets.map((ticket) => (
                          <div key={ticket._id} className="border border-border rounded-lg p-4 bg-muted/30">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-medium text-foreground">
                                  {ticket.attendeeName || "Unnamed Ticket"}
                                </div>
                                <div className="text-sm text-muted-foreground mt-1">
                                  {ticket.attendeeEmail}
                                </div>
                                {ticket.tier?.name && (
                                  <div className="text-xs text-muted-foreground mt-1">
                                    {ticket.tier.name}
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-col items-end gap-1">
                                {ticket.status === "SCANNED" && (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-success/10 text-success text-xs rounded-full">
                                    <Check className="w-3 h-3" />
                                    Attended
                                  </span>
                                )}
                                {ticket.status === "VALID" && (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full">
                                    Unused
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Archived Tickets Section (Cancelled/Refunded) */}
          {archivedTickets.length > 0 && (
            <div className="mt-8">
              <button
                type="button"
                onClick={() => setShowArchived(!showArchived)}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showArchived ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
                <span className="text-sm">
                  {showArchived ? "Hide" : "Show"} {archivedTickets.length} cancelled/refunded ticket{archivedTickets.length !== 1 ? "s" : ""}
                </span>
              </button>

              <AnimatePresence>
                {showArchived && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-4 space-y-3"
                  >
                    {archivedTickets.map((ticket) => (
                      <div
                        key={ticket._id}
                        className="bg-muted/50 border border-border rounded-lg p-4 opacity-60"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-muted-foreground">
                                {ticket.attendeeName || "Unnamed Ticket"}
                              </span>
                              {ticket.status === "CANCELLED" && (
                                <span className="px-2 py-1 bg-destructive/10 text-destructive text-xs rounded-full">
                                  Cancelled
                                </span>
                              )}
                              {ticket.status === "REFUNDED" && (
                                <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full">
                                  Refunded
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">
                              {ticket.event?.name || "Unknown Event"}
                            </div>
                            {ticket.tier?.name && (
                              <div className="text-xs text-muted-foreground mt-1">
                                {ticket.tier.name}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Transfer Modal */}
        {transferModalTicket && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-lg p-6 max-w-md w-full"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Transfer Ticket</h3>
                <button
                  type="button"
                  onClick={() => setTransferModalTicket(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Recipient's Name
                  </label>
                  <input
                    type="text"
                    value={transferName}
                    onChange={(e) => setTransferName(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-primary"
                    placeholder="Enter recipient's name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Recipient's Email
                  </label>
                  <input
                    type="email"
                    value={transferEmail}
                    onChange={(e) => setTransferEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-primary"
                    placeholder="Enter recipient's email"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleSubmitTransfer}
                    disabled={isTransferring}
                    className="flex-1 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50"
                  >
                    {isTransferring ? "Transferring..." : "Transfer Ticket"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setTransferModalTicket(null)}
                    className="flex-1 border border-border px-4 py-2 rounded-lg hover:bg-muted"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Edit Modal */}
        {editModalTicket && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-lg p-6 max-w-md w-full"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Edit Ticket</h3>
                <button
                  type="button"
                  onClick={() => setEditModalTicket(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Attendee Name
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ring focus:border-primary"
                    placeholder="Enter attendee name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Attendee Email
                  </label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ring focus:border-primary"
                    placeholder="Enter attendee email"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleSubmitEdit}
                    className="flex-1 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditModalTicket(null)}
                    className="flex-1 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Bundle Modal */}
        {showBundleModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-lg p-6 max-w-md w-full"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Create Bundle</h3>
                <button
                  type="button"
                  onClick={() => setShowBundleModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bundle Name
                  </label>
                  <input
                    type="text"
                    value={bundleName}
                    onChange={(e) => setBundleName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ring focus:border-primary"
                    placeholder="Enter bundle name (e.g., Family Pack)"
                  />
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">
                    Creating bundle with {selectedTickets.length} selected ticket
                    {selectedTickets.length !== 1 ? "s" : ""}
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleCreateBundle}
                    className="flex-1 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90"
                  >
                    Create Bundle
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowBundleModal(false)}
                    className="flex-1 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirmTicket && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-lg p-6 max-w-md w-full"
            >
              <div className="flex items-center gap-3 mb-4 text-red-600">
                <AlertCircle className="w-6 h-6" />
                <h3 className="text-xl font-bold">Cancel Ticket</h3>
              </div>

              <p className="text-gray-600 mb-6">
                Are you sure you want to cancel this ticket? This action cannot be undone.
              </p>

              <div className="bg-gray-50 p-3 rounded-lg mb-6">
                <div className="text-sm">
                  <span className="font-medium">Ticket:</span>{" "}
                  {deleteConfirmTicket.attendeeName || "Unnamed"}
                </div>
                <div className="text-sm text-gray-600">{deleteConfirmTicket.attendeeEmail}</div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                >
                  Yes, Cancel Ticket
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteConfirmTicket(null)}
                  className="flex-1 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50"
                >
                  Keep Ticket
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
      <PublicFooter />
    </>
  );
}
