/**
 * Reset Payment Configurations
 * Deletes old configs and creates new ones with isActive field
 */

import { mutation } from "../_generated/server";

export const resetAllPaymentConfigs = mutation({
  handler: async (ctx) => {
    // Delete all existing payment configs
    const oldConfigs = await ctx.db.query("eventPaymentConfig").collect();

    for (const config of oldConfigs) {
      await ctx.db.delete(config._id);
    }

    // Get all events
    const events = await ctx.db.query("events").collect();

    const results = [];

    for (const event of events) {
      // Create payment config with isActive field
      const paymentConfigId = await ctx.db.insert("eventPaymentConfig", {
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
      });
    }

    return {
      success: true,
      message: `Reset payment configs for ${results.length} events`,
      deletedOldConfigs: oldConfigs.length,
      createdNewConfigs: results.length,
      results
    };
  },
});
