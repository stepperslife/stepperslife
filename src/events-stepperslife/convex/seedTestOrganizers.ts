/**
 * Comprehensive Test Data Seed Script
 * Creates 3 organizers with events, staff, sub-sellers, bundles, and table packages
 *
 * Run with: npx convex run seedTestOrganizers:createTestOrganizers
 */

import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Helper to generate random referral codes
function generateReferralCode(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
}

export const createTestOrganizers = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const results: any = {
      organizers: [],
      events: [],
      ticketTiers: [],
      bundles: [],
      staff: [],
    };

    // ============================================================================
    // ORGANIZER 1: Maria Johnson - FREE 1000 credits (first event free)
    // ============================================================================
    let maria = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", "maria.johnson@stepperslife-test.com"))
      .first();

    if (!maria) {
      const mariaId = await ctx.db.insert("users", {
        name: "Maria Johnson",
        email: "maria.johnson@stepperslife-test.com",
        role: "organizer",
        authProvider: "password",
        canCreateTicketedEvents: true,
        acceptsStripePayments: true,
        acceptsPaypalPayments: true,
        acceptsCashPayments: true,
        createdAt: now,
        updatedAt: now,
      });
      maria = await ctx.db.get(mariaId);
    }

    // Grant Maria 1000 FREE credits
    const mariaCreditsExist = await ctx.db
      .query("organizerCredits")
      .withIndex("by_organizer", (q) => q.eq("organizerId", maria!._id))
      .first();

    if (!mariaCreditsExist) {
      await ctx.db.insert("organizerCredits", {
        organizerId: maria!._id,
        creditsTotal: 1000,
        creditsUsed: 0,
        creditsRemaining: 1000,
        firstEventFreeUsed: true, // She got the free credits
        createdAt: now,
        updatedAt: now,
      });
    }

    results.organizers.push({
      name: "Maria Johnson",
      email: "maria.johnson@stepperslife-test.com",
      credits: 1000,
      creditType: "FREE (first event bonus)",
    });

    // ============================================================================
    // ORGANIZER 2: James Williams - Purchased 500 credits
    // ============================================================================
    let james = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", "james.williams@stepperslife-test.com"))
      .first();

    if (!james) {
      const jamesId = await ctx.db.insert("users", {
        name: "James Williams",
        email: "james.williams@stepperslife-test.com",
        role: "organizer",
        authProvider: "password",
        canCreateTicketedEvents: true,
        acceptsStripePayments: true,
        acceptsCashPayments: true,
        createdAt: now,
        updatedAt: now,
      });
      james = await ctx.db.get(jamesId);
    }

    // James purchased 500 credits
    const jamesCreditsExist = await ctx.db
      .query("organizerCredits")
      .withIndex("by_organizer", (q) => q.eq("organizerId", james!._id))
      .first();

    if (!jamesCreditsExist) {
      await ctx.db.insert("organizerCredits", {
        organizerId: james!._id,
        creditsTotal: 500,
        creditsUsed: 0,
        creditsRemaining: 500,
        firstEventFreeUsed: true,
        createdAt: now,
        updatedAt: now,
      });

      // Record the credit purchase transaction
      await ctx.db.insert("creditTransactions", {
        organizerId: james!._id,
        ticketsPurchased: 500,
        amountPaid: 50000, // $500 for 500 tickets at $1 each
        pricePerTicket: 100, // $1 in cents
        stripePaymentIntentId: "pi_test_james_500_credits",
        status: "COMPLETED",
        purchasedAt: now,
      });
    }

    results.organizers.push({
      name: "James Williams",
      email: "james.williams@stepperslife-test.com",
      credits: 500,
      creditType: "PURCHASED ($500)",
    });

    // ============================================================================
    // ORGANIZER 3: Lisa Thompson - Purchased 1500 credits
    // ============================================================================
    let lisa = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", "lisa.thompson@stepperslife-test.com"))
      .first();

    if (!lisa) {
      const lisaId = await ctx.db.insert("users", {
        name: "Lisa Thompson",
        email: "lisa.thompson@stepperslife-test.com",
        role: "organizer",
        authProvider: "password",
        canCreateTicketedEvents: true,
        acceptsStripePayments: true,
        acceptsPaypalPayments: true,
        acceptsCashPayments: true,
        createdAt: now,
        updatedAt: now,
      });
      lisa = await ctx.db.get(lisaId);
    }

    // Lisa purchased 1500 credits
    const lisaCreditsExist = await ctx.db
      .query("organizerCredits")
      .withIndex("by_organizer", (q) => q.eq("organizerId", lisa!._id))
      .first();

    if (!lisaCreditsExist) {
      await ctx.db.insert("organizerCredits", {
        organizerId: lisa!._id,
        creditsTotal: 1500,
        creditsUsed: 0,
        creditsRemaining: 1500,
        firstEventFreeUsed: true,
        createdAt: now,
        updatedAt: now,
      });

      // Record the credit purchase transaction
      await ctx.db.insert("creditTransactions", {
        organizerId: lisa!._id,
        ticketsPurchased: 1500,
        amountPaid: 127500, // $1275 for 1500 tickets at $0.85 each (bulk discount)
        pricePerTicket: 85, // $0.85 in cents (bulk discount)
        paypalOrderId: "PAYPAL-lisa-1500-credits",
        status: "COMPLETED",
        purchasedAt: now,
      });
    }

    results.organizers.push({
      name: "Lisa Thompson",
      email: "lisa.thompson@stepperslife-test.com",
      credits: 1500,
      creditType: "PURCHASED ($1,275 - bulk discount)",
    });

    // ============================================================================
    // CREATE EVENTS FOR MARIA (Free credits organizer)
    // ============================================================================

    // Maria's Event 1: Save the Date
    const mariaSaveDate = await ctx.db.insert("events", {
      organizerId: maria!._id,
      organizerName: maria!.name,
      name: "Maria's Spring Gala 2026 - SAVE THE DATE",
      description: "Save the date for an extraordinary evening of elegance and stepping! More details coming soon.",
      eventType: "SAVE_THE_DATE",
      imageUrl: "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=1200&q=80",
      startDate: new Date("2026-04-15T19:00:00").getTime(),
      endDate: new Date("2026-04-15T23:00:00").getTime(),
      eventDateLiteral: "April 15, 2026",
      eventTimeLiteral: "7:00 PM - Details TBA",
      eventTimezone: "America/Chicago",
      location: {
        venueName: "The Crystal Ballroom",
        address: "500 Michigan Ave",
        city: "Chicago",
        state: "IL",
        zipCode: "60611",
        country: "USA",
      },
      categories: ["Save the Date", "Set"],
      status: "PUBLISHED",
      ticketsVisible: false,
      createdAt: now,
      updatedAt: now,
    });
    results.events.push({ id: mariaSaveDate, name: "Maria's Spring Gala 2026", type: "SAVE_THE_DATE" });

    // Maria's Event 2: Free Event
    const mariaFreeEvent = await ctx.db.insert("events", {
      organizerId: maria!._id,
      organizerName: maria!.name,
      name: "Community Steppers Night - FREE",
      description: "Join us for a free night of stepping! All skill levels welcome. Refreshments provided.",
      eventType: "FREE_EVENT",
      imageUrl: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200&q=80",
      doorPrice: "FREE - Donations welcome",
      startDate: new Date("2025-12-05T20:00:00").getTime(),
      endDate: new Date("2025-12-05T23:30:00").getTime(),
      eventDateLiteral: "December 5, 2025",
      eventTimeLiteral: "8:00 PM - 11:30 PM",
      eventTimezone: "America/Chicago",
      location: {
        venueName: "South Side Community Center",
        address: "1200 S State St",
        city: "Chicago",
        state: "IL",
        zipCode: "60605",
        country: "USA",
      },
      categories: ["Social", "Workshop"],
      status: "PUBLISHED",
      ticketsVisible: false,
      createdAt: now,
      updatedAt: now,
    });
    results.events.push({ id: mariaFreeEvent, name: "Community Steppers Night", type: "FREE_EVENT" });

    // Maria's Event 3: Ticketed Event with Multiple Tiers
    const mariaTicketedEvent = await ctx.db.insert("events", {
      organizerId: maria!._id,
      organizerName: maria!.name,
      name: "Maria's Winter Wonderland Ball",
      description: "An elegant evening of stepping featuring live DJ, catered appetizers, and cash bar. VIP includes reserved seating and meet & greet.",
      eventType: "TICKETED_EVENT",
      imageUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&q=80",
      startDate: new Date("2025-12-20T19:00:00").getTime(),
      endDate: new Date("2025-12-21T01:00:00").getTime(),
      eventDateLiteral: "December 20, 2025",
      eventTimeLiteral: "7:00 PM - 1:00 AM",
      eventTimezone: "America/Chicago",
      location: {
        venueName: "The Grand Marquis",
        address: "300 E Randolph St",
        city: "Chicago",
        state: "IL",
        zipCode: "60601",
        country: "USA",
      },
      categories: ["Set", "Holiday Event"],
      status: "PUBLISHED",
      ticketsVisible: true,
      paymentModelSelected: true,
      maxTicketsPerOrder: 10,
      minTicketsPerOrder: 1,
      capacity: 400,
      createdAt: now,
      updatedAt: now,
    });

    // Payment config for Maria's ticketed event
    await ctx.db.insert("eventPaymentConfig", {
      eventId: mariaTicketedEvent,
      organizerId: maria!._id,
      paymentModel: "PREPAY",
      isActive: true,
      activatedAt: now,
      ticketsAllocated: 400,
      customerPaymentMethods: ["CASH", "STRIPE", "PAYPAL"],
      platformFeePercent: 5.0,
      platformFeeFixed: 179,
      processingFeePercent: 2.9,
      charityDiscount: false,
      lowPriceDiscount: false,
      createdAt: now,
      updatedAt: now,
    });

    // Ticket tiers for Maria's event
    const mariaTier1 = await ctx.db.insert("ticketTiers", {
      eventId: mariaTicketedEvent,
      name: "Early Bird",
      description: "Limited early bird pricing - save $15!",
      price: 3500, // $35
      quantity: 100,
      sold: 23,
      isActive: true,
      saleEnd: new Date("2025-12-10").getTime(),
      createdAt: now,
      updatedAt: now,
    });

    const mariaTier2 = await ctx.db.insert("ticketTiers", {
      eventId: mariaTicketedEvent,
      name: "General Admission",
      description: "Standard admission to the event",
      price: 5000, // $50
      quantity: 200,
      sold: 45,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    const mariaTier3 = await ctx.db.insert("ticketTiers", {
      eventId: mariaTicketedEvent,
      name: "VIP Experience",
      description: "Premium seating, champagne reception, and meet & greet",
      price: 12500, // $125
      quantity: 50,
      sold: 12,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    // Table Package for Maria's event
    const mariaTableTier = await ctx.db.insert("ticketTiers", {
      eventId: mariaTicketedEvent,
      name: "VIP Table (8 seats)",
      description: "Reserved VIP table with bottle service. Includes 8 admissions.",
      price: 80000, // $800 for table of 8
      quantity: 10,
      sold: 3,
      isActive: true,
      isTablePackage: true,
      tableCapacity: 8,
      allocationMode: "table",
      createdAt: now,
      updatedAt: now,
    });

    results.ticketTiers.push(
      { id: mariaTier1, event: "Maria's Winter Ball", tier: "Early Bird", price: "$35" },
      { id: mariaTier2, event: "Maria's Winter Ball", tier: "General Admission", price: "$50" },
      { id: mariaTier3, event: "Maria's Winter Ball", tier: "VIP Experience", price: "$125" },
      { id: mariaTableTier, event: "Maria's Winter Ball", tier: "VIP Table (8)", price: "$800" }
    );

    results.events.push({ id: mariaTicketedEvent, name: "Maria's Winter Wonderland Ball", type: "TICKETED_EVENT" });

    // ============================================================================
    // CREATE EVENTS FOR JAMES (500 purchased credits)
    // ============================================================================

    // James' Event 1: Save the Date
    const jamesSaveDate = await ctx.db.insert("events", {
      organizerId: james!._id,
      organizerName: james!.name,
      name: "James' Summer Steppers Retreat 2026",
      description: "Save the date! A weekend of stepping, workshops, and relaxation at a beautiful resort.",
      eventType: "SAVE_THE_DATE",
      imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80",
      startDate: new Date("2026-07-10T14:00:00").getTime(),
      endDate: new Date("2026-07-12T18:00:00").getTime(),
      eventDateLiteral: "July 10-12, 2026",
      eventTimeLiteral: "Full Weekend - Details TBA",
      eventTimezone: "America/Chicago",
      location: {
        venueName: "Lakeside Resort & Spa",
        address: "TBA",
        city: "Lake Geneva",
        state: "WI",
        zipCode: "53147",
        country: "USA",
      },
      categories: ["Save the Date", "Weekend Event"],
      status: "PUBLISHED",
      ticketsVisible: false,
      createdAt: now,
      updatedAt: now,
    });
    results.events.push({ id: jamesSaveDate, name: "James' Summer Retreat 2026", type: "SAVE_THE_DATE" });

    // James' Event 2: Multi-Day Ticketed Event (Weekend)
    const jamesWeekendEvent = await ctx.db.insert("events", {
      organizerId: james!._id,
      organizerName: james!.name,
      name: "Detroit Steppers Weekend Extravaganza",
      description: "3-day stepping extravaganza! Friday night social, Saturday workshops & party, Sunday brunch & farewell dance.",
      eventType: "TICKETED_EVENT",
      imageUrl: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1200&q=80",
      startDate: new Date("2025-12-13T18:00:00").getTime(),
      endDate: new Date("2025-12-15T16:00:00").getTime(),
      eventDateLiteral: "December 13-15, 2025",
      eventTimeLiteral: "Friday 6PM - Sunday 4PM",
      eventTimezone: "America/Detroit",
      location: {
        venueName: "Motor City Grand Hotel",
        address: "1000 Woodward Ave",
        city: "Detroit",
        state: "MI",
        zipCode: "48226",
        country: "USA",
      },
      categories: ["Weekend Event", "Workshop", "Set"],
      status: "PUBLISHED",
      ticketsVisible: true,
      paymentModelSelected: true,
      maxTicketsPerOrder: 6,
      minTicketsPerOrder: 1,
      capacity: 300,
      createdAt: now,
      updatedAt: now,
    });

    // Payment config
    await ctx.db.insert("eventPaymentConfig", {
      eventId: jamesWeekendEvent,
      organizerId: james!._id,
      paymentModel: "PREPAY",
      isActive: true,
      activatedAt: now,
      ticketsAllocated: 300,
      customerPaymentMethods: ["CASH", "STRIPE"],
      platformFeePercent: 5.0,
      platformFeeFixed: 179,
      processingFeePercent: 2.9,
      charityDiscount: false,
      lowPriceDiscount: false,
      createdAt: now,
      updatedAt: now,
    });

    // Individual day passes
    const jamesFridayTier = await ctx.db.insert("ticketTiers", {
      eventId: jamesWeekendEvent,
      name: "Friday Night Only",
      description: "Friday opening night social",
      price: 2500, // $25
      quantity: 100,
      sold: 34,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    const jamesSaturdayTier = await ctx.db.insert("ticketTiers", {
      eventId: jamesWeekendEvent,
      name: "Saturday Full Day",
      description: "Workshops + Saturday night party",
      price: 4500, // $45
      quantity: 150,
      sold: 67,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    const jamesSundayTier = await ctx.db.insert("ticketTiers", {
      eventId: jamesWeekendEvent,
      name: "Sunday Brunch & Dance",
      description: "Farewell brunch and afternoon dance",
      price: 3500, // $35
      quantity: 80,
      sold: 28,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    // Weekend pass
    const jamesWeekendPass = await ctx.db.insert("ticketTiers", {
      eventId: jamesWeekendEvent,
      name: "Full Weekend Pass",
      description: "All 3 days - BEST VALUE! Save $30",
      price: 7500, // $75 (vs $105 separately)
      quantity: 100,
      sold: 41,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    results.ticketTiers.push(
      { id: jamesFridayTier, event: "Detroit Weekend", tier: "Friday", price: "$25" },
      { id: jamesSaturdayTier, event: "Detroit Weekend", tier: "Saturday", price: "$45" },
      { id: jamesSundayTier, event: "Detroit Weekend", tier: "Sunday", price: "$35" },
      { id: jamesWeekendPass, event: "Detroit Weekend", tier: "Weekend Pass", price: "$75" }
    );

    // Create Weekend Bundle
    const jamesWeekendBundle = await ctx.db.insert("ticketBundles", {
      bundleType: "SINGLE_EVENT",
      eventId: jamesWeekendEvent,
      name: "Couple's Weekend Getaway",
      description: "2 Full Weekend Passes - Perfect for couples!",
      price: 13000, // $130 (save $20)
      includedTiers: [
        { tierId: jamesWeekendPass, tierName: "Full Weekend Pass", quantity: 2 },
      ],
      totalQuantity: 30,
      sold: 8,
      regularPrice: 15000,
      savings: 2000,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
    results.bundles.push({ id: jamesWeekendBundle, name: "Couple's Weekend Getaway", price: "$130" });

    results.events.push({ id: jamesWeekendEvent, name: "Detroit Steppers Weekend", type: "TICKETED_EVENT" });

    // ============================================================================
    // CREATE EVENTS FOR LISA (1500 purchased credits)
    // ============================================================================

    // Lisa's Event 1: Large Scale Event with Table Packages
    const lisaGalaEvent = await ctx.db.insert("events", {
      organizerId: lisa!._id,
      organizerName: lisa!.name,
      name: "Lisa's New Year's Eve Grand Gala",
      description: "The most anticipated stepping event of the year! Black tie, live orchestra, gourmet dinner, premium open bar, and stepping until dawn!",
      eventType: "TICKETED_EVENT",
      imageUrl: "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=1200&q=80",
      startDate: new Date("2025-12-31T20:00:00").getTime(),
      endDate: new Date("2026-01-01T04:00:00").getTime(),
      eventDateLiteral: "December 31, 2025",
      eventTimeLiteral: "8:00 PM - 4:00 AM",
      eventTimezone: "America/Chicago",
      location: {
        venueName: "The Palmer House Hilton",
        address: "17 E Monroe St",
        city: "Chicago",
        state: "IL",
        zipCode: "60603",
        country: "USA",
      },
      categories: ["Set", "Holiday Event", "Black Tie"],
      status: "PUBLISHED",
      ticketsVisible: true,
      paymentModelSelected: true,
      maxTicketsPerOrder: 12,
      minTicketsPerOrder: 1,
      capacity: 800,
      createdAt: now,
      updatedAt: now,
    });

    // Payment config
    await ctx.db.insert("eventPaymentConfig", {
      eventId: lisaGalaEvent,
      organizerId: lisa!._id,
      paymentModel: "PREPAY",
      isActive: true,
      activatedAt: now,
      ticketsAllocated: 800,
      customerPaymentMethods: ["CASH", "STRIPE", "PAYPAL"],
      platformFeePercent: 5.0,
      platformFeeFixed: 179,
      processingFeePercent: 2.9,
      charityDiscount: false,
      lowPriceDiscount: false,
      createdAt: now,
      updatedAt: now,
    });

    // Ticket tiers with early bird pricing
    const lisaEarlyBird = await ctx.db.insert("ticketTiers", {
      eventId: lisaGalaEvent,
      name: "Super Early Bird",
      description: "Limited! Save $75 - Ends Dec 1st",
      price: 17500, // $175
      pricingTiers: [
        { name: "Super Early Bird", price: 17500, availableFrom: now, availableUntil: new Date("2025-12-01").getTime() },
        { name: "Early Bird", price: 20000, availableFrom: new Date("2025-12-01").getTime(), availableUntil: new Date("2025-12-15").getTime() },
        { name: "Regular", price: 25000, availableFrom: new Date("2025-12-15").getTime() },
      ],
      quantity: 200,
      sold: 89,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    const lisaGeneral = await ctx.db.insert("ticketTiers", {
      eventId: lisaGalaEvent,
      name: "General Admission",
      description: "Full event access with dinner and open bar",
      price: 25000, // $250
      quantity: 400,
      sold: 156,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    const lisaVIP = await ctx.db.insert("ticketTiers", {
      eventId: lisaGalaEvent,
      name: "Platinum VIP",
      description: "Premium seating, VIP lounge, champagne toast, and swag bag",
      price: 45000, // $450
      quantity: 100,
      sold: 34,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    // Multiple table sizes
    const lisaTable6 = await ctx.db.insert("ticketTiers", {
      eventId: lisaGalaEvent,
      name: "VIP Table for 6",
      description: "Premium location table with bottle service",
      price: 240000, // $2,400
      quantity: 15,
      sold: 7,
      isActive: true,
      isTablePackage: true,
      tableCapacity: 6,
      allocationMode: "table",
      createdAt: now,
      updatedAt: now,
    });

    const lisaTable10 = await ctx.db.insert("ticketTiers", {
      eventId: lisaGalaEvent,
      name: "Grand Table for 10",
      description: "Prime location with 2 bottles and dedicated server",
      price: 400000, // $4,000
      quantity: 8,
      sold: 4,
      isActive: true,
      isTablePackage: true,
      tableCapacity: 10,
      allocationMode: "table",
      createdAt: now,
      updatedAt: now,
    });

    results.ticketTiers.push(
      { id: lisaEarlyBird, event: "Lisa's NYE Gala", tier: "Super Early Bird", price: "$175-$250" },
      { id: lisaGeneral, event: "Lisa's NYE Gala", tier: "General Admission", price: "$250" },
      { id: lisaVIP, event: "Lisa's NYE Gala", tier: "Platinum VIP", price: "$450" },
      { id: lisaTable6, event: "Lisa's NYE Gala", tier: "Table for 6", price: "$2,400" },
      { id: lisaTable10, event: "Lisa's NYE Gala", tier: "Table for 10", price: "$4,000" }
    );

    // Create VIP Group Bundle
    const lisaGroupBundle = await ctx.db.insert("ticketBundles", {
      bundleType: "SINGLE_EVENT",
      eventId: lisaGalaEvent,
      name: "VIP Squad (4 Platinum Tickets)",
      description: "4 Platinum VIP tickets - Save $200!",
      price: 160000, // $1,600 (vs $1,800)
      includedTiers: [
        { tierId: lisaVIP, tierName: "Platinum VIP", quantity: 4 },
      ],
      totalQuantity: 15,
      sold: 5,
      regularPrice: 180000,
      savings: 20000,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
    results.bundles.push({ id: lisaGroupBundle, name: "VIP Squad (4 tickets)", price: "$1,600" });

    results.events.push({ id: lisaGalaEvent, name: "Lisa's NYE Grand Gala", type: "TICKETED_EVENT" });

    // Lisa's Event 2: Free Workshop
    const lisaFreeWorkshop = await ctx.db.insert("events", {
      organizerId: lisa!._id,
      organizerName: lisa!.name,
      name: "Stepping Basics - Free Workshop",
      description: "Learn the fundamentals of Chicago stepping! Perfect for beginners. No experience needed.",
      eventType: "FREE_EVENT",
      imageUrl: "https://images.unsplash.com/photo-1524117074681-31bd4de22ad3?w=1200&q=80",
      doorPrice: "FREE",
      startDate: new Date("2025-12-08T14:00:00").getTime(),
      endDate: new Date("2025-12-08T17:00:00").getTime(),
      eventDateLiteral: "December 8, 2025",
      eventTimeLiteral: "2:00 PM - 5:00 PM",
      eventTimezone: "America/Chicago",
      location: {
        venueName: "Chicago Cultural Center",
        address: "78 E Washington St",
        city: "Chicago",
        state: "IL",
        zipCode: "60602",
        country: "USA",
      },
      categories: ["Workshop", "Beginners"],
      status: "PUBLISHED",
      ticketsVisible: false,
      createdAt: now,
      updatedAt: now,
    });
    results.events.push({ id: lisaFreeWorkshop, name: "Stepping Basics Workshop", type: "FREE_EVENT" });

    // ============================================================================
    // CREATE STAFF FOR EACH ORGANIZER
    // ============================================================================

    // Create staff users first
    const staffUsers = [
      { name: "Mike Roberts", email: "mike.roberts@test.com" },
      { name: "Sarah Davis", email: "sarah.davis@test.com" },
      { name: "Tony Jackson", email: "tony.jackson@test.com" },
      { name: "Angela Brown", email: "angela.brown@test.com" },
      { name: "Derek Wilson", email: "derek.wilson@test.com" },
      { name: "Nicole Martin", email: "nicole.martin@test.com" },
      { name: "Chris Taylor", email: "chris.taylor@test.com" },
      { name: "Monica Lee", email: "monica.lee@test.com" },
      { name: "Kevin Anderson", email: "kevin.anderson@test.com" },
    ];

    const createdStaffUsers: any[] = [];
    for (const staff of staffUsers) {
      let user = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", staff.email))
        .first();

      if (!user) {
        const userId = await ctx.db.insert("users", {
          name: staff.name,
          email: staff.email,
          role: "user",
          authProvider: "password",
          createdAt: now,
          updatedAt: now,
        });
        user = await ctx.db.get(userId);
      }
      createdStaffUsers.push(user);
    }

    // MARIA'S STAFF (for Winter Ball)
    // Team Member 1: Mike (can assign sub-sellers)
    const mariaMike = await ctx.db.insert("eventStaff", {
      eventId: mariaTicketedEvent,
      organizerId: maria!._id,
      staffUserId: createdStaffUsers[0]!._id,
      email: createdStaffUsers[0]!.email,
      name: createdStaffUsers[0]!.name!,
      role: "TEAM_MEMBERS",
      canScan: true,
      canAssignSubSellers: true,
      maxSubSellers: 5,
      hierarchyLevel: 1,
      commissionType: "PERCENTAGE",
      commissionValue: 10, // 10%
      commissionEarned: 0,
      allocatedTickets: 100,
      ticketsSold: 15,
      isActive: true,
      referralCode: generateReferralCode("MIKE"),
      createdAt: now,
      updatedAt: now,
    });

    // Associate under Mike: Sarah
    const mariaSarah = await ctx.db.insert("eventStaff", {
      eventId: mariaTicketedEvent,
      organizerId: maria!._id,
      staffUserId: createdStaffUsers[1]!._id,
      email: createdStaffUsers[1]!.email,
      name: createdStaffUsers[1]!.name!,
      role: "ASSOCIATES",
      canScan: false,
      assignedByStaffId: mariaMike,
      hierarchyLevel: 2,
      commissionType: "FIXED",
      commissionValue: 500, // $5 per ticket
      commissionEarned: 2500, // Sold 5 tickets
      allocatedTickets: 30,
      ticketsSold: 5,
      isActive: true,
      referralCode: generateReferralCode("SARAH"),
      createdAt: now,
      updatedAt: now,
    });

    // Door Staff: Tony
    const mariaTony = await ctx.db.insert("eventStaff", {
      eventId: mariaTicketedEvent,
      organizerId: maria!._id,
      staffUserId: createdStaffUsers[2]!._id,
      email: createdStaffUsers[2]!.email,
      name: createdStaffUsers[2]!.name!,
      role: "STAFF",
      canScan: true,
      hierarchyLevel: 1,
      commissionType: "FIXED",
      commissionValue: 0, // Door staff, no commission
      commissionEarned: 0,
      ticketsSold: 0,
      isActive: true,
      referralCode: generateReferralCode("TONY"),
      createdAt: now,
      updatedAt: now,
    });

    results.staff.push(
      { name: "Mike Roberts", role: "TEAM_MEMBERS", organizer: "Maria", commission: "10%", subSellers: 1 },
      { name: "Sarah Davis", role: "ASSOCIATES", organizer: "Maria", commission: "$5/ticket", assignedBy: "Mike" },
      { name: "Tony Jackson", role: "STAFF (Door)", organizer: "Maria", commission: "N/A" }
    );

    // JAMES'S STAFF (for Weekend Event)
    // Team Member: Angela
    const jamesAngela = await ctx.db.insert("eventStaff", {
      eventId: jamesWeekendEvent,
      organizerId: james!._id,
      staffUserId: createdStaffUsers[3]!._id,
      email: createdStaffUsers[3]!.email,
      name: createdStaffUsers[3]!.name!,
      role: "TEAM_MEMBERS",
      canScan: true,
      canAssignSubSellers: true,
      maxSubSellers: 3,
      hierarchyLevel: 1,
      commissionType: "PERCENTAGE",
      commissionValue: 12, // 12%
      commissionEarned: 4500, // Sold $375 worth
      allocatedTickets: 75,
      ticketsSold: 22,
      isActive: true,
      referralCode: generateReferralCode("ANGELA"),
      createdAt: now,
      updatedAt: now,
    });

    // Associate under Angela: Derek
    const jamesDerek = await ctx.db.insert("eventStaff", {
      eventId: jamesWeekendEvent,
      organizerId: james!._id,
      staffUserId: createdStaffUsers[4]!._id,
      email: createdStaffUsers[4]!.email,
      name: createdStaffUsers[4]!.name!,
      role: "ASSOCIATES",
      canScan: false,
      assignedByStaffId: jamesAngela,
      hierarchyLevel: 2,
      commissionType: "PERCENTAGE",
      commissionValue: 8, // 8% (Angela keeps 4% of her 12%)
      commissionEarned: 1800,
      allocatedTickets: 25,
      ticketsSold: 9,
      isActive: true,
      referralCode: generateReferralCode("DEREK"),
      createdAt: now,
      updatedAt: now,
    });

    // Staff with cash collection: Nicole
    const jamesNicole = await ctx.db.insert("eventStaff", {
      eventId: jamesWeekendEvent,
      organizerId: james!._id,
      staffUserId: createdStaffUsers[5]!._id,
      email: createdStaffUsers[5]!.email,
      name: createdStaffUsers[5]!.name!,
      role: "STAFF",
      canScan: true,
      acceptCashInPerson: true,
      hierarchyLevel: 1,
      commissionType: "FIXED",
      commissionValue: 300, // $3 per cash sale
      commissionEarned: 1500, // 5 cash sales
      cashCollected: 18750, // 5 tickets at $37.50 avg
      ticketsSold: 5,
      isActive: true,
      referralCode: generateReferralCode("NICOLE"),
      createdAt: now,
      updatedAt: now,
    });

    results.staff.push(
      { name: "Angela Brown", role: "TEAM_MEMBERS", organizer: "James", commission: "12%", subSellers: 1 },
      { name: "Derek Wilson", role: "ASSOCIATES", organizer: "James", commission: "8%", assignedBy: "Angela" },
      { name: "Nicole Martin", role: "STAFF (Cash)", organizer: "James", commission: "$3/sale" }
    );

    // LISA'S STAFF (for NYE Gala - larger team)
    // Team Member 1: Chris
    const lisaChris = await ctx.db.insert("eventStaff", {
      eventId: lisaGalaEvent,
      organizerId: lisa!._id,
      staffUserId: createdStaffUsers[6]!._id,
      email: createdStaffUsers[6]!.email,
      name: createdStaffUsers[6]!.name!,
      role: "TEAM_MEMBERS",
      canScan: true,
      canAssignSubSellers: true,
      maxSubSellers: 10,
      hierarchyLevel: 1,
      commissionType: "PERCENTAGE",
      commissionValue: 15, // 15% - higher value event
      commissionEarned: 11250, // Sold $75k worth
      allocatedTickets: 150,
      ticketsSold: 38,
      isActive: true,
      referralCode: generateReferralCode("CHRIS"),
      createdAt: now,
      updatedAt: now,
    });

    // Associate under Chris: Monica
    const lisaMonica = await ctx.db.insert("eventStaff", {
      eventId: lisaGalaEvent,
      organizerId: lisa!._id,
      staffUserId: createdStaffUsers[7]!._id,
      email: createdStaffUsers[7]!.email,
      name: createdStaffUsers[7]!.name!,
      role: "ASSOCIATES",
      canScan: false,
      assignedByStaffId: lisaChris,
      hierarchyLevel: 2,
      commissionType: "PERCENTAGE",
      commissionValue: 10, // 10% (Chris keeps 5%)
      commissionEarned: 6250,
      allocatedTickets: 50,
      ticketsSold: 25,
      isActive: true,
      referralCode: generateReferralCode("MONICA"),
      createdAt: now,
      updatedAt: now,
    });

    // Team Member 2: Kevin (handles tables)
    const lisaKevin = await ctx.db.insert("eventStaff", {
      eventId: lisaGalaEvent,
      organizerId: lisa!._id,
      staffUserId: createdStaffUsers[8]!._id,
      email: createdStaffUsers[8]!.email,
      name: createdStaffUsers[8]!.name!,
      role: "TEAM_MEMBERS",
      canScan: true,
      canAssignSubSellers: false, // Table specialist, no sub-sellers
      hierarchyLevel: 1,
      commissionType: "PERCENTAGE",
      commissionValue: 8, // 8% on high-value tables
      commissionEarned: 32000, // Sold 4 tables = $4,000 commission
      allocatedTickets: 50, // Table allocations
      ticketsSold: 4, // 4 tables
      isActive: true,
      referralCode: generateReferralCode("KEVIN"),
      createdAt: now,
      updatedAt: now,
    });

    results.staff.push(
      { name: "Chris Taylor", role: "TEAM_MEMBERS", organizer: "Lisa", commission: "15%", subSellers: 1 },
      { name: "Monica Lee", role: "ASSOCIATES", organizer: "Lisa", commission: "10%", assignedBy: "Chris" },
      { name: "Kevin Anderson", role: "TEAM_MEMBERS (Tables)", organizer: "Lisa", commission: "8%" }
    );

    // ============================================================================
    // SUMMARY
    // ============================================================================
    return {
      success: true,
      summary: {
        organizers: results.organizers,
        eventsCreated: results.events.length,
        ticketTiersCreated: results.ticketTiers.length,
        bundlesCreated: results.bundles.length,
        staffCreated: results.staff.length,
      },
      details: results,
      instructions: [
        "✅ Created 3 organizers with different credit types:",
        "   - Maria Johnson: 1000 FREE credits (first event bonus)",
        "   - James Williams: 500 PURCHASED credits ($500)",
        "   - Lisa Thompson: 1500 PURCHASED credits ($1,275 bulk)",
        "",
        "✅ Created events:",
        "   - 2 Save the Date events",
        "   - 2 Free events",
        "   - 3 Ticketed events with multiple tiers",
        "",
        "✅ Created ticket options:",
        "   - Early bird pricing",
        "   - General admission",
        "   - VIP tiers",
        "   - Table packages (6 and 10 seats)",
        "   - Multi-day passes",
        "",
        "✅ Created bundles:",
        "   - Couple's Weekend Getaway",
        "   - VIP Squad (4 tickets)",
        "",
        "✅ Created staff hierarchy:",
        "   - 4 Team Members (can assign sub-sellers)",
        "   - 3 Associates (assigned by team members)",
        "   - 2 Door Staff (scanning only)",
        "",
        "🌐 View events at: http://localhost:3004/events",
      ],
    };
  },
});

/**
 * Delete all test organizer data
 * Run with: npx convex run seedTestOrganizers:deleteTestOrganizers
 */
export const deleteTestOrganizers = mutation({
  args: {},
  handler: async (ctx) => {
    const testEmails = [
      "maria.johnson@stepperslife-test.com",
      "james.williams@stepperslife-test.com",
      "lisa.thompson@stepperslife-test.com",
    ];

    let deletedEvents = 0;
    let deletedStaff = 0;
    let deletedTiers = 0;
    let deletedBundles = 0;

    for (const email of testEmails) {
      const user = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", email))
        .first();

      if (user) {
        // Delete events and related data
        const events = await ctx.db
          .query("events")
          .withIndex("by_organizer", (q) => q.eq("organizerId", user._id))
          .collect();

        for (const event of events) {
          // Delete ticket tiers
          const tiers = await ctx.db
            .query("ticketTiers")
            .withIndex("by_event", (q) => q.eq("eventId", event._id))
            .collect();
          for (const tier of tiers) {
            await ctx.db.delete(tier._id);
            deletedTiers++;
          }

          // Delete bundles
          const bundles = await ctx.db
            .query("ticketBundles")
            .withIndex("by_event", (q) => q.eq("eventId", event._id))
            .collect();
          for (const bundle of bundles) {
            await ctx.db.delete(bundle._id);
            deletedBundles++;
          }

          // Delete staff
          const staff = await ctx.db
            .query("eventStaff")
            .withIndex("by_event", (q) => q.eq("eventId", event._id))
            .collect();
          for (const s of staff) {
            await ctx.db.delete(s._id);
            deletedStaff++;
          }

          // Delete payment config
          const paymentConfig = await ctx.db
            .query("eventPaymentConfig")
            .withIndex("by_event", (q) => q.eq("eventId", event._id))
            .first();
          if (paymentConfig) {
            await ctx.db.delete(paymentConfig._id);
          }

          await ctx.db.delete(event._id);
          deletedEvents++;
        }

        // Delete credits
        const credits = await ctx.db
          .query("organizerCredits")
          .withIndex("by_organizer", (q) => q.eq("organizerId", user._id))
          .first();
        if (credits) {
          await ctx.db.delete(credits._id);
        }

        // Delete credit transactions
        const transactions = await ctx.db
          .query("creditTransactions")
          .withIndex("by_organizer", (q) => q.eq("organizerId", user._id))
          .collect();
        for (const t of transactions) {
          await ctx.db.delete(t._id);
        }
      }
    }

    return {
      success: true,
      deleted: {
        events: deletedEvents,
        ticketTiers: deletedTiers,
        bundles: deletedBundles,
        staff: deletedStaff,
      },
    };
  },
});
