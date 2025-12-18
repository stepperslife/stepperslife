/**
 * Test Setup Action
 *
 * Creates a complete test restaurant with staff, menu, and test order.
 * Run via: npx convex run testSetup:setupTestRestaurant
 */

import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

// =====================================================
// CONFIGURATION
// =====================================================

const RESTAURANT_DATA = {
  name: "Steppers Soul Kitchen",
  description: "Authentic soul food with a modern twist. Family recipes passed down for generations.",
  address: "123 Main Street",
  city: "Chicago",
  state: "IL",
  zipCode: "60601",
  phone: "(312) 555-0100",
  cuisine: ["Soul Food", "Southern", "Comfort Food"],
  contactName: "Test Owner",
  contactEmail: "owner@stepperslife.com",
  estimatedPickupTime: 25,
};

const OPERATING_HOURS = {
  monday: { open: "11:00 AM", close: "9:00 PM", closed: false },
  tuesday: { open: "11:00 AM", close: "9:00 PM", closed: false },
  wednesday: { open: "11:00 AM", close: "9:00 PM", closed: false },
  thursday: { open: "11:00 AM", close: "10:00 PM", closed: false },
  friday: { open: "11:00 AM", close: "11:00 PM", closed: false },
  saturday: { open: "10:00 AM", close: "11:00 PM", closed: false },
  sunday: { open: "10:00 AM", close: "8:00 PM", closed: false },
};

const STAFF_INVITES = [
  {
    email: "manager@stepperslife.com",
    name: "Kitchen Manager",
    phone: "(312) 555-0101",
    role: "RESTAURANT_MANAGER" as const,
  },
  {
    email: "staff@stepperslife.com",
    name: "Order Handler",
    role: "RESTAURANT_STAFF" as const,
    permissions: {
      canManageOrders: true,
      canManageMenu: false,
      canManageHours: false,
      canViewAnalytics: false,
    },
  },
];

const MENU_CATEGORIES = [
  { name: "Appetizers", description: "Start your meal right", sortOrder: 1 },
  { name: "Main Dishes", description: "Hearty soul food favorites", sortOrder: 2 },
  { name: "Sides", description: "Classic southern sides", sortOrder: 3 },
  { name: "Desserts", description: "Sweet endings", sortOrder: 4 },
  { name: "Beverages", description: "Refreshing drinks", sortOrder: 5 },
];

const MENU_ITEMS = [
  { category: "Main Dishes", name: "Fried Chicken", description: "Crispy fried chicken, 2 pieces with your choice of side", price: 1499, sortOrder: 1 },
  { category: "Main Dishes", name: "Smothered Pork Chops", description: "Tender pork chops in rich onion gravy", price: 1699, sortOrder: 2 },
  { category: "Sides", name: "Mac & Cheese", description: "Creamy three-cheese macaroni", price: 599, sortOrder: 1 },
  { category: "Sides", name: "Collard Greens", description: "Slow-cooked with smoked turkey", price: 499, sortOrder: 2 },
  { category: "Sides", name: "Cornbread", description: "Sweet buttermilk cornbread", price: 299, sortOrder: 3 },
  { category: "Desserts", name: "Sweet Potato Pie", description: "Homemade with love", price: 699, sortOrder: 1 },
  { category: "Beverages", name: "Sweet Tea", description: "Southern-style sweet tea", price: 299, sortOrder: 1 },
  { category: "Beverages", name: "Lemonade", description: "Fresh-squeezed lemonade", price: 349, sortOrder: 2 },
];

// =====================================================
// MAIN SETUP ACTION
// =====================================================

