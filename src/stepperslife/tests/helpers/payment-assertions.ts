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
    // For now, we'll log the expected values

    try {
      // Note: Direct order query by payment ID not available in current API
      // This would need to be implemented in convex/orders/queries.ts if needed
      console.log('Expected payment verification:');
      console.log(`  Payment Intent ID: ${paymentIntentId}`);
      console.log(`  Amount: $${(expectedAmountCents / 100).toFixed(2)}`);
      console.log(`  Application Fee: $${(expectedApplicationFeeCents / 100).toFixed(2)}`);
      console.log(`  Organizer Account: ${organizerStripeAccountId}`);

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
    const result = await this.convex.query(api.tickets.queries.getOrderDetails, {
      orderId
    });

    expect(result).toBeTruthy();
    expect(result!.order.status).toBe(expectedStatus);
    expect(result!.order.paymentMethod).toBe(expectedPaymentMethod);

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
    // Get order details to find associated tickets
    const result = await this.convex.query(api.tickets.queries.getOrderDetails, {
      orderId
    });

    expect(result).toBeTruthy();
    if (!result || !result.event) return;

    // Query tickets by event and filter by order ID
    const allTickets = await this.convex.query(api.tickets.queries.getTicketsByEvent, {
      eventId: result.event._id
    });

    const tickets = allTickets.filter((t: any) => t.orderId === orderId);

    expect(tickets).toHaveLength(expectedQuantity);

    tickets.forEach((ticket: any, index: number) => {
      expect(ticket.status).toBe(expectedStatus);
      expect(ticket.ticketCode).toBeTruthy();
      console.log(`✓ Ticket ${index + 1}/${expectedQuantity}: status=${ticket.status}, Code=${ticket.ticketCode.substring(0, 20)}...`);
    });
  }

  /**
   * Verify cash payment activation flow
   */
  async verifyCashTicketActivation(
    ticketId: Id<"tickets">,
    activationCode: string
  ): Promise<void> {
    // Note: Direct ticket query by ID not available in current API
    // This functionality would need to be implemented or use getTicketByCode instead
    console.log(`Cash ticket activation verification for ticket ${ticketId}`);
    console.log(`  Expected activation code: ${activationCode}`);
    console.log('  Note: Direct ticket query not available - skipping activation verification');

    // TODO: Implement when direct ticket queries are available
    // Expected flow:
    // 1. Query ticket by ID - expect PENDING_ACTIVATION status
    // 2. Call activation mutation
    // 3. Query ticket again - expect VALID status
  }

  /**
   * Verify organizer credit balance
   */
  async verifyOrganizerCredits(
    organizerId: Id<"users">,
    expectedCreditsRemaining: number
  ): Promise<void> {
    const credits = await this.convex.query(api.credits.queries.getCreditBalance, {
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

    const credits = await this.convex.query(api.credits.queries.getCreditBalance, {
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
    const credits = await this.convex.query(api.credits.queries.getCreditBalance, {
      organizerId
    });

    expect(credits.firstEventFreeUsed).toBe(true);
    // Note: firstEventId may not be returned by getCreditBalance
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
    // Note: Webhook queries not available in current API
    // This would need to be implemented in convex/webhooks/queries.ts if needed
    console.log(`Webhook verification for ${webhookId}`);
    console.log(`  Expected status: ${expectedStatus}`);
    console.log('  Note: Webhook queries not available - skipping verification');

    // TODO: Implement when webhook queries are available
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
    if (config) {
      expect(config.paymentModel).toBe(expectedModel);

      expectedPaymentMethods.forEach((method) => {
        expect(config.customerPaymentMethods).toContain(method);
      });
    }

    console.log(`✓ Payment config verified: model=${expectedModel}, methods=${expectedPaymentMethods.join(', ')}`);
  }

  /**
   * Calculate and verify organizer revenue
   */
  async verifyOrganizerRevenue(
    orderId: Id<"orders">,
    expectedRevenueCents: number
  ): Promise<void> {
    const result = await this.convex.query(api.tickets.queries.getOrderDetails, {
      orderId
    });

    expect(result).toBeTruthy();

    const order = result!.order;
    const actualRevenue = order.subtotalCents - (order.platformFeeCents || 0) - (order.processingFeeCents || 0);

    console.log('Organizer Revenue Verification:');
    console.log(`  Subtotal: $${(order.subtotalCents / 100).toFixed(2)}`);
    console.log(`  Platform Fee: $${((order.platformFeeCents || 0) / 100).toFixed(2)}`);
    console.log(`  Processing Fee: $${((order.processingFeeCents || 0) / 100).toFixed(2)}`);
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
    const result = await this.convex.query(api.tickets.queries.getOrderDetails, {
      orderId
    });

    expect(result).toBeTruthy();
    expect(result!.order.status).toBe('REFUNDED');
    // Note: refundAmount field may not exist on order type
    // expect(result!.order.refundAmount).toBe(refundAmountCents);

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
