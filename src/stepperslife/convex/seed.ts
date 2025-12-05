
import { internalMutation, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Create sample events and populate with ticket tiers
 * Used for testing QR codes
 */
export const createSampleEvents = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    // Get or create organizer
    let organizer = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", "thestepperslife@gmail.com"))
      .first();

    if (!organizer) {
      const organizerId = await ctx.db.insert("users", {
        email: "thestepperslife@gmail.com",
        name: "SteppersLife Events",
        role: "organizer",
        authProvider: "google",
        canCreateTicketedEvents: true,
        createdAt: now,
        updatedAt: now,
      });
      organizer = await ctx.db.get(organizerId);
    }

    // Sample events data
    // Valid categories: "Set", "Workshop", "Save the Date", "Cruise", "Outdoors Steppin", "Holiday Event", "Weekend Event"
    const sampleEvents = [
      {
        name: "Chicago Steppers Set - Summer Edition",
        description: "Join us for an electrifying night of smooth Chicago stepping!",
        categories: ["Set"],
        daysFromNow: 7,
        imageUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80",
        venueName: "The Steppers Lounge",
        city: "Chicago",
        state: "IL",
      },
      {
        name: "Steppin' Workshop: Mastering the Basics",
        description: "Learn the fundamentals of Chicago stepping from expert instructors.",
        categories: ["Workshop"],
        daysFromNow: 14,
        imageUrl: "https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=800&q=80",
        venueName: "Dance Studio A",
        city: "Chicago",
        state: "IL",
      },
      {
        name: "Memorial Day Weekend Steppers Cruise 2025",
        description: "Three nights of non-stop stepping on the water!",
        categories: ["Cruise", "Weekend Event"],
        daysFromNow: 21,
        imageUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80",
        venueName: "Navy Pier",
        city: "Chicago",
        state: "IL",
      },
      {
        name: "Outdoor Steppin' in the Park",
        description: "Free community stepping event in the park.",
        categories: ["Outdoors Steppin"],
        daysFromNow: 10,
        imageUrl: "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=800&q=80",
        venueName: "Grant Park",
        city: "Chicago",
        state: "IL",
      },
      {
        name: "New Year's Eve Steppers Ball 2025",
        description: "Ring in 2026 with the best steppers in the nation!",
        categories: ["Holiday Event", "Set"],
        daysFromNow: 30,
        imageUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80",
        venueName: "Grand Ballroom",
        city: "Chicago",
        state: "IL",
      },
      {
        name: "Detroit Steppers Weekend Getaway",
        description: "A weekend of stepping and socializing in the Motor City.",
        categories: ["Weekend Event"],
        daysFromNow: 45,
        imageUrl: "https://images.unsplash.com/photo-1519167758481-83f29da8c20c?w=800&q=80",
        venueName: "Detroit Convention Center",
        city: "Detroit",
        state: "MI",
      },
    ];

    const eventIds: string[] = [];

    for (const eventData of sampleEvents) {
      const startDate = now + eventData.daysFromNow * oneDay + 20 * 60 * 60 * 1000;

      // Create event
      const eventId = await ctx.db.insert("events", {
        name: eventData.name,
        description: eventData.description,
        organizerId: organizer!._id,
        organizerName: organizer!.name || "SteppersLife Events",
        eventType: "TICKETED_EVENT",
        categories: eventData.categories,
        eventDateLiteral: new Date(startDate).toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
        }),
        eventTimeLiteral: "8:00 PM - 12:00 AM",
        eventTimezone: "America/Chicago",
        timezone: "America/Chicago",
        startDate,
        endDate: startDate + 4 * 60 * 60 * 1000,
        location: {
          venueName: eventData.venueName,
          address: "123 Main St",
          city: eventData.city,
          state: eventData.state,
          zipCode: "60601",
          country: "USA",
        },
        imageUrl: eventData.imageUrl,
        capacity: 200,
        status: "PUBLISHED",
        ticketsVisible: true,
        paymentModelSelected: true,
        ticketsSold: 0,
        allowWaitlist: false,
        allowTransfers: true,
        maxTicketsPerOrder: 10,
        minTicketsPerOrder: 1,
        socialShareCount: 0,
        createdAt: now,
        updatedAt: now,
      });

      // Create ticket tier for this event
      await ctx.db.insert("ticketTiers", {
        eventId,
        name: "General Admission",
        description: "Full access to the event",
        price: 2500,
        quantity: 150,
        sold: 0,
        isActive: true,
        version: 1,
        createdAt: now,
        updatedAt: now,
      });

      // Create payment config
      await ctx.db.insert("eventPaymentConfig", {
        eventId,
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

      eventIds.push(eventId);
    }

    return {
      success: true,
      count: eventIds.length,
      eventIds,
      organizerId: organizer!._id,
      message: "Sample events created successfully!",
    };
  },
});

/**
 * Update event images
 */
