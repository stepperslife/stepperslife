/**
 * Real-World Ticket Testing Setup
 * Creates realistic ticketed events with:
 * - Multiple ticket tiers (Early Bird, General Admission, VIP, Tables)
 * - Ticket bundles (couples package, group package)
 * - Discount codes (percentage and fixed amount)
 * - Payment configurations
 * - Real pricing for actual checkout testing
 *
 * This creates events you can actually test the full purchase flow with
 */

import { v } from "convex/values";
import { mutation, query } from "../_generated/server";

// Generate realistic event images from Unsplash
const EVENT_IMAGES = [
  "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&h=800&fit=crop", // Concert/Party
  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&h=800&fit=crop", // Dance event
  "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&h=800&fit=crop", // DJ event
  "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=1200&h=800&fit=crop", // Gala
  "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200&h=800&fit=crop", // Social event
];

export const createRealWorldTestEvents = mutation({
  args: {
    organizerEmail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    const oneWeek = 7 * oneDay;

    // Find or create organizer
    let organizer;
    if (args.organizerEmail) {
      organizer = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", args.organizerEmail!))
        .first();
    }

    if (!organizer) {
      // Create test organizer
      const organizerId = await ctx.db.insert("users", {
        email: "test-organizer@stepperslife.com",
        name: "Test Event Organizer",
        role: "organizer",
        authProvider: "password",
        createdAt: now,
        updatedAt: now,
      });
      organizer = await ctx.db.get(organizerId);
    }

    const results: any = {
      organizer: { id: organizer!._id, email: organizer!.email },
      events: [],
      bundles: [],
      discountCodes: [],
    };

    // ===== EVENT 1: Upcoming Stepping Social (7 days from now) =====
    const event1Id = await ctx.db.insert("events", {
      name: "Chicago Steppers Social Night",
      description:
        "Join us for an evening of elegant stepping at our monthly social. Live DJ, refreshments, and great vibes. All skill levels welcome! Dress code: Smart casual. This is the perfect event to practice your moves and meet fellow steppers.",
      organizerId: organizer!._id,
      organizerName: organizer!.name,
      eventType: "TICKETED_EVENT",
      categories: ["Set", "Social"],
      eventDateLiteral: "Saturday, " + new Date(now + oneWeek).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
      eventTimeLiteral: "7:00 PM - 12:00 AM",
      eventTimezone: "America/Chicago",
      startDate: now + oneWeek,
      endDate: now + oneWeek + 5 * 60 * 60 * 1000,
      location: {
        venueName: "The Grand Ballroom",
        address: "500 N Michigan Ave",
        city: "Chicago",
        state: "IL",
        zipCode: "60611",
        country: "USA",
      },
      imageUrl: EVENT_IMAGES[0],
      capacity: 250,
      status: "PUBLISHED",
      ticketsVisible: true,
      paymentModelSelected: true,
      ticketsSold: 0,
      createdAt: now,
      updatedAt: now,
    });

    // Create ticket tiers for Event 1
    const event1Tiers = [];

    // Early Bird - ends in 3 days
    const earlyBird1 = await ctx.db.insert("ticketTiers", {
      eventId: event1Id,
      name: "Early Bird Special",
      description: "Limited early bird pricing - get in before prices go up!",
      price: 2500, // $25.00
      quantity: 50,
      sold: 12, // Simulate some sales
      isActive: true,
      saleStart: now - oneDay, // Started yesterday
      saleEnd: now + 3 * oneDay, // Ends in 3 days
      version: 1,
      createdAt: now,
      updatedAt: now,
    });
    event1Tiers.push({ id: earlyBird1, name: "Early Bird Special", price: 2500, quantity: 50, sold: 12 });

    // General Admission
    const generalAdmission1 = await ctx.db.insert("ticketTiers", {
      eventId: event1Id,
      name: "General Admission",
      description: "Standard entry ticket with access to all stepping areas",
      price: 3500, // $35.00
      quantity: 150,
      sold: 0,
      isActive: true,
      version: 1,
      createdAt: now,
      updatedAt: now,
    });
    event1Tiers.push({ id: generalAdmission1, name: "General Admission", price: 3500, quantity: 150, sold: 0 });

    // VIP
    const vip1 = await ctx.db.insert("ticketTiers", {
      eventId: event1Id,
      name: "VIP Experience",
      description: "Premium seating, complimentary drinks, meet & greet with DJ, VIP lounge access",
      price: 7500, // $75.00
      quantity: 50,
      sold: 5,
      isActive: true,
      version: 1,
      createdAt: now,
      updatedAt: now,
    });
    event1Tiers.push({ id: vip1, name: "VIP Experience", price: 7500, quantity: 50, sold: 5 });

    // Create Bundle for Event 1 - Couples Package
    const couplesBundleId = await ctx.db.insert("ticketBundles", {
      eventId: event1Id,
      name: "Couples Package",
      description: "Perfect for date night! Includes 2 General Admission tickets at a discounted price.",
      bundleType: "SINGLE_EVENT",
      includedTiers: [
        { tierId: generalAdmission1, tierName: "General Admission", quantity: 2 },
      ],
      price: 6000, // $60.00 (save $10)
      regularPrice: 7000, // $70.00 if bought separately
      savings: 1000,
      totalQuantity: 30,
      sold: 3,
      isActive: true,
      saleStart: now,
      saleEnd: now + 6 * oneDay,
      createdAt: now,
      updatedAt: now,
    });

    // Create Bundle for Event 1 - Group Package
    const groupBundleId = await ctx.db.insert("ticketBundles", {
      eventId: event1Id,
      name: "Group of 4 Package",
      description: "Bring your crew! 4 General Admission tickets at a great group rate.",
      bundleType: "SINGLE_EVENT",
      includedTiers: [
        { tierId: generalAdmission1, tierName: "General Admission", quantity: 4 },
      ],
      price: 11000, // $110.00 (save $30)
      regularPrice: 14000, // $140.00 if bought separately
      savings: 3000,
      totalQuantity: 20,
      sold: 1,
      isActive: true,
      saleStart: now,
      saleEnd: now + 6 * oneDay,
      createdAt: now,
      updatedAt: now,
    });

    results.bundles.push(
      { id: couplesBundleId, name: "Couples Package", event: "Chicago Steppers Social Night" },
      { id: groupBundleId, name: "Group of 4 Package", event: "Chicago Steppers Social Night" }
    );

    // Create Discount Codes for Event 1
    const discount1 = await ctx.db.insert("discountCodes", {
      code: "STEP10",
      eventId: event1Id,
      organizerId: organizer!._id,
      discountType: "PERCENTAGE",
      discountValue: 10, // 10% off
      maxUses: 50,
      usedCount: 0,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    const discount2 = await ctx.db.insert("discountCodes", {
      code: "SAVE5",
      eventId: event1Id,
      organizerId: organizer!._id,
      discountType: "FIXED_AMOUNT",
      discountValue: 500, // $5 off
      maxUses: 100,
      usedCount: 0,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    // FREE code for testing
    const freeCode1 = await ctx.db.insert("discountCodes", {
      code: "FREE",
      eventId: event1Id,
      organizerId: organizer!._id,
      discountType: "PERCENTAGE",
      discountValue: 100, // 100% off
      usedCount: 0,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    results.discountCodes.push(
      { code: "STEP10", event: "Chicago Steppers Social Night", type: "10% off" },
      { code: "SAVE5", event: "Chicago Steppers Social Night", type: "$5 off" },
      { code: "FREE", event: "Chicago Steppers Social Night", type: "100% off (testing)" }
    );

    results.events.push({
      id: event1Id,
      name: "Chicago Steppers Social Night",
      date: new Date(now + oneWeek).toLocaleDateString(),
      tiers: event1Tiers,
      bundles: ["Couples Package", "Group of 4 Package"],
    });

    // ===== EVENT 2: Premium Gala (30 days from now) =====
    const event2Id = await ctx.db.insert("events", {
      name: "Annual Steppers Gala & Awards Night",
      description:
        "Our most prestigious event of the year! Black tie formal attire required. Features live band, gourmet dinner, awards ceremony, and an exclusive afterparty. This is THE event for serious steppers.",
      organizerId: organizer!._id,
      organizerName: organizer!.name,
      eventType: "TICKETED_EVENT",
      categories: ["Set", "Gala", "Social"],
      eventDateLiteral: "Saturday, " + new Date(now + 30 * oneDay).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
      eventTimeLiteral: "6:00 PM - 2:00 AM",
      eventTimezone: "America/Chicago",
      startDate: now + 30 * oneDay,
      endDate: now + 30 * oneDay + 8 * 60 * 60 * 1000,
      location: {
        venueName: "The Ritz-Carlton Chicago",
        address: "160 E Pearson St",
        city: "Chicago",
        state: "IL",
        zipCode: "60611",
        country: "USA",
      },
      imageUrl: EVENT_IMAGES[3],
      capacity: 400,
      status: "PUBLISHED",
      ticketsVisible: true,
      paymentModelSelected: true,
      ticketsSold: 0,
      createdAt: now,
      updatedAt: now,
    });

    const event2Tiers = [];

    // Standard with early bird pricing tiers
    const standard2 = await ctx.db.insert("ticketTiers", {
      eventId: event2Id,
      name: "Standard Admission",
      description: "Includes dinner, awards ceremony access, and dancing",
      price: 12500, // $125.00 (regular price)
      quantity: 200,
      sold: 45,
      isActive: true,
      pricingTiers: [
        { name: "Super Early Bird", price: 8500, availableFrom: now, availableUntil: now + 7 * oneDay },
        { name: "Early Bird", price: 9500, availableFrom: now + 7 * oneDay, availableUntil: now + 14 * oneDay },
        { name: "Advance", price: 11000, availableFrom: now + 14 * oneDay, availableUntil: now + 21 * oneDay },
      ],
      version: 1,
      createdAt: now,
      updatedAt: now,
    });
    event2Tiers.push({ id: standard2, name: "Standard Admission", price: 12500, quantity: 200, sold: 45 });

    // Premium
    const premium2 = await ctx.db.insert("ticketTiers", {
      eventId: event2Id,
      name: "Premium Experience",
      description: "Priority seating, premium bar access, exclusive gift bag",
      price: 17500, // $175.00
      quantity: 100,
      sold: 22,
      isActive: true,
      pricingTiers: [
        { name: "Early Bird", price: 14500, availableFrom: now, availableUntil: now + 14 * oneDay },
      ],
      version: 1,
      createdAt: now,
      updatedAt: now,
    });
    event2Tiers.push({ id: premium2, name: "Premium Experience", price: 17500, quantity: 100, sold: 22 });

    // VIP Table Package (8 seats)
    const vipTable2 = await ctx.db.insert("ticketTiers", {
      eventId: event2Id,
      name: "VIP Table (8 Guests)",
      description: "Private VIP table for 8, bottle service, dedicated server, afterparty access",
      price: 150000, // $1,500.00 per table
      quantity: 12, // 12 tables available
      sold: 3,
      isActive: true,
      isTablePackage: true,
      tableCapacity: 8,
      version: 1,
      createdAt: now,
      updatedAt: now,
    });
    event2Tiers.push({ id: vipTable2, name: "VIP Table (8 Guests)", price: 150000, quantity: 12, sold: 3 });

    // Create Bundle - Couples Gala Package
    const galaCouplesBundleId = await ctx.db.insert("ticketBundles", {
      eventId: event2Id,
      name: "Gala Couples Package",
      description: "2 Premium Experience tickets + champagne toast for both",
      bundleType: "SINGLE_EVENT",
      includedTiers: [
        { tierId: premium2, tierName: "Premium Experience", quantity: 2 },
      ],
      price: 32000, // $320.00 (save $30)
      regularPrice: 35000,
      savings: 3000,
      totalQuantity: 25,
      sold: 8,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    results.bundles.push({ id: galaCouplesBundleId, name: "Gala Couples Package", event: "Annual Steppers Gala" });

    // Discount code for Event 2
    const galaDiscount = await ctx.db.insert("discountCodes", {
      code: "GALA20",
      eventId: event2Id,
      organizerId: organizer!._id,
      discountType: "PERCENTAGE",
      discountValue: 20, // 20% off
      maxUses: 30,
      usedCount: 0,
      validUntil: now + 14 * oneDay, // Valid for 2 weeks
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    // FREE code for testing
    const freeCode2 = await ctx.db.insert("discountCodes", {
      code: "FREE",
      eventId: event2Id,
      organizerId: organizer!._id,
      discountType: "PERCENTAGE",
      discountValue: 100,
      usedCount: 0,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    results.discountCodes.push(
      { code: "GALA20", event: "Annual Steppers Gala", type: "20% off (expires in 2 weeks)" },
      { code: "FREE", event: "Annual Steppers Gala", type: "100% off (testing)" }
    );

    results.events.push({
      id: event2Id,
      name: "Annual Steppers Gala & Awards Night",
      date: new Date(now + 30 * oneDay).toLocaleDateString(),
      tiers: event2Tiers,
      bundles: ["Gala Couples Package"],
    });

    // ===== EVENT 3: Stepping Workshop (14 days from now) =====
    const event3Id = await ctx.db.insert("events", {
      name: "Masterclass: Advanced Stepping Techniques",
      description:
        "Learn advanced stepping techniques from Chicago's top instructors. Includes 2-hour workshop, practice session, and Q&A. Perfect for intermediate to advanced steppers looking to elevate their skills.",
      organizerId: organizer!._id,
      organizerName: organizer!.name,
      eventType: "TICKETED_EVENT",
      categories: ["Class", "Workshop"],
      eventDateLiteral: "Sunday, " + new Date(now + 14 * oneDay).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
      eventTimeLiteral: "2:00 PM - 6:00 PM",
      eventTimezone: "America/Chicago",
      startDate: now + 14 * oneDay,
      endDate: now + 14 * oneDay + 4 * 60 * 60 * 1000,
      location: {
        venueName: "Dance Chicago Studios",
        address: "1850 N Damen Ave",
        city: "Chicago",
        state: "IL",
        zipCode: "60647",
        country: "USA",
      },
      imageUrl: EVENT_IMAGES[1],
      capacity: 40,
      status: "PUBLISHED",
      ticketsVisible: true,
      paymentModelSelected: true,
      ticketsSold: 0,
      createdAt: now,
      updatedAt: now,
    });

    const event3Tiers = [];

    const workshop3 = await ctx.db.insert("ticketTiers", {
      eventId: event3Id,
      name: "Workshop Entry",
      description: "Full 4-hour workshop access with all instructors",
      price: 4500, // $45.00
      quantity: 40,
      sold: 18,
      isActive: true,
      version: 1,
      createdAt: now,
      updatedAt: now,
    });
    event3Tiers.push({ id: workshop3, name: "Workshop Entry", price: 4500, quantity: 40, sold: 18 });

    // FREE code for testing
    const freeCode3 = await ctx.db.insert("discountCodes", {
      code: "FREE",
      eventId: event3Id,
      organizerId: organizer!._id,
      discountType: "PERCENTAGE",
      discountValue: 100,
      usedCount: 0,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    results.discountCodes.push({ code: "FREE", event: "Masterclass Workshop", type: "100% off (testing)" });

    results.events.push({
      id: event3Id,
      name: "Masterclass: Advanced Stepping Techniques",
      date: new Date(now + 14 * oneDay).toLocaleDateString(),
      tiers: event3Tiers,
      bundles: [],
    });

    // ===== CREATE PAYMENT CONFIGS =====
    // Set up PREPAY model for Event 1 (organizer prepaid)
    await ctx.db.insert("eventPaymentConfig", {
      eventId: event1Id,
      organizerId: organizer!._id,
      paymentModel: "PREPAY",
      customerPaymentMethods: ["STRIPE", "PAYPAL", "CASH"],
      platformFeePercent: 3.7,
      platformFeeFixed: 179, // $1.79
      processingFeePercent: 2.9,
      isActive: true,
      charityDiscount: false,
      lowPriceDiscount: false,
      createdAt: now,
      updatedAt: now,
    });

    // Set up CREDIT_CARD model for Event 2 (fees passed to customer)
    await ctx.db.insert("eventPaymentConfig", {
      eventId: event2Id,
      organizerId: organizer!._id,
      paymentModel: "CREDIT_CARD",
      customerPaymentMethods: ["STRIPE"],
      platformFeePercent: 3.7,
      platformFeeFixed: 179,
      processingFeePercent: 2.9,
      isActive: true,
      charityDiscount: false,
      lowPriceDiscount: false,
      createdAt: now,
      updatedAt: now,
    });

    // PREPAY for Event 3
    await ctx.db.insert("eventPaymentConfig", {
      eventId: event3Id,
      organizerId: organizer!._id,
      paymentModel: "PREPAY",
      customerPaymentMethods: ["STRIPE", "CASH"],
      platformFeePercent: 3.7,
      platformFeeFixed: 179,
      processingFeePercent: 2.9,
      isActive: true,
      charityDiscount: false,
      lowPriceDiscount: false,
      createdAt: now,
      updatedAt: now,
    });

    return {
      success: true,
      message: "Real-world test events created successfully!",
      summary: {
        eventsCreated: 3,
        totalTicketTiers: 7,
        bundlesCreated: 3,
        discountCodesCreated: results.discountCodes.length,
      },
      testingInstructions: {
        step1: "Go to /events to see all published events",
        step2: "Click on any event to view details",
        step3: "Click 'Get Tickets' to go to checkout",
        step4: "Select a ticket tier or bundle",
        step5: "Enter buyer info and proceed to payment",
        step6: "Use code 'FREE' for 100% discount (testing)",
        step7: "Or use 'STEP10' for 10% off, 'SAVE5' for $5 off",
        step8: "Complete checkout and verify tickets at /my-tickets",
      },
      details: results,
    };
  },
});

/**
 * Clean up test events (for resetting)
 */
export const cleanupTestEvents = mutation({
  handler: async (ctx) => {
    // Get test organizer
    const organizer = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", "test-organizer@stepperslife.com"))
      .first();

    if (!organizer) {
      return { success: true, message: "No test data to clean up" };
    }

    // Get all events by test organizer
    const events = await ctx.db.query("events").collect();
    const testEvents = events.filter((e) => e.organizerId === organizer._id);

    const cleaned = {
      events: 0,
      tiers: 0,
      bundles: 0,
      discountCodes: 0,
      paymentConfigs: 0,
    };

    for (const event of testEvents) {
      // Delete ticket tiers
      const tiers = await ctx.db
        .query("ticketTiers")
        .withIndex("by_event", (q) => q.eq("eventId", event._id))
        .collect();
      for (const tier of tiers) {
        await ctx.db.delete(tier._id);
        cleaned.tiers++;
      }

      // Delete bundles
      const bundles = await ctx.db
        .query("ticketBundles")
        .withIndex("by_event", (q) => q.eq("eventId", event._id))
        .collect();
      for (const bundle of bundles) {
        await ctx.db.delete(bundle._id);
        cleaned.bundles++;
      }

      // Delete discount codes
      const discounts = await ctx.db
        .query("discountCodes")
        .withIndex("by_event", (q) => q.eq("eventId", event._id))
        .collect();
      for (const discount of discounts) {
        await ctx.db.delete(discount._id);
        cleaned.discountCodes++;
      }

      // Delete payment configs
      const configs = await ctx.db
        .query("eventPaymentConfig")
        .withIndex("by_event", (q) => q.eq("eventId", event._id))
        .collect();
      for (const config of configs) {
        await ctx.db.delete(config._id);
        cleaned.paymentConfigs++;
      }

      // Delete event
      await ctx.db.delete(event._id);
      cleaned.events++;
    }

    // Delete test organizer
    await ctx.db.delete(organizer._id);

    return {
      success: true,
      message: "Test data cleaned up",
      cleaned,
    };
  },
});

/**
 * Get current test environment status
 */
export const getTestStatus = query({
  handler: async (ctx) => {
    const events = await ctx.db
      .query("events")
      .withIndex("by_status", (q) => q.eq("status", "PUBLISHED"))
      .collect();

    const testEvents = [];

    for (const event of events) {
      const tiers = await ctx.db
        .query("ticketTiers")
        .withIndex("by_event", (q) => q.eq("eventId", event._id))
        .collect();

      const bundles = await ctx.db
        .query("ticketBundles")
        .withIndex("by_event", (q) => q.eq("eventId", event._id))
        .collect();

      const discounts = await ctx.db
        .query("discountCodes")
        .withIndex("by_event", (q) => q.eq("eventId", event._id))
        .collect();

      const orders = await ctx.db
        .query("orders")
        .withIndex("by_event", (q) => q.eq("eventId", event._id))
        .collect();

      const tickets = await ctx.db
        .query("tickets")
        .withIndex("by_event", (q) => q.eq("eventId", event._id))
        .collect();

      testEvents.push({
        id: event._id,
        name: event.name,
        status: event.status,
        startDate: event.startDate ? new Date(event.startDate).toLocaleDateString() : null,
        ticketTiers: tiers.map((t) => ({
          name: t.name,
          price: `$${(t.price / 100).toFixed(2)}`,
          sold: t.sold,
          available: t.quantity - t.sold,
        })),
        bundles: bundles.map((b) => ({
          name: b.name,
          price: `$${(b.price / 100).toFixed(2)}`,
          sold: b.sold,
        })),
        discountCodes: discounts.map((d) => d.code),
        totalOrders: orders.length,
        completedOrders: orders.filter((o) => o.status === "COMPLETED").length,
        totalTicketsSold: tickets.filter((t) => t.status === "VALID").length,
      });
    }

    return {
      totalPublishedEvents: events.length,
      events: testEvents,
    };
  },
});

/**
 * Create staff and associates for event testing
 * This sets up team members who can sell tickets and earn commissions
 */
export const createTestStaffAndAssociates = mutation({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Get the event
    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Event not found");
    }
    if (!event.organizerId) {
      throw new Error("Event has no organizer");
    }

    const results: any = {
      staff: [],
      referralCodes: [],
    };

    // Create Staff Member 1 - Door Scanner
    const staff1Id = await ctx.db.insert("users", {
      email: "scanner1@stepperslife.com",
      name: "Marcus Johnson",
      role: "user",
      authProvider: "password",
      createdAt: now,
      updatedAt: now,
    });

    const staffRecord1 = await ctx.db.insert("eventStaff", {
      staffUserId: staff1Id,
      eventId: args.eventId,
      organizerId: event.organizerId,
      name: "Marcus Johnson",
      email: "scanner1@stepperslife.com",
      role: "STAFF",
      isActive: true,
      canScan: true,
      commissionType: "PERCENTAGE",
      commissionValue: 0, // No commission for door staff
      commissionEarned: 0,
      ticketsSold: 0,
      referralCode: "MARCUS2024",
      createdAt: now,
      updatedAt: now,
    });

    results.staff.push({
      name: "Marcus Johnson",
      email: "scanner1@stepperslife.com",
      role: "STAFF (Door Scanner)",
      canScan: true,
      referralCode: "MARCUS2024",
    });
    results.referralCodes.push("MARCUS2024");

    // Create Staff Member 2 - Event Coordinator
    const staff2Id = await ctx.db.insert("users", {
      email: "coordinator@stepperslife.com",
      name: "Tamika Williams",
      role: "user",
      authProvider: "password",
      createdAt: now,
      updatedAt: now,
    });

    const staffRecord2 = await ctx.db.insert("eventStaff", {
      staffUserId: staff2Id,
      eventId: args.eventId,
      organizerId: event.organizerId,
      name: "Tamika Williams",
      email: "coordinator@stepperslife.com",
      role: "TEAM_MEMBERS",
      isActive: true,
      canScan: true,
      commissionType: "PERCENTAGE",
      commissionValue: 5, // 5% commission
      commissionEarned: 0,
      ticketsSold: 0,
      referralCode: "TAMIKA5",
      createdAt: now,
      updatedAt: now,
    });

    results.staff.push({
      name: "Tamika Williams",
      email: "coordinator@stepperslife.com",
      role: "TEAM_MEMBER (Coordinator)",
      canScan: true,
      commissionRate: "5%",
      referralCode: "TAMIKA5",
    });
    results.referralCodes.push("TAMIKA5");

    // Create Associate 1 - High Commission Seller
    const associate1Id = await ctx.db.insert("users", {
      email: "topseller@stepperslife.com",
      name: "Darnell Thompson",
      role: "user",
      authProvider: "password",
      createdAt: now,
      updatedAt: now,
    });

    const associateRecord1 = await ctx.db.insert("eventStaff", {
      staffUserId: associate1Id,
      eventId: args.eventId,
      organizerId: event.organizerId,
      name: "Darnell Thompson",
      email: "topseller@stepperslife.com",
      role: "ASSOCIATES",
      isActive: true,
      canScan: false,
      commissionType: "PERCENTAGE",
      commissionValue: 10, // 10% commission for top sellers
      commissionEarned: 0,
      ticketsSold: 0,
      referralCode: "DARNELL10",
      createdAt: now,
      updatedAt: now,
    });

    results.staff.push({
      name: "Darnell Thompson",
      email: "topseller@stepperslife.com",
      role: "ASSOCIATE (Top Seller)",
      canScan: false,
      commissionRate: "10%",
      referralCode: "DARNELL10",
    });
    results.referralCodes.push("DARNELL10");

    // Create Associate 2 - Standard Seller
    const associate2Id = await ctx.db.insert("users", {
      email: "seller@stepperslife.com",
      name: "Angela Davis",
      role: "user",
      authProvider: "password",
      createdAt: now,
      updatedAt: now,
    });

    const associateRecord2 = await ctx.db.insert("eventStaff", {
      staffUserId: associate2Id,
      eventId: args.eventId,
      organizerId: event.organizerId,
      name: "Angela Davis",
      email: "seller@stepperslife.com",
      role: "ASSOCIATES",
      isActive: true,
      canScan: false,
      commissionType: "PERCENTAGE",
      commissionValue: 7, // 7% standard commission
      commissionEarned: 0,
      ticketsSold: 0,
      referralCode: "ANGELA7",
      createdAt: now,
      updatedAt: now,
    });

    results.staff.push({
      name: "Angela Davis",
      email: "seller@stepperslife.com",
      role: "ASSOCIATE (Standard)",
      canScan: false,
      commissionRate: "7%",
      referralCode: "ANGELA7",
    });
    results.referralCodes.push("ANGELA7");

    // Create Sub-Seller with parent
    const subSellerId = await ctx.db.insert("users", {
      email: "subseller@stepperslife.com",
      name: "Jerome Banks",
      role: "user",
      authProvider: "password",
      createdAt: now,
      updatedAt: now,
    });

    const subSellerRecord = await ctx.db.insert("eventStaff", {
      staffUserId: subSellerId,
      eventId: args.eventId,
      organizerId: event.organizerId,
      name: "Jerome Banks",
      email: "subseller@stepperslife.com",
      role: "ASSOCIATES", // Sub-sellers are ASSOCIATES with parent assignment
      isActive: true,
      canScan: false,
      commissionType: "PERCENTAGE",
      commissionValue: 5, // 5% for sub-sellers
      commissionEarned: 0,
      ticketsSold: 0,
      referralCode: "JEROME5",
      assignedByStaffId: associateRecord1, // Under Darnell
      hierarchyLevel: 2,
      createdAt: now,
      updatedAt: now,
    });

    results.staff.push({
      name: "Jerome Banks",
      email: "subseller@stepperslife.com",
      role: "SUB_SELLER (Under Darnell)",
      canScan: false,
      commissionRate: "5%",
      referralCode: "JEROME5",
      parentSeller: "Darnell Thompson",
    });
    results.referralCodes.push("JEROME5");

    return {
      success: true,
      message: `Created ${results.staff.length} staff/associates for event`,
      eventName: event.name,
      staff: results.staff,
      referralCodes: results.referralCodes,
      testingInstructions: {
        step1: "Staff can log in with their email and scan tickets at /staff/scan-tickets",
        step2: "Associates can share their referral code to earn commissions",
        step3: "Use referral codes at checkout to track sales",
        step4: "View staff performance at /organizer/team",
      },
    };
  },
});

/**
 * Simulate customer ticket purchases
 * Creates realistic orders and generates actual tickets with QR codes
 */
export const simulateCustomerPurchases = mutation({
  args: {
    eventId: v.id("events"),
    numberOfPurchases: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const numPurchases = args.numberOfPurchases || 5;

    // Get the event
    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    // Get ticket tiers for this event
    const tiers = await ctx.db
      .query("ticketTiers")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();

    if (tiers.length === 0) {
      throw new Error("No ticket tiers found for this event");
    }

    // Get staff for referral attribution
    const staff = await ctx.db
      .query("eventStaff")
      .filter((q) => q.eq(q.field("eventId"), args.eventId))
      .collect();

    // Test customer data
    const testCustomers = [
      { name: "Michael Richardson", email: "michael.r@example.com" },
      { name: "Keisha Brown", email: "keisha.b@example.com" },
      { name: "James Williams", email: "james.w@example.com" },
      { name: "Latoya Jackson", email: "latoya.j@example.com" },
      { name: "David Anderson", email: "david.a@example.com" },
      { name: "Nicole Harris", email: "nicole.h@example.com" },
      { name: "Robert Taylor", email: "robert.t@example.com" },
      { name: "Jasmine Carter", email: "jasmine.c@example.com" },
      { name: "Anthony Moore", email: "anthony.m@example.com" },
      { name: "Stephanie Lewis", email: "stephanie.l@example.com" },
    ];

    const results: any = {
      orders: [],
      tickets: [],
      totalRevenue: 0,
    };

    for (let i = 0; i < Math.min(numPurchases, testCustomers.length); i++) {
      const customer = testCustomers[i];

      // Randomly select a tier
      const tier = tiers[Math.floor(Math.random() * tiers.length)];

      // Random quantity 1-4
      const quantity = Math.floor(Math.random() * 3) + 1;

      // Calculate total
      const subtotal = tier.price * quantity;
      const platformFee = Math.round(subtotal * 0.037) + 179; // 3.7% + $1.79
      const totalCents = subtotal + platformFee;

      // Random staff attribution (30% chance)
      const assignedStaff = staff.length > 0 && Math.random() > 0.7
        ? staff[Math.floor(Math.random() * staff.length)]
        : null;

      // Create or get customer user
      let customerUser = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", customer.email))
        .first();

      if (!customerUser) {
        const userId = await ctx.db.insert("users", {
          email: customer.email,
          name: customer.name,
          role: "user",
          authProvider: "password",
          createdAt: now,
          updatedAt: now,
        });
        customerUser = await ctx.db.get(userId);
      }

      // Create order
      const orderId = await ctx.db.insert("orders", {
        eventId: args.eventId,
        buyerId: customerUser!._id,
        buyerEmail: customer.email,
        buyerName: customer.name,
        status: "COMPLETED",
        subtotalCents: subtotal,
        platformFeeCents: platformFee,
        processingFeeCents: 0,
        totalCents: totalCents,
        paymentMethod: Math.random() > 0.5 ? "STRIPE" : "PAYPAL",
        stripePaymentIntentId: `pi_test_${Date.now()}_${i}`,
        paidAt: now - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000), // Random time in last week
        soldByStaffId: assignedStaff?._id,
        referralCode: assignedStaff?.referralCode,
        createdAt: now,
        updatedAt: now,
      });

      // Create order items
      await ctx.db.insert("orderItems", {
        orderId: orderId,
        ticketTierId: tier._id,
        priceCents: tier.price,
        createdAt: now,
      });

      results.orders.push({
        orderId: orderId,
        customer: customer.name,
        tier: tier.name,
        quantity: quantity,
        total: `$${(totalCents / 100).toFixed(2)}`,
        referral: assignedStaff?.referralCode || "Direct",
      });

      results.totalRevenue += totalCents;

      // Generate actual tickets
      for (let t = 0; t < quantity; t++) {
        // Generate unique ticket code
        const ticketCode = `TKT-${event.name.substring(0, 3).toUpperCase()}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

        const ticketId = await ctx.db.insert("tickets", {
          eventId: args.eventId,
          orderId: orderId,
          ticketTierId: tier._id,
          attendeeId: customerUser!._id,
          attendeeEmail: customer.email,
          attendeeName: customer.name,
          ticketCode: ticketCode,
          status: "VALID",
          soldByStaffId: assignedStaff?._id,
          createdAt: now,
          updatedAt: now,
        });

        results.tickets.push({
          ticketId: ticketId,
          ticketCode: ticketCode,
          attendee: customer.name,
          tier: tier.name,
          status: "VALID",
          qrCodeUrl: `/ticket/${ticketCode}`,
        });
      }

      // Update tier sold count
      await ctx.db.patch(tier._id, {
        sold: tier.sold + quantity,
        updatedAt: now,
      });

      // Update event ticket count
      await ctx.db.patch(args.eventId, {
        ticketsSold: (event.ticketsSold || 0) + quantity,
        updatedAt: now,
      });
    }

    return {
      success: true,
      message: `Created ${results.orders.length} orders with ${results.tickets.length} tickets`,
      eventName: event.name,
      summary: {
        totalOrders: results.orders.length,
        totalTickets: results.tickets.length,
        totalRevenue: `$${(results.totalRevenue / 100).toFixed(2)}`,
      },
      orders: results.orders,
      tickets: results.tickets,
      testingInstructions: {
        step1: "View tickets at /ticket/[ticketCode] - each has a unique QR code",
        step2: "Customers can view their tickets at /my-tickets",
        step3: "Organizer can see all sales at /organizer/events/[eventId]",
        step4: "Staff can scan tickets at /staff/scan-tickets or /scan/[eventId]",
      },
    };
  },
});

/**
 * Test QR code scanning - simulate check-in
 */
export const simulateTicketScanning = mutation({
  args: {
    eventId: v.id("events"),
    scanPercentage: v.optional(v.number()), // What % of tickets to scan
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const scanPercent = args.scanPercentage || 50; // Default 50%

    // Get the event
    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    // Get valid tickets for this event
    const tickets = await ctx.db
      .query("tickets")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();

    const validTickets = tickets.filter((t) => t.status === "VALID");

    if (validTickets.length === 0) {
      return {
        success: false,
        message: "No valid tickets to scan",
      };
    }

    // Get staff who can scan
    const staff = await ctx.db
      .query("eventStaff")
      .filter((q) =>
        q.and(
          q.eq(q.field("eventId"), args.eventId),
          q.eq(q.field("canScan"), true)
        )
      )
      .collect();

    const scanner = staff.length > 0 ? staff[0] : null;

    // Calculate how many to scan
    const numToScan = Math.floor(validTickets.length * (scanPercent / 100));

    // Randomly select tickets to scan
    const shuffled = validTickets.sort(() => Math.random() - 0.5);
    const ticketsToScan = shuffled.slice(0, numToScan);

    const results: any = {
      scanned: [],
      scannerName: scanner?.name || "System",
    };

    for (const ticket of ticketsToScan) {
      // Mark ticket as scanned
      await ctx.db.patch(ticket._id, {
        status: "SCANNED",
        scannedAt: now - Math.floor(Math.random() * 60 * 60 * 1000), // Random time in last hour
        scannedBy: scanner?.staffUserId,
        updatedAt: now,
      });

      results.scanned.push({
        ticketCode: ticket.ticketCode,
        attendee: ticket.attendeeName,
        scannedAt: new Date(now).toLocaleTimeString(),
      });
    }

    return {
      success: true,
      message: `Scanned ${results.scanned.length} of ${validTickets.length} tickets (${scanPercent}%)`,
      eventName: event.name,
      summary: {
        totalTickets: tickets.length,
        validBefore: validTickets.length,
        scannedNow: results.scanned.length,
        remainingValid: validTickets.length - results.scanned.length,
      },
      scannedTickets: results.scanned.slice(0, 10), // Show first 10
      testingInstructions: {
        step1: "View scan statistics at /staff/scan-statistics",
        step2: "Check scanned history at /staff/scanned-tickets",
        step3: "Try scanning more tickets manually at /scan/[eventId]",
      },
    };
  },
});

/**
 * Get comprehensive test status with all data
 */
export const getFullTestStatus = query({
  handler: async (ctx) => {
    // Get all test organizer's events
    const organizer = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", "test-organizer@stepperslife.com"))
      .first();

    if (!organizer) {
      return {
        setupComplete: false,
        message: "No test data found. Run createRealWorldTestEvents first.",
      };
    }

    const events = await ctx.db.query("events").collect();
    const testEvents = events.filter((e) => e.organizerId === organizer._id);

    const fullStatus: any = {
      setupComplete: true,
      organizer: {
        id: organizer._id,
        name: organizer.name,
        email: organizer.email,
      },
      events: [],
      totals: {
        events: testEvents.length,
        ticketTiers: 0,
        bundles: 0,
        discountCodes: 0,
        staff: 0,
        orders: 0,
        tickets: 0,
        scannedTickets: 0,
        revenue: 0,
      },
    };

    for (const event of testEvents) {
      const tiers = await ctx.db
        .query("ticketTiers")
        .withIndex("by_event", (q) => q.eq("eventId", event._id))
        .collect();

      const bundles = await ctx.db
        .query("ticketBundles")
        .withIndex("by_event", (q) => q.eq("eventId", event._id))
        .collect();

      const discounts = await ctx.db
        .query("discountCodes")
        .withIndex("by_event", (q) => q.eq("eventId", event._id))
        .collect();

      const staff = await ctx.db
        .query("eventStaff")
        .filter((q) => q.eq(q.field("eventId"), event._id))
        .collect();

      const orders = await ctx.db
        .query("orders")
        .withIndex("by_event", (q) => q.eq("eventId", event._id))
        .collect();

      const tickets = await ctx.db
        .query("tickets")
        .withIndex("by_event", (q) => q.eq("eventId", event._id))
        .collect();

      const completedOrders = orders.filter((o) => o.status === "COMPLETED");
      const validTickets = tickets.filter((t) => t.status === "VALID");
      const scannedTickets = tickets.filter((t) => t.status === "SCANNED");
      const totalRevenue = completedOrders.reduce((sum, o) => sum + (o.totalCents || 0), 0);

      fullStatus.events.push({
        id: event._id,
        name: event.name,
        date: event.startDate ? new Date(event.startDate).toLocaleDateString() : "TBD",
        status: event.status,
        imageUrl: event.imageUrl,
        location: typeof event.location === "string" ? event.location : (event.location?.venueName || "TBD"),
        ticketTiers: tiers.map((t) => ({
          id: t._id,
          name: t.name,
          price: `$${(t.price / 100).toFixed(2)}`,
          sold: t.sold,
          available: t.quantity - t.sold,
        })),
        bundles: bundles.map((b) => ({
          name: b.name,
          price: `$${(b.price / 100).toFixed(2)}`,
          sold: b.sold,
        })),
        discountCodes: discounts.map((d) => ({
          code: d.code,
          type: d.discountType,
          value: d.discountType === "PERCENTAGE" ? `${d.discountValue}%` : `$${(d.discountValue / 100).toFixed(2)}`,
          uses: d.usedCount || 0,
        })),
        staff: staff.map((s) => ({
          name: s.name,
          role: s.role,
          referralCode: s.referralCode,
          canScan: s.canScan,
        })),
        stats: {
          totalOrders: orders.length,
          completedOrders: completedOrders.length,
          totalTickets: tickets.length,
          validTickets: validTickets.length,
          scannedTickets: scannedTickets.length,
          checkInRate: tickets.length > 0
            ? `${Math.round((scannedTickets.length / tickets.length) * 100)}%`
            : "0%",
          revenue: `$${(totalRevenue / 100).toFixed(2)}`,
        },
      });

      // Update totals
      fullStatus.totals.ticketTiers += tiers.length;
      fullStatus.totals.bundles += bundles.length;
      fullStatus.totals.discountCodes += discounts.length;
      fullStatus.totals.staff += staff.length;
      fullStatus.totals.orders += completedOrders.length;
      fullStatus.totals.tickets += tickets.length;
      fullStatus.totals.scannedTickets += scannedTickets.length;
      fullStatus.totals.revenue += totalRevenue;
    }

    fullStatus.totals.revenue = `$${(fullStatus.totals.revenue / 100).toFixed(2)}`;

    return fullStatus;
  },
});

/**
 * Run complete end-to-end test
 * Creates everything: events, tiers, staff, orders, tickets, and simulates scanning
 */
export const runCompleteE2ETest = mutation({
  handler: async (ctx) => {
    const now = Date.now();

    // Step 1: Create test events using internal helper
    const eventsResult = await createTestEventsInternal(ctx, {});

    if (!eventsResult.success) {
      return { success: false, message: "Failed to create events", error: eventsResult };
    }

    const eventIds = eventsResult.details.events.map((e: any) => e.id);

    const results: any = {
      eventsCreated: eventsResult,
      staffCreated: [],
      purchasesSimulated: [],
      ticketsScanned: [],
    };

    // Step 2: Create staff for each event using internal helper
    for (const eventId of eventIds) {
      try {
        const staffResult = await createTestStaffAndAssociatesInternal(ctx, { eventId });
        results.staffCreated.push(staffResult);
      } catch (e: any) {
        results.staffCreated.push({ error: e.message, eventId });
      }
    }

    // Step 3: Simulate purchases for each event using internal helper
    for (const eventId of eventIds) {
      try {
        const purchaseResult = await simulateCustomerPurchasesInternal(ctx, {
          eventId,
          numberOfPurchases: 5
        });
        results.purchasesSimulated.push(purchaseResult);
      } catch (e: any) {
        results.purchasesSimulated.push({ error: e.message, eventId });
      }
    }

    // Step 4: Simulate scanning for first event only (to leave others for manual testing)
    try {
      const scanResult = await simulateTicketScanningInternal(ctx, {
        eventId: eventIds[0],
        scanPercentage: 30
      });
      results.ticketsScanned.push(scanResult);
    } catch (e: any) {
      results.ticketsScanned.push({ error: e.message });
    }

    return {
      success: true,
      message: "Complete E2E test setup finished!",
      summary: {
        eventsCreated: eventIds.length,
        staffCreated: results.staffCreated.filter((s: any) => s.success).length,
        ordersCreated: results.purchasesSimulated.reduce((sum: number, p: any) =>
          sum + (p.summary?.totalOrders || 0), 0),
        ticketsGenerated: results.purchasesSimulated.reduce((sum: number, p: any) =>
          sum + (p.summary?.totalTickets || 0), 0),
        ticketsScanned: results.ticketsScanned[0]?.summary?.scannedNow || 0,
      },
      testingGuide: {
        customerFlow: [
          "1. Go to /events to browse events",
          "2. Click on an event to see details",
          "3. Click 'Get Tickets' to start checkout",
          "4. Select ticket tier and quantity",
          "5. Use discount code 'FREE' for testing",
          "6. Complete checkout",
          "7. View your tickets at /my-tickets",
          "8. Click on a ticket to see QR code",
        ],
        organizerFlow: [
          "1. Login as test-organizer@stepperslife.com",
          "2. Go to /organizer/events to see your events",
          "3. Click on an event for detailed dashboard",
          "4. View sales, orders, and attendees",
          "5. Manage ticket tiers at /organizer/events/[id]/tickets",
          "6. View team at /organizer/team",
        ],
        staffFlow: [
          "1. Login as scanner1@stepperslife.com",
          "2. Go to /staff/scan-tickets to scan tickets",
          "3. View scan statistics",
          "4. Check scanned history",
        ],
        associateFlow: [
          "1. Login as topseller@stepperslife.com",
          "2. Go to /staff/dashboard",
          "3. Share referral code: DARNELL10",
          "4. Track sales and commissions",
        ],
      },
      details: results,
    };
  },
});

// Helper function for createTestStaffAndAssociates
async function createTestStaffAndAssociatesInternal(ctx: any, args: { eventId: any }) {
  const now = Date.now();

  const event = await ctx.db.get(args.eventId);
  if (!event) {
    throw new Error("Event not found");
  }
  if (!event.organizerId) {
    throw new Error("Event has no organizer");
  }

  const results: any = { staff: [], referralCodes: [] };

  // Create staff members (simplified version for internal use)
  const staffData = [
    { name: "Marcus Johnson", email: "scanner1@stepperslife.com", role: "STAFF" as const, canScan: true, commission: 0, code: "MARCUS2024" },
    { name: "Tamika Williams", email: "coordinator@stepperslife.com", role: "TEAM_MEMBERS" as const, canScan: true, commission: 5, code: "TAMIKA5" },
    { name: "Darnell Thompson", email: "topseller@stepperslife.com", role: "ASSOCIATES" as const, canScan: false, commission: 10, code: "DARNELL10" },
    { name: "Angela Davis", email: "seller@stepperslife.com", role: "ASSOCIATES" as const, canScan: false, commission: 7, code: "ANGELA7" },
  ];

  for (const s of staffData) {
    let user = await ctx.db.query("users").withIndex("by_email", (q: any) => q.eq("email", s.email)).first();
    if (!user) {
      const userId = await ctx.db.insert("users", {
        email: s.email, name: s.name, role: "user", authProvider: "password", createdAt: now, updatedAt: now,
      });
      user = await ctx.db.get(userId);
    }

    await ctx.db.insert("eventStaff", {
      staffUserId: user._id,
      eventId: args.eventId,
      organizerId: event.organizerId,
      name: s.name,
      email: s.email,
      role: s.role,
      isActive: true,
      canScan: s.canScan,
      commissionType: "PERCENTAGE",
      commissionValue: s.commission,
      commissionEarned: 0,
      ticketsSold: 0,
      referralCode: s.code,
      createdAt: now,
      updatedAt: now,
    });

    results.staff.push({ name: s.name, role: s.role, referralCode: s.code });
    results.referralCodes.push(s.code);
  }

  return { success: true, eventName: event.name, staff: results.staff, referralCodes: results.referralCodes };
}

// Helper function for simulateCustomerPurchases
async function simulateCustomerPurchasesInternal(ctx: any, args: { eventId: any; numberOfPurchases: number }) {
  const now = Date.now();
  const event = await ctx.db.get(args.eventId);
  if (!event) throw new Error("Event not found");

  const tiers = await ctx.db.query("ticketTiers").withIndex("by_event", (q: any) => q.eq("eventId", args.eventId)).collect();
  if (tiers.length === 0) throw new Error("No ticket tiers found");

  const staff = await ctx.db.query("eventStaff").filter((q: any) => q.eq(q.field("eventId"), args.eventId)).collect();

  const customers = [
    { name: "Michael Richardson", email: "michael.r@example.com" },
    { name: "Keisha Brown", email: "keisha.b@example.com" },
    { name: "James Williams", email: "james.w@example.com" },
    { name: "Latoya Jackson", email: "latoya.j@example.com" },
    { name: "David Anderson", email: "david.a@example.com" },
  ];

  const results: any = { orders: [], tickets: [], totalRevenue: 0 };

  for (let i = 0; i < Math.min(args.numberOfPurchases, customers.length); i++) {
    const customer = customers[i];
    const tier = tiers[Math.floor(Math.random() * tiers.length)];
    const quantity = Math.floor(Math.random() * 3) + 1;
    const subtotal = tier.price * quantity;
    const platformFee = Math.round(subtotal * 0.037) + 179;
    const totalCents = subtotal + platformFee;
    const assignedStaff = staff.length > 0 && Math.random() > 0.7 ? staff[Math.floor(Math.random() * staff.length)] : null;

    let user = await ctx.db.query("users").withIndex("by_email", (q: any) => q.eq("email", customer.email)).first();
    if (!user) {
      const userId = await ctx.db.insert("users", { email: customer.email, name: customer.name, role: "user", authProvider: "password", createdAt: now, updatedAt: now });
      user = await ctx.db.get(userId);
    }

    const orderId = await ctx.db.insert("orders", {
      eventId: args.eventId, buyerId: user._id, buyerEmail: customer.email, buyerName: customer.name,
      status: "COMPLETED", subtotalCents: subtotal, platformFeeCents: platformFee, processingFeeCents: 0, totalCents,
      paymentMethod: Math.random() > 0.5 ? "STRIPE" : "PAYPAL",
      stripePaymentIntentId: `pi_test_${Date.now()}_${i}`,
      paidAt: now - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000),
      soldByStaffId: assignedStaff?._id, referralCode: assignedStaff?.referralCode,
      createdAt: now, updatedAt: now,
    });

    await ctx.db.insert("orderItems", { orderId, ticketTierId: tier._id, priceCents: tier.price, createdAt: now });
    results.orders.push({ orderId, customer: customer.name, tier: tier.name, quantity, total: `$${(totalCents / 100).toFixed(2)}` });
    results.totalRevenue += totalCents;

    for (let t = 0; t < quantity; t++) {
      const ticketCode = `TKT-${event.name.substring(0, 3).toUpperCase()}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      const ticketId = await ctx.db.insert("tickets", {
        eventId: args.eventId, orderId, ticketTierId: tier._id, attendeeId: user._id,
        attendeeEmail: customer.email, attendeeName: customer.name, ticketCode, status: "VALID",
        soldByStaffId: assignedStaff?._id, createdAt: now, updatedAt: now,
      });
      results.tickets.push({ ticketId, ticketCode, attendee: customer.name, tier: tier.name });
    }

    await ctx.db.patch(tier._id, { sold: tier.sold + quantity, updatedAt: now });
    await ctx.db.patch(args.eventId, { ticketsSold: (event.ticketsSold || 0) + quantity, updatedAt: now });
  }

  return { success: true, eventName: event.name, summary: { totalOrders: results.orders.length, totalTickets: results.tickets.length, totalRevenue: `$${(results.totalRevenue / 100).toFixed(2)}` }, orders: results.orders, tickets: results.tickets };
}

// Helper function for simulateTicketScanning
async function simulateTicketScanningInternal(ctx: any, args: { eventId: any; scanPercentage: number }) {
  const now = Date.now();
  const event = await ctx.db.get(args.eventId);
  if (!event) throw new Error("Event not found");

  const tickets = await ctx.db.query("tickets").withIndex("by_event", (q: any) => q.eq("eventId", args.eventId)).collect();
  const validTickets = tickets.filter((t: any) => t.status === "VALID");
  if (validTickets.length === 0) return { success: false, message: "No valid tickets to scan" };

  const staff = await ctx.db.query("eventStaff").filter((q: any) => q.and(q.eq(q.field("eventId"), args.eventId), q.eq(q.field("canScan"), true))).collect();
  const scanner = staff.length > 0 ? staff[0] : null;

  const numToScan = Math.floor(validTickets.length * (args.scanPercentage / 100));
  const shuffled = validTickets.sort(() => Math.random() - 0.5);
  const ticketsToScan = shuffled.slice(0, numToScan);

  const results: any = { scanned: [] };

  for (const ticket of ticketsToScan) {
    await ctx.db.patch(ticket._id, { status: "SCANNED", scannedAt: now - Math.floor(Math.random() * 60 * 60 * 1000), scannedBy: scanner?.staffUserId, updatedAt: now });
    results.scanned.push({ ticketCode: ticket.ticketCode, attendee: ticket.attendeeName });
  }

  return { success: true, eventName: event.name, summary: { totalTickets: tickets.length, validBefore: validTickets.length, scannedNow: results.scanned.length, remainingValid: validTickets.length - results.scanned.length } };
}

// Helper function to create test events internally
async function createTestEventsInternal(ctx: any, args: { organizerEmail?: string }) {
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;
  const oneWeek = 7 * oneDay;

  // Unsplash images for events
  const eventImages = [
    "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&h=800&fit=crop",
    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&h=800&fit=crop",
    "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&h=800&fit=crop",
  ];

  // Find or create organizer
  let organizer;
  if (args.organizerEmail) {
    organizer = await ctx.db.query("users").withIndex("by_email", (q: any) => q.eq("email", args.organizerEmail)).first();
  }

  if (!organizer) {
    // Check if test organizer already exists
    organizer = await ctx.db.query("users").withIndex("by_email", (q: any) => q.eq("email", "test-organizer@stepperslife.com")).first();

    if (!organizer) {
      const organizerId = await ctx.db.insert("users", {
        email: "test-organizer@stepperslife.com",
        name: "Test Event Organizer",
        role: "organizer",
        authProvider: "password",
        createdAt: now,
        updatedAt: now,
      });
      organizer = await ctx.db.get(organizerId);
    }
  }

  const results: any = {
    organizer: { id: organizer!._id, email: organizer!.email },
    events: [],
    bundles: [],
    discountCodes: [],
  };

  // Create 3 test events
  const eventConfigs = [
    {
      name: "Chicago Steppers Ball 2025",
      description: "The premier stepping event of the year! Join us for an elegant evening of dancing, networking, and celebration.",
      venue: "The Grand Ballroom",
      address: "500 N Michigan Ave",
      city: "Chicago",
      state: "IL",
      zipCode: "60611",
      daysFromNow: 14,
      capacity: 300,
      imageIdx: 0,
      tiers: [
        { name: "Early Bird", price: 2500, quantity: 100 },
        { name: "General Admission", price: 3500, quantity: 150 },
        { name: "VIP", price: 7500, quantity: 50 },
      ],
    },
    {
      name: "Summer Step Fest 2025",
      description: "Outdoor stepping festival with multiple DJs, food vendors, and dance competitions. Bring the whole family!",
      venue: "Millennium Park",
      address: "201 E Randolph St",
      city: "Chicago",
      state: "IL",
      zipCode: "60602",
      daysFromNow: 30,
      capacity: 500,
      imageIdx: 1,
      tiers: [
        { name: "General Admission", price: 2000, quantity: 400 },
        { name: "VIP Section", price: 5000, quantity: 100 },
      ],
    },
    {
      name: "Midwest Steppers Championship",
      description: "Competitive stepping showcase featuring the best steppers from across the Midwest. Prizes and recognition await!",
      venue: "Navy Pier Ballroom",
      address: "600 E Grand Ave",
      city: "Chicago",
      state: "IL",
      zipCode: "60611",
      daysFromNow: 60,
      capacity: 400,
      imageIdx: 2,
      tiers: [
        { name: "Spectator", price: 1500, quantity: 250 },
        { name: "Competitor Entry", price: 5000, quantity: 100 },
        { name: "VIP Judge's Table", price: 10000, quantity: 50 },
      ],
    },
  ];

  for (const config of eventConfigs) {
    const eventDate = now + config.daysFromNow * oneDay;

    const eventId = await ctx.db.insert("events", {
      name: config.name,
      description: config.description,
      organizerId: organizer!._id,
      organizerName: organizer!.name,
      eventType: "TICKETED_EVENT",
      categories: ["Set", "Social"],
      eventDateLiteral: new Date(eventDate).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }),
      eventTimeLiteral: "7:00 PM - 12:00 AM",
      eventTimezone: "America/Chicago",
      startDate: eventDate,
      endDate: eventDate + 5 * 60 * 60 * 1000,
      location: {
        venueName: config.venue,
        address: config.address,
        city: config.city,
        state: config.state,
        zipCode: config.zipCode,
        country: "USA",
      },
      imageUrl: eventImages[config.imageIdx],
      capacity: config.capacity,
      status: "PUBLISHED",
      ticketsVisible: true,
      paymentModelSelected: true,
      ticketsSold: 0,
      createdAt: now,
      updatedAt: now,
    });

    const tierIds: any[] = [];

    // Create ticket tiers
    for (const tier of config.tiers) {
      const tierId = await ctx.db.insert("ticketTiers", {
        eventId: eventId,
        name: tier.name,
        description: `${tier.name} access to ${config.name}`,
        price: tier.price,
        quantity: tier.quantity,
        sold: 0,
        isActive: true,
        version: 1,
        createdAt: now,
        updatedAt: now,
      });
      tierIds.push({ id: tierId, name: tier.name, price: tier.price, quantity: tier.quantity });
    }

    // Create FREE discount code for testing
    await ctx.db.insert("discountCodes", {
      code: "FREE",
      eventId: eventId,
      organizerId: organizer!._id,
      discountType: "PERCENTAGE",
      discountValue: 100,
      usedCount: 0,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    // Create EARLYBIRD15 discount code
    await ctx.db.insert("discountCodes", {
      code: "EARLYBIRD15",
      eventId: eventId,
      organizerId: organizer!._id,
      discountType: "PERCENTAGE",
      discountValue: 15,
      maxUses: 50,
      usedCount: 0,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    results.events.push({
      id: eventId,
      name: config.name,
      date: new Date(eventDate).toLocaleDateString(),
      tiers: tierIds,
    });

    results.discountCodes.push(
      { code: "FREE", event: config.name, type: "100% off (testing)" },
      { code: "EARLYBIRD15", event: config.name, type: "15% off" }
    );
  }

  return {
    success: true,
    message: `Created ${results.events.length} test events with ticket tiers and discount codes`,
    details: results,
    testingInstructions: {
      step1: "View events at /events",
      step2: "Click on an event to see ticket options",
      step3: "Use code 'FREE' at checkout for free testing",
      step4: "Use code 'EARLYBIRD15' for 15% discount",
    },
  };
}
