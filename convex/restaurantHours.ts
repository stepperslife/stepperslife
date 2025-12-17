import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Get operating hours for a restaurant
export const getHours = query({
  args: { restaurantId: v.id("restaurants") },
  handler: async (ctx, args) => {
    const restaurant = await ctx.db.get(args.restaurantId);
    return restaurant?.operatingHours || null;
  },
});

// Update operating hours
export const updateHours = mutation({
  args: {
    restaurantId: v.id("restaurants"),
    operatingHours: v.object({
      monday: v.optional(v.object({ open: v.string(), close: v.string(), closed: v.boolean() })),
      tuesday: v.optional(v.object({ open: v.string(), close: v.string(), closed: v.boolean() })),
      wednesday: v.optional(v.object({ open: v.string(), close: v.string(), closed: v.boolean() })),
      thursday: v.optional(v.object({ open: v.string(), close: v.string(), closed: v.boolean() })),
      friday: v.optional(v.object({ open: v.string(), close: v.string(), closed: v.boolean() })),
      saturday: v.optional(v.object({ open: v.string(), close: v.string(), closed: v.boolean() })),
      sunday: v.optional(v.object({ open: v.string(), close: v.string(), closed: v.boolean() })),
    }),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.restaurantId, {
      operatingHours: args.operatingHours,
      updatedAt: Date.now(),
    });
  },
});

// Toggle accepting orders status
export const toggleAcceptingOrders = mutation({
  args: { restaurantId: v.id("restaurants") },
  handler: async (ctx, args) => {
    const restaurant = await ctx.db.get(args.restaurantId);
    if (!restaurant) throw new Error("Restaurant not found");

    return await ctx.db.patch(args.restaurantId, {
      acceptingOrders: !restaurant.acceptingOrders,
      updatedAt: Date.now(),
    });
  },
});

// Check if restaurant is currently open based on hours
export const isCurrentlyOpen = query({
  args: { restaurantId: v.id("restaurants") },
  handler: async (ctx, args) => {
    const restaurant = await ctx.db.get(args.restaurantId);
    if (!restaurant) return false;

    // If not accepting orders, closed
    if (!restaurant.acceptingOrders) return false;

    // If no operating hours set, assume open if accepting orders
    if (!restaurant.operatingHours) return true;

    const now = new Date();
    const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    const todayKey = days[now.getDay()] as keyof typeof restaurant.operatingHours;

    const todayHours = restaurant.operatingHours[todayKey];
    if (!todayHours || todayHours.closed) return false;

    const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

    return currentTime >= todayHours.open && currentTime <= todayHours.close;
  },
});