export const setupTestRestaurant = action({
  args: {
    skipIfExists: v.optional(v.boolean()),
  },
  handler: async (ctx, args): Promise<{
    success: boolean;
    restaurantId?: string;
    orderId?: string;
    orderNumber?: string;
    errors: string[];
    steps: string[];
  }> => {
    const errors: string[] = [];
    const steps: string[] = [];

    try {
      // Check if restaurant already exists
      const existing = await ctx.runQuery(api.restaurants.getBySlug, {
        slug: "steppers-soul-kitchen",
      });

      if (existing) {
        if (args.skipIfExists) {
          return {
            success: true,
            restaurantId: existing._id,
            errors: [],
            steps: ["Restaurant already exists, skipping setup"],
          };
        }
        // Continue with existing restaurant for order testing
        steps.push(`Using existing restaurant: ${existing._id}`);

        // Try to place order
        const orderResult = await placeTestOrder(ctx, existing._id, steps, errors);
        return {
          success: errors.length === 0,
          restaurantId: existing._id,
          orderId: orderResult?.orderId,
          orderNumber: orderResult?.orderNumber,
          errors,
          steps,
        };
      }

      // STEP 1: Create Restaurant
      steps.push("Creating restaurant...");
      let restaurantId: Id<"restaurants">;
      try {
        restaurantId = await ctx.runMutation(api.restaurants.apply, RESTAURANT_DATA);
        steps.push(`✓ Restaurant created: ${restaurantId}`);
      } catch (error: any) {
        errors.push(`Failed to create restaurant: ${error.message}`);
        return { success: false, errors, steps };
      }

      // STEP 2: Approve Restaurant (requires admin)
      steps.push("Approving restaurant...");
      try {
        await ctx.runMutation(api.restaurants.approve, { restaurantId });
        steps.push("✓ Restaurant approved");
      } catch (error: any) {
        errors.push(`Failed to approve restaurant: ${error.message}`);
        // Continue anyway - might already be approved or user is owner
      }

      // STEP 3: Configure Operating Hours
      steps.push("Setting operating hours...");
      try {
        await ctx.runMutation(api.restaurantHours.updateHours, {
          restaurantId,
          operatingHours: OPERATING_HOURS,
        });
        steps.push("✓ Operating hours set");
      } catch (error: any) {
        errors.push(`Failed to set hours: ${error.message}`);
      }

      // STEP 4: Invite Staff
      steps.push("Inviting staff...");
      for (const staff of STAFF_INVITES) {
        try {
          await ctx.runAction(api.restaurantStaff.inviteStaffWithEmail, {
            restaurantId,
            email: staff.email,
            name: staff.name,
            phone: staff.phone,
            role: staff.role,
            permissions: staff.permissions,
          });
          steps.push(`✓ Invited ${staff.name} (${staff.role})`);
        } catch (error: any) {
          errors.push(`Failed to invite ${staff.name}: ${error.message}`);
        }
      }

      // STEP 5: Create Menu Categories
      steps.push("Creating menu categories...");
      const categoryIds: Record<string, Id<"menuCategories">> = {};
      for (const cat of MENU_CATEGORIES) {
        try {
          categoryIds[cat.name] = await ctx.runMutation(api.menuItems.createCategory, {
            restaurantId,
            name: cat.name,
            description: cat.description,
            sortOrder: cat.sortOrder,
          });
          steps.push(`✓ Created category: ${cat.name}`);
        } catch (error: any) {
          errors.push(`Failed to create category ${cat.name}: ${error.message}`);
        }
      }

      // STEP 6: Create Menu Items
      steps.push("Creating menu items...");
      const menuItemIds: Record<string, Id<"menuItems">> = {};
      for (const item of MENU_ITEMS) {
        try {
          const categoryId = categoryIds[item.category];
          if (!categoryId) {
            errors.push(`Category not found for item ${item.name}: ${item.category}`);
            continue;
          }
          menuItemIds[item.name] = await ctx.runMutation(api.menuItems.create, {
            restaurantId,
            categoryId,
            name: item.name,
            description: item.description,
            price: item.price,
            sortOrder: item.sortOrder,
          });
          steps.push(`✓ Created item: ${item.name} ($${(item.price / 100).toFixed(2)})`);
        } catch (error: any) {
          errors.push(`Failed to create item ${item.name}: ${error.message}`);
        }
      }

      // STEP 7: Enable Order Acceptance
      steps.push("Enabling order acceptance...");
      try {
        await ctx.runMutation(api.restaurants.toggleAcceptingOrders, { id: restaurantId });
        steps.push("✓ Order acceptance enabled");
      } catch (error: any) {
        errors.push(`Failed to enable orders: ${error.message}`);
      }

      // STEP 8: Place Test Order
      const orderResult = await placeTestOrder(ctx, restaurantId, steps, errors, menuItemIds);

      return {
        success: errors.length === 0,
        restaurantId,
        orderId: orderResult?.orderId,
        orderNumber: orderResult?.orderNumber,
        errors,
        steps,
      };
    } catch (error: any) {
      errors.push(`Unexpected error: ${error.message}`);
      return { success: false, errors, steps };
    }
  },
});

