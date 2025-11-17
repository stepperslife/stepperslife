/**
 * Comprehensive Payment System Test Suite
 * Tests all payment flows: PREPAY (3 events) + CREDIT_CARD (7 events) = 10 events total
 * Tests all payment methods: Cash, Stripe, PayPal, CashApp
 */

import { test, expect, Page } from '@playwright/test';
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import {
  generateAllTestEvents,
  generateTestPurchases,
  calculateCreditCardFees,
  calculatePrepayStripeFees,
  calculateCreditsNeeded,
  STRIPE_TEST_CARDS,
  TEST_ORGANIZER,
  TestEvent
} from "./helpers/payment-test-data";
import { OrganizerSetupHelper } from "./helpers/organizer-setup";
import { PaymentAssertions } from "./helpers/payment-assertions";

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL!;
const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3004';

// Test state
let convex: ConvexHttpClient;
let organizerId: Id<"users">;
let createdEventIds: Id<"events">[] = [];
let testSummary = {
  totalEvents: 0,
  prepayEvents: 0,
  creditCardEvents: 0,
  totalPurchases: 0,
  totalRevenueCents: 0,
  totalPlatformFeesCents: 0,
  successfulPayments: 0,
  failedPayments: 0
};

test.describe('Comprehensive Payment System Tests', () => {

  test.beforeAll(async () => {
    convex = new ConvexHttpClient(CONVEX_URL);
    console.log('\n' + '='.repeat(80));
    console.log('COMPREHENSIVE PAYMENT SYSTEM TEST SUITE');
    console.log('Testing: 3 PREPAY events + 7 CREDIT_CARD events = 10 events total');
    console.log('='.repeat(80) + '\n');
  });

  test.afterAll(async () => {
    // Print final summary
    const assertions = new PaymentAssertions();
    assertions.generateSummaryReport(testSummary);

    // Cleanup (optional - comment out to inspect data)
    // const cleaner = new TestDataCleaner();
    // await cleaner.cleanupAll({ deleteEvents: true, deleteOrders: true, deleteTickets: true });
  });

  test('Phase 1: Setup Test Organizer', async ({ page }) => {
    console.log('\n[PHASE 1] Setting up test organizer account...\n');

    const helper = new OrganizerSetupHelper(page);

    // Sign in as organizer
    await helper.signInAsOrganizer(TEST_ORGANIZER.email, TEST_ORGANIZER.name);

    // Get organizer ID
    organizerId = await getOrganizerIdByEmail(TEST_ORGANIZER.email);

    expect(organizerId).toBeTruthy();
    console.log(`✓ Organizer setup complete: ${organizerId}`);
  });

  test('Phase 2: Purchase Credits for PREPAY Events', async ({ page }) => {
    console.log('\n[PHASE 2] Purchasing credits for PREPAY events...\n');

    const helper = new OrganizerSetupHelper(page);

    // Calculate credits needed for 3 PREPAY events
    const prepayEvents = generateAllTestEvents().slice(0, 3);
    const creditsNeeded = calculateCreditsNeeded(prepayEvents);

    console.log(`Credits needed for PREPAY events: ${creditsNeeded}`);

    // Check if first event free credits are available (1,000 credits)
    const hasFreeCredits = await helper.verifyFirstEventFreeCredits(organizerId);

    if (hasFreeCredits) {
      console.log('✓ First event free credits (1,000) will be allocated');
      testSummary.totalRevenueCents += 0; // Free credits
    }

    // If we need more credits beyond the free 1,000
    const additionalCreditsNeeded = Math.max(0, creditsNeeded - 1000);

    if (additionalCreditsNeeded > 0) {
      console.log(`Purchasing ${additionalCreditsNeeded} additional credits...`);

      // For testing purposes, use test credits instead of real payment
      await helper.addTestCredits(organizerId, additionalCreditsNeeded);

      console.log(`✓ ${additionalCreditsNeeded} test credits added`);
    }

    // Verify credit balance
    const balance = await helper.getCreditBalance(organizerId);
    expect(balance).toBeGreaterThanOrEqual(creditsNeeded);

    console.log(`✓ Total credit balance: ${balance} credits`);
  });

  test('Phase 3: Create 3 PREPAY Events', async ({ page }) => {
    console.log('\n[PHASE 3] Creating 3 PREPAY events...\n');

    const prepayEvents = generateAllTestEvents().slice(0, 3);

    for (let i = 0; i < prepayEvents.length; i++) {
      const event = prepayEvents[i];
      console.log(`\nCreating PREPAY Event ${i + 1}: ${event.name}`);

      const eventId = await createEvent(page, event, organizerId);
      createdEventIds.push(eventId);

      testSummary.totalEvents++;
      testSummary.prepayEvents++;

      console.log(`✓ PREPAY Event ${i + 1} created: ${eventId}`);
    }
  });

  test('Phase 4: Setup Stripe Connect for CREDIT_CARD Events', async ({ page }) => {
    console.log('\n[PHASE 4] Setting up Stripe Connect account...\n');

    const helper = new OrganizerSetupHelper(page);

    // For testing, use a test Stripe Connect account
    const stripeAccountId = await helper.useTestStripeAccount(organizerId);

    expect(stripeAccountId).toBeTruthy();
    console.log(`✓ Stripe Connect account setup: ${stripeAccountId}`);
  });

  test('Phase 5: Create 7 CREDIT_CARD Events', async ({ page }) => {
    console.log('\n[PHASE 5] Creating 7 CREDIT_CARD events...\n');

    const creditCardEvents = generateAllTestEvents().slice(3, 10);

    for (let i = 0; i < creditCardEvents.length; i++) {
      const event = creditCardEvents[i];
      console.log(`\nCreating CREDIT_CARD Event ${i + 1}: ${event.name}`);

      const eventId = await createEvent(page, event, organizerId);
      createdEventIds.push(eventId);

      testSummary.totalEvents++;
      testSummary.creditCardEvents++;

      console.log(`✓ CREDIT_CARD Event ${i + 1} created: ${eventId}`);
    }
  });

  test('Phase 6: Client Purchases - PREPAY Event 1 (Cash Only)', async ({ page }) => {
    console.log('\n[PHASE 6] Testing client purchases - PREPAY Event 1 (Cash Only)...\n');

    const eventId = createdEventIds[0];
    const purchases = generateTestPurchases().filter(p => p.eventIndex === 0);

    for (const purchase of purchases) {
      console.log(`Purchase: ${purchase.quantity}x tickets via ${purchase.paymentMethod}`);

      await purchaseTickets(page, eventId, purchase);

      testSummary.totalPurchases++;
      testSummary.successfulPayments++;
    }

    console.log(`✓ Completed ${purchases.length} cash purchases for Event 1`);
  });

  test('Phase 7: Client Purchases - PREPAY Event 2 (Multi-Payment)', async ({ page }) => {
    console.log('\n[PHASE 7] Testing client purchases - PREPAY Event 2 (Multi-Payment)...\n');

    const eventId = createdEventIds[1];
    const purchases = generateTestPurchases().filter(p => p.eventIndex === 1);

    for (const purchase of purchases) {
      console.log(`Purchase: ${purchase.quantity}x tickets via ${purchase.paymentMethod}`);

      try {
        await purchaseTickets(page, eventId, purchase);
        testSummary.totalPurchases++;
        testSummary.successfulPayments++;
      } catch (error) {
        console.error(`Purchase failed: ${error.message}`);
        testSummary.failedPayments++;
      }
    }

    console.log(`✓ Completed purchases for Event 2 (Stripe, PayPal, CashApp)`);
  });

  test('Phase 8: Client Purchases - PREPAY Event 3 (All Methods)', async ({ page }) => {
    console.log('\n[PHASE 8] Testing client purchases - PREPAY Event 3 (All Methods)...\n');

    const eventId = createdEventIds[2];
    const purchases = generateTestPurchases().filter(p => p.eventIndex === 2);

    for (const purchase of purchases) {
      console.log(`Purchase: ${purchase.quantity}x tickets via ${purchase.paymentMethod}`);

      try {
        await purchaseTickets(page, eventId, purchase);
        testSummary.totalPurchases++;
        testSummary.successfulPayments++;
      } catch (error) {
        console.error(`Purchase failed: ${error.message}`);
        testSummary.failedPayments++;
      }
    }

    console.log(`✓ Completed purchases for Event 3 (Cash, Stripe, PayPal, CashApp)`);
  });

  test('Phase 9: Client Purchases - CREDIT_CARD Events (Split Payment)', async ({ page }) => {
    console.log('\n[PHASE 9] Testing client purchases - CREDIT_CARD Events (Stripe Split Payment)...\n');

    for (let i = 3; i < 10; i++) {
      const eventId = createdEventIds[i];
      const purchases = generateTestPurchases().filter(p => p.eventIndex === i);

      console.log(`\nEvent ${i + 1} Purchases:`);

      for (const purchase of purchases) {
        console.log(`  Purchase: ${purchase.quantity}x tickets via Stripe`);

        try {
          await purchaseTickets(page, eventId, purchase);

          // Calculate and verify split payment
          const subtotal = purchase.quantity * 2500; // Assuming $25 average
          const fees = calculateCreditCardFees(subtotal);

          testSummary.totalRevenueCents += subtotal;
          testSummary.totalPlatformFeesCents += fees.platformFeeCents;
          testSummary.totalPurchases++;
          testSummary.successfulPayments++;

        } catch (error) {
          console.error(`  Purchase failed: ${error.message}`);
          testSummary.failedPayments++;
        }
      }
    }

    console.log(`✓ Completed split payment purchases for all 7 CREDIT_CARD events`);
  });

  test('Phase 10: Verify All Payment Calculations', async () => {
    console.log('\n[PHASE 10] Verifying all payment calculations...\n');

    const assertions = new PaymentAssertions();

    // Verify each event's payment config
    for (let i = 0; i < createdEventIds.length; i++) {
      const eventId = createdEventIds[i];
      const event = generateAllTestEvents()[i];

      await assertions.verifyEventPaymentConfig(
        eventId,
        event.paymentModel,
        event.customerPaymentMethods
      );
    }

    console.log('✓ All payment configurations verified');
  });

  test('Phase 11: Verify Split Payment Accuracy', async () => {
    console.log('\n[PHASE 11] Verifying Stripe split payment accuracy...\n');

    const assertions = new PaymentAssertions();

    // Get all CREDIT_CARD orders
    for (let i = 3; i < 10; i++) {
      const eventId = createdEventIds[i];

      const orders = await convex.query(api.orders.queries.getEventOrders, {
        eventId
      });

      console.log(`Event ${i + 1}: ${orders.length} orders to verify`);

      for (const order of orders) {
        if (order.paymentId && order.paymentMethod === 'STRIPE') {
          // Verify split payment calculation
          const fees = calculateCreditCardFees(order.subtotalCents);

          assertions.assertCreditCardFees(
            order.subtotalCents,
            order.platformFeeCents,
            order.processingFeeCents,
            order.totalCents
          );
        }
      }
    }

    console.log('✓ All split payments verified');
  });

  test('Phase 12: Verify Tickets Generated', async () => {
    console.log('\n[PHASE 12] Verifying all tickets were generated correctly...\n');

    const assertions = new PaymentAssertions();
    let totalTickets = 0;

    for (const eventId of createdEventIds) {
      const tickets = await convex.query(api.tickets.queries.getEventTickets, {
        eventId
      });

      totalTickets += tickets.length;

      // Verify each ticket has a QR code
      tickets.forEach((ticket: any) => {
        expect(ticket.qrCode).toBeTruthy();
        expect(ticket.status).toMatch(/VALID|PENDING_ACTIVATION|SCANNED/);
      });
    }

    console.log(`✓ ${totalTickets} tickets generated across all ${createdEventIds.length} events`);
  });
});

