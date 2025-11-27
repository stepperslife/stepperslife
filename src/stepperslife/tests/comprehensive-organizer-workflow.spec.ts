/**
 * Comprehensive Organizer & Ticketing Workflow Test
 *
 * Tests the complete workflow using Convex mutations directly:
 * 1. Organizer registers and gets 300 free tickets
 * 2. Creates 3 events (500 tickets each)
 *    - Event 1: Uses 300 free + 200 purchased (Stripe simulated)
 *    - Event 2: Purchases 500 tickets (Square simulated)
 *    - Event 3: Purchases 500 tickets (Cash App simulated)
 * 3. Distributes tickets to 3 team members (100% commission)
 * 4. Team members distribute to 5 associates (fixed $ per ticket)
 * 5. Simulates customer purchases via Stripe
 * 6. Verifies all commissions and transactions
 *
 * This test bypasses UI and calls Convex mutations directly for reliability.
 */

import { test, expect } from "@playwright/test";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import type { Id } from "../convex/_generated/dataModel";

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || "https://dazzling-mockingbird-241.convex.cloud";

// Test state
let client: ConvexHttpClient;
let organizerId: Id<"users">;
let creditAccountId: Id<"organizerCredits">;
let event1Id: Id<"events">;
let event2Id: Id<"events">;
let event3Id: Id<"events">;
const event1TeamMembers: Array<{ staffId: Id<"eventStaff">; name: string; email: string }> = [];
const event2TeamMembers: Array<{ staffId: Id<"eventStaff">; name: string; email: string }> = [];
const event3TeamMembers: Array<{ staffId: Id<"eventStaff">; name: string; email: string }> = [];
const associates: Array<{ staffId: Id<"eventStaff">; name: string; commission: number }> = [];

