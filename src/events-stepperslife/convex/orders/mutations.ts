import { v } from "convex/values";
import { mutation } from "../_generated/server";

/**
 * Mark an order as paid (called from Stripe webhook)
 */
export const markOrderPaid = mutation({
  args: {
    orderId: v.id("orders"),
    paymentIntentId: v.string(),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);

    if (!order) {
      throw new Error(`Order ${args.orderId} not found`);
    }

    if (order.status === "COMPLETED") {
      console.log(`[Orders] Order ${args.orderId} already marked as paid`);
      return { success: true, alreadyPaid: true };
    }

    // Update order status
    await ctx.db.patch(args.orderId, {
      status: "COMPLETED",
      stripePaymentIntentId: args.paymentIntentId,
      paidAt: Date.now(),
      updatedAt: Date.now(),
    });

    console.log(`[Orders] Order ${args.orderId} marked as COMPLETED`);

    return { success: true, alreadyPaid: false };
  },
});

/**
 * Mark an order as failed (called from Stripe webhook)
 */
export const markOrderFailed = mutation({
  args: {
    orderId: v.id("orders"),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);

    if (!order) {
      throw new Error(`Order ${args.orderId} not found`);
    }

    if (order.status === "FAILED") {
      console.log(`[Orders] Order ${args.orderId} already marked as failed`);
      return { success: true, alreadyFailed: true };
    }

    // Update order status
    await ctx.db.patch(args.orderId, {
      status: "FAILED",
      updatedAt: Date.now(),
    });

    console.log(`[Orders] Order ${args.orderId} marked as FAILED: ${args.reason}`);

    return { success: true, alreadyFailed: false };
  },
});

/**
 * Mark an order as refunded (called from Stripe webhook)
 */
export const markOrderRefunded = mutation({
  args: {
    paymentIntentId: v.string(),
    refundAmount: v.number(),
    refundReason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Find order by payment intent ID
    const orders = await ctx.db
      .query("orders")
      .filter((q) => q.eq(q.field("stripePaymentIntentId"), args.paymentIntentId))
      .collect();

    if (orders.length === 0) {
      console.warn(`[Orders] No order found for payment intent ${args.paymentIntentId}`);
      return { success: false, error: "Order not found" };
    }

    if (orders.length > 1) {
      console.error(
        `[Orders] Multiple orders found for payment intent ${args.paymentIntentId}`
      );
      // Update all matching orders (shouldn't happen, but handle it)
      for (const order of orders) {
        await ctx.db.patch(order._id, {
          status: "REFUNDED",
          updatedAt: Date.now(),
        });
      }
      return { success: true, count: orders.length };
    }

    const order = orders[0];

    if (order.status === "REFUNDED") {
      console.log(`[Orders] Order ${order._id} already marked as refunded`);
      return { success: true, alreadyRefunded: true };
    }

    // Update order status
    await ctx.db.patch(order._id, {
      status: "REFUNDED",
      updatedAt: Date.now(),
    });

    console.log(
      `[Orders] Order ${order._id} marked as REFUNDED - Amount: ${args.refundAmount} cents`
    );

    // TODO: Release tickets back to inventory if needed
    // This would require fetching orderItems and updating ticket tier quantities

    return { success: true, alreadyRefunded: false };
  },
});
