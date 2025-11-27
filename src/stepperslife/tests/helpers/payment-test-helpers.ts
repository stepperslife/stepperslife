/**
 * Payment Test Helper Functions
 *
 * Utilities for testing payment flows in Playwright tests
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

// Initialize Convex client
const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || "https://fearless-dragon-613.convex.cloud";
const convex = new ConvexHttpClient(CONVEX_URL);

export interface TestOrganizer {
  userId: Id<"users">;
  creditsId: Id<"organizerCredits">;
  email: string;
  name: string;
}

export interface TestEvent {
  eventId: Id<"events">;
  paymentConfigId: Id<"eventPaymentConfig">;
  tierId: Id<"ticketTiers">;
  eventName: string;
  paymentModel: "PREPAY" | "CREDIT_CARD";
}

export interface TestOrder {
  orderId: Id<"orders">;
  ticketIds: Id<"tickets">[];
  subtotalCents: number;
  platformFeeCents: number;
  processingFeeCents: number;
  totalCents: number;
}

/**
 * Create a test organizer with credits
 */
export async function createTestOrganizer(
  email: string,
  name: string,
  credits: number = 1000,
  stripeConnectId?: string
): Promise<TestOrganizer> {
  const result = await convex.mutation(api.testing.paymentTestHelpers.setupTestOrganizer, {
    email,
    name,
    credits,
    stripeConnectId,
  });

  return {
    userId: result.userId,
    creditsId: result.creditsId,
    email,
    name,
  };
}

/**
 * Create a PREPAY event with tickets
 */
export async function createPrepayEvent(
  organizerId: Id<"users">,
  eventName: string,
  ticketPrice: number,
  ticketQuantity: number,
  ticketsAllocated: number,
  customerPaymentMethods: string[] = ["CASH"]
): Promise<TestEvent> {
  const result = await convex.mutation(api.testing.paymentTestHelpers.setupTestEvent, {
    organizerId,
    eventName,
    paymentModel: "PREPAY",
    ticketPrice,
    ticketQuantity,
    ticketsAllocated,
    customerPaymentMethods,
  });

  return {
    eventId: result.eventId,
    paymentConfigId: result.paymentConfigId,
    tierId: result.tierId,
    eventName,
    paymentModel: "PREPAY",
  };
}

/**
 * Create a CREDIT_CARD event with Stripe split payment
 */
export async function createCreditCardEvent(
  organizerId: Id<"users">,
  eventName: string,
  ticketPrice: number,
  ticketQuantity: number,
  charityDiscount: boolean = false
): Promise<TestEvent> {
  const result = await convex.mutation(api.testing.paymentTestHelpers.setupTestEvent, {
    organizerId,
    eventName,
    paymentModel: "CREDIT_CARD",
    ticketPrice,
    ticketQuantity,
    charityDiscount,
    customerPaymentMethods: ["STRIPE"],
  });

  return {
    eventId: result.eventId,
    paymentConfigId: result.paymentConfigId,
    tierId: result.tierId,
    eventName,
    paymentModel: "CREDIT_CARD",
  };
}

/**
 * Simulate a customer purchasing tickets
 */
export async function simulatePurchase(
  eventId: Id<"events">,
  ticketTierId: Id<"ticketTiers">,
  quantity: number,
  buyerEmail: string,
  buyerName: string,
  paymentMethod: "STRIPE" | "CASH" | "PAYPAL" | "TEST" = "STRIPE"
): Promise<TestOrder> {
  const result = await convex.mutation(api.testing.paymentTestHelpers.simulateOrder, {
    eventId,
    ticketTierId,
    quantity,
    buyerEmail,
    buyerName,
    paymentMethod,
  });

  return result;
}

/**
 * Verify credit balance for an organizer
 */
export async function verifyCredits(organizerId: Id<"users">) {
  return await convex.query(api.testing.paymentTestHelpers.verifyCredits, {
    organizerId,
  });
}

/**
 * Verify order and fee calculations
 */