async function placeTestOrder(
  ctx: any,
  restaurantId: Id<"restaurants">,
  steps: string[],
  errors: string[],
  menuItemIds?: Record<string, Id<"menuItems">>
): Promise<{ orderId: string; orderNumber: string } | null> {
  steps.push("Placing test order for ira@irawatkins.com...");

  // Get menu items if not provided
  if (!menuItemIds) {
    try {
      const items = await ctx.runQuery(api.menuItems.getByRestaurant, { restaurantId });
      menuItemIds = {};
      for (const item of items) {
        menuItemIds[item.name] = item._id;
      }
    } catch (error: any) {
      errors.push(`Failed to get menu items: ${error.message}`);
      return null;
    }
  }

  // Find customer
  let customerId: Id<"users"> | undefined;
  try {
    const customer = await ctx.runQuery(api.users.queries.getUserByEmail, {
      email: "ira@irawatkins.com",
    });
    customerId = customer?._id;
    if (customerId) {
      steps.push(`✓ Found customer: ${customerId}`);
    } else {
      steps.push("⚠ Customer not found, order will not be linked to user");
    }
  } catch (error: any) {
    steps.push("⚠ Could not look up customer");
  }

  // Build order items
  const orderItems = [
    { name: "Fried Chicken", quantity: 2, price: 1499 },
    { name: "Mac & Cheese", quantity: 1, price: 599 },
    { name: "Collard Greens", quantity: 1, price: 499 },
    { name: "Cornbread", quantity: 2, price: 299 },
    { name: "Sweet Tea", quantity: 2, price: 299 },
  ].map((item) => ({
    menuItemId: menuItemIds![item.name] || ("unknown" as any),
    name: item.name,
    price: item.price,
    quantity: item.quantity,
  }));

  // Calculate totals
  const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = Math.round(subtotal * 0.0875); // 8.75% tax
  const total = subtotal + tax;

  try {
    const orderResult = await ctx.runAction(api.foodOrders.createWithNotification, {
      restaurantId,
      customerId,
      customerName: "Ira Watkins",
      customerEmail: "ira@irawatkins.com",
      customerPhone: "(555) 123-4567",
      items: orderItems,
      subtotal,
      tax,
      total,
      paymentMethod: "pay_at_pickup",
      specialInstructions: "Extra napkins please. Test order for validation.",
    });

    steps.push(`✓ Order placed: ${orderResult.orderNumber} ($${(total / 100).toFixed(2)})`);

    // Process through statuses
    steps.push("Processing order through statuses...");

    const statuses = ["CONFIRMED", "PREPARING", "READY_FOR_PICKUP"];
    for (const status of statuses) {
      try {
        await ctx.runAction(api.foodOrders.updateStatusWithNotification, {
          id: orderResult.orderId,
          status,
        });
        steps.push(`✓ Status updated to: ${status}`);
      } catch (error: any) {
        errors.push(`Failed to update status to ${status}: ${error.message}`);
      }
    }

    // Mark as paid
    try {
      await ctx.runMutation(api.foodOrders.updatePaymentStatus, {
        id: orderResult.orderId,
        paymentStatus: "paid",
        paymentMethod: "cash",
      });
      steps.push("✓ Payment marked as received");
    } catch (error: any) {
      errors.push(`Failed to mark payment: ${error.message}`);
    }

    // Complete order
    try {
      await ctx.runAction(api.foodOrders.updateStatusWithNotification, {
        id: orderResult.orderId,
        status: "COMPLETED",
      });
      steps.push("✓ Order completed");
    } catch (error: any) {
      errors.push(`Failed to complete order: ${error.message}`);
    }

    return {
      orderId: orderResult.orderId,
      orderNumber: orderResult.orderNumber,
    };
  } catch (error: any) {
    errors.push(`Failed to place order: ${error.message}`);
    return null;
  }
}

