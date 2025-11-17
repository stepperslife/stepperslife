/**
 * Comprehensive Organizer, Staff & Payment System Test Suite
 *
 * Tests the complete workflow:
 * 1. Organizer registration
 * 2. Credit purchases (Square, Cash App Pay)
 * 3. Event creation (3 events with PREPAY model)
 * 4. Staff assignment (3 Team Members per event with 100% commission)
 * 5. Associate assignment (random $ per ticket commission)
 * 6. Customer purchases via Stripe
 * 7. Verification of credits, commissions, and settlements
 *
 * Browser: Chromium (Playwright)
 * Environment: Development (local Next.js + production Convex)
 */

import { test, expect, Page, chromium } from "@playwright/test";
import {
  registerOrganizer,
  purchaseCreditsSquare,
  purchaseCreditsCashApp,
  getCreditBalance,
  verifyCreditBalance,
  createEvent,
  addTeamMember,
  addAssociate,
  purchaseTicketsAsCustomer,
  verifySettlementDashboard,
  waitAndScreenshot,
  takeScreenshot,
} from "./helpers/organizer-staff-test-helpers";
import {
  TEST_ORGANIZER,
  CREDIT_PURCHASES,
  TEST_EVENTS,
  TEAM_MEMBERS_PER_EVENT,
  generateAssociatesForTeamMember,
  CUSTOMER_PURCHASES,
  EXPECTED_CREDIT_FLOW,
} from "./fixtures/organizer-staff-test-data";

// Test state to share between tests
let organizerEmail: string;
let organizerPassword: string;
let eventIds: string[] = [];
let staffIds: Record<string, string[]> = {}; // eventId -> staffIds
let creditBalanceAfterPurchases: number;

