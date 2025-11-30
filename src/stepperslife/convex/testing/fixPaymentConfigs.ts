/**
 * Fix Missing Payment Configs
 * Creates payment configs for all published events that don't have one
 * This is required for ticket selection to be visible on event pages
 */

import { mutation } from "../_generated/server";

export const fixMissingPaymentConfigs = mutation({
  handler: async (ctx) => {
    const now = Date.now();

    // Get all published events
    const events = await ctx.db
      .query("events")
      .filter((q) => q.eq(q.field("status"), "PUBLISHED"))
      .collect();

    let created = 0;
    let skipped = 0;
    let updated = 0;
    const details: any[] = [];

    for (const event of events) {
      // Check if payment config already exists
      const existingConfig = await ctx.db
        .query("eventPaymentConfig")
        .withIndex("by_event", (q) => q.eq("eventId", event._id))
        .first();

      if (existingConfig) {
        // If config exists but is not active, activate it
        if (!existingConfig.isActive) {
          await ctx.db.patch(existingConfig._id, {
            isActive: true,
            activatedAt: now,
            updatedAt: now,
          });
          updated++;
          details.push({
            event: event.name,
            action: "activated",
            eventId: event._id,
          });
        } else {
          skipped++;
        }
        continue;
      }

      // Create payment config for this event
      const configId = await ctx.db.insert("eventPaymentConfig", {
        eventId: event._id,
        organizerId: event.organizerId!,
        paymentModel: "CREDIT_CARD",
        customerPaymentMethods: ["STRIPE", "CASH"],
        isActive: true,
        activatedAt: now,
        platformFeePercent: 3.7,
        platformFeeFixed: 179, // $1.79 in cents
        processingFeePercent: 2.9,
        charityDiscount: false,
        lowPriceDiscount: false,
        createdAt: now,
        updatedAt: now,
      });

      // Also ensure event has ticketsVisible set to true
      if (!event.ticketsVisible) {
        await ctx.db.patch(event._id, {
          ticketsVisible: true,
          paymentModelSelected: true,
          updatedAt: now,
        });
      }

      created++;
      details.push({
        event: event.name,
        action: "created",
        eventId: event._id,
        configId: configId,
      });
    }

    return {
      success: true,
      message: `Fixed payment configs: ${created} created, ${updated} activated, ${skipped} already configured`,
      summary: {
        totalEvents: events.length,
        created,
        activated: updated,
        skipped,
      },
      details,
      note: "Tickets should now be visible on all published events. Refresh the event page to see changes.",
    };
  },
});

/**
 * Check which events are missing payment configs
 */
export const checkPaymentConfigs = mutation({
  handler: async (ctx) => {
    const events = await ctx.db
      .query("events")
      .filter((q) => q.eq(q.field("status"), "PUBLISHED"))
      .collect();

    const results: any[] = [];

    for (const event of events) {
      const config = await ctx.db
        .query("eventPaymentConfig")
        .withIndex("by_event", (q) => q.eq("eventId", event._id))
        .first();

      const tiers = await ctx.db
        .query("ticketTiers")
        .withIndex("by_event", (q) => q.eq("eventId", event._id))
        .filter((q) => q.eq(q.field("isActive"), true))
        .collect();

      results.push({
        eventId: event._id,
        name: event.name,
        eventType: event.eventType,
        ticketsVisible: event.ticketsVisible,
        paymentModelSelected: event.paymentModelSelected,
        hasPaymentConfig: !!config,
        paymentConfigActive: config?.isActive ?? false,
        ticketTiersCount: tiers.length,
        willShowTickets:
          event.eventType === "TICKETED_EVENT" &&
          event.ticketsVisible === true &&
          !!config?.isActive &&
          tiers.length > 0,
      });
    }

    const problematic = results.filter(r => !r.willShowTickets);

    return {
      totalEvents: events.length,
      eventsWithTicketsVisible: results.filter(r => r.willShowTickets).length,
      eventsWithIssues: problematic.length,
      issues: problematic,
      allEvents: results,
    };
  },
});
