import { Page, expect, FrameLocator } from "@playwright/test";
import {
  STRIPE_TEST_CARDS,
  TICKET_TIERS,
  TEST_EVENT,
  TIMEOUTS,
} from "./test-data";

/**
 * Checkout Helper Functions for E2E Tests
 */

/**
 * Navigate to an event's checkout page
 */
export async function navigateToEventCheckout(
  page: Page,
  eventId?: string
): Promise<void> {
  if (eventId) {
    await page.goto(`/events/${eventId}/checkout`);
  } else {
    // Navigate to test event via events list
    await page.goto("/events");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForSelector('[data-testid="events-page"]', { timeout: 10000 });

    // Find and click the test event
    const testEventCard = page.locator(
      `[data-testid="event-card"]:has-text("${TEST_EVENT.fullName}")`
    );
    await testEventCard.click();

    // Click buy tickets button
    await page.click('[data-testid="buy-tickets-btn"]');
  }

  await page.waitForLoadState("domcontentloaded");
}

/**
 * Select a ticket tier
 */
export async function selectTicketTier(
  page: Page,
  tierName: string,
  quantity: number = 1
): Promise<void> {
  // Find the tier by name and click select
  const tierSelector = `[data-testid="tier-${tierName.toLowerCase().replace(/\s+/g, "-")}"]`;
  await page.click(tierSelector);

  // Set quantity if more than 1
  if (quantity > 1) {
    const quantityInput = page.locator('[data-testid="ticket-quantity"]');
    await quantityInput.fill(quantity.toString());
  }
}

/**
 * Fill buyer information
 */
export async function fillBuyerInfo(
  page: Page,
  buyerInfo: {
    name: string;
    email: string;
    phone?: string;
  }
): Promise<void> {
  await page.fill('[data-testid="buyer-name"]', buyerInfo.name);
  await page.fill('[data-testid="buyer-email"]', buyerInfo.email);

  if (buyerInfo.phone) {
    const phoneInput = page.locator('[data-testid="buyer-phone"]');
    if (await phoneInput.isVisible()) {
      await phoneInput.fill(buyerInfo.phone);
    }
  }
}

/**
 * Apply a discount code
 */
export async function applyDiscountCode(
  page: Page,
  code: string
): Promise<boolean> {
  const discountInput = page.locator('[data-testid="discount-code-input"]');

  if (!(await discountInput.isVisible())) {
    // Click to expand discount section
    const discountToggle = page.locator('[data-testid="discount-toggle"]');
    if (await discountToggle.isVisible()) {
      await discountToggle.click();
    }
  }

  await discountInput.fill(code);
  await page.click('[data-testid="apply-discount-btn"]');

  // Wait for response
  await page.waitForTimeout(1000);

  // Check if discount was applied
  const successMessage = page.locator('[data-testid="discount-success"]');
  const errorMessage = page.locator('[data-testid="discount-error"]');

  if (await successMessage.isVisible()) {
    return true;
  }

  if (await errorMessage.isVisible()) {
    return false;
  }

  return false;
}

/**
 * Continue to payment step
 */
export async function continueToPayment(page: Page): Promise<void> {
  await page.click('[data-testid="continue-to-payment"]');
  await page.waitForLoadState("domcontentloaded");
}

/**
 * Fill Stripe card details
 */
export async function fillStripeCard(
  page: Page,
  card: typeof STRIPE_TEST_CARDS.success = STRIPE_TEST_CARDS.success
): Promise<void> {
  // Stripe uses iframes, need to locate them
  const stripeFrame = page.frameLocator(
    'iframe[name^="__privateStripeFrame"]'
  ).first();

  // Card number
  const cardNumberFrame = page.frameLocator(
    'iframe[title*="card number"]'
  );
  await cardNumberFrame.locator('[name="cardnumber"]').fill(card.number);

  // Expiry
  const expiryFrame = page.frameLocator(
    'iframe[title*="expiration"]'
  );
  await expiryFrame.locator('[name="exp-date"]').fill(card.expiry);

  // CVC
  const cvcFrame = page.frameLocator(
    'iframe[title*="CVC"]'
  );
  await cvcFrame.locator('[name="cvc"]').fill(card.cvc);

  // ZIP if required
  const zipFrame = page.frameLocator(
    'iframe[title*="ZIP"]'
  );
  if (await zipFrame.locator('[name="postal"]').count() > 0) {
    await zipFrame.locator('[name="postal"]').fill(card.zip);
  }
}

/**
 * Alternative Stripe card fill for single-field format
 */
export async function fillStripeCardSingleField(
  page: Page,
  card: typeof STRIPE_TEST_CARDS.success = STRIPE_TEST_CARDS.success
): Promise<void> {
  const stripeFrame = page.frameLocator(
    'iframe[name^="__privateStripeFrame"]'
  ).first();

  // Type card number with spaces
  await stripeFrame
    .locator('[name="cardnumber"]')
    .fill(card.number);

  // Tab to expiry and fill
  await stripeFrame.locator('[name="exp-date"]').fill(card.expiry);

  // Tab to CVC and fill
  await stripeFrame.locator('[name="cvc"]').fill(card.cvc);
}