export const updateEventImages = mutation({
  args: {},
  handler: async (ctx) => {
    const events = await ctx.db.query("events").collect();
    let updated = 0;

    for (const event of events) {
      if (!event.imageUrl) {
        await ctx.db.patch(event._id, {
          imageUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80",
        });
        updated++;
      }
    }

    return { updated };
  },
});

/**
 * Create test tickets for a user
 */
export const createTestTickets = mutation({
  args: {
    userEmail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const testEmail = args.userEmail || "tickettest@stepperslife.com";

    // Get or create test user
    let testUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", testEmail))
      .first();

    if (!testUser) {
      const userId = await ctx.db.insert("users", {
        email: testEmail,
        name: "Ticket Test User",
        role: "user",
        authProvider: "password",
        passwordHash: "$2b$10$YW76Er8jRoF2t10jBcj/bOHvJ1PaPnTbZJ7mTDiFeyxmjx9QeBi9.",
        createdAt: now,
        updatedAt: now,
      });
      testUser = await ctx.db.get(userId);
    }

    // Get first 3 events with ticket tiers
    const events = await ctx.db.query("events").take(3);
    const tickets: Array<{ code: string; event: string }> = [];

    for (const event of events) {
      // Get ticket tier for this event
      const tier = await ctx.db
        .query("ticketTiers")
        .withIndex("by_event", (q) => q.eq("eventId", event._id))
        .first();

      if (!tier) continue;

      // Create ticket
      const ticketCode = `TKT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      await ctx.db.insert("tickets", {
        eventId: event._id,
        ticketTierId: tier._id,
        attendeeId: testUser!._id,
        ticketCode,
        attendeeName: testUser!.name || "Ticket Test User",
        attendeeEmail: testEmail,
        status: "VALID",
        createdAt: now,
      });

      // Update tier sold count
      await ctx.db.patch(tier._id, { sold: (tier.sold || 0) + 1 });

      tickets.push({ code: ticketCode, event: event.name });
    }

    return {
      success: true,
      message: `Created ${tickets.length} test tickets`,
      loginCredentials: {
        email: testEmail,
        password: "TestPass123",
      },
      tickets,
      viewAt: "/my-tickets",
    };
  },
});

export const seedProducts = internalMutation({
  args: {},
  handler: async (ctx) => {
    const testProducts = [
      {
        name: "SteppersLife Tee",
        description: "Official SteppersLife branded t-shirt. High quality cotton.",
        price: 2500,
        compareAtPrice: 3000,
        sku: "SL-TEE-001",
        inventoryQuantity: 100,
        trackInventory: true,
        category: "Apparel",
        status: "ACTIVE",
        primaryImage: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80",
        hasVariants: false,
        requiresShipping: true,
      },
      {
        name: "Chicago Steppin' Guide",
        description: "Comprehensive guide to Chicago Steppin' moves and history.",
        price: 1500,
        sku: "SL-BOOK-001",
        inventoryQuantity: 50,
        trackInventory: true,
        category: "Books",
        status: "ACTIVE",
        primaryImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=800&q=80",
        hasVariants: false,
        requiresShipping: true,
      },
      {
        name: "Dance Shoes - Men",
        description: "Professional grade dance shoes for men. Leather sole.",
        price: 8500,
        compareAtPrice: 12000,
        sku: "SL-SHOE-M-001",
        inventoryQuantity: 20,
        trackInventory: true,
        category: "Footwear",
        status: "ACTIVE",
        primaryImage: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80",
        hasVariants: false,
        requiresShipping: true,
      },
      {
        name: "Dance Shoes - Women",
        description: "Elegant and comfortable dance shoes for women.",
        price: 8500,
        compareAtPrice: 12000,
        sku: "SL-SHOE-W-001",
        inventoryQuantity: 20,
        trackInventory: true,
        category: "Footwear",
        status: "ACTIVE",
        primaryImage: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80",
        hasVariants: false,
        requiresShipping: true,
      }
    ];

    // Get an admin user to attribute creation to
    const user = await ctx.db.query("users").first();

    // If no user exists, we must create a placeholder one because createdBy is required
    let userId;
    if (user) {
      userId = user._id;
    } else {
      // This is a fallback for empty DBs
      userId = await ctx.db.insert("users", {
        email: "admin@stepperslife.com",
        name: "System Admin",
        role: "admin",
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
    }

    let createdCount = 0;

    for (const product of testProducts) {
      // Check if product already exists to avoid duplicates
      const existing = await ctx.db
        .query("products")
        .withIndex("by_sku", (q) => q.eq("sku", product.sku))
        .first();

      if (!existing) {
        await ctx.db.insert("products", {
          ...product,
          // @ts-ignore
          status: product.status,
          createdBy: userId,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
        createdCount++;
      }
    }

    return `Seeding complete. Created ${createdCount} products.`;
  },
});
