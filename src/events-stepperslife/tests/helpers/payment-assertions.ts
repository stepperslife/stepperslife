/**
 * Payment Assertions Helper
 * Validation functions for payment testing
 */

import { expect } from '@playwright/test';
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || "https://expert-vulture-775.convex.cloud";

export class PaymentAssertions {
  private convex: ConvexHttpClient;

  constructor() {
    this.convex = new ConvexHttpClient(CONVEX_URL);
  }

  /**
   * Assert CREDIT_CARD (split payment) fee calculation is correct
   */
  assertCreditCardFees(
    subtotalCents: number,
    platformFeeCents: number,
    processingFeeCents: number,
    totalCents: number
  ): void {
    // Platform fee: 3.7% + $1.79
    const expectedPlatformFee = Math.round(subtotalCents * 0.037) + 179;

    // Processing fee: 2.9% + $0.30
    const expectedProcessingFee = Math.round(subtotalCents * 0.029) + 30;

    // Total
    const expectedTotal = subtotalCents + expectedPlatformFee + expectedProcessingFee;

    console.log('Fee Calculation Verification:');
    console.log(`  Subtotal: $${(subtotalCents / 100).toFixed(2)}`);
    console.log(`  Expected Platform Fee: $${(expectedPlatformFee / 100).toFixed(2)}`);
    console.log(`  Actual Platform Fee: $${(platformFeeCents / 100).toFixed(2)}`);
    console.log(`  Expected Processing Fee: $${(expectedProcessingFee / 100).toFixed(2)}`);
    console.log(`  Actual Processing Fee: $${(processingFeeCents / 100).toFixed(2)}`);
    console.log(`  Expected Total: $${(expectedTotal / 100).toFixed(2)}`);
    console.log(`  Actual Total: $${(totalCents / 100).toFixed(2)}`);

    expect(platformFeeCents).toBe(expectedPlatformFee);
    expect(processingFeeCents).toBe(expectedProcessingFee);
    expect(totalCents).toBe(expectedTotal);
  }

  /**
   * Assert PREPAY with Stripe fee calculation is correct
   */
  assertPrepayStripeFees(
    subtotalCents: number,
    processingFeeCents: number,
    totalCents: number
  ): void {
    // Only Stripe processing fee: 2.9% + $0.30
    // NO platform fee for PREPAY model
    const expectedProcessingFee = Math.round(subtotalCents * 0.029) + 30;
    const expectedTotal = subtotalCents + expectedProcessingFee;

    console.log('PREPAY Stripe Fee Verification:');
    console.log(`  Subtotal: $${(subtotalCents / 100).toFixed(2)}`);
    console.log(`  Expected Processing Fee: $${(expectedProcessingFee / 100).toFixed(2)}`);
    console.log(`  Actual Processing Fee: $${(processingFeeCents / 100).toFixed(2)}`);
    console.log(`  Expected Total: $${(expectedTotal / 100).toFixed(2)}`);
    console.log(`  Actual Total: $${(totalCents / 100).toFixed(2)}`);

    expect(processingFeeCents).toBe(expectedProcessingFee);
    expect(totalCents).toBe(expectedTotal);
  }

  /**
   * Assert charity discount is applied correctly
   */
  assertCharityDiscount(
    subtotalCents: number,
    platformFeeCents: number,
    isCharityEnabled: boolean
  ): void {
    if (isCharityEnabled) {
      // Charity rate: 50% discount on platform fee
      // Normal: 3.7% + $1.79
      // Charity: 1.85% + $0.90
      const expectedPlatformFee = Math.round(subtotalCents * 0.0185) + 90;

      console.log('Charity Discount Verification:');
      console.log(`  Subtotal: $${(subtotalCents / 100).toFixed(2)}`);
      console.log(`  Expected Charity Platform Fee: $${(expectedPlatformFee / 100).toFixed(2)}`);
      console.log(`  Actual Platform Fee: $${(platformFeeCents / 100).toFixed(2)}`);

      expect(platformFeeCents).toBe(expectedPlatformFee);
    } else {
      // Regular platform fee should apply
      const expectedPlatformFee = Math.round(subtotalCents * 0.037) + 179;
      expect(platformFeeCents).toBe(expectedPlatformFee);
    }
  }

