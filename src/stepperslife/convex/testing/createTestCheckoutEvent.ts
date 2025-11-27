/**
 * Create a complete test event for checkout flow testing
 * This creates an event with:
 * - PUBLISHED status
 * - Active payment configuration
 * - Multiple ticket tiers
 * - Proper inventory
 */

import { v } from "convex/values";
import { mutation } from "../_generated/server";

export const createTestCheckoutEvent = mutation({
  args: {
    organizerEmail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const email = args.organizerEmail || `test-organizer-${Date.now()}@stepperslife.com`;

    // 1. Find or create organizer
    let organizer = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (!organizer) {
      const organizerId = await ctx.db.insert("users", {
        name: "Test Checkout Organizer",
        email: email,
        role: "organizer",
        authProvider: "password",
        canCreateTicketedEvents: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      organizer = await ctx.db.get(organizerId);
    }

    if (!organizer) {
      throw new Error("Failed to create organizer");
    }

    // 2. Create test event (30 days from now)
    const eventDate = Date.now() + 30 * 24 * 60 * 60 * 1000;
    const endDate = eventDate + 5 * 60 * 60 * 1000; // 5 hours later

    const eventId = await ctx.db.insert("events", {
      organizerId: organizer._id,
      organizerName: organizer.name || organizer.email,
      name: "TEST EVENT - Checkout Flow Testing",
      description:
        "This is a test event for validating the complete checkout flow including ticket purchase, payment processing, and email delivery with QR codes.",
      eventType: "TICKETED_EVENT",
      categories: ["Test Event", "Set"],

      // Dates
      startDate: eventDate,
      endDate: endDate,
      timezone: "America/Chicago",
      eventDateLiteral: new Date(eventDate).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "America/Chicago",
      }),
      eventTimeLiteral: "8:00 PM - 1:00 AM",
      eventTimezone: "America/Chicago",

      // Location
      location: {
        venueName: "Test Venue - Grand Ballroom",
        address: "123 Test Street",
        city: "Chicago",
        state: "IL",
        zipCode: "60601",
        country: "US",
      },

      // Capacity
      capacity: 500,

      // PUBLISHED status for immediate testing
      status: "PUBLISHED",

      // Settings - CRITICAL for ticket display
      paymentModelSelected: true,
      ticketsVisible: true,
      allowWaitlist: true,
      allowTransfers: true,
      maxTicketsPerOrder: 10,
      minTicketsPerOrder: 1,
      socialShareCount: 0,

      // Timestamps
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // 3. Create payment configuration (REQUIRED for paymentConfigured flag)
    const paymentConfigId = await ctx.db.insert("eventPaymentConfig", {
      eventId: eventId,
      organizerId: organizer._id,

      // Payment model
      paymentModel: "CREDIT_CARD",

      // Active status - THIS IS CRITICAL!
      isActive: true,

      // Customer payment methods enabled
      customerPaymentMethods: ["STRIPE", "PAYPAL", "CASHAPP"],

      // Payment processor
      merchantProcessor: "STRIPE",

      // Stripe configuration
      stripeConnectAccountId: "test_stripe_account",

      // Fee structure (standard rates)
      platformFeePercent: 3.7, // 3.7%
      platformFeeFixed: 179, // $1.79 in cents
      processingFeePercent: 2.9, // 2.9%

      // Discounts
      charityDiscount: false,
      lowPriceDiscount: false,

      // Timestamps
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // 4. Create ticket tiers
    const ticketTiers = [
      {
        name: "Early Bird",
        description: "Limited time early bird pricing - Save $10!",
        price: 2000, // $20.00
        quantity: 100,
        isActive: true,
      },
      {
        name: "General Admission",
        description: "Standard entry to the event",
        price: 3000, // $30.00
        quantity: 300,
        isActive: true,
      },
      {
        name: "VIP",
        description: "VIP entry with premium seating and complimentary drinks",
        price: 7500, // $75.00
        quantity: 100,
        isActive: true,
      },
    ];

    const tierIds = [];
    for (const tier of ticketTiers) {
      const tierId = await ctx.db.insert("ticketTiers", {
        eventId: eventId,
        name: tier.name,
        description: tier.description,
        price: tier.price,
        quantity: tier.quantity,
        sold: 0, // Start with zero sold
        isActive: tier.isActive,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      tierIds.push(tierId);
    }

    // 5. Return comprehensive test information
    return {
      success: true,
      event: {
        id: eventId,
        name: "TEST EVENT - Checkout Flow Testing",
        url: `https://events.stepperslife.com/events/${eventId}`,
        localUrl: `http://localhost:3004/events/${eventId}`,
        checkoutUrl: `http://localhost:3004/events/${eventId}/checkout`,
      },
      organizer: {
        id: organizer._id,
        email: organizer.email,
        name: organizer.name,
      },
      paymentConfig: {
        id: paymentConfigId,
        isActive: true,
        message: "✅ Payment configured and active",
      },
      ticketTiers: tierIds.map((id, index) => ({
        id: id,
        name: ticketTiers[index].name,
        price: `$${(ticketTiers[index].price / 100).toFixed(2)}`,
        quantity: ticketTiers[index].quantity,
        available: ticketTiers[index].quantity,
      })),
      testingChecklist: [
        "✅ Event created with PUBLISHED status",
        "✅ ticketsVisible: true",
        "✅ Payment configuration active",
        "✅ 3 ticket tiers created with inventory",
        "✅ Total capacity: 500 tickets",
        "",
        "🧪 READY FOR TESTING:",
        "1. Navigate to event page",
        "2. Verify tickets display correctly",
        "3. Click 'Buy Tickets'",
        "4. Fill customer information",
        "5. Use Stripe test card: 4242 4242 4242 4242",
        "6. Complete purchase",
        "7. Check email for tickets with QR codes",
        "",
        "📧 IMPORTANT: Set RESEND_API_KEY in .env.local before testing email delivery",
      ],
      stripeTestCards: {
        success: "4242 4242 4242 4242",
        declined: "4000 0000 0000 0002",
        insufficientFunds: "4000 0000 0000 9995",
        expiry: "12/28",
        cvc: "123",
      },
    };
  },
});

/**
 * Delete test checkout event and all related data
 */
export const deleteTestCheckoutEvent = mutation({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId);

    if (!event) {
      return { success: false, message: "Event not found" };
    }

    // Delete ticket tiers
    const tiers = await ctx.db
      .query("ticketTiers")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();

    for (const tier of tiers) {
      await ctx.db.delete(tier._id);
    }

    // Delete payment config
    const paymentConfig = await ctx.db
      .query("eventPaymentConfig")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .first();

    if (paymentConfig) {
      await ctx.db.delete(paymentConfig._id);
    }

    // Delete event
    await ctx.db.delete(args.eventId);

    return {
      success: true,
      message: `Deleted test event and ${tiers.length} ticket tiers`,
    };
  },
});
