import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import {
  validatePrice,
  validateRequiredString,
  validateSortOrder,
} from "./lib/validation";

// Helper to verify restaurant ownership
async function verifyRestaurantOwnership(
  ctx: { db: any; auth: any },
  restaurantId: Id<"restaurants">
): Promise<boolean> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return false;

  // Get user by email from identity
  const user = await ctx.db
    .query("users")
    .withIndex("by_email", (q: any) => q.eq("email", identity.email))
    .first();

  if (!user) return false;

  // Get restaurant and check ownership
  const restaurant = await ctx.db.get(restaurantId);
  if (!restaurant) return false;

  return restaurant.ownerId === user._id;
}

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
    // Validate inputs
    validateRequiredString(args.name, "Category name", { maxLength: 100 });
    validateSortOrder(args.sortOrder, "Sort order");

    if (args.description) {
      validateRequiredString(args.description, "Description", { minLength: 0, maxLength: 500 });
    }

    // Verify ownership
    const isOwner = await verifyRestaurantOwnership(ctx, args.restaurantId);
    if (!isOwner) {
      throw new Error("Unauthorized: You do not own this restaurant");
    }

    const now = Date.now();
    return await ctx.db.insert("menuCategories", {
      ...args,
      name: args.name.trim(),
      description: args.description?.trim(),
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
    // Validate inputs
    validateRequiredString(args.name, "Menu item name", { maxLength: 200 });
    validatePrice(args.price, "Menu item price");
    validateSortOrder(args.sortOrder, "Sort order");

    if (args.description) {
      validateRequiredString(args.description, "Description", { minLength: 0, maxLength: 1000 });
    }

    // Verify ownership
    const isOwner = await verifyRestaurantOwnership(ctx, args.restaurantId);
    if (!isOwner) {
      throw new Error("Unauthorized: You do not own this restaurant");
    }

    const now = Date.now();
    return await ctx.db.insert("menuItems", {
      ...args,
      name: args.name.trim(),
      description: args.description?.trim(),
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
    // Validate inputs if provided
    if (args.name !== undefined) {
      validateRequiredString(args.name, "Menu item name", { maxLength: 200 });
    }
    if (args.price !== undefined) {
      validatePrice(args.price, "Menu item price");
    }
    if (args.sortOrder !== undefined) {
      validateSortOrder(args.sortOrder, "Sort order");
    }
    if (args.description !== undefined && args.description !== null) {
      validateRequiredString(args.description, "Description", { minLength: 0, maxLength: 1000 });
    }

    // Get the menu item to check restaurant ownership
    const menuItem = await ctx.db.get(args.id);
    if (!menuItem) {
      throw new Error("Menu item not found");
    }

    // Verify ownership
    const isOwner = await verifyRestaurantOwnership(ctx, menuItem.restaurantId);
    if (!isOwner) {
      throw new Error("Unauthorized: You do not own this restaurant");
    }

    const { id, ...updates } = args;
    return await ctx.db.patch(id, {
      ...updates,
      name: args.name?.trim(),
      description: args.description?.trim(),
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

    // Verify ownership
    const isOwner = await verifyRestaurantOwnership(ctx, item.restaurantId);
    if (!isOwner) {
      throw new Error("Unauthorized: You do not own this restaurant");
    }

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
    const item = await ctx.db.get(args.id);
    if (!item) throw new Error("Menu item not found");

    // Verify ownership
    const isOwner = await verifyRestaurantOwnership(ctx, item.restaurantId);
    if (!isOwner) {
      throw new Error("Unauthorized: You do not own this restaurant");
    }

    return await ctx.db.delete(args.id);
  },
});

// Update menu category
export const updateCategory = mutation({
  args: {
    id: v.id("menuCategories"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    sortOrder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Get the category to check restaurant ownership
    const category = await ctx.db.get(args.id);
    if (!category) {
      throw new Error("Category not found");
    }

    // Verify ownership
    const isOwner = await verifyRestaurantOwnership(ctx, category.restaurantId);
    if (!isOwner) {
      throw new Error("Unauthorized: You do not own this restaurant");
    }

    const { id, ...updates } = args;
    return await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// Delete menu category
export const removeCategory = mutation({
  args: { id: v.id("menuCategories") },
  handler: async (ctx, args) => {
    // Get the category to check restaurant ownership
    const category = await ctx.db.get(args.id);
    if (!category) {
      throw new Error("Category not found");
    }

    // Verify ownership
    const isOwner = await verifyRestaurantOwnership(ctx, category.restaurantId);
    if (!isOwner) {
      throw new Error("Unauthorized: You do not own this restaurant");
    }

    // Check if there are any items in this category
    const itemsInCategory = await ctx.db
      .query("menuItems")
      .withIndex("by_category", (q) => q.eq("categoryId", args.id))
      .first();

    if (itemsInCategory) {
      throw new Error("Cannot delete category with items. Move or delete items first.");
    }

    return await ctx.db.delete(args.id);
  },
});

// Get restaurant owned by user
export const getRestaurantByOwner = query({
  args: { ownerId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("restaurants")
      .withIndex("by_owner", (q) => q.eq("ownerId", args.ownerId))
      .first();
  },
});

/**
 * Internal mutation to create a menu category (for admin setup)
 */
export const createCategoryInternal = internalMutation({
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
      name: args.name.trim(),
      description: args.description?.trim(),
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  },
});

/**
 * Internal mutation to create a menu item (for admin setup)
 */
export const createInternal = internalMutation({
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
      name: args.name.trim(),
      description: args.description?.trim(),
      isAvailable: true,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Internal mutation to update menu item without auth (for setup scripts)
export const updateInternal = internalMutation({
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
