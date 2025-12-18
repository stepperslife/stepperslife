/**
 * Production Payment Test Helpers
 * Shared utilities for production payment testing
 */

import { Page, expect } from "@playwright/test";

// Production URLs
export const PRODUCTION_URL = "https://stepperslife.com";

// Test credentials - updated with verified working accounts
export const TEST_CREDENTIALS = {
  admin: {
    email: "admin-test@stepperslife.com",
    password: "TestPassword123!",
  },
  organizer: {
    email: "e2e-organizer@stepperslife.com",
    password: "TestPassword123!",
  },
  user: {
    // Use organizer account for user tests since user account has different password
    email: "e2e-organizer@stepperslife.com",
    password: "TestPassword123!",
  },
};

// Stripe test cards
export const STRIPE_TEST_CARDS = {
  success: {
    number: "4242424242424242",
    expiry: "12/30",
    cvc: "123",
    zip: "30301",
  },
  declined: {
    number: "4000000000000002",
    expiry: "12/30",
    cvc: "123",
    zip: "30301",
  },
  insufficientFunds: {
    number: "4000000000009995",
    expiry: "12/30",
    cvc: "123",
    zip: "30301",
  },
  requires3DS: {
    number: "4000002760003184",
    expiry: "12/30",
    cvc: "123",
    zip: "30301",
  },
};

// Timeouts
export const TIMEOUTS = {
  short: 5000,
  medium: 10000,
  long: 30000,
  payment: 60000,
  navigation: 45000,
};

// Fee calculation constants
export const FEE_CONSTANTS = {
  platformFeePercent: 0.037, // 3.7%
  platformFeeFixed: 179, // $1.79 in cents
  processingFeePercent: 0.029, // 2.9%
};

/**
 * Calculate expected platform fee for CREDIT_CARD model
 */
export function calculatePlatformFee(subtotalCents: number): number {
  return Math.round(subtotalCents * FEE_CONSTANTS.platformFeePercent) + FEE_CONSTANTS.platformFeeFixed;
}

/**
 * Calculate expected processing fee
 */
export function calculateProcessingFee(subtotalCents: number, platformFeeCents: number): number {
  return Math.round((subtotalCents + platformFeeCents) * FEE_CONSTANTS.processingFeePercent);
}

/**
 * Calculate total with all fees
 */
export function calculateTotal(subtotalCents: number): {
  subtotal: number;
  platformFee: number;
  processingFee: number;
  total: number;
} {
  const platformFee = calculatePlatformFee(subtotalCents);
  const processingFee = calculateProcessingFee(subtotalCents, platformFee);
  return {
    subtotal: subtotalCents,
    platformFee,
    processingFee,
    total: subtotalCents + platformFee + processingFee,
  };
}

/**
 * Login to the application
 */
