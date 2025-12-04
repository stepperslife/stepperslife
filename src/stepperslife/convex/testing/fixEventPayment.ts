/**
 * Fix Event Payment Configurations
 * Adds payment configs to all test events
 */

import { mutation } from "../_generated/server";

export const addPaymentConfigsToAllEvents = mutation({
  handler: async (ctx) => {
    // Get all events
    const events = await ctx.db.query("events").collect();

    const results = [];

    for (const event of events) {
      // Skip events without organizerId
      if (!event.organizerId) continue;

      // Check if payment config already exists
      const existingConfig = await ctx.db
        .query("eventPaymentConfig")
        .withIndex("by_event", (q) => q.eq("eventId", event._id))
        .first();

      if (!existingConfig) {
        // Create payment config
        const paymentConfigId = await ctx.db.insert("eventPaymentConfig", {
          eventId: event._id,
          organizerId: event.organizerId,
          paymentModel: "CREDIT_CARD",
          customerPaymentMethods: ["STRIPE"],
          platformFeePercent: 0,
          platformFeeFixed: 0,
          processingFeePercent: 0,
          charityDiscount: false,
          lowPriceDiscount: false,
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });

        results.push({
          eventId: event._id,
          eventName: event.name,
          paymentConfigId: paymentConfigId,
          status: "created"
        });
      } else {
        results.push({
          eventId: event._id,
          eventName: event.name,
          paymentConfigId: existingConfig._id,
          status: "already_exists"
        });
      }
    }

    return {
      success: true,
      message: `Processed ${results.length} events`,
      results
    };
  },
});
