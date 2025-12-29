import { v } from "convex/values";
import { query } from "../_generated/server";

/**
 * Get organizer earnings summary across all their events
 * Calculates total revenue, pending payouts, and completed payouts
 *
 * @returns Object with totalRevenueCents, pendingPayoutCents, totalPaidOutCents, orderCount
 */
export const getOrganizerEarnings = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity || !identity.email) {
      return {
        totalRevenueCents: 0,
        pendingPayoutCents: 0,
        totalPaidOutCents: 0,
        orderCount: 0,
        ticketsSold: 0,
      };
    }

    // Get current user by email
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email as string))
      .first();

    if (!user) {
      return {
        totalRevenueCents: 0,
        pendingPayoutCents: 0,
        totalPaidOutCents: 0,
        orderCount: 0,
        ticketsSold: 0,
      };
    }

    // Get all events owned by this organizer
    const events = await ctx.db
      .query("events")
      .withIndex("by_organizer", (q) => q.eq("organizerId", user._id))
      .collect();

    if (events.length === 0) {
      return {
        totalRevenueCents: 0,
        pendingPayoutCents: 0,
        totalPaidOutCents: 0,
        orderCount: 0,
        ticketsSold: 0,
      };
    }

    // Get all completed orders for these events
    let totalRevenueCents = 0;
    let orderCount = 0;
    let ticketsSold = 0;

    for (const event of events) {
      const orders = await ctx.db
        .query("orders")
        .withIndex("by_event", (q) => q.eq("eventId", event._id))
        .filter((q) => q.eq(q.field("status"), "COMPLETED"))
        .collect();

      for (const order of orders) {
        // Revenue = subtotal - platform fees (what organizer keeps)
        const organizerRevenue = order.subtotalCents - (order.platformFeeCents || 0);
        totalRevenueCents += organizerRevenue;
        orderCount++;
      }

      // Add event's sold tickets count
      ticketsSold += event.ticketsSold || 0;
    }

    // For now, assume all revenue is pending (payout system not yet implemented)
    return {
      totalRevenueCents,
      pendingPayoutCents: totalRevenueCents,
      totalPaidOutCents: 0,
      orderCount,
      ticketsSold,
    };
  },
});

/**
 * Get revenue breakdown by event for the current organizer
 * Returns per-event revenue data for earnings page table
 *
 * @returns Array of event revenue summaries
 */
export const getEventRevenueBreakdown = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity || !identity.email) {
      return [];
    }

    // Get current user by email
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email as string))
      .first();

    if (!user) {
      return [];
    }

    // Get all events owned by this organizer
    const events = await ctx.db
      .query("events")
      .withIndex("by_organizer", (q) => q.eq("organizerId", user._id))
      .collect();

    const results = [];

    for (const event of events) {
      const orders = await ctx.db
        .query("orders")
        .withIndex("by_event", (q) => q.eq("eventId", event._id))
        .filter((q) => q.eq(q.field("status"), "COMPLETED"))
        .collect();

      let eventRevenueCents = 0;
      for (const order of orders) {
        eventRevenueCents += order.subtotalCents - (order.platformFeeCents || 0);
      }

      results.push({
        eventId: event._id,
        eventName: event.name,
        ticketsSold: event.ticketsSold || 0,
        revenueCents: eventRevenueCents,
        orderCount: orders.length,
        status: eventRevenueCents > 0 ? "pending" : "no_sales",
      });
    }

    return results;
  },
});

/**
 * Get order details by Stripe payment intent ID (for refund emails)
 */
export const getOrderByPaymentIntent = query({
  args: {
    paymentIntentId: v.string(),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db
      .query("orders")
      .filter((q) => q.eq(q.field("stripePaymentIntentId"), args.paymentIntentId))
      .first();

    if (!order) {
      return null;
    }

    // Get event details
    let eventName = "Event";
    let eventDate: number | undefined;

    if (order.eventId) {
      const event = await ctx.db.get(order.eventId);
      if (event) {
        eventName = event.name;
        eventDate = event.startDate;
      }
    }

    // Get buyer details from tickets if not on order
    let buyerEmail = order.buyerEmail || "";
    let buyerName = order.buyerName || "";

    if (!buyerEmail || !buyerName) {
      const tickets = await ctx.db
        .query("tickets")
        .filter((q) => q.eq(q.field("orderId"), order._id))
        .first();

      if (tickets) {
        buyerEmail = buyerEmail || tickets.attendeeEmail || "";
        buyerName = buyerName || tickets.attendeeName || "";
      }
    }

    // Use stripePaymentIntentId as order number if available, otherwise use _id
    const orderNumber = order.stripePaymentIntentId
      ? order.stripePaymentIntentId.substring(3, 15).toUpperCase()
      : String(order._id).substring(0, 12).toUpperCase();

    return {
      _id: order._id,
      email: buyerEmail,
      buyerName: buyerName,
      eventName: eventName,
      eventDate: eventDate,
      orderNumber: orderNumber,
      totalCents: order.totalCents,
      status: order.status,
    };
  },
});