/**
 * Submit Stripe payment
 */
export async function submitStripePayment(page: Page): Promise<void> {
  await page.click('[data-testid="pay-now-btn"]');

  // Wait for payment processing
  await page.waitForResponse(
    (response) =>
      response.url().includes("/api/stripe") && response.status() === 200,
    { timeout: TIMEOUTS.payment }
  );
}

/**
 * Complete full Stripe checkout
 */
export async function completeStripeCheckout(
  page: Page,
  options: {
    tierName?: string;
    quantity?: number;
    buyerName: string;
    buyerEmail: string;
    card?: typeof STRIPE_TEST_CARDS.success;
  }
): Promise<void> {
  // Select tier
  await selectTicketTier(
    page,
    options.tierName || TICKET_TIERS.generalAdmission.name,
    options.quantity || 1
  );

  // Fill buyer info
  await fillBuyerInfo(page, {
    name: options.buyerName,
    email: options.buyerEmail,
  });

  // Continue to payment
  await continueToPayment(page);

  // Fill card details
  await fillStripeCard(page, options.card || STRIPE_TEST_CARDS.success);

  // Submit payment
  await submitStripePayment(page);
}

/**
 * Select PayPal payment method
 */
export async function selectPayPalPayment(page: Page): Promise<void> {
  await page.click('[data-testid="payment-method-paypal"]');
}

/**
 * Handle PayPal popup/redirect
 * Note: PayPal sandbox testing requires special handling
 */
export async function completePayPalPayment(
  page: Page,
  credentials: { email: string; password: string }
): Promise<void> {
  // Click PayPal button
  await page.click('[data-testid="paypal-button"]');

  // Wait for PayPal popup
  const popupPromise = page.context().waitForEvent("page");
  const popup = await popupPromise;

  // Wait for PayPal login page
  await popup.waitForLoadState("domcontentloaded");

  // Login to PayPal
  await popup.fill('[name="login_email"]', credentials.email);
  await popup.click('[name="btnNext"]');
  await popup.fill('[name="login_password"]', credentials.password);
  await popup.click('[name="btnLogin"]');

  // Complete purchase
  await popup.waitForLoadState("domcontentloaded");
  await popup.click('[data-testid="submit-button-initial"]');

  // Wait for popup to close
  await popup.waitForEvent("close", { timeout: TIMEOUTS.payment });
}

/**
 * Select cash payment method
 */
export async function selectCashPayment(page: Page): Promise<void> {
  await page.click('[data-testid="payment-method-cash"]');
}

/**
 * Submit cash payment order
 */
export async function submitCashPayment(page: Page): Promise<void> {
  await page.click('[data-testid="reserve-tickets-btn"]');

  // Wait for order creation
  await page.waitForLoadState("domcontentloaded");
}

/**
 * Verify payment success
 */
export async function expectPaymentSuccess(page: Page): Promise<void> {
  await expect(page.locator('[data-testid="payment-success"]')).toBeVisible({
    timeout: TIMEOUTS.long,
  });
}

/**
 * Verify payment failure
 */
export async function expectPaymentFailure(
  page: Page,
  errorMessage?: string
): Promise<void> {
  await expect(page.locator('[data-testid="payment-error"]')).toBeVisible({
    timeout: TIMEOUTS.medium,
  });

  if (errorMessage) {
    await expect(page.locator('[data-testid="payment-error"]')).toContainText(
      errorMessage
    );
  }
}

/**
 * Get order confirmation details
 */
export async function getOrderConfirmation(
  page: Page
): Promise<{
  orderId: string;
  ticketCount: number;
  total: string;
}> {
  await page.waitForSelector('[data-testid="order-confirmation"]');

  const orderId = await page
    .locator('[data-testid="order-id"]')
    .textContent();
  const ticketCountText = await page
    .locator('[data-testid="ticket-count"]')
    .textContent();
  const total = await page
    .locator('[data-testid="order-total"]')
    .textContent();

  return {
    orderId: orderId || "",
    ticketCount: parseInt(ticketCountText || "0", 10),
    total: total || "",
  };
}

/**
 * Verify tickets appear in My Tickets
 */
export async function verifyTicketsInMyTickets(
  page: Page,
  expectedCount: number
): Promise<void> {
  await page.goto("/user/my-tickets");
  await page.waitForLoadState("domcontentloaded");

  const tickets = page.locator('[data-testid="ticket-item"]');
  await expect(tickets).toHaveCount(expectedCount, {
    timeout: TIMEOUTS.medium,
  });
}

/**
 * Calculate expected total with fees
 */
export function calculateExpectedTotal(
  priceInCents: number,
  quantity: number,
  platformFeePercent: number = 3.7,
  platformFeeFixed: number = 179,
  processingFeePercent: number = 2.9,
  processingFeeFixed: number = 30
): number {
  const subtotal = priceInCents * quantity;
  const platformFee = Math.round(
    subtotal * (platformFeePercent / 100) + platformFeeFixed
  );
  const processingFee = Math.round(
    subtotal * (processingFeePercent / 100) + processingFeeFixed
  );
  return subtotal + platformFee + processingFee;
}

/**
 * Format cents to dollars string
 */
export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
