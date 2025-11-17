/**
 * Payment Test Helpers
 *
 * Convex mutations for creating test data and simulating payment flows
 * FOR TESTING ONLY - NOT FOR PRODUCTION USE
 */

import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { Id } from "../_generated/dataModel";

/**
 * Create a test organizer account with initial credits
 */
export const setupTestOrganizer = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    credits: v.number(),
    stripeConnectId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Create user
    const userId = await ctx.db.insert("users", {
      email: args.email,
      name: args.name,
      role: "organizer",
      canCreateTicketedEvents: true,
      stripeConnectedAccountId: args.stripeConnectId,
      stripeAccountSetupComplete: !!args.stripeConnectId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Create credit account
    const creditsId = await ctx.db.insert("organizerCredits", {
      organizerId: userId,
      creditsTotal: args.credits,
      creditsUsed: 0,
      creditsRemaining: args.credits,
      firstEventFreeUsed: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { userId, creditsId };
  },
});

/**
 * Create a complete test event with payment configuration and tickets
 */
export const setupTestEvent = mutation({
  args: {
    organizerId: v.id("users"),
    eventName: v.string(),
    paymentModel: v.union(v.literal("PREPAY"), v.literal("CREDIT_CARD")),
    ticketPrice: v.number(),
    ticketQuantity: v.number(),
    ticketsAllocated: v.optional(v.number()),
    customerPaymentMethods: v.optional(v.array(v.string())),
    charityDiscount: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Get user for validation
    const user = await ctx.db.get(args.organizerId);
    if (!user) {
      throw new Error("User not found");
    }

    // Create event
    const eventId = await ctx.db.insert("events", {
      organizerId: args.organizerId,
      name: args.eventName,
      description: "Test event for payment system testing",
      eventType: "TICKETED_EVENT",
      status: "PUBLISHED",
      paymentModelSelected: true,
      ticketsVisible: true,
      categories: ["Test"],
      startDate: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days from now
      endDate: Date.now() + 7 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000, // +4 hours
      timezone: "America/Chicago",
      location: {
        city: "Chicago",
        state: "IL",
        country: "US",
      },
      capacity: args.ticketQuantity,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Create payment configuration
    const paymentConfigId = await ctx.db.insert("eventPaymentConfig", {
      eventId,
      organizerId: args.organizerId,
      paymentModel: args.paymentModel,
      customerPaymentMethods: args.customerPaymentMethods || ["STRIPE"],
      organizerPaymentMethod: args.paymentModel === "PREPAY" ? "SQUARE" : undefined,
      ticketsAllocated: args.ticketsAllocated,
      stripeConnectAccountId: user.stripeConnectedAccountId,
      platformFeePercent: args.paymentModel === "CREDIT_CARD" ? (args.charityDiscount ? 1.85 : 3.7) : 0,
      platformFeeFixed: args.paymentModel === "CREDIT_CARD" ? (args.charityDiscount ? 90 : 179) : 0,
      processingFeePercent: 2.9,
      charityDiscount: args.charityDiscount || false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Create ticket tier
    const tierIds = await ctx.db.insert("ticketTiers", {
      eventId,
      name: "General Admission",
      description: "Standard entry ticket",
      price: args.ticketPrice,
      quantity: args.ticketQuantity,
      sold: 0,
      isActive: true,
      sortOrder: 0,
      version: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { eventId, paymentConfigId, tierId: tierIds };
  },
});

/**
 * Simulate a complete order with payment
 */
export const simulateOrder = mutation({
  args: {
    eventId: v.id("events"),
    ticketTierId: v.id("ticketTiers"),
    quantity: v.number(),
    buyerEmail: v.string(),
    buyerName: v.string(),
    paymentMethod: v.union(
      v.literal("STRIPE"),
      v.literal("CASH"),
      v.literal("PAYPAL"),
      v.literal("TEST")
    ),
  },
  handler: async (ctx, args) => {
    // Get payment config
    const paymentConfig = await ctx.db
      .query("eventPaymentConfig")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .first();

    if (!paymentConfig) {
      throw new Error("Payment config not found");
    }

    // Get ticket tier
    const tier = await ctx.db.get(args.ticketTierId);
    if (!tier) {
      throw new Error("Ticket tier not found");
    }

    // Calculate fees
    const subtotalCents = tier.price * args.quantity;
    const platformFeeCents =
      Math.round(subtotalCents * (paymentConfig.platformFeePercent / 100)) +
      paymentConfig.platformFeeFixed * args.quantity;
    const processingFeeCents = Math.round(
      (subtotalCents + platformFeeCents) * (paymentConfig.processingFeePercent / 100)
    );
    const totalCents = subtotalCents + platformFeeCents + processingFeeCents;

    // Create buyer if doesn't exist
    let buyerId: Id<"users"> | undefined;
    const existingBuyer = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.buyerEmail))
      .first();

    if (existingBuyer) {
      buyerId = existingBuyer._id;
    } else {
      buyerId = await ctx.db.insert("users", {
        email: args.buyerEmail,
        name: args.buyerName,
        role: "user",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }

    // Create order
    const orderId = await ctx.db.insert("orders", {
      eventId: args.eventId,
      buyerId,
      status: args.paymentMethod === "CASH" ? "PENDING_ACTIVATION" : "COMPLETED",
      subtotalCents,
      platformFeeCents,
      processingFeeCents,
      totalCents,
      paymentMethod: args.paymentMethod,
      stripePaymentIntentId: args.paymentMethod === "STRIPE" ? `test_pi_${Date.now()}` : undefined,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Create tickets
    const ticketIds: Id<"tickets">[] = [];
    for (let i = 0; i < args.quantity; i++) {
      const ticketCode = `TKT-${Date.now()}-${i}`;
      const ticketId = await ctx.db.insert("tickets", {
        orderId,
        eventId: args.eventId,
        ticketTierId: args.ticketTierId,
        attendeeId: buyerId,
        ticketCode,
        status: args.paymentMethod === "CASH" ? "PENDING_ACTIVATION" : "VALID",
        activationCode: args.paymentMethod === "CASH" ? Math.floor(1000 + Math.random() * 9000).toString() : undefined,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      ticketIds.push(ticketId);
    }

    // Update tier sold count with optimistic locking
    const updatedTier = await ctx.db.get(args.ticketTierId);
    if (!updatedTier) {
      throw new Error("Ticket tier not found during update");
    }

    await ctx.db.patch(args.ticketTierId, {
      sold: updatedTier.sold + args.quantity,
      version: updatedTier.version + 1,
      updatedAt: Date.now(),
    });

    // Deduct credits if PREPAY model
    if (paymentConfig.paymentModel === "PREPAY") {
      const credits = await ctx.db
        .query("organizerCredits")
        .withIndex("by_organizer", (q) => q.eq("organizerId", paymentConfig.organizerId))
        .first();

      if (credits) {
        await ctx.db.patch(credits._id, {
          creditsUsed: credits.creditsUsed + args.quantity,
          creditsRemaining: credits.creditsRemaining - args.quantity,
          updatedAt: Date.now(),
        });
      }
    }

    return {
      orderId,
      ticketIds,
      subtotalCents,
      platformFeeCents,
      processingFeeCents,
      totalCents,
    };
  },
});

/**
 * Verify credit balance for an organizer
 */
export const verifyCredits = query({
  args: {
    organizerId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const credits = await ctx.db
      .query("organizerCredits")
      .withIndex("by_organizer", (q) => q.eq("organizerId", args.organizerId))
      .first();

    return credits || null;
  },
});

/**
 * Verify order and fee calculations
 */
export const verifyOrder = query({
  args: {
    orderId: v.id("orders"),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) {
      return null;
    }

    // Get tickets for this order
    const tickets = await ctx.db
      .query("tickets")
      .withIndex("by_order", (q) => q.eq("orderId", args.orderId))
      .collect();

    // Get payment config
    const paymentConfig = await ctx.db
      .query("eventPaymentConfig")
      .withIndex("by_event", (q) => q.eq("eventId", order.eventId))
      .first();

    return {
      order,
      tickets,
      paymentConfig,
      ticketCount: tickets.length,
    };
  },
});

/**
 * Get event statistics
 */
export const getEventStats = query({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    // Get all orders for this event
    const orders = await ctx.db
      .query("orders")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();

    // Get all tickets for this event
    const tickets = await ctx.db
      .query("tickets")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();

    // Get payment config
    const paymentConfig = await ctx.db
      .query("eventPaymentConfig")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .first();

    // Calculate totals
    const totalRevenue = orders.reduce((sum, order) => sum + order.subtotalCents, 0);
    const totalPlatformFees = orders.reduce((sum, order) => sum + order.platformFeeCents, 0);
    const totalProcessingFees = orders.reduce((sum, order) => sum + order.processingFeeCents, 0);
    const totalCollected = orders.reduce((sum, order) => sum + order.totalCents, 0);

    return {
      totalOrders: orders.length,
      totalTickets: tickets.length,
      totalRevenue,
      totalPlatformFees,
      totalProcessingFees,
      totalCollected,
      paymentModel: paymentConfig?.paymentModel,
      completedOrders: orders.filter((o) => o.status === "COMPLETED").length,
      pendingOrders: orders.filter((o) => o.status === "PENDING_ACTIVATION").length,
    };
  },
});

/**
 * Clean up all test data
 */
export const cleanupTestData = mutation({
  args: {},
  handler: async (ctx) => {
    // Delete all users with test email
    const testUsers = await ctx.db
      .query("users")
      .filter((q) =>
        q.or(
          q.eq(q.field("email"), "test-organizer-prepay@stepperslife.test"),
          q.eq(q.field("email"), "test-organizer-creditcard@stepperslife.test"),
          q.eq(q.field("email"), "test-buyer@stepperslife.test")
        )
      )
      .collect();

    for (const user of testUsers) {
      // Delete related credits
      const credits = await ctx.db
        .query("organizerCredits")
        .withIndex("by_organizer", (q) => q.eq("organizerId", user._id))
        .collect();
      for (const credit of credits) {
        await ctx.db.delete(credit._id);
      }

      // Delete related events
      const events = await ctx.db
        .query("events")
        .withIndex("by_organizer", (q) => q.eq("organizerId", user._id))
        .collect();

      for (const event of events) {
        // Delete tickets
        const tickets = await ctx.db
          .query("tickets")
          .withIndex("by_event", (q) => q.eq("eventId", event._id))
          .collect();
        for (const ticket of tickets) {
          await ctx.db.delete(ticket._id);
        }

        // Delete orders
        const orders = await ctx.db
          .query("orders")
          .withIndex("by_event", (q) => q.eq("eventId", event._id))
          .collect();
        for (const order of orders) {
          await ctx.db.delete(order._id);
        }

        // Delete ticket tiers
        const tiers = await ctx.db
          .query("ticketTiers")
          .withIndex("by_event", (q) => q.eq("eventId", event._id))
          .collect();
        for (const tier of tiers) {
          await ctx.db.delete(tier._id);
        }

        // Delete payment config
        const paymentConfigs = await ctx.db
          .query("eventPaymentConfig")
          .withIndex("by_event", (q) => q.eq("eventId", event._id))
          .collect();
        for (const config of paymentConfigs) {
          await ctx.db.delete(config._id);
        }

        // Delete event
        await ctx.db.delete(event._id);
      }

      // Delete user
      await ctx.db.delete(user._id);
    }

    return { success: true, message: "Test data cleaned up" };
  },
});
