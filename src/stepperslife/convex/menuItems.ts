import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Get menu categories for restaurant
export const getCategories = query({
  args: { restaurantId: v.id("restaurants") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("menuCategories")
      .withIndex("by_restaurant", (q) => q.eq("restaurantId", args.restaurantId))
      .collect();
  },
});

// Get menu items for restaurant
export const getByRestaurant = query({
  args: { restaurantId: v.id("restaurants") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("menuItems")
      .withIndex("by_restaurant", (q) => q.eq("restaurantId", args.restaurantId))
      .collect();
  },
});

// Get menu items by category
export const getByCategory = query({
  args: { categoryId: v.id("menuCategories") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("menuItems")
      .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId))
      .collect();
  },
});

// Create menu category
export const createCategory = mutation({
  args: {
    restaurantId: v.id("restaurants"),
    name: v.string(),
    description: v.optional(v.string()),
    sortOrder: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("menuCategories", {
      ...args,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Create menu item
export const create = mutation({
  args: {
    restaurantId: v.id("restaurants"),
    categoryId: v.optional(v.id("menuCategories")),
    name: v.string(),
    description: v.optional(v.string()),
    price: v.number(),
    imageUrl: v.optional(v.string()),
    sortOrder: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("menuItems", {
      ...args,
      isAvailable: true,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Update menu item
export const update = mutation({
  args: {
    id: v.id("menuItems"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    imageUrl: v.optional(v.string()),
    categoryId: v.optional(v.id("menuCategories")),
    isAvailable: v.optional(v.boolean()),
    sortOrder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    return await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// Toggle item availability
export const toggleAvailability = mutation({
  args: { id: v.id("menuItems") },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.id);
    if (!item) throw new Error("Menu item not found");
    
    return await ctx.db.patch(args.id, {
      isAvailable: !item.isAvailable,
      updatedAt: Date.now(),
    });
  },
});

// Delete menu item
export const remove = mutation({
  args: { id: v.id("menuItems") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
});