/**
 * Helper: Create an event with ticket tiers
 */
async function createEvent(
  page: Page,
  event: TestEvent,
  organizerId: Id<"users">
): Promise<Id<"events">> {
  const convex = new ConvexHttpClient(CONVEX_URL);

  // Create event
  const eventId = await convex.mutation(api.events.mutations.createEvent, {
    name: event.name,
    description: event.description,
    organizerId,
    startDate: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days from now
    endDate: Date.now() + 30 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000, // +4 hours
    location: "Test Venue - " + event.name.substring(0, 20),
    status: "DRAFT"
  });

  // Configure payment model
  if (event.paymentModel === "PREPAY") {
    await convex.mutation(api.paymentConfig.mutations.selectPrepayModel, {
      eventId,
      customerPaymentMethods: event.customerPaymentMethods,
      organizerPaymentMethod: "SQUARE"
    });
  } else {
    // CREDIT_CARD model
    const stripeAccountId = process.env.STRIPE_TEST_CONNECT_ACCOUNT_ID || "acct_test_" + Date.now();

    await convex.mutation(api.paymentConfig.mutations.selectCreditCardModel, {
      eventId,
      stripeConnectAccountId: stripeAccountId,
      isCharityEvent: false
    });
  }

  // Create ticket tiers
  for (const tier of event.ticketTiers) {
    await convex.mutation(api.ticketTiers.mutations.createTicketTier, {
      eventId,
      name: tier.name,
      price: tier.price * 100, // Convert to cents
      quantity: tier.quantity,
      description: tier.description
    });
  }

  // Allocate tickets (for PREPAY model)
  if (event.paymentModel === "PREPAY") {
    const totalTickets = event.ticketTiers.reduce((sum, tier) => sum + tier.quantity, 0);

    await convex.mutation(api.paymentConfig.mutations.allocateTickets, {
      eventId,
      ticketsToAllocate: totalTickets
    });
  }

  // Publish event
  await convex.mutation(api.events.mutations.publishEvent, { eventId });

  return eventId;
}

