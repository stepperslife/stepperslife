import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Get all active restaurants
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("restaurants")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();
  },
});

// Get restaurant by slug
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("restaurants")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
  },
});

// Get restaurants by owner
export const getByOwner = query({
  args: { ownerId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("restaurants")
      .withIndex("by_owner", (q) => q.eq("ownerId", args.ownerId))
      .collect();
  },
});

// Create restaurant
export const create = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    ownerId: v.id("users"),
    address: v.string(),
    city: v.string(),
    state: v.string(),
    zipCode: v.string(),
    phone: v.string(),
    cuisine: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("restaurants", {
      ...args,
      logoUrl: undefined,
      coverImageUrl: undefined,
      operatingHours: undefined,
      acceptingOrders: false,
      estimatedPickupTime: 30,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Update restaurant
export const update = mutation({
  args: {
    id: v.id("restaurants"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    zipCode: v.optional(v.string()),
    phone: v.optional(v.string()),
    cuisine: v.optional(v.array(v.string())),
    logoUrl: v.optional(v.string()),
    coverImageUrl: v.optional(v.string()),
    operatingHours: v.optional(v.any()),
    acceptingOrders: v.optional(v.boolean()),
    estimatedPickupTime: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    return await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// Toggle accepting orders
export const toggleAcceptingOrders = mutation({
  args: { id: v.id("restaurants") },
  handler: async (ctx, args) => {
    const restaurant = await ctx.db.get(args.id);
    if (!restaurant) throw new Error("Restaurant not found");

    return await ctx.db.patch(args.id, {
      acceptingOrders: !restaurant.acceptingOrders,
      updatedAt: Date.now(),
    });
  },
});

// Apply to become a restaurant partner (creates pending restaurant)
export const apply = mutation({
  args: {
    ownerId: v.id("users"),
    name: v.string(),
    description: v.optional(v.string()),
    address: v.string(),
    city: v.string(),
    state: v.string(),
    zipCode: v.string(),
    phone: v.string(),
    cuisine: v.array(v.string()),
    contactName: v.string(),
    contactEmail: v.string(),
    website: v.optional(v.string()),
    hoursOfOperation: v.optional(v.string()),
    estimatedPickupTime: v.optional(v.number()),
    additionalNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Generate slug from name
    const baseSlug = args.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Check for existing slug and make unique if needed
    let slug = baseSlug;
    let counter = 1;
    while (true) {
      const existing = await ctx.db
        .query("restaurants")
        .withIndex("by_slug", (q) => q.eq("slug", slug))
        .first();
      if (!existing) break;
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return await ctx.db.insert("restaurants", {
      name: args.name,
      slug,
      description: args.description,
      ownerId: args.ownerId,
      address: args.address,
      city: args.city,
      state: args.state,
      zipCode: args.zipCode,
      phone: args.phone,
      cuisine: args.cuisine,
      logoUrl: undefined,
      coverImageUrl: undefined,
      operatingHours: args.hoursOfOperation,
      acceptingOrders: false,
      estimatedPickupTime: args.estimatedPickupTime || 30,
      isActive: false, // Pending approval
      createdAt: now,
      updatedAt: now,
    });
  },
});
