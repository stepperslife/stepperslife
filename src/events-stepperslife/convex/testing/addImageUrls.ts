/**
 * Add image URLs to test events (internal mutation - no auth required)
 */

import { internalMutation } from "../_generated/server";
import { v } from "convex/values";

export const addImageToEvent = internalMutation({
  args: {
    eventId: v.id("events"),
    imageUrl: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.eventId, {
      imageUrl: args.imageUrl,
    });

    return {
      success: true,
      eventId: args.eventId,
      imageUrl: args.imageUrl,
    };
  },
});

export const addImagesToAllEvents = internalMutation({
  handler: async (ctx) => {
    const events = await ctx.db.query("events").collect();

    // Different event images
    const images = [
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop",
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=400&fit=crop",
      "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=400&fit=crop",
      "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&h=400&fit=crop",
    ];

    const results = [];

    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      const imageUrl = images[i % images.length];

      await ctx.db.patch(event._id, {
        imageUrl,
      });

      results.push({
        eventId: event._id,
        eventName: event.name,
        imageUrl,
      });
    }

    return {
      success: true,
      message: `Added images to ${results.length} events`,
      results,
    };
  },
});
