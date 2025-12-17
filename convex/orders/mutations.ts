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
      return { success: true, alreadyPaid: true };
    }

    // Update order status
    await ctx.db.patch(args.orderId, {
      status: "COMPLETED",
      stripePaymentIntentId: args.paymentIntentId,
      paidAt: Date.now(),
      updatedAt: Date.now(),
    });


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
      return { success: true, alreadyFailed: true };
    }

    // Update order status
    await ctx.db.patch(args.orderId, {
      status: "FAILED",
      updatedAt: Date.now(),
    });


    return { success: true, alreadyFailed: false };
  },
});

/**
 * Mark an order as refunded (called from Stripe webhook)
 * This also releases tickets back to inventory
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
        // Release inventory for each order
        await releaseOrderInventory(ctx, order._id);
      }
      return { success: true, count: orders.length };
    }

    const order = orders[0];

    if (order.status === "REFUNDED") {
      return { success: true, alreadyRefunded: true };
    }

    // Update order status
    // Note: refundAmount and refundReason are passed in args but not stored in schema
    // Consider adding these fields to the schema for better audit tracking
    await ctx.db.patch(order._id, {
      status: "REFUNDED",
    });

    // Release tickets back to inventory
    const inventoryResult = await releaseOrderInventory(ctx, order._id);

    return {
      success: true,
      alreadyRefunded: false,
      inventoryReleased: inventoryResult.released,
      ticketsCancelled: inventoryResult.ticketsCancelled,
    };
  },
});

/**
 * Helper function to release order inventory back to ticket tiers
 */
async function releaseOrderInventory(
  ctx: any,
  orderId: any
): Promise<{ released: number; ticketsCancelled: number }> {
  let released = 0;
  let ticketsCancelled = 0;

  try {
    // Fetch all order items for this order
    const orderItems = await ctx.db
      .query("orderItems")
      .withIndex("by_order", (q: any) => q.eq("orderId", orderId))
      .collect();

    // Group by ticketTierId to batch updates
    const tierQuantities: Map<string, number> = new Map();

    for (const item of orderItems) {
      if (item.ticketTierId) {
        const current = tierQuantities.get(item.ticketTierId) || 0;
        tierQuantities.set(item.ticketTierId, current + 1);
      }
    }

    // Update each ticket tier's sold count
    for (const [tierId, quantity] of tierQuantities) {
      const tier = await ctx.db.get(tierId);
      if (tier) {
        const newSold = Math.max(0, (tier.sold || 0) - quantity);
        await ctx.db.patch(tierId, {
          sold: newSold,
        });
        released += quantity;
        console.log(`[Refund] Released ${quantity} tickets back to tier ${tierId}, new sold count: ${newSold}`);
      }
    }

    // Cancel any associated tickets
    const tickets = await ctx.db
      .query("tickets")
      .filter((q: any) => q.eq(q.field("orderId"), orderId))
      .collect();

    for (const ticket of tickets) {
      if (ticket.status !== "CANCELLED" && ticket.status !== "REFUNDED") {
        await ctx.db.patch(ticket._id, {
          status: "REFUNDED",
          updatedAt: Date.now(),
        });
        ticketsCancelled++;
      }
    }

    console.log(`[Refund] Order ${orderId}: Released ${released} tickets to inventory, cancelled ${ticketsCancelled} tickets`);
  } catch (error: any) {
    console.error(`[Refund] Error releasing inventory for order ${orderId}:`, error);
  }

  return { released, ticketsCancelled };
}
