/**
 * Ticket Notification System
 * Handles sending ticket confirmation emails after order completion
 */

import { v } from "convex/values";
import { action, internalMutation, internalAction } from "../_generated/server";
import { internal } from "../_generated/api";

/**
 * Internal mutation: Get order data for email
 * Actions can't directly access ctx.db, so we use this helper
 */
export const getOrderDataForEmail = internalMutation({
  args: {
    orderId: v.id("orders"),
  },
  handler: async (ctx, args) => {
    // Get order
    const order = await ctx.db.get(args.orderId);
    if (!order) {
      return { success: false as const, error: "Order not found" };
    }

    // Get event
    const event = await ctx.db.get(order.eventId);
    if (!event) {
      return { success: false as const, error: "Event not found" };
    }

    // Get tickets for this order
    const tickets = await ctx.db
      .query("tickets")
      .withIndex("by_order", (q) => q.eq("orderId", args.orderId))
      .collect();

    if (tickets.length === 0) {
      return { success: false as const, error: "No tickets found" };
    }

    // Get image URL if storage-based
    let imageUrl = event.imageUrl;
    if (!imageUrl && event.images && event.images.length > 0) {
      try {
        const url = await ctx.storage.getUrl(event.images[0]);
        imageUrl = url ?? undefined;
      } catch {
        // Ignore storage errors
      }
    }

    return {
      success: true as const,
      order: {
        _id: order._id,
        eventId: order.eventId,
        buyerName: order.buyerName,
        buyerEmail: order.buyerEmail,
        buyerPhone: order.buyerPhone,
        totalCents: order.totalCents,
        status: order.status,
        paymentMethod: order.paymentMethod || "CASH",
        createdAt: order.createdAt,
      },
      event: {
        _id: event._id,
        name: event.name,
        startDate: event.startDate,
        endDate: event.endDate,
        location: event.location || {
          venueName: "Venue TBD",
          address: "",
          city: "",
          state: "",
          zipCode: "",
        },
        imageUrl,
      },
      tickets: tickets.map((ticket) => ({
        _id: ticket._id,
        ticketCode: ticket.ticketCode,
        attendeeName: ticket.attendeeName || order.buyerName,
        attendeeEmail: ticket.attendeeEmail || order.buyerEmail,
        eventId: ticket.eventId,
        ticketTierId: ticket.ticketTierId,
        status: ticket.status,
        createdAt: ticket.createdAt,
      })),
    };
  },
});

/**
 * Send ticket confirmation email after cash order approval
 * Called from organizerApproveCashOrder via scheduler
 */
export const sendCashOrderConfirmation = action({
  args: {
    orderId: v.id("orders"),
  },
  handler: async (ctx, args) => {
    console.log(`[sendCashOrderConfirmation] Sending confirmation for order ${args.orderId}`);

    // Fetch order data using internal mutation
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const getOrderDataFn = (internal as any).notifications?.ticketNotifications?.getOrderDataForEmail;
    const data = getOrderDataFn
      ? await ctx.runMutation(getOrderDataFn, { orderId: args.orderId })
      : { success: false, error: "Internal function not found" };

    if (!data.success || !data.order || !data.event || !data.tickets) {
      console.error(`[sendCashOrderConfirmation] Failed to get order data:`, data.error);
      return { success: false, error: data.error || "Failed to get order data" };
    }

    const { order, event, tickets } = data;

    // Skip if no valid email
    if (!order.buyerEmail || order.buyerEmail.includes("@temp.local")) {
      console.log(`[sendCashOrderConfirmation] Skipping email - no valid email for order ${args.orderId}`);
      return { success: true, skipped: true, reason: "No valid email address" };
    }

    // Prepare order details for email API
    const orderDetails = {
      _id: order._id,
      _creationTime: order.createdAt,
      totalAmount: order.totalCents,
      status: order.status,
      paymentMethod: order.paymentMethod,
    };

    // Prepare tickets for email API
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ticketsForEmail = tickets.map((ticket: any) => ({
      _id: ticket._id,
      _creationTime: ticket.createdAt,
      orderId: args.orderId,
      ticketCode: ticket.ticketCode,
      attendeeName: ticket.attendeeName,
      attendeeEmail: ticket.attendeeEmail,
      eventId: ticket.eventId,
      tierId: ticket.ticketTierId,
      status: ticket.status,
    }));

    // Call the ticket confirmation API endpoint
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://stepperslife.com";

    try {
      const response = await fetch(`${baseUrl}/api/send-ticket-confirmation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: order.buyerEmail,
          orderDetails,
          tickets: ticketsForEmail,
          event,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[sendCashOrderConfirmation] Email API error:`, errorText);
        return { success: false, error: `Email API returned ${response.status}` };
      }

      const result = await response.json();
      console.log(`[sendCashOrderConfirmation] Email sent successfully for order ${args.orderId}:`, result);

      return {
        success: true,
        emailId: result.emailId,
        message: `Ticket confirmation sent to ${order.buyerEmail}`,
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error(`[sendCashOrderConfirmation] Failed to send email:`, error);
      return { success: false, error: errorMessage };
    }
  },
});

/**
 * Public action to resend ticket confirmation (for organizers)
 */
export const resendTicketConfirmation = action({
  args: {
    orderId: v.id("orders"),
  },
  handler: async (ctx, args) => {
    // Verify user is authenticated
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Fetch order data using internal mutation
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const getOrderDataFn = (internal as any).notifications?.ticketNotifications?.getOrderDataForEmail;
    const data = getOrderDataFn
      ? await ctx.runMutation(getOrderDataFn, { orderId: args.orderId })
      : { success: false, error: "Internal function not found" };

    if (!data.success || !data.order || !data.event || !data.tickets) {
      throw new Error(data.error || "Failed to get order data");
    }

    const { order, event, tickets } = data;

    // Check if customer has a valid email
    if (!order.buyerEmail || order.buyerEmail.includes("@temp.local")) {
      throw new Error("Customer does not have a valid email address");
    }

    // Prepare order details for email API
    const orderDetails = {
      _id: order._id,
      _creationTime: order.createdAt,
      totalAmount: order.totalCents,
      status: order.status,
      paymentMethod: order.paymentMethod,
    };

    // Prepare tickets for email API
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ticketsForEmail = tickets.map((ticket: any) => ({
      _id: ticket._id,
      _creationTime: ticket.createdAt,
      orderId: args.orderId,
      ticketCode: ticket.ticketCode,
      attendeeName: ticket.attendeeName,
      attendeeEmail: ticket.attendeeEmail,
      eventId: ticket.eventId,
      tierId: ticket.ticketTierId,
      status: ticket.status,
    }));

    // Call the ticket confirmation API endpoint
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://stepperslife.com";

    const response = await fetch(`${baseUrl}/api/send-ticket-confirmation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: order.buyerEmail,
        orderDetails,
        tickets: ticketsForEmail,
        event,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to send email: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    return {
      success: true,
      emailId: result.emailId,
      message: `Ticket confirmation resent to ${order.buyerEmail}`,
    };
  },
});
