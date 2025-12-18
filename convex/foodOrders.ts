import { v } from "convex/values";
import { query, mutation, action, internalMutation } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { getCurrentUser } from "./lib/auth";
import { requireRestaurantRole, canTransitionOrderStatus, getRestaurantAccess } from "./lib/restaurantAuth";

// Generate order number
function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `FO-${timestamp}-${random}`;
}

// Get orders for restaurant (requires staff role or higher)
export const getByRestaurant = query({
  args: { restaurantId: v.id("restaurants") },
  handler: async (ctx, args) => {
    // Verify user has at least STAFF role for this restaurant
    await requireRestaurantRole(ctx, args.restaurantId, "RESTAURANT_STAFF");

    return await ctx.db
      .query("foodOrders")
      .withIndex("by_restaurant", (q) => q.eq("restaurantId", args.restaurantId))
      .order("desc")
      .collect();
  },
});

// Get orders by customer (user can only see their own orders, admin can see all)
export const getByCustomer = query({
  args: { customerId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    // Only allow viewing own orders (or admin)
    if (user._id !== args.customerId && user.role !== "admin") {
      throw new Error("Not authorized: Cannot view other users' orders");
    }

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
export const create = internalMutation({
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
  handler: async (ctx, args): Promise<{
    orderId: Id<"foodOrders">;
    orderNumber: string;
    restaurantId: Id<"restaurants">;
    customerName: string;
    total: number;
    itemCount: number;
  }> => {
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
  handler: async (ctx, args): Promise<{
    orderId: Id<"foodOrders">;
    orderNumber: string;
    restaurantId: Id<"restaurants">;
    customerName: string;
    total: number;
    itemCount: number;
  }> => {
    // Create the order
    const orderResult = await ctx.runMutation(internal.foodOrders.create, args);

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
export const updateStatus = internalMutation({
  args: {
    id: v.id("foodOrders"),
    status: v.string(),
  },
  handler: async (ctx, args): Promise<{
    orderId: Id<"foodOrders">;
    orderNumber: string | undefined;
    customerId: Id<"users"> | undefined;
    status: string;
  }> => {
    const updates: Record<string, unknown> = { status: args.status };

    if (args.status === "READY_FOR_PICKUP") {
      updates.readyAt = Date.now();
    } else if (args.status === "COMPLETED") {
      updates.completedAt = Date.now();
    }

    await ctx.db.patch(args.id, updates);

    // Return order info for notification
    const order = await ctx.db.get(args.id);
    return {
      orderId: args.id,
      orderNumber: order?.orderNumber,
      customerId: order?.customerId,
      status: args.status,
    };
  },
});

// Secure update order status (verifies role-based access)
export const updateStatusSecure = mutation({
  args: {
    id: v.id("foodOrders"),
    status: v.string(),
  },
  handler: async (ctx, args): Promise<{
    orderId: Id<"foodOrders">;
    orderNumber: string | undefined;
    customerId: Id<"users"> | undefined;
    status: string;
  }> => {
    // Get the order
    const order = await ctx.db.get(args.id);
    if (!order) {
      throw new Error("Order not found");
    }

    // Verify user has access to this restaurant
    const access = await getRestaurantAccess(ctx, order.restaurantId);
    if (!access) {
      throw new Error("Not authorized: No access to this restaurant");
    }

    // Check if role can make this status transition
    const role = access.isAdmin ? "ADMIN" : access.role;
    if (!canTransitionOrderStatus(role, order.status, args.status)) {
      throw new Error(
        `Not authorized: ${access.role} cannot transition from ${order.status} to ${args.status}`
      );
    }

    // Update status
    const updates: Record<string, unknown> = { status: args.status };
    if (args.status === "READY_FOR_PICKUP") {
      updates.readyAt = Date.now();
    } else if (args.status === "COMPLETED") {
      updates.completedAt = Date.now();
    }

    await ctx.db.patch(args.id, updates);

    return {
      orderId: args.id,
      orderNumber: order.orderNumber,
      customerId: order.customerId,
      status: args.status,
    };
  },
});

// Update order status with customer notification (secured)
export const updateStatusWithNotification = action({
  args: {
    id: v.id("foodOrders"),
    status: v.string(),
  },
  handler: async (ctx, args): Promise<{
    orderId: Id<"foodOrders">;
    orderNumber: string | undefined;
    customerId: Id<"users"> | undefined;
    status: string;
  }> => {
    // Update the status using secure mutation (verifies role-based access)
    const updateResult = await ctx.runMutation(api.foodOrders.updateStatusSecure, {
      id: args.id,
      status: args.status,
    });

    // Send notification to customer if they have a subscription
    if (updateResult.customerId) {
      try {
        await ctx.runAction(
          api.notifications.customerNotifications.notifyOrderStatusUpdate,
          {
            foodOrderId: args.id,
            customerId: updateResult.customerId,
            orderNumber: updateResult.orderNumber || "",
            newStatus: args.status,
          }
        );
      } catch (error) {
        // Don't fail if notification fails
        console.error("Failed to send customer notification:", error);
      }
    }

    return updateResult;
  },
});

// Update payment status (requires MANAGER role or higher)
export const updatePaymentStatus = mutation({
  args: {
    id: v.id("foodOrders"),
    paymentStatus: v.string(),
    paymentMethod: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get the order
    const order = await ctx.db.get(args.id);
    if (!order) {
      throw new Error("Order not found");
    }

    // Verify user has at least MANAGER role for this restaurant
    await requireRestaurantRole(ctx, order.restaurantId, "RESTAURANT_MANAGER");

    return await ctx.db.patch(args.id, {
      paymentStatus: args.paymentStatus,
      paymentMethod: args.paymentMethod,
    });
  },
});
