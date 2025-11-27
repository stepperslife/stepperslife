/**
 * Comprehensive Test Setup
 * Creates complete test environment with 4 events, users, and ticket purchases
 */

import { v } from "convex/values";
import { mutation } from "../_generated/server";

export const setupCompleteTest = mutation({
  handler: async (ctx) => {
    const now = Date.now();
    const results: any = {
      users: {},
      events: [],
      purchases: [],
      tickets: []
    };

    // ===== PHASE 1: CREATE USERS =====

    // 1.1 Create Organizer
    const organizerId = await ctx.db.insert("users", {
      email: "thestepperslife@gmail.com",
      name: "SteppersLife Organizer",
      role: "organizer",
      authProvider: "google",
      createdAt: now,
      updatedAt: now,
    });
    results.users.organizer = { id: organizerId, email: "thestepperslife@gmail.com" };

    // 1.2 Create Team Member
    const teamMemberId = await ctx.db.insert("users", {
      email: "taxgenius.tax@gmail.com",
      name: "Team Member",
      role: "user",
      authProvider: "google",
      createdAt: now,
      updatedAt: now,
    });
    results.users.teamMember = { id: teamMemberId, email: "taxgenius.tax@gmail.com" };

    // 1.3 Create Customer
    const customerId = await ctx.db.insert("users", {
      email: "appvillagellc@gmail.com",
      name: "Test Customer",
      role: "user",
      authProvider: "google",
      createdAt: now,
      updatedAt: now,
    });
    results.users.customer = { id: customerId, email: "appvillagellc@gmail.com" };

    // ===== PHASE 2: CREATE 4 EVENTS =====

    const events = [
      {
        name: "Summer Step Fest 2025",
        description: "Annual summer stepping event with live DJ and refreshments",
        price: 3500, // $35.00
        tiers: [
          { name: "Early Bird", price: 2000, quantity: 100 },
          { name: "General Admission", price: 3000, quantity: 300 },
          { name: "VIP", price: 7500, quantity: 100 }
        ]
      },
      {
        name: "Fall Step Championship 2025",
        description: "Competitive stepping championship with cash prizes",
        price: 4000, // $40.00
        tiers: [
          { name: "Early Bird", price: 2500, quantity: 150 },
          { name: "General Admission", price: 3500, quantity: 250 },
          { name: "VIP", price: 8000, quantity: 100 }
        ]
      },
      {
        name: "Winter Gala Step Night 2026",
        description: "Elegant winter gala with professional steppers showcase",
        price: 4500, // $45.00
        tiers: [
          { name: "Standard", price: 3000, quantity: 200 },
          { name: "Premium", price: 4500, quantity: 200 },
          { name: "VIP Table", price: 10000, quantity: 50 }
        ]
      },
      {
        name: "Spring Steppers Social 2025",
        description: "Casual spring social for steppers of all levels",
        price: 3000, // $30.00
        tiers: [
          { name: "Standard", price: 2500, quantity: 150 },
          { name: "Premium", price: 4000, quantity: 150 }
        ]
      }
    ];

    for (let i = 0; i < events.length; i++) {
      const eventData = events[i];

      // Create event
      const eventId = await ctx.db.insert("events", {
        name: eventData.name,
        description: eventData.description,
        organizerId: organizerId,
        eventType: "TICKETED_EVENT",
        categories: ["Set", "Social"],
        startDate: now + ((i + 1) * 30 * 24 * 60 * 60 * 1000), // Each event 30 days apart
        endDate: now + ((i + 1) * 30 * 24 * 60 * 60 * 1000) + (6 * 60 * 60 * 1000), // +6 hours
        timezone: "America/Chicago",
        location: {
          venueName: "Grand Ballroom",
          address: "123 Main St",
          city: "Chicago",
          state: "IL",
          zipCode: "60601",
          country: "USA"
        },
        capacity: eventData.tiers.reduce((sum, t) => sum + t.quantity, 0),
        status: "PUBLISHED",
        ticketsVisible: true,
        paymentModelSelected: true,
        createdAt: now,
        updatedAt: now,
      });

      const eventInfo: any = {
        id: eventId,
        name: eventData.name,
        tiers: []
      };

      // Create ticket tiers
      for (const tier of eventData.tiers) {
        const tierId = await ctx.db.insert("ticketTiers", {
          eventId: eventId,
          name: tier.name,
          description: `${tier.name} access`,
          price: tier.price,
          quantity: tier.quantity,
          sold: 0,
          isActive: true,
          createdAt: now,
          updatedAt: now,
        });

        eventInfo.tiers.push({
          id: tierId,
          name: tier.name,
          price: tier.price,
          quantity: tier.quantity
        });
      }

      // Create FREE discount code for each event
      const discountCodeId = await ctx.db.insert("discountCodes", {
        code: "FREE",
        eventId: eventId,
        organizerId: organizerId,
        discountType: "PERCENTAGE",
        discountValue: 100,
        maxUses: undefined,
        usedCount: 0,
        maxUsesPerUser: undefined,
        validFrom: undefined,
        validUntil: undefined,
        minPurchaseAmount: undefined,
        applicableToTierIds: undefined,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });

      eventInfo.discountCode = discountCodeId;
      results.events.push(eventInfo);
    }

    // ===== PHASE 3: CREATE PURCHASES FOR CUSTOMER =====

    const purchaseQuantities = [5, 3, 4, 2]; // Tickets per event

    for (let i = 0; i < results.events.length; i++) {
      const event = results.events[i];
      const quantity = purchaseQuantities[i];
      const tier = event.tiers[0]; // Use first tier (Early Bird/Standard)

      // Create order
      const orderId = await ctx.db.insert("orders", {
        eventId: event.id,
        buyerId: customerId,
        buyerEmail: "appvillagellc@gmail.com",
        buyerName: "Test Customer",
        subtotalCents: tier.price * quantity,
        platformFeeCents: 0,
        processingFeeCents: 0,
        totalCents: 0, // FREE with discount
        discountCodeId: event.discountCode,
        discountAmountCents: tier.price * quantity,
        status: "PENDING",
        createdAt: now,
        updatedAt: now,
      });

      // Create order items
      for (let j = 0; j < quantity; j++) {
        await ctx.db.insert("orderItems", {
          orderId: orderId,
          ticketTierId: tier.id,
          priceCents: tier.price,
          createdAt: now,
        });
      }

      // Complete order and generate tickets
      await ctx.db.patch(orderId, {
        status: "COMPLETED",
        paymentId: "FREE_ORDER_NO_PAYMENT",
        paymentMethod: "TEST",
        paidAt: now,
        updatedAt: now,
      });

      // Update discount code usage
      await ctx.db.patch(event.discountCode, {
        usedCount: 1,
      });

      // Generate tickets
      const generatedTickets: any[] = [];
      const allOrderItems = await ctx.db.query("orderItems").collect();
      const orderItems = allOrderItems.filter(item => item.orderId === orderId);

      for (const item of orderItems) {
        const ticketCode = `TICKET-${now}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

        const ticketId = await ctx.db.insert("tickets", {
          eventId: event.id,
          orderId: orderId,
          attendeeId: customerId,
          ticketTierId: tier.id,
          ticketCode: ticketCode,
          status: "VALID", // ACTIVE ticket
          createdAt: now,
          updatedAt: now,
        });

        generatedTickets.push({
          id: ticketId,
          code: ticketCode,
          event: event.name,
          tier: tier.name
        });
      }

      // Update tier sold count
      await ctx.db.patch(tier.id, {
        sold: quantity,
      });

      results.purchases.push({
        event: event.name,
        orderId: orderId,
        quantity: quantity,
        tier: tier.name,
        total: "$0.00 (FREE)",
        tickets: generatedTickets
      });

      results.tickets.push(...generatedTickets);
    }

    // ===== SUMMARY =====
    return {
      success: true,
      message: "Complete test environment set up successfully",
      summary: {
        users: {
          organizer: "thestepperslife@gmail.com",
          teamMember: "taxgenius.tax@gmail.com",
          customer: "appvillagellc@gmail.com"
        },
        events: results.events.length,
        totalTicketsPurchased: purchaseQuantities.reduce((a, b) => a + b, 0),
        customerActiveTickets: results.tickets.length
      },
      details: results
    };
  },
});

/**
 * Get test summary for verification
 */
export const getTestSummary = mutation({
  handler: async (ctx) => {
    const events = await ctx.db.query("events").collect();
    const tickets = await ctx.db.query("tickets").collect();
    const orders = await ctx.db.query("orders").collect();
    const users = await ctx.db.query("users").collect();

    const customerTickets = tickets.filter(t => {
      const order = orders.find(o => o._id === t.orderId);
      return order?.buyerEmail === "appvillagellc@gmail.com";
    });

    return {
      totalEvents: events.length,
      totalTickets: tickets.length,
      totalOrders: orders.length,
      totalUsers: users.length,
      customerActiveTickets: customerTickets.filter(t => t.status === "VALID").length,
      events: events.map(e => ({
        name: e.name,
        status: e.status,
        capacity: e.capacity
      })),
      customerEmail: "appvillagellc@gmail.com"
    };
  },
});