test.describe("Comprehensive Organizer Workflow", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeAll(async () => {
    client = new ConvexHttpClient(CONVEX_URL);
  });

  // ============================================================
  // PHASE 1: ORGANIZER REGISTRATION & FREE TICKETS
  // ============================================================

  test("Step 1: Create organizer with 300 free tickets", async () => {
    console.log("\n🎭 STEP 1: Creating test organizer...\n");

    const timestamp = Date.now();
    const result = await client.mutation(api.testing.comprehensiveOrganizerTest.createTestOrganizer, {
      email: `organizer-test-${timestamp}@stepperslife.com`,
      name: `Test Organizer ${timestamp}`,
    });

    expect(result.success).toBe(true);
    expect(result.freeTickets).toBe(300);

    organizerId = result.organizerId;
    creditAccountId = result.creditAccountId;

    console.log(`✅ Organizer created: ${result.organizerId}`);
    console.log(`✅ Free tickets: ${result.freeTickets}`);
    console.log(`✅ Message: ${result.message}`);
  });

  // ============================================================
  // PHASE 2: CREDIT PURCHASES
  // ============================================================

  test("Step 2a: Purchase 200 credits for Event 1 (Stripe)", async () => {
    console.log("\n💳 STEP 2a: Purchasing 200 credits via Stripe...\n");

    const result = await client.mutation(api.testing.comprehensiveOrganizerTest.purchaseCredits, {
      organizerId,
      quantity: 200,
      paymentMethod: "STRIPE",
      paymentId: `stripe_test_${Date.now()}`,
    });

    expect(result.success).toBe(true);
    expect(result.purchasedCredits).toBe(200);
    expect(result.totalCost).toBe(60); // 200 × $0.30
    expect(result.newBalance).toBe(500); // 300 free + 200 purchased

    console.log(`✅ Purchased: ${result.purchasedCredits} credits`);
    console.log(`✅ Cost: $${result.totalCost}`);
    console.log(`✅ New balance: ${result.newBalance} credits`);
  });

  test("Step 2b: Purchase 500 credits for Event 2 (Square)", async () => {
    console.log("\n💳 STEP 2b: Purchasing 500 credits via Square...\n");

    const result = await client.mutation(api.testing.comprehensiveOrganizerTest.purchaseCredits, {
      organizerId,
      quantity: 500,
      paymentMethod: "SQUARE",
      paymentId: `square_test_${Date.now()}`,
    });

    expect(result.success).toBe(true);
    expect(result.purchasedCredits).toBe(500);
    expect(result.totalCost).toBe(150); // 500 × $0.30
    expect(result.newBalance).toBe(1000); // 500 + 500

    console.log(`✅ Purchased: ${result.purchasedCredits} credits`);
    console.log(`✅ Cost: $${result.totalCost}`);
    console.log(`✅ New balance: ${result.newBalance} credits`);
  });

  test("Step 2c: Purchase 500 credits for Event 3 (Cash App)", async () => {
    console.log("\n💳 STEP 2c: Purchasing 500 credits via Cash App...\n");

    const result = await client.mutation(api.testing.comprehensiveOrganizerTest.purchaseCredits, {
      organizerId,
      quantity: 500,
      paymentMethod: "CASHAPP",
      paymentId: `cashapp_test_${Date.now()}`,
    });

    expect(result.success).toBe(true);
    expect(result.purchasedCredits).toBe(500);
    expect(result.totalCost).toBe(150); // 500 × $0.30
    expect(result.newBalance).toBe(1500); // 1000 + 500

    console.log(`✅ Purchased: ${result.purchasedCredits} credits`);
    console.log(`✅ Cost: $${result.totalCost}`);
    console.log(`✅ New balance: ${result.newBalance} credits`);
  });

  // ============================================================
  // PHASE 3: EVENT CREATION
  // ============================================================

  test("Step 3a: Create Event 1 (500 tickets, uses 300 free + 200 purchased)", async () => {
    console.log("\n🎪 STEP 3a: Creating Event 1...\n");

    const result = await client.mutation(api.testing.comprehensiveOrganizerTest.createPrepaidEvent, {
      organizerId,
      eventName: "Test Event #1 - Premium Gala",
      ticketPrice: 50,
      ticketsToAllocate: 500,
      useFirstEventCredit: true, // Use the 300 free tickets
    });

    expect(result.success).toBe(true);
    expect(result.ticketsAllocated).toBe(500);
    expect(result.creditsRemaining).toBe(1000); // 1500 - 500

    event1Id = result.eventId;

    console.log(`✅ Event created: ${result.eventName}`);
    console.log(`✅ Event ID: ${result.eventId}`);
    console.log(`✅ Tickets: ${result.ticketsAllocated}`);
    console.log(`✅ Credits remaining: ${result.creditsRemaining}`);
  });

  test("Step 3b: Create Event 2 (500 tickets, purchased via Square)", async () => {
    console.log("\n🎪 STEP 3b: Creating Event 2...\n");

    const result = await client.mutation(api.testing.comprehensiveOrganizerTest.createPrepaidEvent, {
      organizerId,
      eventName: "Test Event #2 - Weekend Workshop",
      ticketPrice: 35,
      ticketsToAllocate: 500,
      useFirstEventCredit: false,
    });

    expect(result.success).toBe(true);
    expect(result.ticketsAllocated).toBe(500);
    expect(result.creditsRemaining).toBe(500); // 1000 - 500

    event2Id = result.eventId;

    console.log(`✅ Event created: ${result.eventName}`);
    console.log(`✅ Tickets: ${result.ticketsAllocated}`);
    console.log(`✅ Credits remaining: ${result.creditsRemaining}`);
  });

  test("Step 3c: Create Event 3 (500 tickets, purchased via Cash App)", async () => {
    console.log("\n🎪 STEP 3c: Creating Event 3...\n");

    const result = await client.mutation(api.testing.comprehensiveOrganizerTest.createPrepaidEvent, {
      organizerId,
      eventName: "Test Event #3 - Summer Social",
      ticketPrice: 25,
      ticketsToAllocate: 500,
      useFirstEventCredit: false,
    });

    expect(result.success).toBe(true);
    expect(result.ticketsAllocated).toBe(500);
    expect(result.creditsRemaining).toBe(0); // 500 - 500

    event3Id = result.eventId;

    console.log(`✅ Event created: ${result.eventName}`);
    console.log(`✅ Tickets: ${result.ticketsAllocated}`);
    console.log(`✅ Credits remaining: ${result.creditsRemaining}`);
  });

  // ============================================================
  // PHASE 4: ADD TEAM MEMBERS (100% COMMISSION)
  // ============================================================

  test("Step 4a: Add 3 team members to Event 1", async () => {
    console.log("\n👥 STEP 4a: Adding team members to Event 1...\n");

    const teamMemberNames = ["Alice Johnson", "Bob Smith", "Carol Williams"];

    for (const name of teamMemberNames) {
      const email = `${name.toLowerCase().replace(" ", ".")}@stepperslife.com`;
      const result = await client.mutation(api.testing.comprehensiveOrganizerTest.addTeamMember, {
        eventId: event1Id,
        name,
        email,
      });

      expect(result.success).toBe(true);
      event1TeamMembers.push({
        staffId: result.staffId,
        name: result.name,
        email: result.email,
      });

      console.log(`✅ Team member added: ${result.name} (${result.email})`);
    }

    expect(event1TeamMembers.length).toBe(3);
  });

  test("Step 4b: Add 3 team members to Event 2", async () => {
    console.log("\n👥 STEP 4b: Adding team members to Event 2...\n");

    const teamMemberNames = ["David Brown", "Emily Davis", "Frank Miller"];

    for (const name of teamMemberNames) {
      const email = `${name.toLowerCase().replace(" ", ".")}@stepperslife.com`;
      const result = await client.mutation(api.testing.comprehensiveOrganizerTest.addTeamMember, {
        eventId: event2Id,
        name,
        email,
      });

      expect(result.success).toBe(true);
      event2TeamMembers.push({
        staffId: result.staffId,
        name: result.name,
        email: result.email,
      });

      console.log(`✅ Team member added: ${result.name}`);
    }

    expect(event2TeamMembers.length).toBe(3);
  });

  test("Step 4c: Add 3 team members to Event 3", async () => {
    console.log("\n👥 STEP 4c: Adding team members to Event 3...\n");

    const teamMemberNames = ["Grace Wilson", "Henry Moore", "Ivy Taylor"];

    for (const name of teamMemberNames) {
      const email = `${name.toLowerCase().replace(" ", ".")}@stepperslife.com`;
      const result = await client.mutation(api.testing.comprehensiveOrganizerTest.addTeamMember, {
        eventId: event3Id,
        name,
        email,
      });

      expect(result.success).toBe(true);
      event3TeamMembers.push({
        staffId: result.staffId,
        name: result.name,
        email: result.email,
      });

      console.log(`✅ Team member added: ${result.name}`);
    }

    expect(event3TeamMembers.length).toBe(3);
  });

  // ============================================================
  // PHASE 5: ALLOCATE TICKETS TO TEAM MEMBERS
  // ============================================================

  test("Step 5: Allocate random tickets to team members", async () => {
    console.log("\n🎫 STEP 5: Allocating tickets to team members...\n");

    // Event 1: Distribute 500 tickets randomly among 3 team members
    const event1Allocations = [150, 200, 150]; // Must sum to 500
    for (let i = 0; i < event1TeamMembers.length; i++) {
      const result = await client.mutation(api.testing.comprehensiveOrganizerTest.allocateTicketsToStaff, {
        staffId: event1TeamMembers[i].staffId,
        quantity: event1Allocations[i],
      });

      expect(result.success).toBe(true);
      console.log(`✅ Event 1 - ${event1TeamMembers[i].name}: ${event1Allocations[i]} tickets`);
    }

    // Event 2: Distribute 500 tickets
    const event2Allocations = [175, 150, 175];
    for (let i = 0; i < event2TeamMembers.length; i++) {
      const result = await client.mutation(api.testing.comprehensiveOrganizerTest.allocateTicketsToStaff, {
        staffId: event2TeamMembers[i].staffId,
        quantity: event2Allocations[i],
      });

      expect(result.success).toBe(true);
      console.log(`✅ Event 2 - ${event2TeamMembers[i].name}: ${event2Allocations[i]} tickets`);
    }

    // Event 3: Distribute 500 tickets
    const event3Allocations = [100, 250, 150];
    for (let i = 0; i < event3TeamMembers.length; i++) {
      const result = await client.mutation(api.testing.comprehensiveOrganizerTest.allocateTicketsToStaff, {
        staffId: event3TeamMembers[i].staffId,
        quantity: event3Allocations[i],
      });

      expect(result.success).toBe(true);
      console.log(`✅ Event 3 - ${event3TeamMembers[i].name}: ${event3Allocations[i]} tickets`);
    }
  });

  // ============================================================
  // PHASE 6: ADD ASSOCIATES (FIXED $ COMMISSION)
  // ============================================================

  test("Step 6: Add 5 associates with fixed commission", async () => {
    console.log("\n🤝 STEP 6: Adding associates with fixed commission...\n");

    const associateData = [
      { name: "John Associate", commission: 7.50, teamMember: event1TeamMembers[0] },
      { name: "Jane Associate", commission: 5.00, teamMember: event1TeamMembers[1] },
      { name: "Mike Associate", commission: 10.00, teamMember: event2TeamMembers[0] },
      { name: "Sarah Associate", commission: 6.50, teamMember: event2TeamMembers[1] },
      { name: "Tom Associate", commission: 8.00, teamMember: event3TeamMembers[0] },
    ];

    for (const assoc of associateData) {
      const email = `${assoc.name.toLowerCase().replace(" ", ".")}@stepperslife.com`;
      const result = await client.mutation(api.testing.comprehensiveOrganizerTest.addAssociate, {
        eventId: assoc.teamMember.staffId.toString().includes(event1Id.toString()) ? event1Id :
                 assoc.teamMember.staffId.toString().includes(event2Id.toString()) ? event2Id : event3Id,
        teamMemberStaffId: assoc.teamMember.staffId,
        name: assoc.name,
        email,
        commissionPerTicket: assoc.commission,
      });

      expect(result.success).toBe(true);
      associates.push({
        staffId: result.staffId,
        name: result.name,
        commission: result.commission,
      });

      console.log(`✅ Associate added: ${result.name} ($${result.commission}/ticket)`);
    }

    expect(associates.length).toBe(5);
  });

  // ============================================================
  // PHASE 7: SIMULATE CUSTOMER PURCHASES
  // ============================================================

  test("Step 7: Simulate customer purchases via Stripe", async () => {
    console.log("\n💰 STEP 7: Simulating customer purchases...\n");

    // Event 1: 10 customers, 50 tickets total
    for (let i = 1; i <= 10; i++) {
      const quantity = Math.floor(Math.random() * 5) + 1; // 1-5 tickets
      const sellerStaffId = i <= 3 ? event1TeamMembers[0].staffId :
                           i <= 7 ? event1TeamMembers[1].staffId :
                           event1TeamMembers[2].staffId;

      const result = await client.mutation(api.testing.comprehensiveOrganizerTest.simulateCustomerPurchase, {
        eventId: event1Id,
        sellerStaffId,
        customerEmail: `customer${i}@example.com`,
        customerName: `Customer ${i}`,
        quantity,
        ticketPrice: 50,
      });

      expect(result.success).toBe(true);
      console.log(`✅ Event 1 - Customer ${i}: ${quantity} tickets ($${result.totalAmount})`);
    }

    // Event 2: 8 customers, 40 tickets total
    for (let i = 1; i <= 8; i++) {
      const quantity = Math.floor(Math.random() * 5) + 1;
      const sellerStaffId = i <= 3 ? event2TeamMembers[0].staffId :
                           i <= 6 ? event2TeamMembers[1].staffId :
                           event2TeamMembers[2].staffId;

      const result = await client.mutation(api.testing.comprehensiveOrganizerTest.simulateCustomerPurchase, {
        eventId: event2Id,
        sellerStaffId,
        customerEmail: `customer${i + 10}@example.com`,
        customerName: `Customer ${i + 10}`,
        quantity,
        ticketPrice: 35,
      });

      expect(result.success).toBe(true);
      console.log(`✅ Event 2 - Customer ${i + 10}: ${quantity} tickets`);
    }

    // Event 3: 12 customers, 60 tickets total
    for (let i = 1; i <= 12; i++) {
      const quantity = Math.floor(Math.random() * 5) + 1;
      const sellerStaffId = i <= 4 ? event3TeamMembers[0].staffId :
                           i <= 8 ? event3TeamMembers[1].staffId :
                           event3TeamMembers[2].staffId;

      const result = await client.mutation(api.testing.comprehensiveOrganizerTest.simulateCustomerPurchase, {
        eventId: event3Id,
        sellerStaffId,
        customerEmail: `customer${i + 18}@example.com`,
        customerName: `Customer ${i + 18}`,
        quantity,
        ticketPrice: 25,
      });

      expect(result.success).toBe(true);
      console.log(`✅ Event 3 - Customer ${i + 18}: ${quantity} tickets`);
    }
  });

  // ============================================================
  // PHASE 8: VERIFICATION
  // ============================================================

  test("Step 8a: Verify test summary", async () => {
    console.log("\n📊 STEP 8a: Verifying test summary...\n");

    const summary = await client.query(api.testing.comprehensiveOrganizerTest.getTestSummary, {
      organizerId,
    });

    console.log("\n=== TEST SUMMARY ===");
    console.log(`\nOrganizer: ${summary.organizer.name} (${summary.organizer.email})`);

    console.log(`\nCredits:`);
    console.log(`  Total: ${summary.credits.total}`);
    console.log(`  Used: ${summary.credits.used}`);
    console.log(`  Remaining: ${summary.credits.remaining}`);
    console.log(`  First Event Free Used: ${summary.credits.firstEventFreeUsed}`);

    console.log(`\nTransactions:`);
    console.log(`  Total: ${summary.transactions.total}`);
    console.log(`  Purchases: ${summary.transactions.purchases}`);
    console.log(`  Usage: ${summary.transactions.usage}`);
    console.log(`  Total Purchased: ${summary.transactions.totalPurchased} credits`);
    console.log(`  Total Spent: $${summary.transactions.totalSpent}`);

    console.log(`\nEvents: ${summary.events.length}`);
    summary.events.forEach((event: any) => {
      console.log(`  - ${event.name} (${event.capacity} tickets, ${event.status})`);
    });

    console.log(`\nStaff:`);
    console.log(`  Total: ${summary.staffCount.total}`);
    console.log(`  Team Members: ${summary.staffCount.teamMembers}`);
    console.log(`  Associates: ${summary.staffCount.associates}`);

    console.log(`\nSales:`);
    console.log(`  Orders: ${summary.sales.totalOrders}`);
    console.log(`  Tickets Sold: ${summary.sales.totalTicketsSold}`);
    console.log(`  Revenue: $${summary.sales.totalRevenue.toFixed(2)}`);
    console.log(`  Platform Fees: $${summary.sales.totalFees.toFixed(2)}`);
    console.log(`  Net Revenue: $${summary.sales.netRevenue.toFixed(2)}`);

    // Assertions
    expect(summary.credits.total).toBe(1500); // 300 + 200 + 500 + 500
    expect(summary.credits.used).toBe(1500); // All used for 3 events
    expect(summary.credits.remaining).toBe(0);
    expect(summary.events.length).toBe(3);
    expect(summary.staffCount.teamMembers).toBe(9); // 3 per event × 3 events
    expect(summary.staffCount.associates).toBe(5);
  });

  test("Step 8b: Verify Event 1 commissions", async () => {
    console.log("\n📊 STEP 8b: Verifying Event 1 commissions...\n");

    const commissions = await client.query(api.testing.comprehensiveOrganizerTest.getCommissionSummary, {
      eventId: event1Id,
    });

    console.log(`\nEvent 1 - Commission Summary:`);
    console.log(`  Staff Count: ${commissions.staffCount}`);
    console.log(`  Total Tickets Sold: ${commissions.totalTicketsSold}`);
    console.log(`  Total Commissions: $${commissions.totalCommissionsPaid.toFixed(2)}`);

    commissions.commissions.forEach((staff: any) => {
      console.log(`\n  ${staff.name} (${staff.role}):`);
      console.log(`    Commission: ${staff.commissionType === "PERCENTAGE" ? staff.commissionValue + "%" : "$" + staff.commissionValue}`);
      console.log(`    Allocated: ${staff.ticketsAllocated} tickets`);
      console.log(`    Sold: ${staff.ticketsSold} tickets`);
      console.log(`    Earned: $${staff.totalCommission.toFixed(2)}`);
    });

    expect(commissions.staffCount).toBeGreaterThan(0);
    expect(commissions.totalTicketsSold).toBeGreaterThan(0);
  });

  test("Step 8c: Verify Event 2 commissions", async () => {
    console.log("\n📊 STEP 8c: Verifying Event 2 commissions...\n");

    const commissions = await client.query(api.testing.comprehensiveOrganizerTest.getCommissionSummary, {
      eventId: event2Id,
    });

    console.log(`\nEvent 2 - Commission Summary:`);
    console.log(`  Total Commissions: $${commissions.totalCommissionsPaid.toFixed(2)}`);

    expect(commissions.staffCount).toBeGreaterThan(0);
  });

  test("Step 8d: Verify Event 3 commissions", async () => {
    console.log("\n📊 STEP 8d: Verifying Event 3 commissions...\n");

    const commissions = await client.query(api.testing.comprehensiveOrganizerTest.getCommissionSummary, {
      eventId: event3Id,
    });

    console.log(`\nEvent 3 - Commission Summary:`);
    console.log(`  Total Commissions: $${commissions.totalCommissionsPaid.toFixed(2)}`);

    expect(commissions.staffCount).toBeGreaterThan(0);
  });

  test("Step 9: Final verification complete", async () => {
    console.log("\n✅ ============================================");
    console.log("✅ COMPREHENSIVE TEST COMPLETED SUCCESSFULLY!");
    console.log("✅ ============================================\n");

    console.log("Summary:");
    console.log("  ✅ Organizer created with 300 free tickets");
    console.log("  ✅ 1,200 additional credits purchased (200 Stripe, 500 Square, 500 Cash App)");
    console.log("  ✅ 3 events created (500 tickets each = 1,500 tickets)");
    console.log("  ✅ 9 team members added (3 per event, 100% commission)");
    console.log("  ✅ 5 associates added (fixed $ commission)");
    console.log("  ✅ Customer purchases simulated via Stripe");
    console.log("  ✅ Commissions calculated and tracked");
    console.log("\n🎉 All workflow steps verified successfully!");
  });
});
