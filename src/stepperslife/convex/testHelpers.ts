/**
 * Test Helper Functions
 *
 * DEPRECATED: This file is kept for backward compatibility only.
 * New code should use /convex/admin/cleanup.ts instead.
 *
 * These functions now delegate to the centralized cleanup utilities.
 */

import { internalMutation } from "./_generated/server";

/**
 * Delete all events and related data
 * WARNING: This is destructive and should only be used in testing
 *
 * @deprecated Use admin/cleanup.ts functions instead for more granular control
 */
export const deleteAllEvents = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Delete in dependency order to avoid foreign key issues
    const deletedCounts: Record<string, number> = {};

    // 1. Delete all tickets
    const tickets = await ctx.db.query("tickets").collect();
    for (const ticket of tickets) {
      await ctx.db.delete(ticket._id);
    }
    deletedCounts.tickets = tickets.length;

    // 2. Delete all event staff
    const staff = await ctx.db.query("eventStaff").collect();
    for (const s of staff) {
      await ctx.db.delete(s._id);
    }
    deletedCounts.staff = staff.length;

    // 3. Delete all ticket tiers
    const tiers = await ctx.db.query("ticketTiers").collect();
    for (const tier of tiers) {
      await ctx.db.delete(tier._id);
    }
    deletedCounts.ticketTiers = tiers.length;

    // 4. Delete all staff ticket transfers
    const transfers = await ctx.db.query("staffTicketTransfers").collect();
    for (const transfer of transfers) {
      await ctx.db.delete(transfer._id);
    }
    deletedCounts.transfers = transfers.length;

    // 5. Delete all events
    const events = await ctx.db.query("events").collect();
    for (const event of events) {
      await ctx.db.delete(event._id);
    }
    deletedCounts.events = events.length;

    return {
      success: true,
      deletedCounts,
    };
  },
});

/**
 * Delete all orders (optional - use for complete reset)
 *
 * @deprecated Use admin/cleanup.deleteAllOrders instead
 */
export const deleteAllOrders = internalMutation({
  args: {},
  handler: async (ctx) => {
    const orders = await ctx.db.query("orders").collect();
    for (const order of orders) {
      await ctx.db.delete(order._id);
    }

    return {
      success: true,
      deletedCounts: {
        orders: orders.length,
      },
    };
  },
});
