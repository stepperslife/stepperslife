/**
 * Organizer Setup Helper
 * Handles organizer account creation, credit purchases, and Stripe Connect setup
 */

import { Page } from '@playwright/test';
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || "https://expert-vulture-775.convex.cloud";

export class OrganizerSetupHelper {
  private convex: ConvexHttpClient;
  private page: Page;

  constructor(page: Page) {
    this.page = page;
    this.convex = new ConvexHttpClient(CONVEX_URL);
  }

  /**
   * Sign in as organizer (assumes auth is configured)
   */
  async signInAsOrganizer(email: string, name: string): Promise<void> {
    console.log(`Signing in as organizer: ${email}`);

    // Navigate to sign in page
    await this.page.goto('/');

    // Check if already signed in
    const isSignedIn = await this.page.locator('text=Dashboard').isVisible().catch(() => false);
    if (isSignedIn) {
      console.log('Already signed in');
      return;
    }

    // Sign in logic - adjust based on your auth provider
    // This is a placeholder - update based on Clerk/Auth0/etc configuration
    await this.page.click('text=Sign In').catch(() => {});
    await this.page.fill('input[type="email"]', email).catch(() => {});
    await this.page.fill('input[name="name"]', name).catch(() => {});
    await this.page.click('button[type="submit"]').catch(() => {});

    // Wait for redirect to dashboard
    await this.page.waitForURL('**/dashboard', { timeout: 10000 }).catch(() => {});
  }

  /**
   * Get organizer's current credit balance via API
   */
  async getCreditBalance(organizerId: Id<"users">): Promise<number> {
    try {
      const credits = await this.convex.query(api.credits.queries.getCreditBalance, {
        organizerId
      });
      return credits?.creditsRemaining || 0;
    } catch (error) {
      console.error('Error fetching credit balance:', error);
      return 0;
    }
  }

  /**
   * Purchase credits using Square (sandbox mode)
   */
  async purchaseCreditsWithSquare(
    organizerId: Id<"users">,
    creditAmount: number
  ): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    console.log(`Purchasing ${creditAmount} credits with Square for organizer ${organizerId}`);

