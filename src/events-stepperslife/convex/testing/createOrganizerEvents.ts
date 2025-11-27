/**
 * Create test events for organizer testing workflow
 * This creates events without payment (DRAFT status initially)
 */

import { v } from "convex/values";
import { mutation } from "../_generated/server";

export const createOrganizerWithEvents = mutation({
  args: {
    organizerEmail: v.optional(v.string()),
    numberOfEvents: v.optional(v.number()),
    eventTypes: v.optional(
      v.array(
        v.union(
          v.literal("TICKETED_EVENT"),
          v.literal("FREE_EVENT"),
          v.literal("SAVE_THE_DATE")
        )
      )
    ),
  },
  handler: async (ctx, args) => {
    const email = args.organizerEmail || `organizer-${Date.now()}@test.com`;
    const numEvents = args.numberOfEvents || 3;

    // 1. Find or create organizer
    let organizer = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (!organizer) {
      // Create test organizer
      const organizerId = await ctx.db.insert("users", {
        name: "Test Organizer",
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

    // 2. Create multiple events
    const eventIds = [];
    const eventDetails = [
      // TICKETED EVENTS (6)
      {
        name: "Chicago Steppers Social - Summer Kickoff",
        description:
          "Join us for an amazing night of stepping! DJ spinning the best steppers music. Doors open at 8 PM. Line dance lessons at 9 PM.",
        eventType: "TICKETED_EVENT" as const,
        price: 2500, // $25
        capacity: 500,
        categories: ["Set"],
        venueName: "Grand Ballroom Chicago",
        city: "Chicago",
        state: "IL",
        zipCode: "60601",
      },
      {
        name: "Detroit Steppers Weekend",
        description:
          "3-day steppers event featuring workshops, competitions, and nightly socials. VIP packages available with meet & greet.",
        eventType: "TICKETED_EVENT" as const,
        price: 3000, // $30
        capacity: 500,
        categories: ["Weekend Event", "Workshop"],
        venueName: "Motor City Convention Center",
        city: "Detroit",
        state: "MI",
        zipCode: "48201",
      },
      {
        name: "Atlanta Steppers Extravaganza",
        description:
          "The South's premier steppers event returns! Live band, multiple DJs, food vendors. Early bird pricing available.",
        eventType: "TICKETED_EVENT" as const,
        price: 2000, // $20
        capacity: 500,
        categories: ["Set"],
        venueName: "Atlanta Event Hall",
        city: "Atlanta",
        state: "GA",
        zipCode: "30301",
      },
      {
        name: "Houston Steppers Gala",
        description:
          "Annual black-tie steppers gala with live orchestra, gourmet dinner, and premium open bar. VIP tables available.",
        eventType: "TICKETED_EVENT" as const,
        price: 7500, // $75
        capacity: 300,
        categories: ["Set"],
        venueName: "Houston Grand Hotel Ballroom",
        city: "Houston",
        state: "TX",
        zipCode: "77001",
      },
      {
        name: "Memphis Blues & Steppers Night",
        description:
          "Live blues band, stepping all night! Special guest DJ from Chicago. Soul food buffet included with admission.",
        eventType: "TICKETED_EVENT" as const,
        price: 3500, // $35
        capacity: 400,
        categories: ["Set"],
        venueName: "Beale Street Music Hall",
        city: "Memphis",
        state: "TN",
        zipCode: "38103",
      },
      {
        name: "Miami Beach Steppers Festival",
        description:
          "3-day beach festival! Daytime poolside sessions, evening ballroom socials. Workshops with master instructors.",
        eventType: "TICKETED_EVENT" as const,
        price: 12500, // $125 (3-day pass)
        capacity: 600,
        categories: ["Weekend Event", "Workshop"],
        venueName: "Ocean View Resort & Spa",
        city: "Miami Beach",
        state: "FL",
        zipCode: "33139",
      },
      // FREE EVENTS (2)
      {
        name: "Beginner Steppers Workshop - Free Class",
        description:
          "Learn the basics of Chicago stepping! Free introductory class for beginners. No partner required. All ages welcome.",
        eventType: "FREE_EVENT" as const,
        price: 0,
        capacity: 100,
        categories: ["Workshop"],
        venueName: "Community Center Downtown",
        city: "Chicago",
        state: "IL",
        zipCode: "60602",
      },
      {
        name: "Steppers in the Park - Summer Series",
        description:
          "Free outdoor steppers social every Sunday! Bring your own refreshments. DJ playing classic steppers tracks. Family friendly.",
        eventType: "FREE_EVENT" as const,
        price: 0,
        capacity: 200,
        categories: ["Outdoors Steppin"],
        venueName: "Grant Park Pavilion",
        city: "Chicago",
        state: "IL",
        zipCode: "60605",
      },
      // SAVE THE DATE (2)
      {
        name: "New Year's Eve Steppers Ball 2026",
        description:
          "Save the date! Ring in 2026 with the biggest steppers event of the year. Details and tickets coming soon. Early bird list signup available.",
        eventType: "SAVE_THE_DATE" as const,
        price: 0,
        capacity: 1000,
        categories: ["Save the Date", "Holiday Event"],
        venueName: "To Be Announced",
        city: "Chicago",
        state: "IL",
        zipCode: "60601",
      },
      {
        name: "Annual Steppers Convention 2026",
        description:
          "Save the date for the 15th Annual National Steppers Convention! 5 days of workshops, competitions, and socials. Hotel block details coming soon.",
        eventType: "SAVE_THE_DATE" as const,
        price: 0,
        capacity: 2000,
        categories: ["Save the Date", "Weekend Event", "Workshop"],
        venueName: "Las Vegas Convention Center",
        city: "Las Vegas",
        state: "NV",
        zipCode: "89109",
      },
    ];

    for (let i = 0; i < Math.min(numEvents, eventDetails.length); i++) {
      const event = eventDetails[i];
      // Vary dates: some soon, some far out
      const daysOut = event.eventType === "SAVE_THE_DATE" ? 365 + i * 30 : 30 + i * 10;
      const futureDate = Date.now() + daysOut * 24 * 60 * 60 * 1000;
      const endDate = futureDate + 5 * 60 * 60 * 1000; // 5 hours later

      const eventId = await ctx.db.insert("events", {
        organizerId: organizer._id,
        organizerName: organizer.name || organizer.email,
        name: event.name,
        description: event.description,
        eventType: event.eventType,
        categories: event.categories,

        // Dates
        startDate: futureDate,
        endDate: endDate,
        timezone: "America/Chicago",
        eventDateLiteral: new Date(futureDate).toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          timeZone: "America/Chicago",
        }),
        eventTimeLiteral:
          event.eventType === "SAVE_THE_DATE" ? "Time TBA" : "8:00 PM - 1:00 AM",
        eventTimezone: "America/Chicago",

        // Location
        location: {
          venueName: event.venueName,
          address: `${100 + i * 10} Main Street`,
          city: event.city,
          state: event.state,
          zipCode: event.zipCode,
          country: "US",
        },

        // Capacity
        capacity: event.capacity,

        // Door price for FREE events
        doorPrice: event.eventType === "FREE_EVENT" ? "FREE" : undefined,

        // DRAFT status - organizer will publish after setup
        status: "DRAFT",

        // Settings
        paymentModelSelected: false,
        ticketsVisible: event.eventType === "TICKETED_EVENT",
        allowWaitlist: true,
        allowTransfers: event.eventType === "TICKETED_EVENT",
        maxTicketsPerOrder: event.eventType === "TICKETED_EVENT" ? 10 : 1,
        minTicketsPerOrder: 1,
        socialShareCount: 0,

        // Timestamps
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      eventIds.push(eventId);
    }

    // 3. Grant 1000 FREE credits for first event (if this is their first event)
    const existingCredits = await ctx.db
      .query("organizerCredits")
      .withIndex("by_organizer", (q) => q.eq("organizerId", organizer._id))
      .first();

    let creditsGranted = false;
    if (!existingCredits) {
      await ctx.db.insert("organizerCredits", {
        organizerId: organizer._id,
        creditsTotal: 1000,
        creditsUsed: 0,
        creditsRemaining: 1000,
        firstEventFreeUsed: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      creditsGranted = true;
    }

    return {
      success: true,
      organizer: {
        id: organizer._id,
        email: organizer.email,
        name: organizer.name,
      },
      events: eventIds,
      creditsGranted,
      freeCredits: creditsGranted ? 1000 : 0,
      message: `Created ${eventIds.length} events for organizer ${organizer.email}`,
      nextSteps: [
        "Events created in DRAFT status",
        creditsGranted ? "✅ Granted 1000 FREE credits for first event" : "Credits already exist",
        "To publish events, set status to PUBLISHED",
        "Events do NOT require payment to create or publish",
        "Payment setup is optional for ticketed events",
      ],
    };
  },
});

/**
 * Publish an event (change status from DRAFT to PUBLISHED)
 */
export const publishEvent = mutation({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId);

    if (!event) {
      throw new Error("Event not found");
    }

    // Update status to PUBLISHED
    await ctx.db.patch(args.eventId, {
      status: "PUBLISHED",
      updatedAt: Date.now(),
    });

    return {
      success: true,
      eventId: args.eventId,
      message: "Event published successfully",
      eventUrl: `/events/${args.eventId}`,
    };
  },
});

/**
 * Publish all DRAFT events for an organizer
 */
export const publishAllOrganizerEvents = mutation({
  args: {
    organizerEmail: v.string(),
  },
  handler: async (ctx, args) => {
    // Find organizer
    const organizer = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.organizerEmail))
      .first();

    if (!organizer) {
      throw new Error("Organizer not found");
    }

    // Find all DRAFT events
    const draftEvents = await ctx.db
      .query("events")
      .withIndex("by_organizer", (q) => q.eq("organizerId", organizer._id))
      .filter((q) => q.eq(q.field("status"), "DRAFT"))
      .collect();

    // Publish all
    const publishedIds = [];
    for (const event of draftEvents) {
      await ctx.db.patch(event._id, {
        status: "PUBLISHED",
        updatedAt: Date.now(),
      });
      publishedIds.push(event._id);
    }

    return {
      success: true,
      publishedCount: publishedIds.length,
      events: publishedIds,
      message: `Published ${publishedIds.length} events`,
      verifyAt: "http://localhost:3004/events",
    };
  },
});

/**
 * Delete all test organizer events
 */
export const deleteOrganizerTestEvents = mutation({
  args: {
    organizerEmail: v.string(),
  },
  handler: async (ctx, args) => {
    // Find organizer
    const organizer = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.organizerEmail))
      .first();

    if (!organizer) {
      return { success: true, deletedCount: 0, message: "Organizer not found" };
    }

    // Delete all events
    const events = await ctx.db
      .query("events")
      .withIndex("by_organizer", (q) => q.eq("organizerId", organizer._id))
      .collect();

    for (const event of events) {
      await ctx.db.delete(event._id);
    }

    // Delete credits
    const credits = await ctx.db
      .query("organizerCredits")
      .withIndex("by_organizer", (q) => q.eq("organizerId", organizer._id))
      .first();

    if (credits) {
      await ctx.db.delete(credits._id);
    }

    return {
      success: true,
      deletedCount: events.length,
      message: `Deleted ${events.length} events and credits for ${args.organizerEmail}`,
    };
  },
});