export async function verifyOrder(orderId: Id<"orders">) {
  return await convex.query(api.testing.paymentTestHelpers.verifyOrder, {
    orderId,
  });
}

/**
 * Get event statistics
 */
export async function getEventStats(eventId: Id<"events">) {
  return await convex.query(api.testing.paymentTestHelpers.getEventStats, {
    eventId,
  });
}

/**
 * Clean up all test data
 */
export async function cleanupTestData() {
  return await convex.mutation(api.testing.paymentTestHelpers.cleanupTestData, {});
}

/**
 * Calculate expected fees for PREPAY model
 */
export function calculatePrepayFees(subtotalCents: number, onlinePayment: boolean = true) {
  const platformFeeCents = 0; // PREPAY has no platform fee
  const processingFeeCents = onlinePayment ? Math.round(subtotalCents * 0.029) : 0;
  const totalCents = subtotalCents + platformFeeCents + processingFeeCents;

  return {
    subtotalCents,
    platformFeeCents,
    processingFeeCents,
    totalCents,
  };
}

/**
 * Calculate expected fees for CREDIT_CARD model
 */
export function calculateCreditCardFees(
  subtotalCents: number,
  quantity: number,
  charityDiscount: boolean = false,
  lowPriceDiscount: boolean = false
) {
  // Determine platform fee based on discounts
  let platformFeePercent = 3.7;
  let platformFeeFixed = 179; // $1.79 in cents

  if (charityDiscount || lowPriceDiscount) {
    platformFeePercent = 1.85;
    platformFeeFixed = 90; // $0.90 in cents
  }

  const platformFeeCents =
    Math.round(subtotalCents * (platformFeePercent / 100)) + platformFeeFixed * quantity;
  const processingFeeCents = Math.round((subtotalCents + platformFeeCents) * 0.029);
  const totalCents = subtotalCents + platformFeeCents + processingFeeCents;

  return {
    subtotalCents,
    platformFeeCents,
    processingFeeCents,
    totalCents,
    platformFeePercent,
    platformFeeFixed,
  };
}

/**
 * Wait for a condition with timeout
 */
export async function waitFor(
  condition: () => Promise<boolean>,
  timeoutMs: number = 10000,
  intervalMs: number = 500
): Promise<boolean> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeoutMs) {
    if (await condition()) {
      return true;
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  return false;
}

/**
 * Format cents to dollars
 */
export function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

/**
 * Generate unique test email
 */
export function generateTestEmail(prefix: string): string {
  return `${prefix}-${Date.now()}@stepperslife.test`;
}

/**
 * Generate unique test event name
 */
export function generateTestEventName(prefix: string): string {
  return `${prefix} ${Date.now()}`;
}

/**
 * Verify fee calculations match expected values
 */
export function verifyFeeCalculations(
  actual: { subtotalCents: number; platformFeeCents: number; processingFeeCents: number; totalCents: number },
  expected: { subtotalCents: number; platformFeeCents: number; processingFeeCents: number; totalCents: number },
  tolerance: number = 1 // Allow 1 cent tolerance for rounding
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (Math.abs(actual.subtotalCents - expected.subtotalCents) > tolerance) {
    errors.push(
      `Subtotal mismatch: expected ${formatCents(expected.subtotalCents)}, got ${formatCents(actual.subtotalCents)}`
    );
  }

  if (Math.abs(actual.platformFeeCents - expected.platformFeeCents) > tolerance) {
    errors.push(
      `Platform fee mismatch: expected ${formatCents(expected.platformFeeCents)}, got ${formatCents(actual.platformFeeCents)}`
    );
  }

  if (Math.abs(actual.processingFeeCents - expected.processingFeeCents) > tolerance) {
    errors.push(
      `Processing fee mismatch: expected ${formatCents(expected.processingFeeCents)}, got ${formatCents(actual.processingFeeCents)}`
    );
  }

  if (Math.abs(actual.totalCents - expected.totalCents) > tolerance) {
    errors.push(
      `Total mismatch: expected ${formatCents(expected.totalCents)}, got ${formatCents(actual.totalCents)}`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