  /**
   * Verify Stripe split payment was created correctly
   */
  async verifyStripeSplitPayment(
    paymentIntentId: string,
    expectedAmountCents: number,
    expectedApplicationFeeCents: number,
    organizerStripeAccountId: string
  ): Promise<void> {
    console.log('Verifying Stripe split payment...');

    // In a real test, you would call Stripe API to verify the payment intent
    // For now, we'll verify via the order record in the database

    try {
      const order = await this.convex.query(api.orders.queries.getOrderByPaymentId, {
        paymentId: paymentIntentId
      });

      expect(order).toBeTruthy();
      expect(order.totalCents).toBe(expectedAmountCents);
      expect(order.platformFeeCents).toBe(expectedApplicationFeeCents);

      console.log('✓ Split payment verified in database');

      // Additional verification against Stripe API (requires Stripe SDK)
      /*
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      expect(paymentIntent.amount).toBe(expectedAmountCents);
      expect(paymentIntent.application_fee_amount).toBe(expectedApplicationFeeCents);
      expect(paymentIntent.transfer_data?.destination).toBe(organizerStripeAccountId);

      console.log('✓ Split payment verified with Stripe API');
      */
    } catch (error) {
      console.error('Split payment verification failed:', error);
      throw error;
    }
  }

  /**
   * Verify order was created with correct status
   */
  async verifyOrderCreated(
    orderId: Id<"orders">,
    expectedStatus: string,
    expectedPaymentMethod: string
  ): Promise<void> {
    const order = await this.convex.query(api.orders.queries.getOrder, {
      orderId
    });

    expect(order).toBeTruthy();
    expect(order.status).toBe(expectedStatus);
    expect(order.paymentMethod).toBe(expectedPaymentMethod);

    console.log(`✓ Order ${orderId} verified: status=${expectedStatus}, payment=${expectedPaymentMethod}`);
  }

  /**
   * Verify tickets were generated correctly
   */
  async verifyTicketsGenerated(
    orderId: Id<"orders">,
    expectedQuantity: number,
    expectedStatus: string
  ): Promise<void> {
    const tickets = await this.convex.query(api.tickets.queries.getTicketsByOrder, {
      orderId
    });

    expect(tickets).toHaveLength(expectedQuantity);

    tickets.forEach((ticket: any, index: number) => {
      expect(ticket.status).toBe(expectedStatus);
      expect(ticket.qrCode).toBeTruthy();
      console.log(`✓ Ticket ${index + 1}/${expectedQuantity}: status=${ticket.status}, QR=${ticket.qrCode.substring(0, 20)}...`);
    });
  }

  /**
   * Verify cash payment activation flow
   */
  async verifyCashTicketActivation(
    ticketId: Id<"tickets">,
    activationCode: string
  ): Promise<void> {
    // Verify ticket starts as PENDING_ACTIVATION
    let ticket = await this.convex.query(api.tickets.queries.getTicket, {
      ticketId
    });

    expect(ticket.status).toBe('PENDING_ACTIVATION');
    expect(ticket.activationCodeHash).toBeTruthy();

    console.log('✓ Cash ticket created with PENDING_ACTIVATION status');

    // Simulate staff activation
    await this.convex.mutation(api.orders.cashPayments.activateTicket, {
      ticketId,
      activationCode
    });

    // Verify ticket is now VALID
    ticket = await this.convex.query(api.tickets.queries.getTicket, {
      ticketId
    });

    expect(ticket.status).toBe('VALID');
    console.log('✓ Cash ticket activated successfully');
  }

  /**
   * Verify organizer credit balance
   */
  async verifyOrganizerCredits(
    organizerId: Id<"users">,
    expectedCreditsRemaining: number
  ): Promise<void> {
    const credits = await this.convex.query(api.credits.queries.getOrganizerCredits, {
      organizerId
    });

    expect(credits).toBeTruthy();
    expect(credits.creditsRemaining).toBe(expectedCreditsRemaining);

    console.log(`✓ Organizer credit balance verified: ${expectedCreditsRemaining} credits remaining`);
  }

  /**
   * Verify credits were deducted for PREPAY ticket sale
   */
  async verifyCreditDeduction(
    organizerId: Id<"users">,
    previousBalance: number,
    ticketsUsed: number
  ): Promise<void> {
    const expectedBalance = previousBalance - ticketsUsed;

    const credits = await this.convex.query(api.credits.queries.getOrganizerCredits, {
      organizerId
    });

    expect(credits.creditsRemaining).toBe(expectedBalance);

    console.log(`✓ Credits deducted: ${previousBalance} - ${ticketsUsed} = ${expectedBalance}`);
  }

  /**
   * Verify first event free credits
   */
  async verifyFirstEventFreeCredits(
    organizerId: Id<"users">,
    expectedEventId: Id<"events">
  ): Promise<void> {
    const credits = await this.convex.query(api.credits.queries.getOrganizerCredits, {
      organizerId
    });

    expect(credits.firstEventFreeUsed).toBe(true);
    expect(credits.firstEventId).toBe(expectedEventId);
    expect(credits.creditsTotal).toBeGreaterThanOrEqual(1000);

    console.log('✓ First event free 1,000 credits verified');
  }