export async function login(
  page: Page,
  email: string,
  password: string
): Promise<boolean> {
  await page.goto("/login");
  await page.waitForLoadState("domcontentloaded");
  await page.waitForTimeout(3000);

  // Fill email first
  const emailInput = page.locator('input[name="email"], input[type="email"]');
  await emailInput.waitFor({ state: "visible", timeout: 10000 });
  await emailInput.fill(email);

  // Click "Sign in with password" button to reveal password field
  // The login page uses magic link by default
  const signInWithPasswordBtn = page.locator('button:has-text("Sign in with password")');
  if (await signInWithPasswordBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    await signInWithPasswordBtn.click();
    await page.waitForTimeout(1000);
  }

  // Now fill password
  const passwordInput = page.locator('input[name="password"], input[type="password"]');
  await passwordInput.waitFor({ state: "visible", timeout: 10000 });
  await passwordInput.fill(password);

  // Submit
  const submitBtn = page.locator('button[type="submit"]:has-text("Sign In"), button[type="submit"]');
  await submitBtn.click();

  // Wait for navigation or error
  try {
    await page.waitForURL(/\/(dashboard|organizer|admin|events)/, {
      timeout: TIMEOUTS.long,
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Login as admin
 */
export async function loginAsAdmin(page: Page): Promise<boolean> {
  return login(page, TEST_CREDENTIALS.admin.email, TEST_CREDENTIALS.admin.password);
}

/**
 * Login as organizer
 */
export async function loginAsOrganizer(page: Page): Promise<boolean> {
  return login(page, TEST_CREDENTIALS.organizer.email, TEST_CREDENTIALS.organizer.password);
}

/**
 * Login as regular user
 */
export async function loginAsUser(page: Page): Promise<boolean> {
  return login(page, TEST_CREDENTIALS.user.email, TEST_CREDENTIALS.user.password);
}

/**
 * Logout from the application
 */
export async function logout(page: Page): Promise<void> {
  // Try to find and click logout button
  const logoutButton = page.locator('button:has-text("Logout"), a:has-text("Logout"), [data-testid="logout-btn"]');
  if (await logoutButton.isVisible()) {
    await logoutButton.click();
    await page.waitForURL("/login", { timeout: TIMEOUTS.medium });
  }
}

/**
 * Navigate to an event checkout page
 */
export async function navigateToEventCheckout(page: Page, eventUrl?: string): Promise<void> {
  if (eventUrl) {
    await page.goto(eventUrl);
  } else {
    // Navigate to events list and click first available event
    await page.goto("/events");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(5000);

    // Click on first event card
    const eventCard = page.locator('[data-testid^="event-card-"], .event-card, [href^="/events/"]').first();
    await eventCard.click();
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(3000);
  }

  // Click buy tickets button
  const buyButton = page.locator('[data-testid="buy-tickets-btn"], button:has-text("Buy Tickets"), a:has-text("Buy Tickets")');
  if (await buyButton.isVisible()) {
    await buyButton.click();
    await page.waitForTimeout(2000);
  }
}

/**
 * Select a ticket tier
 */
export async function selectTicketTier(
  page: Page,
  tierName?: string,
  quantity: number = 1
): Promise<void> {
  // Select tier
  const tierSelector = tierName
    ? page.locator(`[data-testid="tier-${tierName}"], .ticket-tier:has-text("${tierName}")`)
    : page.locator('[data-testid^="tier-"], .ticket-tier').first();

  await tierSelector.click();

  // Set quantity if not 1
  if (quantity > 1) {
    const quantityInput = page.locator('input[name="quantity"], [data-testid="quantity-input"]');
    await quantityInput.fill(quantity.toString());
  }
}

/**
 * Fill buyer information
 */
export async function fillBuyerInfo(
  page: Page,
  name: string,
  email: string,
  phone?: string
): Promise<void> {
  await page.fill('[data-testid="buyer-name"], input[name="name"]', name);
  await page.fill('[data-testid="buyer-email"], input[name="email"]', email);
  if (phone) {
    await page.fill('[data-testid="buyer-phone"], input[name="phone"]', phone);
  }
}

/**
 * Continue to payment step
 */
export async function continueToPayment(page: Page): Promise<void> {
  const continueButton = page.locator('[data-testid="continue-to-payment"], button:has-text("Continue"), button:has-text("Next")');
  await continueButton.click();
  await page.waitForTimeout(2000); // Wait for payment form to load
}

/**
 * Fill Stripe card details in iframe
 */
export async function fillStripeCard(
  page: Page,
  card: { number: string; expiry: string; cvc: string; zip?: string }
): Promise<void> {
  // Wait for Stripe iframe to load
  await page.waitForTimeout(2000);

  // Find Stripe iframe
  const stripeFrame = page.frameLocator('iframe[name^="__privateStripeFrame"]').first();

  // Fill card number
  const cardInput = stripeFrame.locator('[name="cardnumber"], [data-elements-stable-field-name="cardNumber"]');
  await cardInput.fill(card.number);

  // Fill expiry
  const expiryInput = stripeFrame.locator('[name="exp-date"], [data-elements-stable-field-name="cardExpiry"]');
  await expiryInput.fill(card.expiry);

  // Fill CVC
  const cvcInput = stripeFrame.locator('[name="cvc"], [data-elements-stable-field-name="cardCvc"]');
  await cvcInput.fill(card.cvc);

  // Fill ZIP if provided
  if (card.zip) {
    const zipInput = stripeFrame.locator('[name="postal"], [data-elements-stable-field-name="postalCode"]');
    if (await zipInput.isVisible()) {
      await zipInput.fill(card.zip);
    }
  }
}

/**
 * Submit payment
 */
export async function submitPayment(page: Page): Promise<void> {
  const payButton = page.locator('[data-testid="pay-now-btn"], button:has-text("Pay"), button:has-text("Complete Purchase")');
  await payButton.click();
}

/**
 * Wait for payment success
 */
export async function waitForPaymentSuccess(page: Page): Promise<boolean> {
  try {
    await page.waitForSelector('[data-testid="payment-success"], .payment-success, :has-text("Thank you")', {
      timeout: TIMEOUTS.payment,
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if payment method is available
 */
export async function isPaymentMethodAvailable(
  page: Page,
  method: "card" | "paypal" | "cash" | "cashapp"
): Promise<boolean> {
  const selectors: Record<string, string> = {
    card: '[data-testid="payment-method-card"], :has-text("Credit Card"), :has-text("Debit Card")',
    paypal: '[data-testid="payment-method-paypal"], :has-text("PayPal")',
    cash: '[data-testid="payment-method-cash"], :has-text("Cash")',
    cashapp: ':has-text("Cash App")',
  };

  const locator = page.locator(selectors[method]);
  return await locator.isVisible();
}

/**
 * Select payment method
 */
export async function selectPaymentMethod(
  page: Page,
  method: "card" | "paypal" | "cash"
): Promise<void> {
  const selectors: Record<string, string> = {
    card: '[data-testid="payment-method-card"]',
    paypal: '[data-testid="payment-method-paypal"]',
    cash: '[data-testid="payment-method-cash"]',
  };

  await page.click(selectors[method]);
}

/**
 * Generate unique test email
 */
export function generateTestEmail(): string {
  return `test-${Date.now()}@stepperslife.com`;
}

/**
 * Format cents to dollar string
 */
export function formatCentsToDollars(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
