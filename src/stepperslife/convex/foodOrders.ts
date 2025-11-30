import { v } from "convex/values";
import { query, mutation, action } from "./_generated/server";
import { api, internal } from "./_generated/api";

// Generate order number
function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `FO-${timestamp}-${random}`;
}

// Get orders for restaurant
export const getByRestaurant = query({
  args: { restaurantId: v.id("restaurants") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("foodOrders")
      .withIndex("by_restaurant", (q) => q.eq("restaurantId", args.restaurantId))
      .order("desc")
      .collect();
  },
});

// Get orders by customer
export const getByCustomer = query({
  args: { customerId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("foodOrders")
      .withIndex("by_customer", (q) => q.eq("customerId", args.customerId))
      .order("desc")
      .collect();
  },
});

// Get order by number
export const getByOrderNumber = query({
  args: { orderNumber: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("foodOrders")
      .withIndex("by_order_number", (q) => q.eq("orderNumber", args.orderNumber))
      .first();
  },
});

// Get order by ID
export const getById = query({
  args: { id: v.id("foodOrders") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Create food order (internal mutation - returns order details)
export const create = mutation({
  args: {
    restaurantId: v.id("restaurants"),
    customerId: v.optional(v.id("users")),
    customerName: v.string(),
    customerEmail: v.string(),
    customerPhone: v.string(),
    items: v.array(v.object({
      menuItemId: v.id("menuItems"),
      name: v.string(),
      price: v.number(),
      quantity: v.number(),
      notes: v.optional(v.string()),
    })),
    subtotal: v.number(),
    tax: v.number(),
    total: v.number(),
    pickupTime: v.optional(v.number()),
    specialInstructions: v.optional(v.string()),
    paymentMethod: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const orderNumber = generateOrderNumber();
    const now = Date.now();

    const orderId = await ctx.db.insert("foodOrders", {
      ...args,
      orderNumber,
      status: "PENDING",
      paymentStatus: "pending",
      placedAt: now,
    });

    // Return order details for notification
    return {
      orderId,
      orderNumber,
      restaurantId: args.restaurantId,
      customerName: args.customerName,
      total: args.total,
      itemCount: args.items.reduce((sum, item) => sum + item.quantity, 0),
    };
  },
});

// Create food order with notification (action that calls mutation + triggers notification)
export const createWithNotification = action({
  args: {
    restaurantId: v.id("restaurants"),
    customerId: v.optional(v.id("users")),
    customerName: v.string(),
    customerEmail: v.string(),
    customerPhone: v.string(),
    items: v.array(v.object({
      menuItemId: v.id("menuItems"),
      name: v.string(),
      price: v.number(),
      quantity: v.number(),
      notes: v.optional(v.string()),
    })),
    subtotal: v.number(),
    tax: v.number(),
    total: v.number(),
    pickupTime: v.optional(v.number()),
    specialInstructions: v.optional(v.string()),
    paymentMethod: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Create the order
    const orderResult = await ctx.runMutation(api.foodOrders.create, args);

    // Trigger notification to restaurant
    try {
      await ctx.runAction(
        api.notifications.restaurantNotifications.notifyNewFoodOrder,
        {
          foodOrderId: orderResult.orderId,
          restaurantId: orderResult.restaurantId,
          orderNumber: orderResult.orderNumber,
          customerName: orderResult.customerName,
          totalCents: orderResult.total, // total is already in cents
          itemCount: orderResult.itemCount,
        }
      );
    } catch (error) {
      // Don't fail the order if notification fails
      console.error("Failed to send order notification:", error);
    }

    return orderResult;
  },
});

// Update order status
export const updateStatus = mutation({
  args: {
    id: v.id("foodOrders"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const updates: Record<string, unknown> = { status: args.status };
    
    if (args.status === "READY_FOR_PICKUP") {
      updates.readyAt = Date.now();
    } else if (args.status === "COMPLETED") {
      updates.completedAt = Date.now();
    }
    
    return await ctx.db.patch(args.id, updates);
  },
});

// Update payment status
export const updatePaymentStatus = mutation({
  args: {
    id: v.id("foodOrders"),
    paymentStatus: v.string(),
    paymentMethod: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.id, {
      paymentStatus: args.paymentStatus,
      paymentMethod: args.paymentMethod,
    });
  },
});
