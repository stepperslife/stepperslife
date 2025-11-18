/**
 * Debug helper to check events in database
 */

import { v } from "convex/values";
import { query } from "../_generated/server";

export const getAllEvents = query({
  args: {},
  handler: async (ctx) => {
    const allEvents = await ctx.db.query("events").collect();

    return {
      total: allEvents.length,
      events: allEvents.map((e) => ({
        id: e._id,
        name: e.name,
        status: e.status,
        eventType: e.eventType,
        startDate: e.startDate,
        location: e.location,
        organizerId: e.organizerId,
        createdAt: e.createdAt,
      })),
    };
  },
});

export const getPublishedEventsDebug = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    // Get all published events
    const publishedEvents = await ctx.db
      .query("events")
      .withIndex("by_status", (q) => q.eq("status", "PUBLISHED"))
      .collect();

    // Filter by date
    const futureEvents = publishedEvents.filter((e) => {
      const eventDate = e.endDate || e.startDate;
      return eventDate && eventDate >= now;
    });

    return {
      totalPublished: publishedEvents.length,
      futurePublished: futureEvents.length,
      now: now,
      events: futureEvents.map((e) => ({
        id: e._id,
        name: e.name,
        startDate: e.startDate,
        endDate: e.endDate,
        daysFromNow: e.startDate ? Math.floor((e.startDate - now) / (1000 * 60 * 60 * 24)) : null,
        location: e.location,
        categories: e.categories,
        hasCategories: !!e.categories && e.categories.length > 0,
      })),
    };
  },
});