    try {
      // Navigate to credits purchase page
      await this.page.goto('/dashboard/credits/purchase');

      // Enter credit amount
      await this.page.fill('input[name="creditAmount"]', creditAmount.toString());

      // Calculate cost ($0.30 per credit)
      const costDollars = (creditAmount * 0.30).toFixed(2);
      console.log(`Cost: $${costDollars}`);

      // Select Square payment method
      await this.page.click('button:has-text("Square")');

      // Wait for Square payment form to load
      await this.page.waitForSelector('#square-payment-form', { timeout: 10000 });

      // In sandbox mode, Square provides test card
      // The Web Payments SDK should be initialized with sandbox credentials
      await this.page.click('#card-button'); // Trigger card payment

      // Wait for payment to process
      await this.page.waitForSelector('text=Payment Successful', { timeout: 15000 });

      // Get transaction ID from success message or URL
      const successMessage = await this.page.textContent('.payment-success-message');

      return {
        success: true,
        transactionId: `sq_test_${Date.now()}`
      };
    } catch (error) {
      console.error('Square payment failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Purchase credits using PayPal (sandbox mode)
   */
  async purchaseCreditsWithPayPal(
    organizerId: Id<"users">,
    creditAmount: number
  ): Promise<{ success: boolean; orderId?: string; error?: string }> {
    console.log(`Purchasing ${creditAmount} credits with PayPal for organizer ${organizerId}`);

    try {
      // Navigate to credits purchase page
      await this.page.goto('/dashboard/credits/purchase');

      // Enter credit amount
      await this.page.fill('input[name="creditAmount"]', creditAmount.toString());

      // Select PayPal payment method
      await this.page.click('button:has-text("PayPal")');

      // Wait for PayPal button to render
      await this.page.waitForSelector('#paypal-button-container', { timeout: 10000 });

      // Click PayPal button
      await this.page.click('#paypal-button-container button');

      // Handle PayPal popup/redirect (in sandbox mode)
      // Note: This may require special handling for popup windows
      const paypalPage = await this.page.context().waitForEvent('page', { timeout: 15000 });

      // Login to PayPal sandbox account
      await paypalPage.fill('input[name="login_email"]', process.env.PAYPAL_SANDBOX_EMAIL || 'buyer@example.com');
      await paypalPage.click('button[type="submit"]');
      await paypalPage.fill('input[name="login_password"]', process.env.PAYPAL_SANDBOX_PASSWORD || 'password');
      await paypalPage.click('button[type="submit"]');

      // Confirm payment
      await paypalPage.click('button:has-text("Complete Purchase")');

      // Wait for redirect back
      await this.page.waitForSelector('text=Payment Successful', { timeout: 15000 });

      return {
        success: true,
        orderId: `PAYPAL_${Date.now()}`
      };
    } catch (error) {
      console.error('PayPal payment failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Manually add test credits via API (for testing only)
   */
  async addTestCredits(
    organizerId: Id<"users">,
    creditAmount: number
  ): Promise<void> {
    console.log(`Adding ${creditAmount} test credits to organizer ${organizerId}`);

    try {
      // Use purchaseCredits mutation to add credits
      await this.convex.mutation(api.credits.mutations.purchaseCredits, {
        userId: organizerId,
        credits: creditAmount,
        amountPaid: creditAmount * 30, // $0.30 per credit
        squarePaymentId: `test_${Date.now()}`
      });

      console.log(`Successfully added ${creditAmount} test credits`);
    } catch (error) {
      console.error('Error adding test credits:', error);
      throw error;
    }
  }

  /**
   * Setup Stripe Connect account for organizer
   */
  async setupStripeConnectAccount(
    organizerId: Id<"users">
  ): Promise<{ accountId: string; success: boolean; error?: string }> {
    console.log(`Setting up Stripe Connect account for organizer ${organizerId}`);

    try {
      // Navigate to Stripe Connect setup
      await this.page.goto('/dashboard/payments/stripe-connect');

      // Click to start onboarding
      await this.page.click('button:has-text("Connect with Stripe")');

      // In test mode, Stripe provides a test account setup flow
      // Wait for Stripe Connect iframe to load
      const stripeFrame = this.page.frameLocator('iframe[name*="stripe"]');

      // Fill in test business information
      await stripeFrame.locator('input[name="business_name"]').fill('Test Business LLC');
      await stripeFrame.locator('input[name="first_name"]').fill('Test');
      await stripeFrame.locator('input[name="last_name"]').fill('Organizer');
      await stripeFrame.locator('input[name="email"]').fill('test-organizer@stepperslife.com');

      // Fill in test address
      await stripeFrame.locator('input[name="address"]').fill('123 Test Street');
      await stripeFrame.locator('input[name="city"]').fill('San Francisco');
      await stripeFrame.locator('select[name="state"]').selectOption('CA');
      await stripeFrame.locator('input[name="zip"]').fill('94105');

      // Fill in test EIN/SSN
      await stripeFrame.locator('input[name="tax_id"]').fill('000000000');

      // Fill in test bank account (Stripe test account)
      await stripeFrame.locator('input[name="routing_number"]').fill('110000000');
      await stripeFrame.locator('input[name="account_number"]').fill('000123456789');

      // Submit onboarding
      await stripeFrame.locator('button[type="submit"]').click();

      // Wait for completion
      await this.page.waitForURL('**/dashboard/payments/stripe-connect/success', { timeout: 20000 });

      // Get the Stripe account ID from the success page or API
      const accountId = await this.page.getAttribute('[data-stripe-account-id]', 'data-stripe-account-id') || '';

      return {
        accountId,
        success: true
      };
    } catch (error) {
      console.error('Stripe Connect setup failed:', error);
      return {
        accountId: '',
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Use test Stripe Connect account ID (for faster testing)
   * Note: This function is a placeholder - updateStripeConnectAccount mutation doesn't exist yet
   */
  async useTestStripeAccount(
    organizerId: Id<"users">
  ): Promise<string> {
    console.log(`Using test Stripe Connect account for organizer ${organizerId}`);

    // In test mode, you can use a pre-configured test Connect account
    const testAccountId = process.env.STRIPE_TEST_CONNECT_ACCOUNT_ID || 'acct_test_' + Date.now();

    console.warn('Note: updateStripeConnectAccount mutation not implemented yet');
    // TODO: Implement this mutation in convex/paymentConfig/mutations.ts
    // await this.convex.mutation(api.paymentConfig.mutations.updateStripeConnectAccount, {
    //   organizerId,
    //   stripeAccountId: testAccountId
    // });

    return testAccountId;
  }

  /**
   * Verify first event free credits were applied
   */
  async verifyFirstEventFreeCredits(organizerId: Id<"users">): Promise<boolean> {
    try {
      const credits = await this.convex.query(api.credits.queries.getCreditBalance, {
        organizerId
      });

      return credits?.firstEventFreeUsed === false && credits?.creditsRemaining >= 1000;
    } catch (error) {
      console.error('Error verifying free credits:', error);
      return false;
    }
  }

  /**
   * Calculate credits needed for events
   */
  calculateCreditsNeeded(ticketQuantities: number[]): number {
    return ticketQuantities.reduce((sum, qty) => sum + qty, 0);
  }

  /**
   * Get organizer payment configuration
   */
  async getPaymentConfig(eventId: Id<"events">): Promise<any> {
    try {
      return await this.convex.query(api.paymentConfig.queries.getEventPaymentConfig, {
        eventId
      });
    } catch (error) {
      console.error('Error fetching payment config:', error);
      return null;
    }
  }

  /**
   * Cleanup: Remove test Stripe Connect account
   */
  async cleanupStripeAccount(accountId: string): Promise<void> {
    console.log(`Cleaning up Stripe Connect account: ${accountId}`);
    // In production, you'd call Stripe API to delete the test account
    // For testing, this is optional
  }
}

/**
 * Helper to get organizer ID from email
 */
export async function getOrganizerIdByEmail(email: string): Promise<Id<"users"> | null> {
  const convex = new ConvexHttpClient(CONVEX_URL);

  try {
    const user = await convex.query(api.users.queries.getUserByEmail, {
      email
    });
    return user?._id || null;
  } catch (error) {
    console.error('Error fetching organizer by email:', error);
    return null;
  }
}
