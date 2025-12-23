import { v } from "convex/values";
import { query } from "../_generated/server";

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
