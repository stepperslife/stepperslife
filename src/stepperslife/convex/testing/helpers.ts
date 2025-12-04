/**
 * TESTING HELPERS
 * These mutations and queries are only for testing purposes and bypass authentication
 */

import { v } from "convex/values";
import { mutation, query } from "../_generated/server";

/**
 * Enable tickets visibility for testing (bypasses authentication)
 */
export const enableTicketsForTesting = mutation({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {

    // Update event to make tickets visible
    await ctx.db.patch(args.eventId, {
      ticketsVisible: true,
      paymentModelSelected: true,
      updatedAt: Date.now(),
    });

    // Check if payment config exists
    const existingConfig = await ctx.db
      .query("eventPaymentConfig")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .first();

    if (!existingConfig) {
      // Get event to get organizerId
      const event = await ctx.db.get(args.eventId);
      if (!event) throw new Error("Event not found");
      if (!event.organizerId) throw new Error("Event has no organizer");

      // Create minimal payment config
      await ctx.db.insert("eventPaymentConfig", {
        eventId: args.eventId,
        organizerId: event.organizerId,
        paymentModel: "PREPAY",
        customerPaymentMethods: ["CASH"],
        isActive: true,
        platformFeePercent: 0,
        platformFeeFixed: 0,
        processingFeePercent: 0,
        charityDiscount: false,
        lowPriceDiscount: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    } else {
      // Update existing config to be active
      await ctx.db.patch(existingConfig._id, {
        isActive: true,
        updatedAt: Date.now(),
      });
    }

    return { success: true };
  },
});

/**
 * Get all tickets for an event (testing only)
 */
export const getTicketsForEvent = query({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    const tickets = await ctx.db
      .query("tickets")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();

    return tickets;
  },
});

/**
 * Get scan history for a ticket (testing only)
 */
export const getScanHistory = query({
  args: {
    ticketId: v.id("tickets"),
  },
  handler: async (ctx, args) => {
    const ticket = await ctx.db.get(args.ticketId);
    if (!ticket) return [];

    // Return scan history - for now just return array with scannedAt if ticket was scanned
    const history = [];
    if (ticket.scannedAt) {
      history.push({
        scannedAt: ticket.scannedAt,
        scannedBy: ticket.scannedBy,
        ticketId: ticket._id,
      });
    }

    return history;
  },
});
