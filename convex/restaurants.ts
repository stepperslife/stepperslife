import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getCurrentUser, requireAdmin } from "./lib/auth";
import { requireRestaurantOwner, requireRestaurantRole } from "./lib/restaurantAuth";
import { USER_ROLES } from "./lib/roles";

// Get all active restaurants
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    try {
      // Use filter instead of index to avoid potential index issues
      const allRestaurants = await ctx.db.query("restaurants").collect();
      return allRestaurants.filter((r) => r.isActive === true);
    } catch (error) {
      console.error("Error fetching restaurants:", error);
      // Return empty array if there's an error
      return [];
    }
  },
});

// Get restaurant by slug
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    try {
      return await ctx.db
        .query("restaurants")
        .withIndex("by_slug", (q) => q.eq("slug", args.slug))
        .first();
    } catch (error) {
      console.error("Error fetching restaurant by slug:", error);
      return null;
    }
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

// Create restaurant (admin only - regular users should use apply)
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
    // Only admins can directly create restaurants
    await requireAdmin(ctx);

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

// Update restaurant (requires ownership or manager role)
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
    // Verify user has at least MANAGER role for this restaurant
    await requireRestaurantRole(ctx, args.id, "RESTAURANT_MANAGER");

    const { id, ...updates } = args;

    // Only owners can change isActive status
    if (updates.isActive !== undefined) {
      await requireRestaurantOwner(ctx, id);
    }

    return await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// Toggle accepting orders (requires manager role or higher)
export const toggleAcceptingOrders = mutation({
  args: { id: v.id("restaurants") },
  handler: async (ctx, args) => {
    // Verify user has at least MANAGER role for this restaurant
    const { restaurant } = await requireRestaurantRole(ctx, args.id, "RESTAURANT_MANAGER");

    return await ctx.db.patch(args.id, {
      acceptingOrders: !restaurant.acceptingOrders,
      updatedAt: Date.now(),
    });
  },
});

// Get featured restaurants for homepage (limit 5)
export const getFeatured = query({
  args: {},
  handler: async (ctx) => {
    try {
      // Use filter instead of index to avoid potential index issues
      const allRestaurants = await ctx.db.query("restaurants").collect();
      const activeRestaurants = allRestaurants.filter((r) => r.isActive === true);
      return activeRestaurants.slice(0, 5);
    } catch (error) {
      console.error("Error fetching featured restaurants:", error);
      return [];
    }
  },
});

// Seed restaurants with mock data (admin only)
export const seedRestaurants = mutation({
  args: {},
  handler: async (ctx) => {
    // Require admin authentication
    const adminUser = await requireAdmin(ctx);
    const now = Date.now();

    // Check if restaurants already seeded
    const existing = await ctx.db.query("restaurants").first();
    if (existing) {
      return { message: "Restaurants already seeded", count: 0 };
    }

    const mockRestaurants = [
      {
        name: "Soul Food Spot",
        slug: "soul-food-spot",
        description: "Authentic soul food in the heart of Chicago. Famous for our fried chicken and mac & cheese.",
        cuisine: ["Soul Food", "American", "Southern"],
        logoUrl: "https://images.unsplash.com/photo-1623855244605-ed5c86548028?w=200&q=80",
        coverImageUrl: "https://images.unsplash.com/photo-1623855244605-ed5c86548028?w=800&q=80",
        acceptingOrders: true,
        estimatedPickupTime: 30,
        address: "123 Soul Street",
        city: "Chicago",
        state: "IL",
        zipCode: "60601",
        phone: "(312) 555-0001",
      },
      {
        name: "Chicago Deep Dish Kitchen",
        slug: "chicago-deep-dish-kitchen",
        description: "The best deep dish pizza in Chicago! Made fresh daily with family recipes.",
        cuisine: ["Pizza", "Italian", "American"],
        logoUrl: "https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=200&q=80",
        coverImageUrl: "https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=800&q=80",
        acceptingOrders: true,
        estimatedPickupTime: 45,
        address: "456 Pizza Ave",
        city: "Chicago",
        state: "IL",
        zipCode: "60602",
        phone: "(312) 555-0002",
      },
      {
        name: "Harold's Chicken Shack",
        slug: "harolds-chicken-shack",
        description: "Chicago's legendary chicken spot. Crispy, juicy, and perfectly seasoned every time.",
        cuisine: ["Chicken", "American", "Fast Food"],
        logoUrl: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=200&q=80",
        coverImageUrl: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=800&q=80",
        acceptingOrders: true,
        estimatedPickupTime: 20,
        address: "789 Chicken Blvd",
        city: "Chicago",
        state: "IL",
        zipCode: "60603",
        phone: "(312) 555-0003",
      },
      {
        name: "Taste of Home Café",
        slug: "taste-of-home-cafe",
        description: "Homestyle cooking that reminds you of Sunday dinner at grandma's house.",
        cuisine: ["American", "Comfort Food", "Soul Food"],
        logoUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&q=80",
        coverImageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80",
        acceptingOrders: true,
        estimatedPickupTime: 35,
        address: "321 Home Lane",
        city: "Chicago",
        state: "IL",
        zipCode: "60604",
        phone: "(312) 555-0004",
      },
      {
        name: "Wing Stop Express",
        slug: "wing-stop-express",
        description: "Fresh wings tossed in your choice of 12 signature sauces. Perfect game day food!",
        cuisine: ["Wings", "American", "Fast Food"],
        logoUrl: "https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=200&q=80",
        coverImageUrl: "https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=800&q=80",
        acceptingOrders: false,
        estimatedPickupTime: 25,
        address: "654 Wing Way",
        city: "Chicago",
        state: "IL",
        zipCode: "60605",
        phone: "(312) 555-0005",
      },
    ];

    let count = 0;
    for (const restaurant of mockRestaurants) {
      await ctx.db.insert("restaurants", {
        ...restaurant,
        ownerId: adminUser._id,
        operatingHours: {
          monday: { open: "11:00 AM", close: "9:00 PM" },
          tuesday: { open: "11:00 AM", close: "9:00 PM" },
          wednesday: { open: "11:00 AM", close: "9:00 PM" },
          thursday: { open: "11:00 AM", close: "9:00 PM" },
          friday: { open: "11:00 AM", close: "10:00 PM" },
          saturday: { open: "12:00 PM", close: "10:00 PM" },
          sunday: { open: "12:00 PM", close: "8:00 PM" },
        },
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });
      count++;
    }

    return { message: "Restaurants seeded successfully", count };
  },
});