// =====================================================
// HELPER QUERIES
// =====================================================

export const getTestRestaurant = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("restaurants")
      .withIndex("by_slug", (q) => q.eq("slug", "steppers-soul-kitchen"))
      .first();
  },
});

export const getTestOrderStats = query({
  args: {},
  handler: async (ctx) => {
    const restaurant = await ctx.db
      .query("restaurants")
      .withIndex("by_slug", (q) => q.eq("slug", "steppers-soul-kitchen"))
      .first();

    if (!restaurant) {
      return { restaurantExists: false };
    }

    const orders = await ctx.db
      .query("foodOrders")
      .withIndex("by_restaurant", (q) => q.eq("restaurantId", restaurant._id))
      .collect();

    const staff = await ctx.db
      .query("restaurantStaff")
      .withIndex("by_restaurant", (q) => q.eq("restaurantId", restaurant._id))
      .collect();

    const categories = await ctx.db
      .query("menuCategories")
      .withIndex("by_restaurant", (q) => q.eq("restaurantId", restaurant._id))
      .collect();

    const menuItems = await ctx.db
      .query("menuItems")
      .withIndex("by_restaurant", (q) => q.eq("restaurantId", restaurant._id))
      .collect();

    return {
      restaurantExists: true,
      restaurantId: restaurant._id,
      restaurantName: restaurant.name,
      isActive: restaurant.isActive,
      acceptingOrders: restaurant.acceptingOrders,
      stats: {
        orders: orders.length,
        pendingOrders: orders.filter((o) => o.status === "PENDING").length,
        completedOrders: orders.filter((o) => o.status === "COMPLETED").length,
        staff: staff.length,
        activeStaff: staff.filter((s) => s.status === "ACTIVE").length,
        pendingInvites: staff.filter((s) => s.status === "PENDING").length,
        categories: categories.length,
        menuItems: menuItems.length,
        availableItems: menuItems.filter((m) => m.isAvailable).length,
      },
    };
  },
});

// =====================================================
// CLEANUP (for testing)
// =====================================================

export const cleanupTestRestaurant = mutation({
  args: {
    confirm: v.literal("DELETE_TEST_RESTAURANT"),
  },
  handler: async (ctx, args) => {
    const restaurant = await ctx.db
      .query("restaurants")
      .withIndex("by_slug", (q) => q.eq("slug", "steppers-soul-kitchen"))
      .first();

    if (!restaurant) {
      return { success: false, message: "Restaurant not found" };
    }

    // Delete related data
    const orders = await ctx.db
      .query("foodOrders")
      .withIndex("by_restaurant", (q) => q.eq("restaurantId", restaurant._id))
      .collect();
    for (const order of orders) {
      await ctx.db.delete(order._id);
    }

    const staff = await ctx.db
      .query("restaurantStaff")
      .withIndex("by_restaurant", (q) => q.eq("restaurantId", restaurant._id))
      .collect();
    for (const member of staff) {
      await ctx.db.delete(member._id);
    }

    const categories = await ctx.db
      .query("menuCategories")
      .withIndex("by_restaurant", (q) => q.eq("restaurantId", restaurant._id))
      .collect();
    for (const cat of categories) {
      await ctx.db.delete(cat._id);
    }

    const menuItems = await ctx.db
      .query("menuItems")
      .withIndex("by_restaurant", (q) => q.eq("restaurantId", restaurant._id))
      .collect();
    for (const item of menuItems) {
      await ctx.db.delete(item._id);
    }

    // Delete restaurant
    await ctx.db.delete(restaurant._id);

    return {
      success: true,
      deleted: {
        orders: orders.length,
        staff: staff.length,
        categories: categories.length,
        menuItems: menuItems.length,
      },
    };
  },
});
