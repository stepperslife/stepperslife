/**
 * Add varied Unsplash images to test events
 */

import { mutation } from "../_generated/server";

// Verified working Unsplash image URLs for events/parties/dance
const EVENT_IMAGES = [
  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80", // Concert crowd
  "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80", // Party lights
  "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=800&q=80", // Dance floor
  "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80", // DJ booth
  "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80", // Crowd dancing
  "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80", // Festival
  "https://images.unsplash.com/photo-1504680177321-2e6a879aac86?w=800&q=80", // Stage lights
  "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&q=80", // Concert
  "https://images.unsplash.com/photo-1501281668745-f7f57925c138?w=800&q=80", // Party
  "https://images.unsplash.com/photo-1496024840928-4c417adf211d?w=800&q=80", // Dance event
  "https://images.unsplash.com/photo-1485579149621-3123dd979885?w=800&q=80", // Celebration
  "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80", // Gala
  "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&q=80", // Social event
  "https://images.unsplash.com/photo-1482575832494-771f74bf6857?w=800&q=80", // Night event
  "https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=800&q=80", // Elegant party
];

export const addImagesToEvents = mutation({
  handler: async (ctx) => {
    const events = await ctx.db.query("events").collect();

    const results = [];

    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      // Rotate through different images
      const imageUrl = EVENT_IMAGES[i % EVENT_IMAGES.length];

      await ctx.db.patch(event._id, {
        imageUrl,
      });

      results.push({
        eventId: event._id,
        eventName: event.name,
        imageUrl,
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
