/**
 * Add placeholder images to test events
 */

import { mutation } from "../_generated/server";

export const addImagesToEvents = mutation({
  handler: async (ctx) => {
    const events = await ctx.db.query("events").collect();

    const results = [];

    for (const event of events) {
      await ctx.db.patch(event._id, {
        imageUrl: `https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop`,
      });

      results.push({
        eventId: event._id,
        eventName: event.name,
        imageAdded: true,
      });
    }

    return {
      success: true,
      message: `Added images to ${results.length} events`,
      results,
    };
  },
});
