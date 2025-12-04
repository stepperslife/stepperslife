/**
 * Seed SteppersLife Events
 * Creates realistic stepping events for thestepperslife@gmail.com organizer
 * with professional Unsplash images
 */

import { mutation } from "../_generated/server";

// Professional event images from Unsplash - stepping/dance themed
const EVENT_IMAGES = {
  gala: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&h=800&fit=crop&q=80",
  party: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&h=800&fit=crop&q=80",
  dance: "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=1200&h=800&fit=crop&q=80",
  dj: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&h=800&fit=crop&q=80",
  social: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200&h=800&fit=crop&q=80",
  elegant: "https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=1200&h=800&fit=crop&q=80",
  celebration: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1200&h=800&fit=crop&q=80",
  club: "https://images.unsplash.com/photo-1571266028243-3716f02d2d2e?w=1200&h=800&fit=crop&q=80",
};

export const seedSteppersLifeEvents = mutation({
  handler: async (ctx) => {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    const oneWeek = 7 * oneDay;

    // Find the thestepperslife@gmail.com organizer
    let organizer = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", "thestepperslife@gmail.com"))
      .first();

    if (!organizer) {
      // Create the organizer if doesn't exist
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

    const results: {
      organizer: { id: string; email: string };
      events: Array<{
        id: string;
        name: string;
        date: string;
        venue: string;
        tiers: Array<{ name: string; price: string; quantity: number }>;
      }>;
      discountCodes: Array<{ code: string; event: string; discount: string }>;
    } = {
      organizer: { id: organizer!._id, email: organizer!.email },
      events: [],
      discountCodes: [],
    };

    // Define realistic Chicago stepping events
    const eventConfigs = [
      {
        name: "New Year's Eve Steppers Ball 2025",
        description: `Ring in 2026 in style at Chicago's most prestigious stepping event of the year!

Join us for an unforgettable night featuring:
- Live performances by Chicago's finest stepping DJs
- Premium open bar until midnight
- Champagne toast at midnight
- Gourmet hors d'oeuvres
- Red carpet photo booth
- Balloon drop countdown

Black tie attire required. This is THE stepping event you don't want to miss!`,
        venue: "The Ritz-Carlton Chicago - Grand Ballroom",
        address: "160 E Pearson St",
        city: "Chicago",
        state: "IL",
        zipCode: "60611",
        daysFromNow: 27, // December 31, 2025
        startTime: "9:00 PM",
        endTime: "3:00 AM",
        capacity: 400,
        imageUrl: EVENT_IMAGES.elegant,
        categories: ["Gala", "Holiday", "Special Event"],
        tiers: [
          { name: "Early Bird Special", price: 7500, quantity: 100, description: "Limited early bird pricing - save $25!" },
          { name: "General Admission", price: 10000, quantity: 200, description: "Includes dinner, open bar, and champagne toast" },
          { name: "VIP Experience", price: 15000, quantity: 75, description: "Premium seating, bottle service, and VIP lounge access" },
          { name: "VIP Table (8 guests)", price: 100000, quantity: 25, description: "Private table for 8 with bottle service and dedicated server" },
        ],
      },
      {
        name: "MLK Weekend Steppers Celebration",
        description: `Honor the legacy of Dr. Martin Luther King Jr. with an evening of unity through dance!

This annual celebration brings together steppers from across the nation for a powerful weekend of community and culture.

Event highlights:
- Stepping showcase featuring legendary steppers
- Live DJ sets spinning classic R&B and stepping music
- Soul food buffet dinner
- Unity ceremony and tribute
- Dance floor open all night

Dresscode: Elegant/Semi-Formal`,
        venue: "Hyatt Regency McCormick Place",
        address: "2233 S Martin Luther King Dr",
        city: "Chicago",
        state: "IL",
        zipCode: "60616",
        daysFromNow: 45, // MLK Weekend January 2026
        startTime: "7:00 PM",
        endTime: "1:00 AM",
        capacity: 500,
        imageUrl: EVENT_IMAGES.celebration,
        categories: ["Holiday", "Set", "Cultural"],
        tiers: [
          { name: "General Admission", price: 5500, quantity: 350, description: "Full event access with dinner buffet" },
          { name: "Premium Experience", price: 8500, quantity: 100, description: "Priority seating and premium bar access" },
          { name: "VIP Package", price: 12500, quantity: 50, description: "VIP lounge, bottle service, and meet & greet" },
        ],
      },
      {
        name: "Valentine's Steppers Romance Night",
        description: `Fall in love on the dance floor at Chicago's most romantic stepping event!

Perfect for couples and singles alike, this elegant evening celebrates love through the art of Chicago stepping.

Features:
- Romantic atmosphere with candlelit decor
- Couples stepping competition with prizes
- Singles mixer hour (6-7 PM)
- Live roses for the ladies
- Professional photography
- Sweetheart raffle drawing

Dress to impress in red, pink, or black!`,
        venue: "The Langham Chicago - Devonshire Ballroom",
        address: "330 N Wabash Ave",
        city: "Chicago",
        state: "IL",
        zipCode: "60611",
        daysFromNow: 72, // Valentine's weekend February 2026
        startTime: "6:00 PM",
        endTime: "12:00 AM",
        capacity: 300,
        imageUrl: EVENT_IMAGES.gala,
        categories: ["Holiday", "Social", "Set"],
        tiers: [
          { name: "Singles Entry", price: 4500, quantity: 100, description: "Individual admission with singles mixer access" },
          { name: "Couples Package", price: 7500, quantity: 80, description: "Admission for 2 with rose and champagne" },
          { name: "VIP Couples Experience", price: 12000, quantity: 20, description: "Reserved table, bottle service, and professional photo session" },
        ],
      },
      {
        name: "Sunday Afternoon Steppers Social",
        description: `The perfect way to end your weekend! Join us for a relaxed afternoon of smooth stepping.

This casual Sunday set is perfect for all skill levels:
- Beginner-friendly environment
- Smooth grooves all afternoon
- Cash bar with drink specials
- Light appetizers available
- Free stepping tips from experienced dancers

Come as you are - casual dress code. No partner needed!`,
        venue: "South Shore Cultural Center",
        address: "7059 S South Shore Dr",
        city: "Chicago",
        state: "IL",
        zipCode: "60649",
        daysFromNow: 10, // Upcoming Sunday
        startTime: "3:00 PM",
        endTime: "8:00 PM",
        capacity: 150,
        imageUrl: EVENT_IMAGES.social,
        categories: ["Social", "Set", "Casual"],
        tiers: [
          { name: "Afternoon Pass", price: 2000, quantity: 120, description: "Full afternoon access" },
          { name: "VIP Early Entry", price: 3500, quantity: 30, description: "Early entry at 2 PM with reserved seating" },
        ],
      },
      {
        name: "Chicago Steppers Championship 2026",
        description: `The most prestigious stepping competition in the Midwest returns!

Watch the best steppers in the region compete for the championship title and $10,000 in cash prizes.

Competition categories:
- Professional Division
- Amateur Division
- Youth Division (18-25)
- Legends Division (50+)
- Team Competition

Special guest judges and celebrity appearances. Don't miss this legendary event!`,
        venue: "Navy Pier - Grand Ballroom",
        address: "600 E Grand Ave",
        city: "Chicago",
        state: "IL",
        zipCode: "60611",
        daysFromNow: 90, // March 2026
        startTime: "5:00 PM",
        endTime: "12:00 AM",
        capacity: 600,
        imageUrl: EVENT_IMAGES.party,
        categories: ["Competition", "Special Event", "Championship"],
        tiers: [
          { name: "Spectator General", price: 3500, quantity: 400, description: "General admission seating" },
          { name: "Spectator Premium", price: 5500, quantity: 100, description: "Premium seating near the stage" },
          { name: "Competitor Entry", price: 7500, quantity: 80, description: "Competition entry fee (one category)" },
          { name: "VIP Judge's Table", price: 15000, quantity: 20, description: "Exclusive table seating with judges and celebrities" },
        ],
      },
      {
        name: "Throwback Thursday: 90s R&B Step Night",
        description: `Take it back to the golden era of stepping!

One night only: A throwback evening dedicated to the music that defined Chicago stepping.

Featuring:
- All 90s & early 2000s R&B classics
- Old school dress code encouraged
- $5 throwback drink specials
- Best dressed contest
- Memory lane video montage

Come relive the classics: Jodeci, SWV, Keith Sweat, Silk, and more!`,
        venue: "The Promontory",
        address: "5311 S Lake Park Ave",
        city: "Chicago",
        state: "IL",
        zipCode: "60615",
        daysFromNow: 17, // Upcoming Thursday
        startTime: "8:00 PM",
        endTime: "1:00 AM",
        capacity: 200,
        imageUrl: EVENT_IMAGES.club,
        categories: ["Themed", "Social", "Set"],
        tiers: [
          { name: "General Admission", price: 2500, quantity: 170, description: "Standard entry" },
          { name: "VIP Booth", price: 5000, quantity: 30, description: "Reserved booth seating for up to 4" },
        ],
      },
      {
        name: "Ladies Night Stepping Soiree",
        description: `A special evening celebrating the queens of the dance floor!

Ladies, this night is for YOU:
- Free entry for ladies before 8 PM
- Ladies-only stepping workshop 6-7 PM
- Free champagne for first 50 ladies
- Male guest escorts available
- DJ spinning ladies' choice all night
- Rose ceremony for the best dressed

Gentlemen welcome after 8 PM with paid admission.`,
        venue: "The Ivy Room",
        address: "941 N Western Ave",
        city: "Chicago",
        state: "IL",
        zipCode: "60622",
        daysFromNow: 21, // 3 weeks out
        startTime: "6:00 PM",
        endTime: "11:00 PM",
        capacity: 175,
        imageUrl: EVENT_IMAGES.dance,
        categories: ["Special Event", "Social", "Ladies Night"],
        tiers: [
          { name: "Ladies Early Entry (Before 8PM)", price: 0, quantity: 75, description: "Free admission for ladies before 8 PM" },
          { name: "Ladies After 8PM", price: 1500, quantity: 50, description: "Ladies admission after 8 PM" },
          { name: "Gentlemen Admission", price: 3000, quantity: 50, description: "Gentleman admission (after 8 PM only)" },
        ],
      },
      {
        name: "Monthly First Friday Steppers Set",
        description: `Start your month right at Chicago's hottest monthly stepping event!

Every first Friday, we bring together the stepping community for a night of pure dancing.

What to expect:
- 5 hours of non-stop stepping music
- Rotating guest DJs each month
- Happy hour 7-9 PM
- Free stepping lessons 7-8 PM for beginners
- Friendly, welcoming atmosphere

This month featuring: DJ Smooth Grooves

No partner needed - all skill levels welcome!`,
        venue: "The Vault Chicago",
        address: "431 S Dearborn St",
        city: "Chicago",
        state: "IL",
        zipCode: "60605",
        daysFromNow: 31, // Next first Friday
        startTime: "7:00 PM",
        endTime: "12:00 AM",
        capacity: 250,
        imageUrl: EVENT_IMAGES.dj,
        categories: ["Monthly", "Social", "Set"],
        tiers: [
          { name: "Early Bird (Before Midnight Tonight)", price: 1500, quantity: 50, description: "Limited early bird pricing" },
          { name: "Advance", price: 2000, quantity: 150, description: "Advance purchase online" },
          { name: "At Door", price: 2500, quantity: 50, description: "Day-of door price" },
        ],
      },
    ];

    // Create each event
    for (const config of eventConfigs) {
      const eventDate = now + config.daysFromNow * oneDay;

      // Parse start time to create proper timestamp
      const [startHour, startMinute] = config.startTime.replace(" PM", "").replace(" AM", "").split(":").map(Number);
      const isPM = config.startTime.includes("PM");
      const adjustedStartHour = isPM && startHour !== 12 ? startHour + 12 : startHour;

      const [endHour, endMinute] = config.endTime.replace(" PM", "").replace(" AM", "").split(":").map(Number);
      const isEndPM = config.endTime.includes("PM");
      const adjustedEndHour = isEndPM && endHour !== 12 ? endHour + 12 : endHour;

      // Calculate duration
      let durationHours = adjustedEndHour - adjustedStartHour;
      if (durationHours < 0) durationHours += 24; // Event goes past midnight

      const startDateTime = eventDate + (adjustedStartHour * 60 + (startMinute || 0)) * 60 * 1000;
      const endDateTime = startDateTime + durationHours * 60 * 60 * 1000;

      const eventId = await ctx.db.insert("events", {
        name: config.name,
        description: config.description,
        organizerId: organizer!._id,
        organizerName: organizer!.name || "SteppersLife Events",
        eventType: "TICKETED_EVENT",
        categories: config.categories,
        eventDateLiteral: new Date(eventDate).toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
        }),
        eventTimeLiteral: `${config.startTime} - ${config.endTime}`,
        eventTimezone: "America/Chicago",
        timezone: "America/Chicago",
        startDate: startDateTime,
        endDate: endDateTime,
        location: {
          venueName: config.venue,
          address: config.address,
          city: config.city,
          state: config.state,
          zipCode: config.zipCode,
          country: "USA",
        },
        imageUrl: config.imageUrl,
        capacity: config.capacity,
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

      // Create ticket tiers
      const tierInfo: Array<{ name: string; price: string; quantity: number }> = [];

      for (const tier of config.tiers) {
        await ctx.db.insert("ticketTiers", {
          eventId: eventId,
          name: tier.name,
          description: tier.description,
          price: tier.price,
          quantity: tier.quantity,
          sold: 0,
          isActive: true,
          version: 1,
          createdAt: now,
          updatedAt: now,
        });

        tierInfo.push({
          name: tier.name,
          price: `$${(tier.price / 100).toFixed(2)}`,
          quantity: tier.quantity,
        });
      }

      // Create payment config (PREPAY model - organizer prepaid)
      await ctx.db.insert("eventPaymentConfig", {
        eventId: eventId,
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

      // Create discount codes
      // FREE code for testing
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

      // STEPPERS10 - 10% off
      await ctx.db.insert("discountCodes", {
        code: "STEPPERS10",
        eventId: eventId,
        organizerId: organizer!._id,
        discountType: "PERCENTAGE",
        discountValue: 10,
        maxUses: 100,
        usedCount: 0,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });

      // EARLYBIRD - 15% off for first 50 uses
      await ctx.db.insert("discountCodes", {
        code: "EARLYBIRD",
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
        date: new Date(eventDate).toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        }),
        venue: config.venue,
        tiers: tierInfo,
      });

      results.discountCodes.push(
        { code: "FREE", event: config.name, discount: "100% off (testing)" },
        { code: "STEPPERS10", event: config.name, discount: "10% off" },
        { code: "EARLYBIRD", event: config.name, discount: "15% off (limited)" }
      );
    }

    return {
      success: true,
      message: `Successfully created ${results.events.length} events for SteppersLife!`,
      organizer: results.organizer,
      events: results.events,
      discountCodes: results.discountCodes.slice(0, 10), // Show first 10 codes
      testingInstructions: {
        viewEvents: "Go to /events to see all published events",
        buyTickets: "Click on any event and select 'Get Tickets'",
        freeTest: "Use code 'FREE' at checkout for free testing",
        discount10: "Use code 'STEPPERS10' for 10% off",
        discount15: "Use code 'EARLYBIRD' for 15% off (limited uses)",
        organizerDashboard: "Login as thestepperslife@gmail.com and go to /organizer/events",
      },
    };
  },
});

/**
 * Clean up SteppersLife events
 * Removes all events created by thestepperslife@gmail.com
 */
export const cleanupSteppersLifeEvents = mutation({
  handler: async (ctx) => {
    const organizer = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", "thestepperslife@gmail.com"))
      .first();

    if (!organizer) {
      return { success: true, message: "No SteppersLife organizer found" };
    }

    const events = await ctx.db.query("events").collect();
    const organizerEvents = events.filter((e) => e.organizerId === organizer._id);

    const cleaned = {
      events: 0,
      tiers: 0,
      discountCodes: 0,
      paymentConfigs: 0,
    };

    for (const event of organizerEvents) {
      // Delete ticket tiers
      const tiers = await ctx.db
        .query("ticketTiers")
        .withIndex("by_event", (q) => q.eq("eventId", event._id))
        .collect();
      for (const tier of tiers) {
        await ctx.db.delete(tier._id);
        cleaned.tiers++;
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

    return {
      success: true,
      message: `Cleaned up ${cleaned.events} events`,
      cleaned,
    };
  },
});
