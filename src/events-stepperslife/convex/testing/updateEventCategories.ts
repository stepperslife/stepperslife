/**
 * Update existing events with correct category names
 */

import { mutation } from "../_generated/server";

export const updateAllEventCategories = mutation({
  args: {},
  handler: async (ctx) => {
    // Define the correct categories for each event by name
    const categoryUpdates: Record<string, string[]> = {
      "Chicago Steppers Social - Summer Kickoff": ["Set"],
      "Detroit Steppers Weekend": ["Weekend Event", "Workshop"],
      "Atlanta Steppers Extravaganza": ["Set"],
      "Houston Steppers Gala": ["Set"],
      "Memphis Blues & Steppers Night": ["Set"],
      "Miami Beach Steppers Festival": ["Weekend Event", "Workshop"],
      "Beginner Steppers Workshop - Free Class": ["Workshop"],
      "Steppers in the Park - Summer Series": ["Outdoors Steppin"],
      "New Year's Eve Steppers Ball 2026": ["Save the Date", "Holiday Event"],
      "Annual Steppers Convention 2026": ["Save the Date", "Weekend Event", "Workshop"],
    };

    // Get all events
    const allEvents = await ctx.db.query("events").collect();

    const updated = [];
    for (const event of allEvents) {
      const newCategories = categoryUpdates[event.name];
      if (newCategories) {
        await ctx.db.patch(event._id, {
          categories: newCategories,
          updatedAt: Date.now(),
        });
        updated.push({
          name: event.name,
          oldCategories: event.categories,
          newCategories: newCategories,
        });
      }
    }

    return {
      success: true,
      updated: updated.length,
      details: updated,
      message: `Updated ${updated.length} events with correct categories`,
    };
  },
});