  /**
   * Verify webhook was processed
   */
  async verifyWebhookProcessed(
    webhookId: string,
    expectedStatus: string
  ): Promise<void> {
    // This assumes you have a webhookLogs table
    const webhook = await this.convex.query(api.webhooks.queries.getWebhook, {
      webhookId
    });

    expect(webhook).toBeTruthy();
    expect(webhook.status).toBe(expectedStatus);

    console.log(`✓ Webhook ${webhookId} processed: status=${expectedStatus}`);
  }

  /**
   * Verify payment config for event
   */
  async verifyEventPaymentConfig(
    eventId: Id<"events">,
    expectedModel: "PREPAY" | "CREDIT_CARD",
    expectedPaymentMethods: string[]
  ): Promise<void> {
    const config = await this.convex.query(api.paymentConfig.queries.getEventPaymentConfig, {
      eventId
    });

    expect(config).toBeTruthy();
    expect(config.paymentModel).toBe(expectedModel);

    expectedPaymentMethods.forEach((method) => {
      expect(config.customerPaymentMethods).toContain(method);
    });

    console.log(`✓ Payment config verified: model=${expectedModel}, methods=${expectedPaymentMethods.join(', ')}`);
  }

  /**
   * Calculate and verify organizer revenue
   */
  async verifyOrganizerRevenue(
    orderId: Id<"orders">,
    expectedRevenueCents: number
  ): Promise<void> {
    const order = await this.convex.query(api.orders.queries.getOrder, {
      orderId
    });

    const actualRevenue = order.subtotalCents - order.platformFeeCents - order.processingFeeCents;

    console.log('Organizer Revenue Verification:');
    console.log(`  Subtotal: $${(order.subtotalCents / 100).toFixed(2)}`);
    console.log(`  Platform Fee: $${(order.platformFeeCents / 100).toFixed(2)}`);
    console.log(`  Processing Fee: $${(order.processingFeeCents / 100).toFixed(2)}`);
    console.log(`  Expected Revenue: $${(expectedRevenueCents / 100).toFixed(2)}`);
    console.log(`  Actual Revenue: $${(actualRevenue / 100).toFixed(2)}`);

    expect(actualRevenue).toBe(expectedRevenueCents);
  }

  /**
   * Verify refund was processed correctly
   */
  async verifyRefund(
    orderId: Id<"orders">,
    refundAmountCents: number
  ): Promise<void> {
    const order = await this.convex.query(api.orders.queries.getOrder, {
      orderId
    });

    expect(order.status).toBe('REFUNDED');
    expect(order.refundAmount).toBe(refundAmountCents);

    console.log(`✓ Refund verified: $${(refundAmountCents / 100).toFixed(2)}`);
  }

  /**
   * Assert ticket QR code format
   */
  assertQRCodeFormat(qrCode: string, ticketId: Id<"tickets">): void {
    // QR code should contain the ticket ID and be properly formatted
    expect(qrCode).toBeTruthy();
    expect(qrCode.length).toBeGreaterThan(0);
    expect(qrCode).toContain(ticketId);

    console.log(`✓ QR code format valid for ticket ${ticketId}`);
  }

  /**
   * Verify concurrent purchase handling (no over-allocation)
   */
  async verifyConcurrentPurchases(
    eventId: Id<"events">,
    ticketTierId: Id<"ticketTiers">,
    totalPurchased: number,
    maxQuantity: number
  ): Promise<void> {
    const tier = await this.convex.query(api.ticketTiers.queries.getTicketTier, {
      ticketTierId
    });

    expect(tier.sold).toBeLessThanOrEqual(maxQuantity);
    expect(tier.sold).toBe(totalPurchased);

    console.log(`✓ Concurrent purchases verified: ${totalPurchased}/${maxQuantity} sold`);
  }

  /**
   * Generate test summary report
   */
  generateSummaryReport(testResults: {
    totalEvents: number;
    prepayEvents: number;
    creditCardEvents: number;
    totalPurchases: number;
    totalRevenueCents: number;
    totalPlatformFeesCents: number;
    successfulPayments: number;
    failedPayments: number;
  }): void {
    console.log('\n' + '='.repeat(60));
    console.log('PAYMENT SYSTEM TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Events Created: ${testResults.totalEvents}`);
    console.log(`  - PREPAY Events: ${testResults.prepayEvents}`);
    console.log(`  - CREDIT_CARD Events: ${testResults.creditCardEvents}`);
    console.log(`\nTotal Purchases: ${testResults.totalPurchases}`);
    console.log(`  - Successful: ${testResults.successfulPayments}`);
    console.log(`  - Failed: ${testResults.failedPayments}`);
    console.log(`\nTotal Revenue: $${(testResults.totalRevenueCents / 100).toFixed(2)}`);
    console.log(`Platform Fees Collected: $${(testResults.totalPlatformFeesCents / 100).toFixed(2)}`);
    console.log('='.repeat(60) + '\n');
  }
}

export const paymentAssertions = new PaymentAssertions();
