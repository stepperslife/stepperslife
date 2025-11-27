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
      // Check if payment config already exists
      const existingConfig = await ctx.db
        .query("paymentConfigs")
        .filter((q) => q.eq(q.field("eventId"), event._id))
        .first();

      if (!existingConfig) {
        // Create payment config
        const paymentConfigId = await ctx.db.insert("paymentConfigs", {
          eventId: event._id,
          model: "CREDIT_CARD",
          platformFeePercent: 0,
          platformFeeFixed: 0,
          stripeFeePercent: 0,
          stripeFeeFixed: 0,
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
