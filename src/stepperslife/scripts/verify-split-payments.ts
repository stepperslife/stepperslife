/**
 * Verify Split Payments Script
 * Validates Stripe split payments are processed correctly
 */

import Stripe from 'stripe';
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY!;
const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || "https://expert-vulture-775.convex.cloud";

interface SplitPaymentVerification {
  orderId: Id<"orders">;
  paymentIntentId: string;
  passed: boolean;
  errors: string[];
  details: {
    expectedAmount?: number;
    actualAmount?: number;
    expectedApplicationFee?: number;
    actualApplicationFee?: number;
    expectedDestination?: string;
    actualDestination?: string;
  };
}

class SplitPaymentVerifier {
  private stripe: Stripe;
  private convex: ConvexHttpClient;
  private verifications: SplitPaymentVerification[] = [];

  constructor() {
    if (!STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is required');
    }

    this.stripe = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: '2025-10-29.clover'
    });

    this.convex = new ConvexHttpClient(CONVEX_URL);
  }

  /**
   * Verify a single split payment
   */
  async verifySplitPayment(orderId: Id<"orders">): Promise<SplitPaymentVerification> {
    console.log(`\n[VERIFY] Checking split payment for order ${orderId}...`);

    const verification: SplitPaymentVerification = {
      orderId,
      paymentIntentId: '',
      passed: true,
      errors: [],
      details: {}
    };

    try {
      // Get order from database
      const orderDetails = await this.convex.query(api.tickets.queries.getOrderDetails, { orderId });

      if (!orderDetails || !orderDetails.order) {
        verification.passed = false;
        verification.errors.push('Order not found');
        return verification;
      }

      const order = orderDetails.order;

      if (!order.paymentId) {
        verification.passed = false;
        verification.errors.push('No payment ID on order');
        return verification;
      }

      verification.paymentIntentId = order.paymentId;

      // Get payment config to verify split payment settings
      const paymentConfig = await this.convex.query(api.paymentConfig.queries.getEventPaymentConfig, {
        eventId: order.eventId
      });

      if (!paymentConfig) {
        verification.passed = false;
        verification.errors.push('No payment config found for event');
        return verification;
      }

      if (paymentConfig.paymentModel !== 'CREDIT_CARD') {
        verification.passed = false;
        verification.errors.push(`Order is not CREDIT_CARD model (${paymentConfig.paymentModel})`);
        return verification;
      }

      // Retrieve payment intent from Stripe
      const paymentIntent = await this.stripe.paymentIntents.retrieve(order.paymentId);

      // Verify amount
      verification.details.expectedAmount = order.totalCents;
      verification.details.actualAmount = paymentIntent.amount;

      if (paymentIntent.amount !== order.totalCents) {
        verification.passed = false;
        verification.errors.push(
          `Amount mismatch: expected ${order.totalCents}, got ${paymentIntent.amount}`
        );
      }

      // Verify application fee (platform fee)
      verification.details.expectedApplicationFee = order.platformFeeCents;
      verification.details.actualApplicationFee = paymentIntent.application_fee_amount || 0;

      if (paymentIntent.application_fee_amount !== order.platformFeeCents) {
        verification.passed = false;
        verification.errors.push(
          `Application fee mismatch: expected ${order.platformFeeCents}, got ${paymentIntent.application_fee_amount}`
        );
      }

      // Verify transfer destination (organizer's Stripe Connect account)
      if (paymentIntent.transfer_data) {
        verification.details.expectedDestination = paymentConfig.stripeConnectAccountId;
        verification.details.actualDestination = paymentIntent.transfer_data.destination as string;

        if (paymentIntent.transfer_data.destination !== paymentConfig.stripeConnectAccountId) {
          verification.passed = false;
          verification.errors.push(
            `Destination mismatch: expected ${paymentConfig.stripeConnectAccountId}, got ${paymentIntent.transfer_data.destination}`
          );
        }
      } else {
        verification.passed = false;
        verification.errors.push('No transfer_data on payment intent');
      }

      // Verify payment status
      if (paymentIntent.status !== 'succeeded' && order.status === 'COMPLETED') {
        verification.passed = false;
        verification.errors.push(
          `Payment status mismatch: order is COMPLETED but payment intent status is ${paymentIntent.status}`
        );
      }

      if (verification.passed) {
        console.log(`✓ Split payment verified successfully`);
        console.log(`  Amount: $${(paymentIntent.amount / 100).toFixed(2)}`);
        console.log(`  Platform Fee: $${((paymentIntent.application_fee_amount || 0) / 100).toFixed(2)}`);
        console.log(`  Organizer Receives: $${((paymentIntent.amount - (paymentIntent.application_fee_amount || 0)) / 100).toFixed(2)}`);
      } else {
        console.log(`✗ Split payment verification failed:`);
        verification.errors.forEach(err => console.log(`  - ${err}`));
      }

    } catch (error) {
      verification.passed = false;
      const errorMessage = error instanceof Error ? error.message : String(error);
      verification.errors.push(`Error: ${errorMessage}`);
      console.error(`✗ Verification error: ${errorMessage}`);
    }

    this.verifications.push(verification);
    return verification;
  }

  /**
   * Verify multiple split payments
   */
  async verifyMultipleSplitPayments(orderIds: Id<"orders">[]): Promise<void> {
    console.log('\n' + '='.repeat(80));
    console.log('SPLIT PAYMENT VERIFICATION');
    console.log('='.repeat(80));

    for (const orderId of orderIds) {
      await this.verifySplitPayment(orderId);
    }

    this.printVerificationReport();
  }

  /**
   * Verify all CREDIT_CARD orders for an event
   */
  async verifyEventSplitPayments(eventId: Id<"events">): Promise<void> {
    console.log(`\nVerifying all split payments for event ${eventId}...`);

    try {
      // Get all orders for the event
      const orders = await this.convex.query(api.events.queries.getEventOrders, {
        eventId
      });

      const creditCardOrders = orders.filter((order: any) =>
        order.paymentMethod === 'STRIPE' && order.paymentId
      );

      console.log(`Found ${creditCardOrders.length} Stripe orders to verify`);

      for (const order of creditCardOrders) {
        await this.verifySplitPayment(order._id);
      }

      this.printVerificationReport();

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Error verifying event split payments:', errorMessage);
      throw error;
    }
  }

  /**
   * Get Stripe account balance (platform account)
   */
  async getPlatformBalance(): Promise<void> {
    console.log('\n[PLATFORM] Checking platform Stripe balance...');

    try {
      const balance = await this.stripe.balance.retrieve();

      console.log('Platform Balance:');
      balance.available.forEach((bal) => {
        console.log(`  ${bal.currency.toUpperCase()}: $${(bal.amount / 100).toFixed(2)} available`);
      });

      balance.pending.forEach((bal) => {
        console.log(`  ${bal.currency.toUpperCase()}: $${(bal.amount / 100).toFixed(2)} pending`);
      });

    } catch (error) {
      console.error('Error fetching platform balance:', error);
    }
  }

  /**
   * Get organizer's Stripe Connect account balance
   */
  async getOrganizerBalance(stripeAccountId: string): Promise<void> {
    console.log(`\n[ORGANIZER] Checking balance for ${stripeAccountId}...`);

    try {
      const balance = await this.stripe.balance.retrieve({
        stripeAccount: stripeAccountId
      });

      console.log(`Organizer Balance (${stripeAccountId}):`);
      balance.available.forEach((bal) => {
        console.log(`  ${bal.currency.toUpperCase()}: $${(bal.amount / 100).toFixed(2)} available`);
      });

      balance.pending.forEach((bal) => {
        console.log(`  ${bal.currency.toUpperCase()}: $${(bal.amount / 100).toFixed(2)} pending`);
      });

    } catch (error) {
      console.error('Error fetching organizer balance:', error);
    }
  }

  /**
   * List recent application fees (platform revenue)
   */
  async listApplicationFees(limit: number = 10): Promise<void> {
    console.log('\n[PLATFORM FEES] Recent application fees...');

    try {
      const fees = await this.stripe.applicationFees.list({ limit });

      console.log(`Found ${fees.data.length} recent application fees:`);

      fees.data.forEach((fee, index) => {
        console.log(`${index + 1}. ${fee.id}`);
        console.log(`   Amount: $${(fee.amount / 100).toFixed(2)}`);
        console.log(`   Created: ${new Date(fee.created * 1000).toISOString()}`);
        console.log(`   Account: ${fee.account}`);
        console.log(`   Payment Intent: ${fee.charge}`);
      });

      const totalFees = fees.data.reduce((sum, fee) => sum + fee.amount, 0);
      console.log(`\nTotal Application Fees: $${(totalFees / 100).toFixed(2)}`);

    } catch (error) {
      console.error('Error listing application fees:', error);
    }
  }

  /**
   * Verify transfer to organizer
   */
  async verifyTransfer(paymentIntentId: string): Promise<void> {
    console.log(`\n[TRANSFER] Verifying transfer for payment ${paymentIntentId}...`);

    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId, {
        expand: ['transfer_data.destination']
      });

      if (!paymentIntent.transfer_data) {
        console.log('✗ No transfer data found');
        return;
      }

      // Get the transfer
      const transfers = await this.stripe.transfers.list({
        destination: paymentIntent.transfer_data.destination as string,
        limit: 10
      });

      const relatedTransfer = transfers.data.find(t =>
        t.source_transaction === paymentIntent.latest_charge
      );

      if (relatedTransfer) {
        console.log('✓ Transfer found:');
        console.log(`  Transfer ID: ${relatedTransfer.id}`);
        console.log(`  Amount: $${(relatedTransfer.amount / 100).toFixed(2)}`);
        console.log(`  Destination: ${relatedTransfer.destination}`);
        console.log(`  Created: ${new Date(relatedTransfer.created * 1000).toISOString()}`);
      } else {
        console.log('✗ Transfer not found');
      }

    } catch (error) {
      console.error('Error verifying transfer:', error);
    }
  }

  /**
   * Print verification report
   */
  private printVerificationReport(): void {
    console.log('\n' + '='.repeat(80));
    console.log('VERIFICATION REPORT');
    console.log('='.repeat(80));

    const passed = this.verifications.filter(v => v.passed).length;
    const failed = this.verifications.filter(v => !v.passed).length;

    this.verifications.forEach((verification, index) => {
      const status = verification.passed ? '✓ PASS' : '✗ FAIL';
      console.log(`${index + 1}. ${status} - Order ${verification.orderId}`);

      if (!verification.passed) {
        verification.errors.forEach(err => {
          console.log(`   - ${err}`);
        });
      }

      if (verification.details.expectedAmount) {
        console.log(`   Amount: $${(verification.details.actualAmount! / 100).toFixed(2)}`);
        console.log(`   Platform Fee: $${(verification.details.actualApplicationFee! / 100).toFixed(2)}`);
      }
    });

    console.log('\n' + '-'.repeat(80));
    console.log(`Total Verifications: ${this.verifications.length}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    console.log(`Success Rate: ${((passed / this.verifications.length) * 100).toFixed(2)}%`);
    console.log('='.repeat(80) + '\n');
  }
}

// CLI usage
if (require.main === module) {
  const verifier = new SplitPaymentVerifier();

  const command = process.argv[2];
  const arg = process.argv[3];

  switch (command) {
    case 'verify-order':
      if (!arg) {
        console.error('Usage: node verify-split-payments.js verify-order <orderId>');
        process.exit(1);
      }
      verifier.verifySplitPayment(arg as Id<"orders">)
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
      break;

    case 'verify-event':
      if (!arg) {
        console.error('Usage: node verify-split-payments.js verify-event <eventId>');
        process.exit(1);
      }
      verifier.verifyEventSplitPayments(arg as Id<"events">)
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
      break;

    case 'platform-balance':
      verifier.getPlatformBalance()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
      break;

    case 'organizer-balance':
      if (!arg) {
        console.error('Usage: node verify-split-payments.js organizer-balance <stripeAccountId>');
        process.exit(1);
      }
      verifier.getOrganizerBalance(arg)
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
      break;

    case 'application-fees':
      verifier.listApplicationFees(parseInt(arg) || 10)
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
      break;

    case 'verify-transfer':
      if (!arg) {
        console.error('Usage: node verify-split-payments.js verify-transfer <paymentIntentId>');
        process.exit(1);
      }
      verifier.verifyTransfer(arg)
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
      break;

    default:
      console.log('Stripe Split Payment Verifier');
      console.log('\nUsage:');
      console.log('  node verify-split-payments.js verify-order <orderId>');
      console.log('  node verify-split-payments.js verify-event <eventId>');
      console.log('  node verify-split-payments.js platform-balance');
      console.log('  node verify-split-payments.js organizer-balance <stripeAccountId>');
      console.log('  node verify-split-payments.js application-fees [limit]');
      console.log('  node verify-split-payments.js verify-transfer <paymentIntentId>');
      process.exit(0);
  }
}

export default SplitPaymentVerifier;
