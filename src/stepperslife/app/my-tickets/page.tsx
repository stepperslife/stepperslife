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

  const [expandedTicket, setExpandedTicket] = useState<string | null>(null);
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

  // Separate upcoming and past events
  const now = Date.now();
  const upcomingEvents = groupedTickets
    ? Object.values(groupedTickets).filter(
      (group) => group.event.startDate && group.event.startDate >= now
    )
    : [];
  const pastEvents = groupedTickets
    ? Object.values(groupedTickets).filter(
      (group) => !group.event.startDate || group.event.startDate < now
    )
    : [];

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
                    className="bg-white rounded-lg shadow-md overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900">{event.name}</h3>
                          <div className="flex items-center gap-4 mt-2 text-gray-600">
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
                        </div>
                        <span className="bg-accent text-primary px-3 py-1 rounded-full text-sm font-medium">
                          {eventTickets.length} ticket{eventTickets.length !== 1 ? "s" : ""}
                        </span>
                      </div>

                      <div className="space-y-3">
                        {eventTickets.map((ticket) => {
                          const isExpanded = expandedTicket === ticket._id;
                          const editable = isTicketEditable(ticket);

                          return (
                            <div
                              key={ticket._id}
                              className={`border rounded-lg transition-all ${selectedTickets.includes(ticket._id)
                                ? "border-primary bg-accent"
                                : "border-border"
                                }`}
                            >
                              <div className="p-4">
                                <div className="flex justify-between items-start">
                                  <div className="flex items-start gap-3 flex-1">
                                    {/* Selection checkbox */}
                                    <input
                                      type="checkbox"
                                      checked={selectedTickets.includes(ticket._id)}
                                      onChange={() => handleToggleTicketSelection(ticket._id)}
                                      className="mt-1"
                                      disabled={!editable}
                                    />

                                    <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium">
                                          {ticket.attendeeName || "Unnamed Ticket"}
                                        </span>
                                        {ticket.bundleId && (
                                          <span className="px-2 py-1 bg-accent text-primary text-xs rounded-full">
                                            {ticket.bundleName || "Bundled"}
                                          </span>
                                        )}
                                        {ticket.status === "CANCELLED" && (
                                          <span className="px-2 py-1 bg-destructive/10 text-destructive text-xs rounded-full">
                                            Cancelled
                                          </span>
                                        )}
                                      </div>
                                      <div className="text-sm text-muted-foreground mt-1">
                                        {ticket.attendeeEmail}
                                      </div>
                                      {ticket.tier?.name && (
                                        <div className="text-sm text-muted-foreground mt-1">
                                          {ticket.tier.name}
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    {/* Action buttons */}
                                    {editable && (
                                      <>
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
                                      </>
                                    )}

                                    <button
                                      type="button"
                                      onClick={() =>
                                        setExpandedTicket(isExpanded ? null : ticket._id)
                                      }
                                      className="p-2 text-muted-foreground hover:bg-muted rounded-lg transition-colors"
                                    >
                                      {isExpanded ? (
                                        <ChevronUp className="w-4 h-4" />
                                      ) : (
                                        <ChevronDown className="w-4 h-4" />
                                      )}
                                    </button>
                                  </div>
                                </div>

                                {/* Expanded content */}
                                <AnimatePresence>
                                  {isExpanded && ticket.ticketCode && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: "auto", opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      transition={{ duration: 0.3 }}
                                      className="mt-4 pt-4 border-t"
                                    >
                                      <div className="flex flex-col items-center">
                                        <QRCodeSVG
                                          value={ticket.ticketCode || ""}
                                          size={200}
                                          level="H"
                                          includeMargin={true}
                                        />
                                        <p className="text-xs text-muted-foreground mt-2">
                                          Ticket Code: {ticket.ticketCode}
                                        </p>
                                        <div className="flex gap-2 mt-4">
                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleShareTicket(ticket.ticketCode || "", event.name)
                                            }
                                            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm"
                                          >
                                            <Share2 className="w-4 h-4" />
                                            Share
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleDownloadTicket(ticket.ticketCode || "", event.name)
                                            }
                                            className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted text-sm"
                                          >
                                            <Download className="w-4 h-4" />
                                            Download
                                          </button>
                                        </div>
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
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
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-4">Past Events</h2>
              <div className="space-y-6">
                {pastEvents.map(({ event, tickets: eventTickets }) => (
                  <motion.div
                    key={event._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-lg shadow-md overflow-hidden opacity-75"
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900">{event.name}</h3>
                          <div className="flex items-center gap-4 mt-2 text-gray-600">
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
                        </div>
                        <span className="bg-muted text-foreground px-3 py-1 rounded-full text-sm font-medium">
                          {eventTickets.length} ticket{eventTickets.length !== 1 ? "s" : ""}
                        </span>
                      </div>

                      <div className="space-y-3">
                        {eventTickets.map((ticket) => (
                          <div key={ticket._id} className="border border-border rounded-lg p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-medium">
                                  {ticket.attendeeName || "Unnamed Ticket"}
                                </div>
                                <div className="text-sm text-muted-foreground mt-1">
                                  {ticket.attendeeEmail}
                                </div>
                                {ticket.status === "SCANNED" && (
                                  <span className="inline-flex items-center gap-1 mt-2 px-2 py-1 bg-success/10 text-success text-xs rounded-full">
                                    <Check className="w-3 h-3" />
                                    Scanned
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
