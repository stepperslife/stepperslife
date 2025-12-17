/**
 * Create 3 Test Events with Tickets
 * - First event should trigger welcome bonus (1000 free tickets)
 * - All events include ticket tiers
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || "https://fearless-dragon-613.convex.cloud";
const client = new ConvexHttpClient(CONVEX_URL);

const BOBBY_EMAIL = "bobby@stepperslife.com";

async function createTestEvents() {
  console.log("🎫 Creating 3 Test Events with Tickets for Bobby...\n");

  // Get Bobby's user ID
  const bobby = await client.query(api.users.queries.getUserByEmail, {
    email: BOBBY_EMAIL,
  });

  if (!bobby) {
    console.error("❌ Bobby user not found!");
    console.log("Please run: node scripts/create-bobby-admin.mjs");
    process.exit(1);
  }

  console.log(`✅ Found Bobby (${bobby.email})`);
  console.log(`   Role: ${bobby.role}`);
  console.log(`   ID: ${bobby._id}\n`);

  // Check if this is Bobby's first event (should show welcome bonus)
  const existingEvents = await client.query(api.events.queries.getOrganizerEvents, {
    userId: bobby._id,
  });

  const isFirstEvent = !existingEvents || existingEvents.length === 0;

  if (isFirstEvent) {
    console.log("🎉 This will be Bobby's FIRST event - Welcome bonus will be triggered!");
    console.log("   You should see: 'Welcome! You get 1000 tickets for your first event for free'\n");
  } else {
    console.log(`ℹ️  Bobby already has ${existingEvents.length} event(s). Welcome bonus already used.\n`);
  }

  const events = [
    {
      name: "Summer Steppin' Fest 2025",
      description: "Join us for an amazing summer steppin' experience with live DJ, workshops, and performances!",
      startDate: new Date("2025-08-15T19:00:00").getTime(),
      endDate: new Date("2025-08-15T23:00:00").getTime(),
      location: "Chicago Ballroom, 123 State Street, Chicago, IL 60601",
      eventType: "TICKETED_EVENT",
      ticketTiers: [
        { name: "Early Bird", price: 25, capacity: 100, description: "Save $10 with early bird pricing!" },
        { name: "General Admission", price: 35, capacity: 200, description: "Standard entry to the event" },
        { name: "VIP", price: 75, capacity: 50, description: "VIP seating, complimentary drinks, and meet & greet" },
      ],
    },
    {
      name: "Steppers Soul Night",
      description: "A night of smooth steppin' with classic soul and R&B music. Dress to impress!",
      startDate: new Date("2025-09-20T20:00:00").getTime(),
      endDate: new Date("2025-09-21T01:00:00").getTime(),
      location: "Soul Lounge, 456 Michigan Ave, Chicago, IL 60611",
      eventType: "TICKETED_EVENT",
      ticketTiers: [
        { name: "Standard", price: 30, capacity: 150, description: "Standard admission" },
        { name: "Premium", price: 50, capacity: 75, description: "Premium seating area with reserved tables" },
      ],
    },
    {
      name: "New Year's Eve Steppin' Gala",
      description: "Ring in the New Year with style! Grand ballroom, champagne toast at midnight, and all-night steppin'!",
      startDate: new Date("2025-12-31T21:00:00").getTime(),
      endDate: new Date("2026-01-01T03:00:00").getTime(),
      location: "Grand Hyatt Ballroom, 789 N Michigan Ave, Chicago, IL 60611",
      eventType: "TICKETED_EVENT",
      ticketTiers: [
        { name: "General Admission", price: 60, capacity: 200, description: "General admission with champagne toast" },
        { name: "VIP Table (4 guests)", price: 300, capacity: 20, description: "Reserved table for 4, bottle service, premium seating" },
        { name: "Ultra VIP (2 guests)", price: 200, capacity: 30, description: "Premium seating, meet & greet, photo booth access" },
      ],
    },
  ];

  console.log("📝 Creating events...\n");

  for (let i = 0; i < events.length; i++) {
    const eventData = events[i];
    console.log(`\n${i + 1}. Creating: ${eventData.name}`);

    try {
      // Create the event
      const eventId = await client.mutation(api.events.mutations.createEvent, {
        name: eventData.name,
        description: eventData.description,
        startDate: eventData.startDate,
        endDate: eventData.endDate,
        location: eventData.location,
        eventType: eventData.eventType,
        organizerId: bobby._id,
        published: true,
        maxCapacity: eventData.ticketTiers.reduce((sum, tier) => sum + tier.capacity, 0),
      });

      console.log(`   ✅ Event created: ${eventId}`);

      // Add ticket tiers
      console.log(`   📋 Adding ${eventData.ticketTiers.length} ticket tiers...`);

      for (const tier of eventData.ticketTiers) {
        await client.mutation(api.tickets.mutations.createTicketTier, {
          eventId,
          name: tier.name,
          price: tier.price,
          capacity: tier.capacity,
          description: tier.description,
        });
        console.log(`      ✓ ${tier.name}: $${tier.price} (${tier.capacity} tickets)`);
      }

      console.log(`   ✅ All ticket tiers added`);

      if (i === 0 && isFirstEvent) {
        console.log(`   🎉 WELCOME BONUS: Bobby should see the welcome message for this first event!`);
      }

    } catch (error) {
      console.error(`   ❌ Error creating event:`, error);
      console.error(`   Details:`, error.message);
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("✅ COMPLETE! Created 3 test events with tickets");
  console.log("=".repeat(60));

  console.log("\n📊 Summary:");
  console.log(`   - User: ${bobby.email} (${bobby.role})`);
  console.log(`   - Events created: 3`);
  console.log(`   - All events have ticket tiers configured`);

  if (isFirstEvent) {
    console.log(`\n🎁 FIRST EVENT BONUS:`);
    console.log(`   When you view the first event in the UI, you should see:`);
    console.log(`   "Welcome! You get 1000 tickets for your first event for free"`);
  }

  console.log("\n🔗 View events at:");
  console.log("   https://events.stepperslife.com/organizer/events");
  console.log("\n✨ Login with: bobby@stepperslife.com / admin123\n");
}

createTestEvents().catch((error) => {
  console.error("💥 Fatal error:", error);
  process.exit(1);
});
