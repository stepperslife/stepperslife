/**
 * Comprehensive Organizer & Ticketing Test
 *
 * Tests the complete workflow:
 * 1. Organizer registers and gets 300 free tickets
 * 2. Creates 3 events (500 tickets each)
 *    - Event 1: Uses 300 free + 200 purchased (Stripe simulated)
 *    - Event 2: Purchases 500 tickets (Square simulated)
 *    - Event 3: Purchases 500 tickets (Cash App simulated)
 * 3. Distributes tickets to 3 team members (100% commission)
 * 4. Team members distribute to 5 associates (fixed $ per ticket)
 * 5. Simulates customer purchases via Stripe
 * 6. Verifies all commissions and transactions
 */

import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { Id } from "../_generated/dataModel";

/**
 * Step 1: Create test organizer with email and get 300 free tickets
 */
export const createTestOrganizer = mutation({
  args: {
    email: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    // Create organizer user
    const organizerId = await ctx.db.insert("users", {
      email: args.email,
      name: args.name,
      role: "organizer",
      authProvider: "password",
      canCreateTicketedEvents: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Initialize credits with 300 FREE tickets (first event bonus)
    const FIRST_EVENT_FREE_TICKETS = 300;
    const creditAccountId = await ctx.db.insert("organizerCredits", {
      organizerId,
      creditsTotal: FIRST_EVENT_FREE_TICKETS,
      creditsUsed: 0,
      creditsRemaining: FIRST_EVENT_FREE_TICKETS,
      firstEventFreeUsed: false, // Not used yet
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return {
      success: true,
      organizerId,
      creditAccountId,
      freeTickets: FIRST_EVENT_FREE_TICKETS,
      message: `Organizer created with ${FIRST_EVENT_FREE_TICKETS} free tickets`,
    };
  },
});

/**
 * Step 2: Purchase additional credits (simulates Square/Cash App/Stripe payment)
 */
export const purchaseCredits = mutation({
  args: {
    organizerId: v.id("users"),
    quantity: v.number(),
    paymentMethod: v.union(
      v.literal("STRIPE"),
      v.literal("SQUARE"),
      v.literal("CASHAPP")
    ),
    paymentId: v.string(), // Simulated payment ID
  },
  handler: async (ctx, args) => {
    const CREDIT_PRICE = 0.30; // $0.30 per ticket
    const totalCost = args.quantity * CREDIT_PRICE;

    // Get credit account
    const creditAccount = await ctx.db
      .query("organizerCredits")
      .withIndex("by_organizer", (q) => q.eq("organizerId", args.organizerId))
      .first();

    if (!creditAccount) {
      throw new Error("Credit account not found");
    }

    // Record transaction (schema requires specific fields)
    const transactionData: any = {
      organizerId: args.organizerId,
      ticketsPurchased: args.quantity,
      amountPaid: totalCost * 100, // Convert to cents
      pricePerTicket: CREDIT_PRICE * 100, // $0.30 in cents
      status: "COMPLETED" as const,
      purchasedAt: Date.now(),
    };

    // Add payment method-specific ID
    if (args.paymentMethod === "STRIPE") {
      transactionData.stripePaymentIntentId = args.paymentId;
    } else if (args.paymentMethod === "SQUARE") {
      transactionData.squarePaymentId = args.paymentId;
    } else if (args.paymentMethod === "CASHAPP") {
      // Cash App uses Square infrastructure
      transactionData.squarePaymentId = args.paymentId;
    }

    await ctx.db.insert("creditTransactions", transactionData);

    // Update credit balance
    await ctx.db.patch(creditAccount._id, {
      creditsTotal: creditAccount.creditsTotal + args.quantity,
      creditsRemaining: creditAccount.creditsRemaining + args.quantity,
      updatedAt: Date.now(),
    });

    return {
      success: true,
      purchasedCredits: args.quantity,
      totalCost,
      paymentMethod: args.paymentMethod,
      newBalance: creditAccount.creditsRemaining + args.quantity,
    };
  },
});

/**
 * Step 3: Create prepaid event and allocate credits
 */
export const createPrepaidEvent = mutation({
  args: {
    organizerId: v.id("users"),
    eventName: v.string(),
    ticketPrice: v.number(),
    ticketsToAllocate: v.number(),
    useFirstEventCredit: v.boolean(),
  },
  handler: async (ctx, args) => {
    // Get organizer
    const organizer = await ctx.db.get(args.organizerId);
    if (!organizer) {
      throw new Error("Organizer not found");
    }

    // Get credit account
    const creditAccount = await ctx.db
      .query("organizerCredits")
      .withIndex("by_organizer", (q) => q.eq("organizerId", args.organizerId))
      .first();

    if (!creditAccount) {
      throw new Error("Credit account not found");
    }

    // Check if enough credits
    if (creditAccount.creditsRemaining < args.ticketsToAllocate) {
      throw new Error(
        `Insufficient credits. Have: ${creditAccount.creditsRemaining}, Need: ${args.ticketsToAllocate}`
      );
    }

    // Create event
    const futureDate = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days from now
    const eventId = await ctx.db.insert("events", {
      organizerId: args.organizerId,
      organizerName: organizer.name || organizer.email,
      name: args.eventName,
      description: `Test event - ${args.eventName}`,
      eventType: "TICKETED_EVENT",
      startDate: futureDate,
      endDate: futureDate + 6 * 60 * 60 * 1000, // 6 hours duration
      timezone: "America/Chicago",
      location: {
        venueName: "Test Venue",
        address: "123 Test St",
        city: "Chicago",
        state: "IL",
        zipCode: "60601",
        country: "US",
      },
      status: "PUBLISHED",
      capacity: args.ticketsToAllocate,
      paymentModelSelected: true,
      ticketsVisible: true,
      allowWaitlist: false,
      allowTransfers: true,
      maxTicketsPerOrder: 10,
      minTicketsPerOrder: 1,
      socialShareCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Create payment config (PREPAY model) with all required fields
    await ctx.db.insert("eventPaymentConfig", {
      eventId,
      organizerId: args.organizerId,
      paymentModel: "PREPAY",
      ticketsAllocated: args.ticketsToAllocate,
      customerPaymentMethods: ["STRIPE", "CASH"],
      isActive: true,
      charityDiscount: false,
      lowPriceDiscount: false,
      platformFeePercent: 0, // PREPAY model has no platform fee
      platformFeeFixed: 0,
      processingFeePercent: 0.029, // Stripe: 2.9%
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Deduct credits (usage is tracked in organizerCredits, not creditTransactions)
    await ctx.db.patch(creditAccount._id, {
      creditsUsed: creditAccount.creditsUsed + args.ticketsToAllocate,
      creditsRemaining: creditAccount.creditsRemaining - args.ticketsToAllocate,
      firstEventFreeUsed: args.useFirstEventCredit ? true : creditAccount.firstEventFreeUsed,
      updatedAt: Date.now(),
    });

    return {
      success: true,
      eventId,
      eventName: args.eventName,
      ticketsAllocated: args.ticketsToAllocate,
      creditsRemaining: creditAccount.creditsRemaining - args.ticketsToAllocate,
    };
  },
});

/**
 * Step 4: Add team member to event
 */
export const addTeamMember = mutation({
  args: {
    eventId: v.id("events"),
    name: v.string(),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    // Create user for team member if doesn't exist
    let teamMemberUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!teamMemberUser) {
      const userId = await ctx.db.insert("users", {
        email: args.email,
        name: args.name,
        role: "user",
        authProvider: "password",
        canCreateTicketedEvents: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      teamMemberUser = await ctx.db.get(userId);
    }

    if (!teamMemberUser) {
      throw new Error("Failed to create team member user");
    }

    // Generate unique referral code
    const referralCode = `TEAM_${event._id.slice(0, 8)}_${teamMemberUser._id.slice(0, 8)}`;

    // Add as staff with TEAM_MEMBERS role and 100% commission (matching schema)
    const staffId = await ctx.db.insert("eventStaff", {
      eventId: args.eventId,
      organizerId: event.organizerId,
      staffUserId: teamMemberUser._id,
      email: args.email,
      name: args.name,
      role: "TEAM_MEMBERS",
      commissionType: "PERCENTAGE",
      commissionValue: 100, // 100% commission
      commissionEarned: 0, // in cents
      ticketsSold: 0,
      isActive: true,
      referralCode,
      hierarchyLevel: 1,
      canAssignSubSellers: true, // Can add associates
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return {
      success: true,
      staffId,
      teamMemberId: teamMemberUser._id,
      name: args.name,
      email: args.email,
    };
  },
});

/**
 * Step 5: Allocate tickets to team member
 */
export const allocateTicketsToStaff = mutation({
  args: {
    staffId: v.id("eventStaff"),
    quantity: v.number(),
  },
  handler: async (ctx, args) => {
    const staff = await ctx.db.get(args.staffId);
    if (!staff) {
      throw new Error("Staff member not found");
    }

    // Update allocation (field is called 'allocatedTickets' in schema)
    const currentAllocated = staff.allocatedTickets || 0;
    await ctx.db.patch(args.staffId, {
      allocatedTickets: currentAllocated + args.quantity,
    });

    return {
      success: true,
      allocated: args.quantity,
      totalAllocated: currentAllocated + args.quantity,
    };
  },
});

/**
 * Step 6: Team member adds associate
 */
export const addAssociate = mutation({
  args: {
    eventId: v.id("events"),
    teamMemberStaffId: v.id("eventStaff"),
    name: v.string(),
    email: v.string(),
    commissionPerTicket: v.number(), // Fixed $ amount per ticket
  },
  handler: async (ctx, args) => {
    const teamMemberStaff = await ctx.db.get(args.teamMemberStaffId);
    if (!teamMemberStaff || teamMemberStaff.role !== "TEAM_MEMBERS") {
      throw new Error("Invalid team member");
    }

    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    // Create user for associate
    let associateUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!associateUser) {
      const userId = await ctx.db.insert("users", {
        email: args.email,
        name: args.name,
        role: "user",
        authProvider: "password",
        canCreateTicketedEvents: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      associateUser = await ctx.db.get(userId);
    }

    if (!associateUser) {
      throw new Error("Failed to create associate user");
    }

    // Generate unique referral code
    const referralCode = `ASSOC_${event._id.slice(0, 8)}_${associateUser._id.slice(0, 8)}`;

    // Add as staff with ASSOCIATES role and fixed commission (matching schema)
    const staffId = await ctx.db.insert("eventStaff", {
      eventId: args.eventId,
      organizerId: event.organizerId,
      staffUserId: associateUser._id,
      email: args.email,
      name: args.name,
      role: "ASSOCIATES",
      commissionType: "FIXED",
      commissionValue: args.commissionPerTicket,
      commissionEarned: 0, // in cents
      ticketsSold: 0,
      isActive: true,
      referralCode,
      hierarchyLevel: 2,
      assignedByStaffId: args.teamMemberStaffId,
      canAssignSubSellers: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return {
      success: true,
      staffId,
      associateId: associateUser._id,
      name: args.name,
      email: args.email,
      commission: args.commissionPerTicket,
    };
  },
});

/**
 * Step 7: Simulate customer purchase via Stripe (dev mode)
 */
export const simulateCustomerPurchase = mutation({
  args: {
    eventId: v.id("events"),
    sellerStaffId: v.optional(v.id("eventStaff")), // Optional - can be sold by team member or associate
    customerEmail: v.string(),
    customerName: v.string(),
    quantity: v.number(),
    ticketPrice: v.number(),
  },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    // Calculate total (all amounts in cents for schema)
    const subtotalCents = args.quantity * args.ticketPrice * 100; // Convert to cents
    const STRIPE_FEE_PERCENT = 0.029; // 2.9%
    const STRIPE_FEE_FIXED_CENTS = 30; // $0.30 = 30 cents
    const processingFeeCents = Math.round((subtotalCents * STRIPE_FEE_PERCENT) + STRIPE_FEE_FIXED_CENTS);
    const platformFeeCents = 0; // PREPAY model has no platform fee
    const totalCents = subtotalCents + processingFeeCents + platformFeeCents;

    // Create customer user if doesn't exist
    let customerUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.customerEmail))
      .first();

    if (!customerUser) {
      const userId = await ctx.db.insert("users", {
        email: args.customerEmail,
        name: args.customerName,
        role: "user",
        authProvider: "password",
        canCreateTicketedEvents: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      customerUser = await ctx.db.get(userId);
    }

    if (!customerUser) {
      throw new Error("Failed to create customer user");
    }

    // Create order (matching schema with correct field names and cents)
    const stripePaymentIntentId = `pi_test_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    const orderId = await ctx.db.insert("orders", {
      eventId: args.eventId,
      buyerId: customerUser._id,
      buyerEmail: args.customerEmail,
      buyerName: args.customerName,
      subtotalCents,
      platformFeeCents,
      processingFeeCents,
      totalCents,
      paymentMethod: "STRIPE",
      status: "COMPLETED",
      stripePaymentIntentId,
      soldByStaffId: args.sellerStaffId,
      referralCode: args.sellerStaffId ? `STAFF_${args.sellerStaffId}` : undefined,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Create tickets (matching schema)
    const ticketIds = [];
    for (let i = 0; i < args.quantity; i++) {
      const ticketId = await ctx.db.insert("tickets", {
        eventId: args.eventId,
        orderId,
        attendeeId: customerUser._id,
        attendeeEmail: args.customerEmail,
        attendeeName: args.customerName,
        ticketCode: `TICKET-${Date.now()}-${i}`,
        status: "VALID",
        price: args.ticketPrice,
        soldByStaffId: args.sellerStaffId,
        paymentMethod: "STRIPE",
        createdAt: Date.now(),
      });
      ticketIds.push(ticketId);
    }

    // Update staff sales if sold by staff member
    if (args.sellerStaffId) {
      const staff = await ctx.db.get(args.sellerStaffId);
      if (staff) {
        await ctx.db.patch(args.sellerStaffId, {
          ticketsSold: staff.ticketsSold + args.quantity,
        });

        // Calculate commission (in cents)
        const netAmountCents = subtotalCents - processingFeeCents; // What organizer receives
        let commissionAmountCents = 0;

        if (staff.commissionType === "PERCENTAGE") {
          // Team members get percentage of net amount
          commissionAmountCents = Math.round((netAmountCents * staff.commissionValue) / 100);
        } else if (staff.commissionType === "FIXED") {
          // Associates get fixed dollar amount per ticket (stored in dollars, convert to cents)
          commissionAmountCents = Math.round(staff.commissionValue * args.quantity * 100);
        }

        // Update staff commission earned (commissions tracked in eventStaff table)
        await ctx.db.patch(args.sellerStaffId, {
          commissionEarned: staff.commissionEarned + commissionAmountCents,
        });
      }
    }

    return {
      success: true,
      orderId,
      ticketIds,
      quantity: args.quantity,
      totalAmount: totalCents / 100, // Convert back to dollars for display
      stripeFee: processingFeeCents / 100,
      netAmount: (subtotalCents - processingFeeCents) / 100,
      paymentIntentId: stripePaymentIntentId,
    };
  },
});

/**
 * Query: Get commission summary for verification
 */
export const getCommissionSummary = query({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    // Get all staff for this event
    const staff = await ctx.db
      .query("eventStaff")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();

    // Build commission summary from eventStaff data
    const commissionData = [];
    for (const staffMember of staff) {
      const user = await ctx.db.get(staffMember.staffUserId);

      commissionData.push({
        staffId: staffMember._id,
        name: user?.name || user?.email || "Unknown",
        role: staffMember.role,
        commissionType: staffMember.commissionType || "PERCENTAGE",
        commissionValue: staffMember.commissionValue || 0,
        ticketsAllocated: staffMember.allocatedTickets || 0,
        ticketsSold: staffMember.ticketsSold,
        totalCommission: staffMember.commissionEarned / 100, // Convert cents to dollars
        commissionRecords: staffMember.ticketsSold > 0 ? 1 : 0,
      });
    }

    return {
      eventId: args.eventId,
      staffCount: staff.length,
      commissions: commissionData,
      totalCommissionsPaid: commissionData.reduce((sum, c) => sum + c.totalCommission, 0),
      totalTicketsSold: commissionData.reduce((sum, c) => sum + c.ticketsSold, 0),
    };
  },
});

/**
 * Query: Get test summary
 */
export const getTestSummary = query({
  args: {
    organizerId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Get organizer
    const organizer = await ctx.db.get(args.organizerId);

    // Get credits
    const credits = await ctx.db
      .query("organizerCredits")
      .withIndex("by_organizer", (q) => q.eq("organizerId", args.organizerId))
      .first();

    // Get credit transactions
    const creditTransactions = await ctx.db
      .query("creditTransactions")
      .withIndex("by_organizer", (q) => q.eq("organizerId", args.organizerId))
      .collect();

    // Get events
    const events = await ctx.db
      .query("events")
      .withIndex("by_organizer", (q) => q.eq("organizerId", args.organizerId))
      .collect();

    // Get all staff across all events
    const allStaff = [];
    for (const event of events) {
      const eventStaff = await ctx.db
        .query("eventStaff")
        .withIndex("by_event", (q) => q.eq("eventId", event._id))
        .collect();
      allStaff.push(...eventStaff.map(s => ({ ...s, eventName: event.name })));
    }

    // Get all orders
    const allOrders = [];
    for (const event of events) {
      const eventOrders = await ctx.db
        .query("orders")
        .withIndex("by_event", (q) => q.eq("eventId", event._id))
        .collect();
      allOrders.push(...eventOrders);
    }

    return {
      organizer: {
        id: organizer?._id,
        name: organizer?.name,
        email: organizer?.email,
      },
      credits: {
        total: credits?.creditsTotal || 0,
        used: credits?.creditsUsed || 0,
        remaining: credits?.creditsRemaining || 0,
        firstEventFreeUsed: credits?.firstEventFreeUsed || false,
      },
      transactions: {
        total: creditTransactions.length,
        totalPurchased: creditTransactions.reduce((sum, t) => sum + t.ticketsPurchased, 0),
        totalSpent: creditTransactions.reduce((sum, t) => sum + (t.amountPaid / 100), 0), // Convert cents to dollars
      },
      events: events.map(e => ({
        id: e._id,
        name: e.name,
        capacity: e.capacity,
        status: e.status,
      })),
      staffCount: {
        total: allStaff.length,
        teamMembers: allStaff.filter(s => s.role === "TEAM_MEMBERS").length,
        associates: allStaff.filter(s => s.role === "ASSOCIATES").length,
      },
      staff: allStaff.map(s => ({
        eventName: s.eventName,
        role: s.role,
        ticketsAllocated: s.allocatedTickets || 0,
        ticketsSold: s.ticketsSold,
        commission: `${s.commissionType === "PERCENTAGE" ? s.commissionValue + "%" : "$" + s.commissionValue}`,
      })),
      sales: {
        totalOrders: allOrders.length,
        totalTicketsSold: allOrders.reduce((sum, o) => sum + o.quantity, 0),
        totalRevenue: allOrders.reduce((sum, o) => sum + o.totalAmount, 0),
        totalFees: allOrders.reduce((sum, o) => sum + o.platformFee, 0),
        netRevenue: allOrders.reduce((sum, o) => sum + o.netAmount, 0),
      },
    };
  },
});
