/**
 * Create a test event for verifying events display on /events page
 * This is a development-only mutation for manual testing
 */

import { v } from "convex/values";
import { mutation } from "../_generated/server";

export const createTestPublishedEvent = mutation({
  args: {
    organizerEmail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Find or create organizer
    let organizer = await ctx.db
      .query("users")
      .withIndex("by_email", (q) =>
        q.eq("email", args.organizerEmail || "test-organizer@stepperslife.com")
      )
      .first();

    if (!organizer) {
      // Create test organizer
      const organizerId = await ctx.db.insert("users", {
        name: "Test Organizer",
        email: args.organizerEmail || "test-organizer@stepperslife.com",
        role: "organizer",
        // @ts-ignore - passwordHash type issue in schema
        passwordHash: "$2a$10$abc123", // Dummy hash for testing
        authProvider: "password",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      organizer = { _id: organizerId };
    }

    // Create test event with PUBLISHED status
    const futureDate = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days from now
    const endDate = futureDate + 4 * 60 * 60 * 1000; // 4 hours later

    const eventId = await ctx.db.insert("events", {
      name: `Test Event - ${new Date().toLocaleString()}`,
      description:
        "This is a test event created to verify the /events page display. It should appear on the events page with all required fields properly configured.",
      eventType: "TICKETED_EVENT",
      status: "PUBLISHED", // CRITICAL - must be PUBLISHED to show on /events page
      organizerId: organizer._id,
      organizerName: "Test Organizer",

      // Future dates (required for display by default)
      startDate: futureDate,
      endDate: endDate,
      timezone: "America/Chicago",

      // Literal date/time
      eventDateLiteral: new Date(futureDate).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "America/Chicago",
      }),
      eventTimeLiteral: "8:00 PM - 12:00 AM",
      eventTimezone: "America/Chicago",

      // Location (object format - required for proper display)
      location: {
        venueName: "Test Venue",
        address: "123 Test Street",
        city: "Chicago",
        state: "IL",
        zipCode: "60601",
        country: "US",
      },

      // Categories
      categories: ["Testing", "Music", "Social"],

      // Visibility
      ticketsVisible: true,

      // Image (optional)
      imageUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30",

      // Timestamps
      createdAt: Date.now(),
      updatedAt: Date.now(),

      // Social
      socialShareCount: 0,
    });

    return {
      success: true,
      eventId,
      message: "Test event created successfully with PUBLISHED status",
      eventUrl: `/events/${eventId}`,
      verifyAt: "http://localhost:3004/events",
    };
  },
});

/**
 * Delete all test events (cleanup)
 */
export const deleteAllTestEvents = mutation({
  args: {},
  handler: async (ctx) => {
    const testEvents = await ctx.db
      .query("events")
      .filter((q) => q.or(q.eq(q.field("name"), "Test Event"), q.like("name", "Test Event - %")))
      .collect();

    for (const event of testEvents) {
      await ctx.db.delete(event._id);
    }

    return {
      success: true,
      deletedCount: testEvents.length,
      message: `Deleted ${testEvents.length} test events`,
    };
  },
});