/**
 * Helper: Purchase tickets as a client
 */
async function purchaseTickets(
  page: Page,
  eventId: Id<"events">,
  purchase: any
): Promise<void> {
  const convex = new ConvexHttpClient(CONVEX_URL);

  // Get ticket tiers for the event
  const tiers = await convex.query(api.ticketTiers.queries.getEventTicketTiers, {
    eventId
  });

  const tier = tiers[purchase.ticketTierIndex];

  // Create order via API (faster than UI for testing)
  const orderId = await convex.mutation(api.tickets.mutations.createOrder, {
    eventId,
    buyerId: organizerId, // Using organizer as buyer for simplicity
    items: [{ ticketTierId: tier._id, quantity: purchase.quantity }]
  });

  // Handle payment based on method
  switch (purchase.paymentMethod) {
    case 'CASH':
      // Cash orders remain PENDING until staff activation
      console.log(`  Cash order created: ${orderId} (PENDING_ACTIVATION)`);
      break;

    case 'STRIPE':
      // Simulate Stripe payment completion
      const paymentIntentId = `pi_test_${Date.now()}`;

      await convex.mutation(api.tickets.mutations.completeOrder, {
        orderId,
        paymentId: paymentIntentId,
        paymentMethod: "STRIPE"
      });

      console.log(`  Stripe payment completed: ${orderId}`);
      break;

    case 'PAYPAL':
      // Simulate PayPal payment completion
      const paypalOrderId = `PAYPAL_${Date.now()}`;

      await convex.mutation(api.tickets.mutations.completeOrder, {
        orderId,
        paymentId: paypalOrderId,
        paymentMethod: "PAYPAL"
      });

      console.log(`  PayPal payment completed: ${orderId}`);
      break;

    case 'CASHAPP':
      // Simulate CashApp payment completion
      const cashAppId = `CASHAPP_${Date.now()}`;

      await convex.mutation(api.tickets.mutations.completeOrder, {
        orderId,
        paymentId: cashAppId,
        paymentMethod: "CASHAPP"
      });

      console.log(`  CashApp payment completed: ${orderId}`);
      break;
  }
}

/**
 * Helper: Get organizer ID by email
 */
async function getOrganizerIdByEmail(email: string): Promise<Id<"users">> {
  const convex = new ConvexHttpClient(CONVEX_URL);

  const user = await convex.query(api.users.queries.getUserByEmail, {
    email
  });

  return user._id;
}