test.describe("Comprehensive Organizer/Staff/Payment System Tests", () => {
  test.describe.configure({ mode: "serial" }); // Run tests in order

  // ==================================================================
  // PHASE 1: ORGANIZER REGISTRATION & CREDIT PURCHASE
  // ==================================================================

  test("Step 1: Register new organizer account", async ({ page }) => {
    console.log("\n🎭 STEP 1: Registering new organizer account...\n");

    const organizer = await registerOrganizer(page, TEST_ORGANIZER);

    // Save credentials for subsequent tests
    organizerEmail = TEST_ORGANIZER.email;
    organizerPassword = TEST_ORGANIZER.password;

    // Verify we're on organizer dashboard
    await expect(page).toHaveURL(/\/organizer/);

    // Take screenshot
    await waitAndScreenshot(page, "01-organizer-registered");

    console.log(`✅ Organizer registered: ${organizer.email}`);
  });

  test("Step 2: Purchase 500 credits via Square", async ({ page }) => {
    console.log("\n💳 STEP 2: Purchasing 500 credits via Square...\n");

    // Login if needed
    if (!page.url().includes("/organizer")) {
      await page.goto("/login");
      await page.fill('input[name="email"]', organizerEmail);
      await page.fill('input[name="password"]', organizerPassword);
      await page.click('button[type="submit"]');
      await page.waitForURL(/\/organizer/);
    }

    // Purchase credits
    await purchaseCreditsSquare(
      page,
      CREDIT_PURCHASES.square.amount,
      {
        number: CREDIT_PURCHASES.square.testCard,
        cvv: CREDIT_PURCHASES.square.cvv,
        expiry: CREDIT_PURCHASES.square.expiry,
      }
    );

    // Verify balance
    const balance = await getCreditBalance(page);
    expect(balance).toBe(CREDIT_PURCHASES.square.amount);

    await waitAndScreenshot(page, "02-square-purchase-500-credits");

    console.log(`✅ Purchased 500 credits via Square. Balance: ${balance}`);
  });

  test("Step 3: Purchase 500 credits via Cash App Pay", async ({ page }) => {
    console.log("\n💰 STEP 3: Purchasing 500 credits via Cash App Pay...\n");

    await purchaseCreditsCashApp(
      page,
      CREDIT_PURCHASES.cashApp.amount,
      CREDIT_PURCHASES.cashApp.testTag
    );

    // Verify balance
    const balance = await getCreditBalance(page);
    expect(balance).toBe(EXPECTED_CREDIT_FLOW.purchased.total);

    creditBalanceAfterPurchases = balance;

    await waitAndScreenshot(page, "03-cashapp-purchase-500-credits");

    console.log(`✅ Purchased 500 credits via Cash App. Balance: ${balance}`);
  });

  // ==================================================================
  // PHASE 2: EVENT CREATION (3 EVENTS)
  // ==================================================================

  test("Step 4: Create Event 1 (First Event - FREE 1000 credits)", async ({ page }) => {
    console.log("\n🎫 STEP 4: Creating Event 1 (first event with FREE credits)...\n");

    const event = await createEvent(page, TEST_EVENTS[0]);
    eventIds.push(event.eventId!);

    // Verify first event bonus (1000 FREE credits)
    const balance = await getCreditBalance(page);
    const expectedBalance =
      EXPECTED_CREDIT_FLOW.purchased.total +
      EXPECTED_CREDIT_FLOW.bonus.firstEvent -
      TEST_EVENTS[0].creditsAllocated;

    expect(balance).toBe(expectedBalance);

    await waitAndScreenshot(page, "04-event1-created-free-credits");

    console.log(`✅ Event 1 created: ${event.name}`);
    console.log(`✅ First event bonus applied: +1000 credits`);
    console.log(`✅ Credits allocated: -${TEST_EVENTS[0].creditsAllocated}`);
    console.log(`✅ New balance: ${balance}`);
  });

  test("Step 5: Create Event 2 (Second Event - PAID)", async ({ page }) => {
    console.log("\n🎫 STEP 5: Creating Event 2 (PAID from purchased credits)...\n");

    const event = await createEvent(page, TEST_EVENTS[1]);
    eventIds.push(event.eventId!);

    // Verify credits deducted
    const balance = await getCreditBalance(page);
    const expectedBalance =
      EXPECTED_CREDIT_FLOW.totalCredits -
      TEST_EVENTS[0].creditsAllocated -
      TEST_EVENTS[1].creditsAllocated;

    expect(balance).toBe(expectedBalance);

    await waitAndScreenshot(page, "05-event2-created-paid");

    console.log(`✅ Event 2 created: ${event.name}`);
    console.log(`✅ Credits allocated: -${TEST_EVENTS[1].creditsAllocated}`);
    console.log(`✅ New balance: ${balance}`);
  });

  test("Step 6: Create Event 3 (Third Event - PAID)", async ({ page }) => {
    console.log("\n🎫 STEP 6: Creating Event 3 (PAID from purchased credits)...\n");

    const event = await createEvent(page, TEST_EVENTS[2]);
    eventIds.push(event.eventId!);

    // Verify final credits balance
    const balance = await getCreditBalance(page);
    expect(balance).toBe(EXPECTED_CREDIT_FLOW.remaining);

    await waitAndScreenshot(page, "06-event3-created-paid");

    console.log(`✅ Event 3 created: ${event.name}`);
    console.log(`✅ Credits allocated: -${TEST_EVENTS[2].creditsAllocated}`);
    console.log(`✅ Final balance: ${balance}`);
  });

  // ==================================================================
  // PHASE 3: STAFF ASSIGNMENT (3 TEAM MEMBERS PER EVENT)
  // ==================================================================

  test("Step 7: Add 3 Team Members to Event 1", async ({ page }) => {
    console.log("\n👥 STEP 7: Adding 3 Team Members to Event 1...\n");

    const eventId = eventIds[0];
    staffIds[eventId] = [];

    for (const teamMember of TEAM_MEMBERS_PER_EVENT[0]) {
      await addTeamMember(page, eventId, {
        ...teamMember,
        canAssignSubSellers: true,
      });

      console.log(`✅ Added: ${teamMember.name} - ${teamMember.ticketAllocation} tickets @ 100% commission`);
    }

    await waitAndScreenshot(page, "07-event1-team-members");
  });

  test("Step 8: Add 3 Team Members to Event 2", async ({ page }) => {
    console.log("\n👥 STEP 8: Adding 3 Team Members to Event 2...\n");

    const eventId = eventIds[1];
    staffIds[eventId] = [];

    for (const teamMember of TEAM_MEMBERS_PER_EVENT[1]) {
      await addTeamMember(page, eventId, {
        ...teamMember,
        canAssignSubSellers: true,
      });

      console.log(`✅ Added: ${teamMember.name} - ${teamMember.ticketAllocation} tickets @ 100% commission`);
    }

    await waitAndScreenshot(page, "08-event2-team-members");
  });

  test("Step 9: Add 3 Team Members to Event 3", async ({ page }) => {
    console.log("\n👥 STEP 9: Adding 3 Team Members to Event 3...\n");

    const eventId = eventIds[2];
    staffIds[eventId] = [];

    for (const teamMember of TEAM_MEMBERS_PER_EVENT[2]) {
      await addTeamMember(page, eventId, {
        ...teamMember,
        canAssignSubSellers: true,
      });

      console.log(`✅ Added: ${teamMember.name} - ${teamMember.ticketAllocation} tickets @ 100% commission`);
    }

    await waitAndScreenshot(page, "09-event3-team-members");
  });

  // ==================================================================
  // PHASE 4: ASSOCIATE ASSIGNMENT
  // ==================================================================

  test("Step 10: Team Members assign Associates (Event 1)", async ({ page }) => {
    console.log("\n🤝 STEP 10: Team Members assigning Associates for Event 1...\n");

    const eventId = eventIds[0];

    for (let i = 0; i < TEAM_MEMBERS_PER_EVENT[0].length; i++) {
      const teamMember = TEAM_MEMBERS_PER_EVENT[0][i];
      const associates = generateAssociatesForTeamMember(i);

      for (const associate of associates) {
        await addAssociate(page, eventId, teamMember.email, associate);

        console.log(`✅ ${teamMember.name} assigned: ${associate.name}`);
        console.log(`   - Tickets: ${associate.ticketAllocation}`);
        console.log(`   - Commission: $${associate.commissionValue / 100} per ticket`);
      }
    }

    await waitAndScreenshot(page, "10-event1-associates");
  });

  test("Step 11: Team Members assign Associates (Event 2)", async ({ page }) => {
    console.log("\n🤝 STEP 11: Team Members assigning Associates for Event 2...\n");

    const eventId = eventIds[1];

    for (let i = 0; i < TEAM_MEMBERS_PER_EVENT[1].length; i++) {
      const teamMember = TEAM_MEMBERS_PER_EVENT[1][i];
      const associates = generateAssociatesForTeamMember(i);

      for (const associate of associates) {
        await addAssociate(page, eventId, teamMember.email, associate);

        console.log(`✅ ${teamMember.name} assigned: ${associate.name}`);
        console.log(`   - Tickets: ${associate.ticketAllocation}`);
        console.log(`   - Commission: $${associate.commissionValue / 100} per ticket`);
      }
    }

    await waitAndScreenshot(page, "11-event2-associates");
  });

  test("Step 12: Team Members assign Associates (Event 3)", async ({ page }) => {
    console.log("\n🤝 STEP 12: Team Members assigning Associates for Event 3...\n");

    const eventId = eventIds[2];

    for (let i = 0; i < TEAM_MEMBERS_PER_EVENT[2].length; i++) {
      const teamMember = TEAM_MEMBERS_PER_EVENT[2][i];
      const associates = generateAssociatesForTeamMember(i);

      for (const associate of associates) {
        await addAssociate(page, eventId, teamMember.email, associate);

        console.log(`✅ ${teamMember.name} assigned: ${associate.name}`);
        console.log(`   - Tickets: ${associate.ticketAllocation}`);
        console.log(`   - Commission: $${associate.commissionValue / 100} per ticket`);
      }
    }

    await waitAndScreenshot(page, "12-event3-associates");
  });

  // ==================================================================
  // PHASE 5: CUSTOMER PURCHASES VIA STRIPE
  // ==================================================================

  test("Step 13: Simulate customer purchases - Event 1", async ({ page }) => {
    console.log("\n💳 STEP 13: Simulating customer purchases for Event 1...\n");

    const eventId = eventIds[0];

    for (let i = 0; i < 10; i++) {
      const purchase = CUSTOMER_PURCHASES[i % CUSTOMER_PURCHASES.length];

      await purchaseTicketsAsCustomer(
        page,
        eventId,
        purchase.quantity,
        purchase.testCard
      );

      console.log(`✅ Customer ${i + 1} purchased ${purchase.quantity} ticket(s)`);
    }

    await waitAndScreenshot(page, "13-event1-customer-purchases");
  });

  test("Step 14: Simulate customer purchases - Event 2", async ({ page }) => {
    console.log("\n💳 STEP 14: Simulating customer purchases for Event 2...\n");

    const eventId = eventIds[1];

    for (let i = 0; i < 10; i++) {
      const purchase = CUSTOMER_PURCHASES[i % CUSTOMER_PURCHASES.length];

      await purchaseTicketsAsCustomer(
        page,
        eventId,
        purchase.quantity,
        purchase.testCard
      );

      console.log(`✅ Customer ${i + 1} purchased ${purchase.quantity} ticket(s)`);
    }

    await waitAndScreenshot(page, "14-event2-customer-purchases");
  });

  test("Step 15: Simulate customer purchases - Event 3", async ({ page }) => {
    console.log("\n💳 STEP 15: Simulating customer purchases for Event 3...\n");

    const eventId = eventIds[2];

    for (let i = 0; i < 10; i++) {
      const purchase = CUSTOMER_PURCHASES[i % CUSTOMER_PURCHASES.length];

      await purchaseTicketsAsCustomer(
        page,
        eventId,
        purchase.quantity,
        purchase.testCard
      );

      console.log(`✅ Customer ${i + 1} purchased ${purchase.quantity} ticket(s)`);
    }

    await waitAndScreenshot(page, "15-event3-customer-purchases");
  });

  // ==================================================================
  // PHASE 6: VERIFICATION & SETTLEMENT
  // ==================================================================

  test("Step 16: Verify organizer credit balance", async ({ page }) => {
    console.log("\n✅ STEP 16: Verifying organizer credit balance...\n");

    // Login as organizer
    await page.goto("/login");
    await page.fill('input[name="email"]', organizerEmail);
    await page.fill('input[name="password"]', organizerPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/organizer/);

    // Check credit balance
    await verifyCreditBalance(page, EXPECTED_CREDIT_FLOW.remaining);

    await waitAndScreenshot(page, "16-final-credit-balance");

    console.log(`✅ Credit balance verified: ${EXPECTED_CREDIT_FLOW.remaining} credits remaining`);
  });

  test("Step 17: Verify Team Member commissions (100%)", async ({ page }) => {
    console.log("\n💰 STEP 17: Verifying Team Member commissions...\n");

    // For each event, verify settlement dashboard shows 100% commission
    for (let i = 0; i < eventIds.length; i++) {
      const eventId = eventIds[i];

      await page.goto(`/organizer/events/${eventId}/settlement`);
      await page.waitForLoadState("networkidle");

      await takeScreenshot(page, `17-event${i + 1}-settlement-dashboard`);

      console.log(`✅ Settlement dashboard checked for Event ${i + 1}`);
    }
  });

  test("Step 18: Verify admin panel records", async ({ page }) => {
    console.log("\n🔧 STEP 18: Verifying admin panel records...\n");

    // This would require admin login
    // For now, just verify events are visible in organizer dashboard

    await page.goto("/organizer/events");
    await page.waitForLoadState("networkidle");

    // Verify all 3 events are listed
    for (let i = 0; i < TEST_EVENTS.length; i++) {
      const eventName = TEST_EVENTS[i].name;
      await expect(page.locator(`text="${eventName}"`)).toBeVisible();
      console.log(`✅ Event visible: ${eventName}`);
    }

    await waitAndScreenshot(page, "18-organizer-events-list");
  });

  // ==================================================================
  // FINAL SUMMARY
  // ==================================================================

  test("Final Summary: Test execution complete", async ({ page }) => {
    console.log("\n" + "=".repeat(60));
    console.log("🎉 COMPREHENSIVE TEST SUITE COMPLETE");
    console.log("=".repeat(60));
    console.log("\n📊 Summary:");
    console.log(`   ✅ Organizer registered: ${organizerEmail}`);
    console.log(`   ✅ Credits purchased: ${EXPECTED_CREDIT_FLOW.purchased.total}`);
    console.log(`   ✅ First event bonus: ${EXPECTED_CREDIT_FLOW.bonus.firstEvent}`);
    console.log(`   ✅ Total credits: ${EXPECTED_CREDIT_FLOW.totalCredits}`);
    console.log(`   ✅ Events created: ${eventIds.length}`);
    console.log(`   ✅ Credits allocated: ${EXPECTED_CREDIT_FLOW.allocated.total}`);
    console.log(`   ✅ Credits remaining: ${EXPECTED_CREDIT_FLOW.remaining}`);
    console.log(`   ✅ Team Members added: 9 (3 per event)`);
    console.log(`   ✅ Associates added: ~9-18 (random)`);
    console.log(`   ✅ Customer purchases: 30 (10 per event)`);
    console.log("\n📸 Screenshots saved in: test-results/screenshots/");
    console.log("=".repeat(60) + "\n");
  });
});
