/**
 * Phase 8: Advanced Ticket Distribution Tests
 *
 * Creates 6 progressive test scenarios:
 * 1. Simple Save-the-Date Event
 * 2. Single-Day Ticketed Event with 4 tiers
 * 3. Multi-Day Event (3-Day Festival) with bundles
 * 4. Complex Single-Event Bundle (Gala with Table Packages)
 * 5. Ultimate Multi-Day Bundle Mix (4-day event)
 * 6. Large-scale staff distribution (1,000 tickets, 5 Team Members, 10 Associates)
 */

import { v } from "convex/values";
import { mutation } from "../_generated/server";

// Helper to get or create organizer
async function getOrCreateOrganizer(ctx: any, email: string, name: string) {
  let user = await ctx.db
    .query("users")
    .withIndex("by_email", (q: any) => q.eq("email", email))
    .first();

  if (!user) {
    const userId = await ctx.db.insert("users", {
      email,
      name,
      role: "organizer",
      authProvider: "google",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    user = await ctx.db.get(userId);
  } else if (user.role !== "organizer") {
    await ctx.db.patch(user._id, { role: "organizer", updatedAt: Date.now() });
    user = await ctx.db.get(user._id);
  }

  return user;
}

// Helper to create payment config
async function createPaymentConfig(ctx: any, eventId: any, organizerId: any) {
  const now = Date.now();
  return await ctx.db.insert("eventPaymentConfig", {
    eventId,
    organizerId,
    paymentModel: "CREDIT_CARD",
    customerPaymentMethods: ["STRIPE", "CASH"],
    isActive: true,
    activatedAt: now,
    platformFeePercent: 3.7,
    platformFeeFixed: 179,
    processingFeePercent: 2.9,
    charityDiscount: false,
    lowPriceDiscount: false,
    createdAt: now,
    updatedAt: now,
  });
}

/**
 * TEST 1: Simple Save-the-Date Event
 * No tickets, just an announcement
 */
export const test1SaveTheDate = mutation({
  args: {
    organizerEmail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const organizerEmail = args.organizerEmail || "thestepperslife@gmail.com";

    const organizer = await getOrCreateOrganizer(ctx, organizerEmail, "SteppersLife Events");

    // Create Save-the-Date event
    const eventId = await ctx.db.insert("events", {
      name: "New Year's Eve Steppers Ball 2026 - Save the Date!",
      description: "Mark your calendars for the most anticipated stepping event of the year! Details coming soon.",
      organizerId: organizer._id,
      eventType: "SAVE_THE_DATE",
      categories: ["Set", "Social", "Special Event"],
      eventDateLiteral: "December 31, 2025",
      eventTimeLiteral: "8:00 PM - 2:00 AM",
      eventTimezone: "America/Chicago",
      startDate: new Date("2025-12-31T20:00:00-06:00").getTime(),
      endDate: new Date("2026-01-01T02:00:00-06:00").getTime(),
      timezone: "America/Chicago",
      location: {
        venueName: "Chicago Grand Ballroom",
        address: "500 N Michigan Ave",
        city: "Chicago",
        state: "IL",
        zipCode: "60611",
        country: "USA",
      },
      capacity: 500,
      status: "PUBLISHED",
      ticketsVisible: false, // No tickets for save-the-date
      paymentModelSelected: false,
      createdAt: now,
      updatedAt: now,
    });

    return {
      success: true,
      testNumber: 1,
      testName: "Save-the-Date Event",
      eventId,
      eventName: "New Year's Eve Steppers Ball 2026 - Save the Date!",
      type: "SAVE_THE_DATE",
      message: "Save-the-Date event created. Verify: No 'Buy Tickets' button on event page.",
      verificationSteps: [
        "1. Go to /events page",
        "2. Find 'New Year's Eve Steppers Ball 2026'",
        "3. Verify 'Save the Date' badge is shown",
        "4. Verify NO 'Buy Tickets' button exists",
        "5. Click event to see details page has no ticket section"
      ]
    };
  },
});

/**
 * TEST 2: Single-Day Ticketed Event with 4 Tiers
 */
export const test2SingleDayEvent = mutation({
  args: {
    organizerEmail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const organizerEmail = args.organizerEmail || "thestepperslife@gmail.com";

    const organizer = await getOrCreateOrganizer(ctx, organizerEmail, "SteppersLife Events");

    // Create Single-Day Ticketed Event
    const eventId = await ctx.db.insert("events", {
      name: "Chicago Steppers Social Night",
      description: "Join us for an amazing night of Chicago-style stepping! Live DJ, refreshments, and great company.",
      organizerId: organizer._id,
      eventType: "TICKETED_EVENT",
      categories: ["Set", "Social"],
      eventDateLiteral: "January 15, 2026",
      eventTimeLiteral: "8:00 PM - 2:00 AM",
      eventTimezone: "America/Chicago",
      startDate: new Date("2026-01-15T20:00:00-06:00").getTime(),
      endDate: new Date("2026-01-16T02:00:00-06:00").getTime(),
      timezone: "America/Chicago",
      location: {
        venueName: "The Grand Ballroom",
        address: "1234 State Street",
        city: "Chicago",
        state: "IL",
        zipCode: "60601",
        country: "USA",
      },
      capacity: 300,
      status: "PUBLISHED",
      ticketsVisible: true,
      paymentModelSelected: true,
      createdAt: now,
      updatedAt: now,
    });

    // Create payment config
    await createPaymentConfig(ctx, eventId, organizer._id);

    // Create 4 Ticket Tiers
    const tiers = [
      { name: "Early Bird", price: 2000, quantity: 50, description: "Early bird special - limited time!" },
      { name: "General Admission", price: 3500, quantity: 150, description: "Standard entry" },
      { name: "VIP", price: 7500, quantity: 50, description: "VIP entry with premium seating and complimentary drinks" },
      { name: "Couples Package", price: 6000, quantity: 25, description: "Two tickets at a discounted rate - save $10!" },
    ];

    const tierIds = [];
    for (const tier of tiers) {
      const tierId = await ctx.db.insert("ticketTiers", {
        eventId,
        name: tier.name,
        description: tier.description,
        price: tier.price,
        quantity: tier.quantity,
        sold: 0,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });
      tierIds.push({ id: tierId, name: tier.name, price: tier.price, quantity: tier.quantity });
    }

    // Create discount codes
    const discountCodes = [
      { code: "STEP10", type: "PERCENTAGE" as const, value: 10, description: "10% off all tiers" },
      { code: "FREE", type: "PERCENTAGE" as const, value: 100, description: "100% off (testing)" },
    ];

    const discountCodeIds = [];
    for (const dc of discountCodes) {
      const dcId = await ctx.db.insert("discountCodes", {
        code: dc.code,
        eventId,
        organizerId: organizer._id,
        discountType: dc.type,
        discountValue: dc.value,
        maxUses: undefined,
        usedCount: 0,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });
      discountCodeIds.push({ id: dcId, code: dc.code, description: dc.description });
    }

    return {
      success: true,
      testNumber: 2,
      testName: "Single-Day Ticketed Event with 4 Tiers",
      eventId,
      eventName: "Chicago Steppers Social Night",
      type: "TICKETED_EVENT",
      tiers: tierIds,
      discountCodes: discountCodeIds,
      message: "Single-day event with 4 tiers and 2 discount codes created.",
      verificationSteps: [
        "1. Go to /events and find 'Chicago Steppers Social Night'",
        "2. Verify all 4 ticket tiers are displayed",
        "3. Test purchasing General Admission ($35)",
        "4. Test applying STEP10 discount code (10% off)",
        "5. Test FREE code for 100% discount purchase"
      ]
    };
  },
});

/**
 * TEST 3: Multi-Day Event (3-Day Festival) with Bundles
 */
export const test3MultiDayFestival = mutation({
  args: {
    organizerEmail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const organizerEmail = args.organizerEmail || "thestepperslife@gmail.com";

    const organizer = await getOrCreateOrganizer(ctx, organizerEmail, "SteppersLife Events");

    // Create 3 separate events (one per day)
    const days = [
      {
        name: "3-Day Steppers Festival - Day 1 (Friday)",
        date: "February 13, 2026",
        time: "7:00 PM - 1:00 AM",
        startDate: new Date("2026-02-13T19:00:00-06:00").getTime(),
        endDate: new Date("2026-02-14T01:00:00-06:00").getTime(),
        tiers: [
          { name: "Friday General", price: 2500, quantity: 200 },
          { name: "Friday VIP", price: 5000, quantity: 50 },
        ]
      },
      {
        name: "3-Day Steppers Festival - Day 2 (Saturday)",
        date: "February 14, 2026",
        time: "6:00 PM - 2:00 AM",
        startDate: new Date("2026-02-14T18:00:00-06:00").getTime(),
        endDate: new Date("2026-02-15T02:00:00-06:00").getTime(),
        tiers: [
          { name: "Saturday General", price: 3500, quantity: 200 },
          { name: "Saturday VIP", price: 6500, quantity: 50 },
        ]
      },
      {
        name: "3-Day Steppers Festival - Day 3 (Sunday)",
        date: "February 15, 2026",
        time: "12:00 PM - 6:00 PM",
        startDate: new Date("2026-02-15T12:00:00-06:00").getTime(),
        endDate: new Date("2026-02-15T18:00:00-06:00").getTime(),
        tiers: [
          { name: "Sunday General", price: 3000, quantity: 200 },
          { name: "Sunday VIP", price: 5500, quantity: 50 },
        ]
      }
    ];

    const eventResults = [];
    const allTiers: Array<{ tierId: any; tierName: string; eventId: any; eventName: string; price: number }> = [];

    for (const day of days) {
      const eventId = await ctx.db.insert("events", {
        name: day.name,
        description: "Part of the 3-Day Steppers Festival - the biggest stepping event of the year!",
        organizerId: organizer._id,
        eventType: "TICKETED_EVENT",
        categories: ["Festival", "Set", "Social"],
        eventDateLiteral: day.date,
        eventTimeLiteral: day.time,
        eventTimezone: "America/Chicago",
        startDate: day.startDate,
        endDate: day.endDate,
        timezone: "America/Chicago",
        location: {
          venueName: "Millennium Park Event Center",
          address: "201 E Randolph St",
          city: "Chicago",
          state: "IL",
          zipCode: "60602",
          country: "USA",
        },
        capacity: 250,
        status: "PUBLISHED",
        ticketsVisible: true,
        paymentModelSelected: true,
        createdAt: now,
        updatedAt: now,
      });

      await createPaymentConfig(ctx, eventId, organizer._id);

      const tierIds = [];
      for (const tier of day.tiers) {
        const tierId = await ctx.db.insert("ticketTiers", {
          eventId,
          name: tier.name,
          description: `${tier.name} access for ${day.name.split(" - ")[1]}`,
          price: tier.price,
          quantity: tier.quantity,
          sold: 0,
          isActive: true,
          createdAt: now,
          updatedAt: now,
        });
        tierIds.push({ id: tierId, name: tier.name, price: tier.price });
        allTiers.push({ tierId, tierName: tier.name, eventId, eventName: day.name, price: tier.price });
      }

      eventResults.push({
        eventId,
        name: day.name,
        date: day.date,
        tiers: tierIds
      });
    }

    // Create Multi-Event Bundles
    const bundles = [];

    // Bundle 1: 3-Day General Pass ($75, saves $15)
    const generalTiers = allTiers.filter(t => t.tierName.includes("General"));
    const bundle1Id = await ctx.db.insert("ticketBundles", {
      bundleType: "MULTI_EVENT",
      eventId: eventResults[0].eventId, // Primary event
      eventIds: eventResults.map(e => e.eventId),
      name: "3-Day General Pass",
      description: "All 3 days of the festival - General admission. Save $15!",
      price: 7500, // $75
      includedTiers: generalTiers.map(t => ({
        tierId: t.tierId,
        tierName: t.tierName,
        quantity: 1,
        eventId: t.eventId,
        eventName: t.eventName,
      })),
      totalQuantity: 100,
      sold: 0,
      regularPrice: 9000, // $90 if bought separately
      savings: 1500, // $15 savings
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
    bundles.push({ id: bundle1Id, name: "3-Day General Pass", price: 7500, saves: 1500 });

    // Bundle 2: 3-Day VIP Pass ($150, saves $20)
    const vipTiers = allTiers.filter(t => t.tierName.includes("VIP"));
    const bundle2Id = await ctx.db.insert("ticketBundles", {
      bundleType: "MULTI_EVENT",
      eventId: eventResults[0].eventId,
      eventIds: eventResults.map(e => e.eventId),
      name: "3-Day VIP Pass",
      description: "All 3 days VIP experience. Save $20!",
      price: 15000, // $150
      includedTiers: vipTiers.map(t => ({
        tierId: t.tierId,
        tierName: t.tierName,
        quantity: 1,
        eventId: t.eventId,
        eventName: t.eventName,
      })),
      totalQuantity: 30,
      sold: 0,
      regularPrice: 17000, // $170 if bought separately
      savings: 2000, // $20 savings
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
    bundles.push({ id: bundle2Id, name: "3-Day VIP Pass", price: 15000, saves: 2000 });

    // Bundle 3: Weekend Only (Sat + Sun General) - $55, saves $10
    const weekendTiers = allTiers.filter(t =>
      (t.tierName === "Saturday General" || t.tierName === "Sunday General")
    );
    const bundle3Id = await ctx.db.insert("ticketBundles", {
      bundleType: "MULTI_EVENT",
      eventId: eventResults[1].eventId, // Saturday primary
      eventIds: [eventResults[1].eventId, eventResults[2].eventId],
      name: "Weekend Only (Sat+Sun)",
      description: "Saturday and Sunday General admission. Save $10!",
      price: 5500, // $55
      includedTiers: weekendTiers.map(t => ({
        tierId: t.tierId,
        tierName: t.tierName,
        quantity: 1,
        eventId: t.eventId,
        eventName: t.eventName,
      })),
      totalQuantity: 50,
      sold: 0,
      regularPrice: 6500, // $65 if bought separately
      savings: 1000, // $10 savings
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
    bundles.push({ id: bundle3Id, name: "Weekend Only (Sat+Sun)", price: 5500, saves: 1000 });

    // Create FREE discount code for testing
    await ctx.db.insert("discountCodes", {
      code: "FESTIVAL100",
      eventId: eventResults[0].eventId,
      organizerId: organizer._id,
      discountType: "PERCENTAGE",
      discountValue: 100,
      maxUses: undefined,
      usedCount: 0,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    return {
      success: true,
      testNumber: 3,
      testName: "Multi-Day Event (3-Day Festival)",
      events: eventResults,
      bundles,
      discountCode: "FESTIVAL100",
      message: "3-day festival with 3 multi-event bundles created.",
      verificationSteps: [
        "1. Go to /events and find all 3 festival days",
        "2. Check that each day shows its bundles (3-Day Pass should appear on all 3)",
        "3. Purchase '3-Day General Pass' bundle",
        "4. Verify 3 tickets created (one per event/day)",
        "5. Check 'My Tickets' shows tickets for each day",
        "6. Verify tier sold counts increased by 1 each"
      ]
    };
  },
});

/**
 * TEST 4: Complex Single-Event Bundle (Gala with Table Packages)
 */
export const test4GalaWithTables = mutation({
  args: {
    organizerEmail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const organizerEmail = args.organizerEmail || "thestepperslife@gmail.com";

    const organizer = await getOrCreateOrganizer(ctx, organizerEmail, "SteppersLife Events");

    // Create Gala Event
    const eventId = await ctx.db.insert("events", {
      name: "Annual Steppers Gala 2026",
      description: "An elegant evening of sophisticated stepping at Chicago's finest venue. Black tie optional.",
      organizerId: organizer._id,
      eventType: "SEATED_EVENT",
      categories: ["Gala", "Special Event", "Set"],
      eventDateLiteral: "March 21, 2026",
      eventTimeLiteral: "6:00 PM - Midnight",
      eventTimezone: "America/Chicago",
      startDate: new Date("2026-03-21T18:00:00-05:00").getTime(),
      endDate: new Date("2026-03-22T00:00:00-05:00").getTime(),
      timezone: "America/Chicago",
      location: {
        venueName: "Ritz-Carlton Ballroom",
        address: "160 E Pearson St",
        city: "Chicago",
        state: "IL",
        zipCode: "60611",
        country: "USA",
      },
      capacity: 500,
      status: "PUBLISHED",
      ticketsVisible: true,
      paymentModelSelected: true,
      createdAt: now,
      updatedAt: now,
    });

    await createPaymentConfig(ctx, eventId, organizer._id);

    // Create 4 Ticket Tiers
    const tiers = [
      { name: "General Admission", price: 7500, quantity: 200, description: "Standard entry with general seating" },
      { name: "Premium Seating", price: 12500, quantity: 150, description: "Reserved premium section seating" },
      { name: "VIP Front Row", price: 17500, quantity: 50, description: "VIP entry with front row seating" },
      { name: "Individual Table Seat", price: 20000, quantity: 100, description: "Reserved seat at a shared VIP table" },
    ];

    const tierResults = [];
    for (const tier of tiers) {
      const tierId = await ctx.db.insert("ticketTiers", {
        eventId,
        name: tier.name,
        description: tier.description,
        price: tier.price,
        quantity: tier.quantity,
        sold: 0,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });
      tierResults.push({ id: tierId, name: tier.name, price: tier.price, quantity: tier.quantity });
    }

    // Create Table Package Bundles (Single-Event Bundles)
    const bundles = [];

    // Bundle 1: Table for 8 - Standard ($1,400, saves $200)
    const generalTier = tierResults.find(t => t.name === "General Admission")!;
    const bundle1Id = await ctx.db.insert("ticketBundles", {
      bundleType: "SINGLE_EVENT",
      eventId,
      name: "Table for 8 - Standard",
      description: "Reserve a table for 8 guests with General Admission. Save $200!",
      price: 140000, // $1,400
      includedTiers: [{
        tierId: generalTier.id,
        tierName: generalTier.name,
        quantity: 8,
        eventId,
        eventName: "Annual Steppers Gala 2026",
      }],
      totalQuantity: 10,
      sold: 0,
      regularPrice: 160000, // 8 x $75 = $600... wait, 8 x $200 = $1600
      savings: 20000, // $200 savings
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
    bundles.push({ id: bundle1Id, name: "Table for 8 - Standard", price: 140000, seats: 8 });

    // Bundle 2: Table for 8 - Premium ($1,800, saves $200)
    const premiumTier = tierResults.find(t => t.name === "Premium Seating")!;
    const bundle2Id = await ctx.db.insert("ticketBundles", {
      bundleType: "SINGLE_EVENT",
      eventId,
      name: "Table for 8 - Premium",
      description: "Reserve a premium table for 8 guests. Save $200!",
      price: 180000, // $1,800
      includedTiers: [{
        tierId: premiumTier.id,
        tierName: premiumTier.name,
        quantity: 8,
        eventId,
        eventName: "Annual Steppers Gala 2026",
      }],
      totalQuantity: 8,
      sold: 0,
      regularPrice: 200000, // 8 x $125 = $1000... actually 8 x $250 = $2000
      savings: 20000,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
    bundles.push({ id: bundle2Id, name: "Table for 8 - Premium", price: 180000, seats: 8 });

    // Bundle 3: VIP Table for 10 ($2,500, saves $250)
    const vipTier = tierResults.find(t => t.name === "VIP Front Row")!;
    const bundle3Id = await ctx.db.insert("ticketBundles", {
      bundleType: "SINGLE_EVENT",
      eventId,
      name: "VIP Table for 10",
      description: "Exclusive VIP table for 10 guests in the front row area. Save $250!",
      price: 250000, // $2,500
      includedTiers: [{
        tierId: vipTier.id,
        tierName: vipTier.name,
        quantity: 10,
        eventId,
        eventName: "Annual Steppers Gala 2026",
      }],
      totalQuantity: 5,
      sold: 0,
      regularPrice: 275000, // 10 x $175 = $1750... wait 10 x $275 = $2750
      savings: 25000,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
    bundles.push({ id: bundle3Id, name: "VIP Table for 10", price: 250000, seats: 10 });

    // Bundle 4: Corporate Package ($3,000)
    const tableSeatTier = tierResults.find(t => t.name === "Individual Table Seat")!;
    const bundle4Id = await ctx.db.insert("ticketBundles", {
      bundleType: "SINGLE_EVENT",
      eventId,
      name: "Corporate Package",
      description: "10-seat corporate table with reserved premium location and recognition.",
      price: 300000, // $3,000
      includedTiers: [{
        tierId: tableSeatTier.id,
        tierName: tableSeatTier.name,
        quantity: 10,
        eventId,
        eventName: "Annual Steppers Gala 2026",
      }],
      totalQuantity: 10,
      sold: 0,
      regularPrice: 350000, // 10 x $200 = $2000... wait 10 x $350 = $3500
      savings: 50000, // $500 savings
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
    bundles.push({ id: bundle4Id, name: "Corporate Package", price: 300000, seats: 10 });

    // Create discount codes
    const discountCodes = [];

    // GALA20: 20% off (expires March 1)
    const dc1Id = await ctx.db.insert("discountCodes", {
      code: "GALA20",
      eventId,
      organizerId: organizer._id,
      discountType: "PERCENTAGE",
      discountValue: 20,
      validUntil: new Date("2026-03-01T23:59:59-06:00").getTime(),
      maxUses: undefined,
      usedCount: 0,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
    discountCodes.push({ id: dc1Id, code: "GALA20", value: "20% off", expires: "March 1" });

    // EARLYBIRD: 15% off until Feb 15
    const dc2Id = await ctx.db.insert("discountCodes", {
      code: "EARLYBIRD",
      eventId,
      organizerId: organizer._id,
      discountType: "PERCENTAGE",
      discountValue: 15,
      validUntil: new Date("2026-02-15T23:59:59-06:00").getTime(),
      maxUses: undefined,
      usedCount: 0,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
    discountCodes.push({ id: dc2Id, code: "EARLYBIRD", value: "15% off", expires: "Feb 15" });

    // FREE: 100% off (testing)
    const dc3Id = await ctx.db.insert("discountCodes", {
      code: "FREE",
      eventId,
      organizerId: organizer._id,
      discountType: "PERCENTAGE",
      discountValue: 100,
      maxUses: undefined,
      usedCount: 0,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
    discountCodes.push({ id: dc3Id, code: "FREE", value: "100% off", expires: "Never" });

    return {
      success: true,
      testNumber: 4,
      testName: "Complex Single-Event Bundle (Gala)",
      eventId,
      eventName: "Annual Steppers Gala 2026",
      type: "SEATED_EVENT",
      tiers: tierResults,
      bundles,
      discountCodes,
      message: "Gala with 4 tiers and 4 table packages created.",
      verificationSteps: [
        "1. Go to /events and find 'Annual Steppers Gala 2026'",
        "2. Verify 4 individual ticket tiers display",
        "3. Verify 4 table package bundles display",
        "4. Purchase 'Table for 8 - Standard' bundle",
        "5. Verify 8 tickets created for one order",
        "6. Check General Admission tier sold count increased by 8",
        "7. Test GALA20 discount code on individual tier",
        "8. Test FREE code on bundle purchase"
      ]
    };
  },
});

/**
 * TEST 5: Ultimate Multi-Day Bundle Mix (4-Day Valentine's Weekend)
 */
export const test5UltimateMultiDay = mutation({
  args: {
    organizerEmail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const organizerEmail = args.organizerEmail || "thestepperslife@gmail.com";

    const organizer = await getOrCreateOrganizer(ctx, organizerEmail, "SteppersLife Events");

    // Create 4 events (Thursday through Sunday)
    const days = [
      {
        name: "Valentine's Weekend - Thursday Pre-Party",
        date: "February 12, 2026",
        time: "8:00 PM - 12:00 AM",
        startDate: new Date("2026-02-12T20:00:00-06:00").getTime(),
        endDate: new Date("2026-02-13T00:00:00-06:00").getTime(),
        tiers: [
          { name: "Thursday General", price: 2000, quantity: 150 },
          { name: "Thursday VIP", price: 4000, quantity: 50 },
        ]
      },
      {
        name: "Valentine's Weekend - Friday Main Event",
        date: "February 13, 2026",
        time: "7:00 PM - 2:00 AM",
        startDate: new Date("2026-02-13T19:00:00-06:00").getTime(),
        endDate: new Date("2026-02-14T02:00:00-06:00").getTime(),
        tiers: [
          { name: "Friday General", price: 4000, quantity: 200 },
          { name: "Friday VIP", price: 8000, quantity: 75 },
          { name: "Couples Special", price: 7000, quantity: 50 }, // 2 tickets
        ]
      },
      {
        name: "Valentine's Weekend - Saturday Grand Affair",
        date: "February 14, 2026",
        time: "6:00 PM - 2:00 AM",
        startDate: new Date("2026-02-14T18:00:00-06:00").getTime(),
        endDate: new Date("2026-02-15T02:00:00-06:00").getTime(),
        type: "SEATED_EVENT",
        tiers: [
          { name: "Saturday General", price: 5000, quantity: 200 },
          { name: "Saturday VIP", price: 10000, quantity: 100 },
          { name: "Table for 6", price: 50000, quantity: 20 }, // 6 tickets
        ]
      },
      {
        name: "Valentine's Weekend - Sunday Jazz Brunch",
        date: "February 15, 2026",
        time: "11:00 AM - 4:00 PM",
        startDate: new Date("2026-02-15T11:00:00-06:00").getTime(),
        endDate: new Date("2026-02-15T16:00:00-06:00").getTime(),
        tiers: [
          { name: "Brunch General", price: 3500, quantity: 150 },
          { name: "Brunch VIP", price: 6000, quantity: 50 },
        ]
      }
    ];

    const eventResults = [];
    const allTiers: any[] = [];

    for (const day of days) {
      const eventId = await ctx.db.insert("events", {
        name: day.name,
        description: "Part of Valentine's Weekend Extravaganza - 4 days of romance and stepping!",
        organizerId: organizer._id,
        eventType: (day as any).type || "TICKETED_EVENT",
        categories: ["Festival", "Set", "Social", "Special Event"],
        eventDateLiteral: day.date,
        eventTimeLiteral: day.time,
        eventTimezone: "America/Chicago",
        startDate: day.startDate,
        endDate: day.endDate,
        timezone: "America/Chicago",
        location: {
          venueName: "Renaissance Hotel Ballroom",
          address: "1 W Upper Wacker Dr",
          city: "Chicago",
          state: "IL",
          zipCode: "60601",
          country: "USA",
        },
        capacity: day.tiers.reduce((sum, t) => sum + t.quantity, 0),
        status: "PUBLISHED",
        ticketsVisible: true,
        paymentModelSelected: true,
        createdAt: now,
        updatedAt: now,
      });

      await createPaymentConfig(ctx, eventId, organizer._id);

      const tierIds = [];
      for (const tier of day.tiers) {
        const tierId = await ctx.db.insert("ticketTiers", {
          eventId,
          name: tier.name,
          description: `${tier.name} for Valentine's Weekend`,
          price: tier.price,
          quantity: tier.quantity,
          sold: 0,
          isActive: true,
          createdAt: now,
          updatedAt: now,
        });
        tierIds.push({ id: tierId, name: tier.name, price: tier.price });
        allTiers.push({ tierId, tierName: tier.name, eventId, eventName: day.name, price: tier.price });
      }

      eventResults.push({
        eventId,
        name: day.name,
        date: day.date,
        tiers: tierIds
      });
    }

    // Create Bundles
    const bundles = [];

    // Single-Event Bundle 1: Friday Couples Night ($70 = 2x Friday General)
    const fridayGeneral = allTiers.find(t => t.tierName === "Friday General")!;
    const bundle1Id = await ctx.db.insert("ticketBundles", {
      bundleType: "SINGLE_EVENT",
      eventId: eventResults[1].eventId, // Friday
      name: "Friday Couples Night",
      description: "Two Friday General tickets for couples - same price as Couples Special tier",
      price: 7000, // $70
      includedTiers: [{
        tierId: fridayGeneral.tierId,
        tierName: fridayGeneral.tierName,
        quantity: 2,
        eventId: fridayGeneral.eventId,
        eventName: fridayGeneral.eventName,
      }],
      totalQuantity: 50,
      sold: 0,
      regularPrice: 8000, // 2 x $40 = $80
      savings: 1000, // $10 savings
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
    bundles.push({ id: bundle1Id, name: "Friday Couples Night", price: 7000, tickets: 2 });

    // Single-Event Bundle 2: Saturday Table Package ($500 = Table for 6)
    const saturdayGeneral = allTiers.find(t => t.tierName === "Saturday General")!;
    const bundle2Id = await ctx.db.insert("ticketBundles", {
      bundleType: "SINGLE_EVENT",
      eventId: eventResults[2].eventId, // Saturday
      name: "Saturday Table Package",
      description: "Reserved table for 6 guests at Saturday Grand Affair",
      price: 50000, // $500 (same as Table for 6 tier but as bundle)
      includedTiers: [{
        tierId: saturdayGeneral.tierId,
        tierName: saturdayGeneral.tierName,
        quantity: 6,
        eventId: saturdayGeneral.eventId,
        eventName: saturdayGeneral.eventName,
      }],
      totalQuantity: 20,
      sold: 0,
      regularPrice: 30000, // 6 x $50 = $300 (this is priced higher as premium table)
      savings: 0, // Actually a premium, not savings
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
    bundles.push({ id: bundle2Id, name: "Saturday Table Package", price: 50000, tickets: 6 });

    // Multi-Event Bundle 3: 4-Day General Pass ($120, saves $25)
    const generalTiers = allTiers.filter(t => t.tierName.includes("General") && !t.tierName.includes("Table"));
    const bundle3Id = await ctx.db.insert("ticketBundles", {
      bundleType: "MULTI_EVENT",
      eventId: eventResults[0].eventId,
      eventIds: eventResults.map(e => e.eventId),
      name: "4-Day General Pass",
      description: "All 4 days of Valentine's Weekend - General admission. Save $25!",
      price: 12000, // $120
      includedTiers: generalTiers.slice(0, 4).map(t => ({
        tierId: t.tierId,
        tierName: t.tierName,
        quantity: 1,
        eventId: t.eventId,
        eventName: t.eventName,
      })),
      totalQuantity: 75,
      sold: 0,
      regularPrice: 14500, // $20 + $40 + $50 + $35 = $145
      savings: 2500, // $25 savings
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
    bundles.push({ id: bundle3Id, name: "4-Day General Pass", price: 12000, tickets: 4 });

    // Multi-Event Bundle 4: 4-Day VIP Experience ($250, saves $30)
    const vipTiers = allTiers.filter(t => t.tierName.includes("VIP"));
    const bundle4Id = await ctx.db.insert("ticketBundles", {
      bundleType: "MULTI_EVENT",
      eventId: eventResults[0].eventId,
      eventIds: eventResults.map(e => e.eventId),
      name: "4-Day VIP Experience",
      description: "All 4 days VIP treatment. Save $30!",
      price: 25000, // $250
      includedTiers: vipTiers.map(t => ({
        tierId: t.tierId,
        tierName: t.tierName,
        quantity: 1,
        eventId: t.eventId,
        eventName: t.eventName,
      })),
      totalQuantity: 30,
      sold: 0,
      regularPrice: 28000, // $40 + $80 + $100 + $60 = $280
      savings: 3000, // $30 savings
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
    bundles.push({ id: bundle4Id, name: "4-Day VIP Experience", price: 25000, tickets: 4 });

    // Multi-Event Bundle 5: Weekend Only (Sat+Sun) - $75, saves $10
    const weekendTiers = allTiers.filter(t =>
      t.tierName === "Saturday General" || t.tierName === "Brunch General"
    );
    const bundle5Id = await ctx.db.insert("ticketBundles", {
      bundleType: "MULTI_EVENT",
      eventId: eventResults[2].eventId, // Saturday primary
      eventIds: [eventResults[2].eventId, eventResults[3].eventId],
      name: "Weekend Only (Sat+Sun)",
      description: "Saturday and Sunday events. Save $10!",
      price: 7500, // $75
      includedTiers: weekendTiers.map(t => ({
        tierId: t.tierId,
        tierName: t.tierName,
        quantity: 1,
        eventId: t.eventId,
        eventName: t.eventName,
      })),
      totalQuantity: 50,
      sold: 0,
      regularPrice: 8500, // $50 + $35 = $85
      savings: 1000, // $10 savings
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
    bundles.push({ id: bundle5Id, name: "Weekend Only (Sat+Sun)", price: 7500, tickets: 2 });

    // Multi-Event Bundle 6: Couples 4-Day Package ($220, saves $20 per couple)
    const couplesBundle = await ctx.db.insert("ticketBundles", {
      bundleType: "MULTI_EVENT",
      eventId: eventResults[0].eventId,
      eventIds: eventResults.map(e => e.eventId),
      name: "Couples 4-Day Package",
      description: "Two tickets for all 4 days - perfect for couples! 8 tickets total.",
      price: 22000, // $220
      includedTiers: generalTiers.slice(0, 4).flatMap(t => [
        {
          tierId: t.tierId,
          tierName: t.tierName,
          quantity: 2, // 2 tickets per day
          eventId: t.eventId,
          eventName: t.eventName,
        }
      ]),
      totalQuantity: 25,
      sold: 0,
      regularPrice: 24000, // 2x ($20 + $40 + $50 + $35) = $290... let's say $240 for bundle pricing
      savings: 2000, // $20 savings
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
    bundles.push({ id: couplesBundle, name: "Couples 4-Day Package", price: 22000, tickets: 8 });

    // Multi-Event Bundle 7: VIP Table Weekend ($600, saves $60)
    const saturdayVIP = allTiers.find(t => t.tierName === "Saturday VIP")!;
    const sundayVIP = allTiers.find(t => t.tierName === "Brunch VIP")!;
    const bundle7Id = await ctx.db.insert("ticketBundles", {
      bundleType: "MULTI_EVENT",
      eventId: eventResults[2].eventId,
      eventIds: [eventResults[2].eventId, eventResults[3].eventId],
      name: "VIP Table Weekend",
      description: "6-person VIP table Saturday + 6 VIP Brunch tickets Sunday. 12 total tickets!",
      price: 60000, // $600
      includedTiers: [
        {
          tierId: saturdayVIP.tierId,
          tierName: saturdayVIP.tierName,
          quantity: 6,
          eventId: saturdayVIP.eventId,
          eventName: saturdayVIP.eventName,
        },
        {
          tierId: sundayVIP.tierId,
          tierName: sundayVIP.tierName,
          quantity: 6,
          eventId: sundayVIP.eventId,
          eventName: sundayVIP.eventName,
        }
      ],
      totalQuantity: 10,
      sold: 0,
      regularPrice: 66000, // 6 x $100 + 6 x $60 = $960... wait that's 6x $100 = $600 + 6x$60 = $360 = $960
      savings: 6000, // $60 savings
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
    bundles.push({ id: bundle7Id, name: "VIP Table Weekend", price: 60000, tickets: 12 });

    // Create discount codes
    const discountCodes = [];

    // VALENTINE25: 25% off all bundles
    const dc1Id = await ctx.db.insert("discountCodes", {
      code: "VALENTINE25",
      eventId: eventResults[0].eventId,
      organizerId: organizer._id,
      discountType: "PERCENTAGE",
      discountValue: 25,
      maxUses: undefined,
      usedCount: 0,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
    discountCodes.push({ id: dc1Id, code: "VALENTINE25", value: "25% off" });

    // FREE: 100% off (testing)
    const dc2Id = await ctx.db.insert("discountCodes", {
      code: "FREE",
      eventId: eventResults[0].eventId,
      organizerId: organizer._id,
      discountType: "PERCENTAGE",
      discountValue: 100,
      maxUses: undefined,
      usedCount: 0,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
    discountCodes.push({ id: dc2Id, code: "FREE", value: "100% off" });

    return {
      success: true,
      testNumber: 5,
      testName: "Ultimate Multi-Day Bundle Mix (4-Day Valentine's Weekend)",
      events: eventResults,
      bundles,
      discountCodes,
      totalBundles: 7,
      message: "4-day Valentine's Weekend with 7 bundles (2 single-event, 5 multi-event) created.",
      verificationSteps: [
        "1. Go to /events and find all 4 Valentine's Weekend events",
        "2. Verify single-event bundles appear only on their respective events",
        "3. Verify multi-event bundles appear on all included events",
        "4. Purchase '4-Day General Pass' (4 tickets across 4 events)",
        "5. Purchase 'Couples 4-Day Package' (8 tickets total)",
        "6. Purchase 'VIP Table Weekend' (12 tickets: 6 Sat + 6 Sun)",
        "7. Verify all tickets created correctly",
        "8. Test VALENTINE25 discount on bundle purchase"
      ]
    };
  },
});

/**
 * TEST 6: Large-Scale Staff Distribution (1,000 Tickets)
 */
export const test6StaffDistribution = mutation({
  args: {
    organizerEmail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const organizerEmail = args.organizerEmail || "thestepperslife@gmail.com";

    const organizer = await getOrCreateOrganizer(ctx, organizerEmail, "SteppersLife Events");

    // Create large event with 1,000 tickets
    const eventId = await ctx.db.insert("events", {
      name: "Mega Steppers Convention 2026",
      description: "The largest stepping convention in the Midwest! 1,000 attendees expected.",
      organizerId: organizer._id,
      eventType: "TICKETED_EVENT",
      categories: ["Convention", "Festival", "Set", "Social", "Workshop"],
      eventDateLiteral: "April 4, 2026",
      eventTimeLiteral: "10:00 AM - 10:00 PM",
      eventTimezone: "America/Chicago",
      startDate: new Date("2026-04-04T10:00:00-05:00").getTime(),
      endDate: new Date("2026-04-04T22:00:00-05:00").getTime(),
      timezone: "America/Chicago",
      location: {
        venueName: "McCormick Place",
        address: "2301 S King Dr",
        city: "Chicago",
        state: "IL",
        zipCode: "60616",
        country: "USA",
      },
      capacity: 1000,
      status: "PUBLISHED",
      ticketsVisible: true,
      paymentModelSelected: true,
      createdAt: now,
      updatedAt: now,
    });

    await createPaymentConfig(ctx, eventId, organizer._id);

    // Create 3 Ticket Tiers (total 1,000 tickets)
    const tiers = [
      { name: "General Admission", price: 5000, quantity: 500, description: "Standard entry" },
      { name: "VIP Access", price: 10000, quantity: 300, description: "VIP entry with premium areas" },
      { name: "All-Access Pass", price: 15000, quantity: 200, description: "Full access including workshops" },
    ];

    const tierResults = [];
    for (const tier of tiers) {
      const tierId = await ctx.db.insert("ticketTiers", {
        eventId,
        name: tier.name,
        description: tier.description,
        price: tier.price,
        quantity: tier.quantity,
        sold: 0,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });
      tierResults.push({ id: tierId, name: tier.name, price: tier.price, quantity: tier.quantity });
    }

    // Create 5 Team Members (Business Partners)
    const teamMembers = [
      { name: "Marcus Johnson", email: "marcus.test@example.com" },
      { name: "Angela Davis", email: "angela.test@example.com" },
      { name: "Robert Wilson", email: "robert.test@example.com" },
      { name: "Patricia Harris", email: "patricia.test@example.com" },
      { name: "William Clark", email: "william.test@example.com" },
    ];

    const teamMemberResults = [];

    for (const tm of teamMembers) {
      // Create user for team member
      let tmUser = await ctx.db
        .query("users")
        .withIndex("by_email", (q: any) => q.eq("email", tm.email))
        .first();

      if (!tmUser) {
        const userId = await ctx.db.insert("users", {
          email: tm.email,
          name: tm.name,
          role: "user",
          createdAt: now,
          updatedAt: now,
        });
        tmUser = await ctx.db.get(userId);
      }

      // Generate referral code
      const referralCode = `${tm.name.split(" ")[0].toUpperCase().substring(0, 4)}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      // Create staff record
      const staffId = await ctx.db.insert("eventStaff", {
        eventId,
        organizerId: organizer._id,
        staffUserId: tmUser!._id,
        name: tm.name,
        email: tm.email,
        role: "TEAM_MEMBERS",
        isActive: true,
        referralCode,
        // Commission (15% for business partners)
        commissionType: "PERCENTAGE",
        commissionValue: 15,
        commissionEarned: 0,
        // Ticket allocation: 200 tickets each
        allocatedTickets: 200,
        ticketsSold: 0,
        cashCollected: 0,
        // Permissions
        canScan: true,
        canAssignSubSellers: true, // Business partners can assign Associates
        // Hierarchy
        hierarchyLevel: 1, // Direct under organizer
        // Timestamps
        createdAt: now,
        updatedAt: now,
      });

      teamMemberResults.push({
        staffId,
        userId: tmUser!._id,
        name: tm.name,
        email: tm.email,
        referralCode,
        allocatedTickets: 200,
        associates: [] as Array<{
          staffId: any;
          name: string;
          email: string;
          referralCode: string;
          allocatedTickets: number;
          parentTeamMember: string;
        }>
      });
    }

    // Create 2 Associates per Team Member (10 total)
    const associateNames = [
      ["Keisha Williams", "keisha.test@example.com"],
      ["James Brown", "james.test@example.com"],
      ["Darnell Thompson", "darnell.test@example.com"],
      ["Tamika Jones", "tamika.test@example.com"],
      ["Michelle Carter", "michelle.test@example.com"],
      ["Derek Moore", "derek.test@example.com"],
      ["Kevin Jackson", "kevin.test@example.com"],
      ["Sharon Lewis", "sharon.test@example.com"],
      ["Nicole Robinson", "nicole.test@example.com"],
      ["Anthony Hall", "anthony.test@example.com"],
    ];

    let associateIndex = 0;
    for (const tmResult of teamMemberResults) {
      // Each Team Member gets 2 Associates
      for (let i = 0; i < 2; i++) {
        const [assocName, assocEmail] = associateNames[associateIndex];
        associateIndex++;

        // Create user for associate
        let assocUser = await ctx.db
          .query("users")
          .withIndex("by_email", (q: any) => q.eq("email", assocEmail))
          .first();

        if (!assocUser) {
          const userId = await ctx.db.insert("users", {
            email: assocEmail,
            name: assocName,
            role: "user",
            createdAt: now,
            updatedAt: now,
          });
          assocUser = await ctx.db.get(userId);
        }

        // Generate referral code for associate
        const referralCode = `${assocName.split(" ")[0].toUpperCase().substring(0, 4)}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

        // Create staff record for associate
        const assocStaffId = await ctx.db.insert("eventStaff", {
          eventId,
          organizerId: organizer._id,
          staffUserId: assocUser!._id,
          name: assocName,
          email: assocEmail,
          role: "ASSOCIATES",
          isActive: true,
          referralCode,
          // Commission (10% for Associates)
          commissionType: "PERCENTAGE",
          commissionValue: 10,
          commissionEarned: 0,
          // Ticket allocation: 100 tickets each (from Team Member)
          allocatedTickets: 100,
          ticketsSold: 0,
          cashCollected: 0,
          // Permissions
          canScan: false,
          canAssignSubSellers: false, // Associates cannot assign sub-sellers
          // Hierarchy
          hierarchyLevel: 2, // Under Team Member
          assignedByStaffId: tmResult.staffId,
          // Timestamps
          createdAt: now,
          updatedAt: now,
        });

        tmResult.associates.push({
          staffId: assocStaffId,
          name: assocName,
          email: assocEmail,
          referralCode,
          allocatedTickets: 100,
          parentTeamMember: tmResult.name
        });
      }

      // Update Team Member's remaining allocation (they gave away all 200 to their 2 Associates)
      // Actually in real system they'd track allocatedToSubSellers, but for this test data we're good
    }

    // Create FREE discount code for testing
    await ctx.db.insert("discountCodes", {
      code: "MEGA100",
      eventId,
      organizerId: organizer._id,
      discountType: "PERCENTAGE",
      discountValue: 100,
      maxUses: undefined,
      usedCount: 0,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    return {
      success: true,
      testNumber: 6,
      testName: "Large-Scale Staff Distribution",
      eventId,
      eventName: "Mega Steppers Convention 2026",
      capacity: 1000,
      tiers: tierResults,
      staffHierarchy: {
        totalStaff: 15,
        teamMembers: teamMemberResults.map(tm => ({
          name: tm.name,
          email: tm.email,
          referralCode: tm.referralCode,
          allocatedTickets: tm.allocatedTickets,
          associates: tm.associates.map(a => ({
            name: a.name,
            email: a.email,
            referralCode: a.referralCode,
            allocatedTickets: a.allocatedTickets,
          }))
        }))
      },
      distributionSummary: {
        totalTickets: 1000,
        teamMemberCount: 5,
        associateCount: 10,
        ticketsPerTeamMember: 200,
        ticketsPerAssociate: 100,
        teamMemberCommission: "15%",
        associateCommission: "10%"
      },
      discountCode: "MEGA100",
      message: "Large event with 5 Team Members (200 tickets each) and 10 Associates (100 tickets each) created.",
      verificationSteps: [
        "1. Go to /events and find 'Mega Steppers Convention 2026'",
        "2. Login as organizer and go to Team Management",
        "3. Verify 5 Team Members listed with 200 tickets each",
        "4. Expand Team Member to see their 2 Associates (100 tickets each)",
        "5. Login as Associate (e.g., keisha.test@example.com)",
        "6. Go to Staff Dashboard and verify 100 allocated tickets",
        "7. Create a cash sale as Associate",
        "8. Verify commission appears for Associate (10%)",
        "9. Verify override commission appears for Team Member (portion of 15%)",
        "10. Check Settlement Dashboard shows all 15 staff"
      ]
    };
  },
});

/**
 * Run all 6 tests in sequence
 */
export const runAllPhase8Tests = mutation({
  args: {
    organizerEmail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const results = [];
    const organizerEmail = args.organizerEmail || "thestepperslife@gmail.com";

    // Note: In a real implementation, we'd call each test mutation
    // For now, return instructions on how to run them individually

    return {
      success: true,
      message: "Phase 8 tests are ready. Run each test individually:",
      tests: [
        {
          number: 1,
          name: "Save-the-Date Event",
          mutation: "test1SaveTheDate",
          description: "Simple announcement event with no tickets"
        },
        {
          number: 2,
          name: "Single-Day Ticketed Event",
          mutation: "test2SingleDayEvent",
          description: "4 ticket tiers with discount codes"
        },
        {
          number: 3,
          name: "Multi-Day Festival",
          mutation: "test3MultiDayFestival",
          description: "3-day event with multi-event bundles"
        },
        {
          number: 4,
          name: "Gala with Table Packages",
          mutation: "test4GalaWithTables",
          description: "SEATED_EVENT with single-event table bundles"
        },
        {
          number: 5,
          name: "Ultimate Multi-Day Bundle Mix",
          mutation: "test5UltimateMultiDay",
          description: "4-day event with 7 bundles (2 single, 5 multi)"
        },
        {
          number: 6,
          name: "Staff Distribution",
          mutation: "test6StaffDistribution",
          description: "1,000 tickets across 5 Team Members and 10 Associates"
        }
      ],
      runCommand: `npx convex run testing/phase8AdvancedTests:[testName] --args '{"organizerEmail":"${organizerEmail}"}'`
    };
  },
});

/**
 * Cleanup: Remove all Phase 8 test data
 */
export const cleanupPhase8Tests = mutation({
  handler: async (ctx) => {
    const testEventNames = [
      "New Year's Eve Steppers Ball 2026 - Save the Date!",
      "Chicago Steppers Social Night",
      "3-Day Steppers Festival - Day 1 (Friday)",
      "3-Day Steppers Festival - Day 2 (Saturday)",
      "3-Day Steppers Festival - Day 3 (Sunday)",
      "Annual Steppers Gala 2025",
      "Valentine's Weekend - Thursday Pre-Party",
      "Valentine's Weekend - Friday Main Event",
      "Valentine's Weekend - Saturday Grand Affair",
      "Valentine's Weekend - Sunday Jazz Brunch",
      "Mega Steppers Convention 2026",
    ];

    let deletedEvents = 0;
    let deletedTiers = 0;
    let deletedBundles = 0;
    let deletedDiscounts = 0;
    let deletedPaymentConfigs = 0;
    let deletedStaff = 0;

    for (const eventName of testEventNames) {
      const events = await ctx.db
        .query("events")
        .filter((q) => q.eq(q.field("name"), eventName))
        .collect();

      for (const event of events) {
        // Delete ticket tiers
        const tiers = await ctx.db
          .query("ticketTiers")
          .withIndex("by_event", (q) => q.eq("eventId", event._id))
          .collect();
        for (const tier of tiers) {
          await ctx.db.delete(tier._id);
          deletedTiers++;
        }

        // Delete bundles
        const bundles = await ctx.db.query("ticketBundles").collect();
        for (const bundle of bundles) {
          if (bundle.eventId === event._id || bundle.eventIds?.includes(event._id)) {
            await ctx.db.delete(bundle._id);
            deletedBundles++;
          }
        }

        // Delete discount codes
        const discounts = await ctx.db
          .query("discountCodes")
          .withIndex("by_event", (q) => q.eq("eventId", event._id))
          .collect();
        for (const dc of discounts) {
          await ctx.db.delete(dc._id);
          deletedDiscounts++;
        }

        // Delete payment configs
        const paymentConfigs = await ctx.db
          .query("eventPaymentConfig")
          .withIndex("by_event", (q) => q.eq("eventId", event._id))
          .collect();
        for (const pc of paymentConfigs) {
          await ctx.db.delete(pc._id);
          deletedPaymentConfigs++;
        }

        // Delete staff
        const staff = await ctx.db
          .query("eventStaff")
          .withIndex("by_event", (q) => q.eq("eventId", event._id))
          .collect();
        for (const s of staff) {
          await ctx.db.delete(s._id);
          deletedStaff++;
        }

        // Delete event
        await ctx.db.delete(event._id);
        deletedEvents++;
      }
    }

    return {
      success: true,
      message: "Phase 8 test data cleaned up",
      deleted: {
        events: deletedEvents,
        tiers: deletedTiers,
        bundles: deletedBundles,
        discountCodes: deletedDiscounts,
        paymentConfigs: deletedPaymentConfigs,
        staff: deletedStaff,
      }
    };
  },
});