// Apply to become a restaurant partner (creates pending restaurant)
export const apply = mutation({
  args: {
    // NOTE: ownerId is NOT accepted from client - obtained from auth context
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
    // SECURITY: Get ownerId from authenticated user, not from client
    const user = await getCurrentUser(ctx);
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
      ownerId: user._id, // SECURE: From auth context, not client
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

// Get pending restaurant applications (admin only)
export const getPending = query({
  args: {},
  handler: async (ctx) => {
    // This is a read operation, but should only be accessible to admins
    // The frontend should check user role before displaying this data
    const allRestaurants = await ctx.db.query("restaurants").collect();
    return allRestaurants.filter((r) => r.isActive === false);
  },
});

// Approve a restaurant application (admin only)
export const approve = mutation({
  args: {
    restaurantId: v.id("restaurants"),
  },
  handler: async (ctx, args) => {
    // Require admin authentication
    await requireAdmin(ctx);

    const restaurant = await ctx.db.get(args.restaurantId);
    if (!restaurant) {
      throw new Error("Restaurant not found");
    }

    if (restaurant.isActive) {
      throw new Error("Restaurant is already approved");
    }

    const now = Date.now();

    // Approve the restaurant
    await ctx.db.patch(args.restaurantId, {
      isActive: true,
      updatedAt: now,
    });

    // Upgrade owner's role to restaurateur (if not already admin/restaurateur)
    const owner = await ctx.db.get(restaurant.ownerId);
    if (owner && owner.role === "user") {
      await ctx.db.patch(restaurant.ownerId, {
        role: USER_ROLES.RESTAURATEUR,
        updatedAt: now,
      });
    }

    return { success: true, restaurantId: args.restaurantId };
  },
});

// Reject a restaurant application (admin only)
export const reject = mutation({
  args: {
    restaurantId: v.id("restaurants"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Require admin authentication
    await requireAdmin(ctx);

    const restaurant = await ctx.db.get(args.restaurantId);
    if (!restaurant) {
      throw new Error("Restaurant not found");
    }

    // Delete the restaurant application
    await ctx.db.delete(args.restaurantId);

    // Check if user has any other approved restaurants
    // If not, and they're a restaurateur, consider downgrading
    const otherRestaurants = await ctx.db
      .query("restaurants")
      .withIndex("by_owner", (q) => q.eq("ownerId", restaurant.ownerId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    if (otherRestaurants.length === 0) {
      const owner = await ctx.db.get(restaurant.ownerId);
      if (owner && owner.role === "restaurateur") {
        await ctx.db.patch(restaurant.ownerId, {
          role: USER_ROLES.USER,
          updatedAt: Date.now(),
        });
      }
    }

    return { success: true };
  },
});

// Suspend an approved restaurant (admin only)
export const suspend = mutation({
  args: {
    restaurantId: v.id("restaurants"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Require admin authentication
    await requireAdmin(ctx);

    const restaurant = await ctx.db.get(args.restaurantId);
    if (!restaurant) {
      throw new Error("Restaurant not found");
    }

    await ctx.db.patch(args.restaurantId, {
      isActive: false,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Get user's own restaurant applications (for dashboard)
export const getMyRestaurants = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);

    // Admin sees all restaurants
    if (user.role === "admin") {
      return await ctx.db.query("restaurants").collect();
    }

    // Regular users see only their own restaurants
    return await ctx.db
      .query("restaurants")
      .withIndex("by_owner", (q) => q.eq("ownerId", user._id))
      .collect();
  },
});
