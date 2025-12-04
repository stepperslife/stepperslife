/**
 * Create FREE discount code for testing
 * This creates a 100% discount code that can be used for testing checkout flow
 */

import { v } from "convex/values";
import { mutation } from "../_generated/server";

export const createFreeDiscountCode = mutation({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    // Get the event
    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    // Check if FREE code already exists for this event
    const existingCode = await ctx.db
      .query("discountCodes")
      .withIndex("by_code", (q) => q.eq("code", "FREE"))
      .filter((q) => q.eq(q.field("eventId"), args.eventId))
      .first();

    if (existingCode) {
      return {
        success: true,
        message: "FREE discount code already exists",
        discountCodeId: existingCode._id,
        code: "FREE",
      };
    }

    const now = Date.now();

    // Validate organizerId is present
    if (!event.organizerId) {
      throw new Error("Event does not have an organizer");
    }

    // Create FREE discount code (100% off, unlimited uses)
    const discountCodeId = await ctx.db.insert("discountCodes", {
      code: "FREE",
      eventId: args.eventId,
      organizerId: event.organizerId,
      discountType: "PERCENTAGE",
      discountValue: 100, // 100% off
      maxUses: undefined, // Unlimited uses
      usedCount: 0,
      maxUsesPerUser: undefined, // Unlimited per user
      validFrom: undefined, // Valid immediately
      validUntil: undefined, // Never expires
      minPurchaseAmount: undefined, // No minimum
      applicableToTierIds: undefined, // Applies to all tiers
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    return {
      success: true,
      message: "FREE discount code created successfully",
      discountCodeId,
      code: "FREE",
      details: {
        discountType: "PERCENTAGE",
        discountValue: 100,
        description: "100% off - Unlimited uses - No expiration",
      },
    };
  },
});

/**
 * Create FREE discount code for all test events
 */
export const createFreeCodeForAllTestEvents = mutation({
  handler: async (ctx) => {
    // Find all test events (events with "TEST" in the name)
    const allEvents = await ctx.db.query("events").collect();
    const testEvents = allEvents.filter(
      (event) => event.name.includes("TEST") || event.name.includes("Test")
    );

    const results = [];

    for (const event of testEvents) {
      // Check if FREE code already exists
      const existingCode = await ctx.db
        .query("discountCodes")
        .withIndex("by_code", (q) => q.eq("code", "FREE"))
        .filter((q) => q.eq(q.field("eventId"), event._id))
        .first();

      if (existingCode) {
        results.push({
          eventId: event._id,
          eventName: event.name,
          status: "already_exists",
          discountCodeId: existingCode._id,
        });
        continue;
      }

      const now = Date.now();

      // Validate organizerId is present
      if (!event.organizerId) {
        results.push({
          eventId: event._id,
          eventName: event.name,
          status: "error" as const,
          discountCodeId: undefined,
          error: "Event does not have an organizer",
        });
        continue;
      }

      // Create FREE code
      const discountCodeId = await ctx.db.insert("discountCodes", {
        code: "FREE",
        eventId: event._id,
        organizerId: event.organizerId,
        discountType: "PERCENTAGE",
        discountValue: 100,
        maxUses: undefined,
        usedCount: 0,
        maxUsesPerUser: undefined,
        validFrom: undefined,
        validUntil: undefined,
        minPurchaseAmount: undefined,
        applicableToTierIds: undefined,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });

      results.push({
        eventId: event._id,
        eventName: event.name,
        status: "created",
        discountCodeId,
      });
    }

    return {
      success: true,
      totalTestEvents: testEvents.length,
      results,
    };
  },
});
