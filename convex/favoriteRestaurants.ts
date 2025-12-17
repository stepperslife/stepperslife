import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Get user's favorite restaurants
export const getByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const favorites = await ctx.db
      .query("favoriteRestaurants")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    // Get restaurant details for each favorite
    const favoritesWithRestaurants = await Promise.all(
      favorites.map(async (favorite) => {
        const restaurant = await ctx.db.get(favorite.restaurantId);
        return {
          ...favorite,
          restaurant,
        };
      })
    );

    // Filter out any null restaurants (deleted)
    return favoritesWithRestaurants.filter((f) => f.restaurant !== null);
  },
});

// Check if a restaurant is favorited by user
export const isFavorited = query({
  args: {
    userId: v.id("users"),
    restaurantId: v.id("restaurants"),
  },
  handler: async (ctx, args) => {
    const favorite = await ctx.db
      .query("favoriteRestaurants")
      .withIndex("by_user_restaurant", (q) =>
        q.eq("userId", args.userId).eq("restaurantId", args.restaurantId)
      )
      .first();

    return !!favorite;
  },
});

// Toggle favorite status
export const toggle = mutation({
  args: {
    userId: v.id("users"),
    restaurantId: v.id("restaurants"),
  },
  handler: async (ctx, args) => {
    // Check if already favorited
    const existing = await ctx.db
      .query("favoriteRestaurants")
      .withIndex("by_user_restaurant", (q) =>
        q.eq("userId", args.userId).eq("restaurantId", args.restaurantId)
      )
      .first();

    if (existing) {
      // Remove from favorites
      await ctx.db.delete(existing._id);
      return { action: "removed", isFavorited: false };
    } else {
      // Add to favorites
      await ctx.db.insert("favoriteRestaurants", {
        userId: args.userId,
        restaurantId: args.restaurantId,
        createdAt: Date.now(),
      });
      return { action: "added", isFavorited: true };
    }
  },
});

// Add to favorites
export const add = mutation({
  args: {
    userId: v.id("users"),
    restaurantId: v.id("restaurants"),
  },
  handler: async (ctx, args) => {
    // Check if already favorited
    const existing = await ctx.db
      .query("favoriteRestaurants")
      .withIndex("by_user_restaurant", (q) =>
        q.eq("userId", args.userId).eq("restaurantId", args.restaurantId)
      )
      .first();

    if (existing) {
      return existing._id;
    }

    return await ctx.db.insert("favoriteRestaurants", {
      userId: args.userId,
      restaurantId: args.restaurantId,
      createdAt: Date.now(),
    });
  },
});

// Remove from favorites
export const remove = mutation({
  args: {
    userId: v.id("users"),
    restaurantId: v.id("restaurants"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("favoriteRestaurants")
      .withIndex("by_user_restaurant", (q) =>
        q.eq("userId", args.userId).eq("restaurantId", args.restaurantId)
      )
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
      return true;
    }
    return false;
  },
});

// Get count of favorites for a restaurant
export const getRestaurantFavoriteCount = query({
  args: { restaurantId: v.id("restaurants") },
  handler: async (ctx, args) => {
    const favorites = await ctx.db
      .query("favoriteRestaurants")
      .withIndex("by_restaurant", (q) => q.eq("restaurantId", args.restaurantId))
      .collect();

    return favorites.length;
  },
});
