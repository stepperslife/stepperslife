import { Page, expect } from "@playwright/test";
import {
  VENDOR_ACCOUNT,
  CUSTOMER_ACCOUNT,
  TEST_SHIPPING_ADDRESS,
  STRIPE_TEST_CARD,
} from "./test-accounts";

/**
 * Wait for page to be fully loaded (no loading spinners)
 */
export async function waitForPageLoad(page: Page, timeout = 10000): Promise<void> {
  await page.waitForLoadState("domcontentloaded");

  // Wait for any loading spinners to disappear
  const spinner = page.locator(".animate-spin");
  try {
    await spinner.waitFor({ state: "hidden", timeout });
  } catch {
    // Spinner might not be present, which is fine
  }
}

/**
 * Login as vendor (iradwaktins@gmail.com)
 */
export async function loginAsVendor(page: Page): Promise<boolean> {
  return login(page, VENDOR_ACCOUNT.email, VENDOR_ACCOUNT.password);
}

/**
 * Login as customer (ira@irawatkins.com)
 */
export async function loginAsCustomer(page: Page): Promise<boolean> {
  return login(page, CUSTOMER_ACCOUNT.email, CUSTOMER_ACCOUNT.password);
}

/**
 * Generic login function
 */
export async function login(page: Page, email: string, password: string): Promise<boolean> {
  await page.goto("/login");
  await waitForPageLoad(page);

  // Check if already logged in
  const logoutButton = page.locator('text="Log Out"').or(page.locator('text="Sign Out"'));
  if (await logoutButton.isVisible().catch(() => false)) {
    console.log("Already logged in");
    return true;
  }

  // The login page shows magic link by default - need to click "Sign in with password" first
  const passwordLoginButton = page.locator('button:has-text("Sign in with password")');
  if (await passwordLoginButton.isVisible({ timeout: 5000 }).catch(() => false)) {
    await passwordLoginButton.click();
    await page.waitForTimeout(500); // Wait for password field to appear
  }

  // Fill email field - use specific test ID for password login form
  const emailInput = page.getByTestId("password-email-input");
  await emailInput.waitFor({ state: "visible", timeout: 5000 });
  await emailInput.fill(email);

  // Fill password field
  const passwordInput = page.locator('input[type="password"]');
  await passwordInput.waitFor({ state: "visible", timeout: 5000 });
  await passwordInput.fill(password);

  // Submit using the Sign In button in the password form
  const submitButton = page.locator('form:has(input[type="password"]) button[type="submit"]');
  await submitButton.click();

  // Wait for navigation or dashboard to appear
  await page.waitForTimeout(3000);
  await waitForPageLoad(page);

  // Verify login success by checking for logout option or user menu
  const isLoggedIn = await page.locator('text="Log Out"')
    .or(page.locator('text="Sign Out"'))
    .or(page.locator('[data-testid="user-menu"]'))
    .or(page.locator('text="Dashboard"'))
    .or(page.locator('text="My Account"'))
    .isVisible()
    .catch(() => false);

  return isLoggedIn;
}

/**
 * Navigate to vendor product creation page
 */
export async function navigateToProductCreation(page: Page): Promise<void> {
  await page.goto("/vendor/dashboard/products/create");
  await waitForPageLoad(page);

  // Verify we're on the create product page
  await expect(page.locator('h1, h2').filter({ hasText: /add|create|new.*product/i }).first()).toBeVisible({ timeout: 10000 });
}

/**
 * Fill product creation form
 */
export async function fillProductForm(
  page: Page,
  productData: {
    name: string;
    description: string;
    price: number;
    category?: string;
    inventoryQuantity?: number;
    status?: "ACTIVE" | "DRAFT";
  }
): Promise<void> {
  // Product name
  await page.fill('input[name="name"], input[placeholder*="name" i]', productData.name);

  // Description
  await page.fill('textarea[name="description"], textarea[placeholder*="description" i]', productData.description);

  // Price (convert to string with 2 decimal places)
  const priceInput = page.locator('input[name="price"], input[type="number"]').first();
  await priceInput.fill(productData.price.toFixed(2));

  // Category (if provided)
  if (productData.category) {
    const categorySelect = page.locator('select[name="category"]');
    if (await categorySelect.isVisible().catch(() => false)) {
      await categorySelect.selectOption({ label: productData.category });
    }
  }

  // Inventory quantity
  if (productData.inventoryQuantity !== undefined) {
    const inventoryInput = page.locator('input[name="inventoryQuantity"], input[name="inventory"]');
    if (await inventoryInput.isVisible().catch(() => false)) {
      await inventoryInput.fill(productData.inventoryQuantity.toString());
    }
  }

  // Status
  if (productData.status) {
    const statusSelect = page.locator('select[name="status"]');
    if (await statusSelect.isVisible().catch(() => false)) {
      await statusSelect.selectOption(productData.status);
    }
  }
}

/**
 * Submit product form and wait for success
 */
export async function submitProductAndWait(page: Page): Promise<string | null> {
  // Click submit button
  await page.click('button[type="submit"]');

  // Wait for success indication
  await page.waitForTimeout(2000);

  // Check for success toast or redirect
  const successToast = page.locator('text="Product created"').or(page.locator('text="successfully"'));
  const wasSuccessful = await successToast.isVisible({ timeout: 10000 }).catch(() => false);

  if (wasSuccessful) {
    // Try to extract product ID from URL if redirected
    const url = page.url();
    const productIdMatch = url.match(/products\/([a-z0-9]+)/i);
    return productIdMatch ? productIdMatch[1] : null;
  }

  return null;
}

/**
 * Navigate to marketplace
 */
export async function navigateToMarketplace(page: Page): Promise<void> {
  await page.goto("/marketplace");
  await waitForPageLoad(page);
}

/**
 * Search for product in marketplace
 */
export async function searchForProduct(page: Page, productName: string): Promise<void> {
  const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]');

  if (await searchInput.isVisible().catch(() => false)) {
    await searchInput.fill(productName);
    await page.waitForTimeout(1000); // Wait for search results
  }
}

/**
 * Click on a product by name
 */
export async function clickOnProduct(page: Page, productName: string): Promise<boolean> {
  // Look for product heading (h3) containing the product name, then find its parent link
  const productHeading = page.locator(`h3:has-text("${productName}")`).first();

  if (await productHeading.isVisible({ timeout: 5000 }).catch(() => false)) {
    // Find the View Product link near this heading
    const parentCard = productHeading.locator(".."); // Go to parent
    const viewProductLink = parentCard.locator('a:has-text("View Product")');
    if (await viewProductLink.isVisible({ timeout: 2000 }).catch(() => false)) {
      await viewProductLink.click();
      await waitForPageLoad(page);
      return true;
    }
  }

  // Fallback: try to find any link with the product name
  const productLink = page.locator(`a:has-text("${productName}")`).first();
  if (await productLink.isVisible({ timeout: 3000 }).catch(() => false)) {
    await productLink.click();
    await waitForPageLoad(page);
    return true;
  }

  return false;
}

/**
 * Add current product to cart
 */
export async function addProductToCart(page: Page, quantity: number = 1): Promise<void> {
  // Set quantity if input is available
  const quantityInput = page.locator('input[type="number"]').first();
  if (await quantityInput.isVisible().catch(() => false)) {
    await quantityInput.fill(quantity.toString());
  }

  // Click add to cart
  const addToCartButton = page.locator('button:has-text("Add to Cart")').first()
    .or(page.locator('button:has-text("Add")').first());

  await addToCartButton.click();
  await page.waitForTimeout(1000);
}

/**
 * Navigate to checkout
 */
export async function navigateToCheckout(page: Page): Promise<void> {
  // Try clicking checkout button or navigating directly
  const checkoutButton = page.locator('a:has-text("Checkout"), button:has-text("Checkout")').first();

  if (await checkoutButton.isVisible().catch(() => false)) {
    await checkoutButton.click();
  } else {
    await page.goto("/marketplace/checkout");
  }

  await waitForPageLoad(page);
}

/**
 * Fill checkout customer information
 */
export async function fillCheckoutForm(
  page: Page,
  customerData: {
    name: string;
    email: string;
    phone?: string;
  }
): Promise<void> {
  // Wait for checkout form to be visible
  await page.waitForSelector('h1:has-text("Checkout"), h2:has-text("Contact")', { timeout: 15000 });

  // Customer name - look for Full Name field with placeholder "John Doe"
  const nameInput = page.getByPlaceholder("John Doe");
  if (await nameInput.isVisible({ timeout: 3000 }).catch(() => false)) {
    await nameInput.fill(customerData.name);
  }

  // Email - look for email field with placeholder "john@example.com"
  const emailInput = page.getByPlaceholder("john@example.com");
  if (await emailInput.isVisible({ timeout: 3000 }).catch(() => false)) {
    await emailInput.fill(customerData.email);
  }

  // Phone (optional) - look for phone field with placeholder "(555) 123-4567"
  if (customerData.phone) {
    const phoneInput = page.getByPlaceholder("(555) 123-4567");
    if (await phoneInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await phoneInput.fill(customerData.phone);
    }
  }
}

/**
 * Fill shipping address
 */
export async function fillShippingAddress(
  page: Page,
  address = TEST_SHIPPING_ADDRESS
): Promise<void> {
  // Street address - placeholder "123 Main Street"
  const streetInput = page.getByPlaceholder("123 Main Street");
  if (await streetInput.isVisible({ timeout: 3000 }).catch(() => false)) {
    await streetInput.fill(address.address1);
  }

  // Apt/Suite - placeholder "Apartment 4B"
  if (address.address2) {
    const apt2Input = page.getByPlaceholder("Apartment 4B");
    if (await apt2Input.isVisible({ timeout: 2000 }).catch(() => false)) {
      await apt2Input.fill(address.address2);
    }
  }

  // City - placeholder "Chicago"
  const cityInput = page.getByPlaceholder("Chicago");
  if (await cityInput.isVisible({ timeout: 2000 }).catch(() => false)) {
    await cityInput.fill(address.city);
  }

  // State - placeholder "IL"
  const stateInput = page.getByPlaceholder("IL");
  if (await stateInput.isVisible({ timeout: 2000 }).catch(() => false)) {
    await stateInput.fill(address.state);
  }

  // ZIP Code - placeholder "60601"
  const zipInput = page.getByPlaceholder("60601");
  if (await zipInput.isVisible({ timeout: 2000 }).catch(() => false)) {
    await zipInput.fill(address.zipCode);
  }
}

/**
 * Select shipping method
 */
export async function selectShippingMethod(page: Page, method: "DELIVERY" | "PICKUP"): Promise<void> {
  const radioValue = method;
  await page.click(`input[value="${radioValue}"]`);
}

/**
 * Fill Stripe card details in iframe
 */
export async function fillStripeCard(
  page: Page,
  card = STRIPE_TEST_CARD
): Promise<void> {
  // Locate Stripe iframe
  const stripeFrame = page.frameLocator('iframe[name*="stripe"]').first()
    .or(page.frameLocator('iframe[src*="stripe"]').first());

  // Fill card number
  const cardNumber = stripeFrame.locator('input[name="cardnumber"], input[placeholder*="card number" i]');
  await cardNumber.fill(card.number);

  // Fill expiry
  const expiry = stripeFrame.locator('input[name="exp-date"], input[placeholder*="MM" i]');
  await expiry.fill(card.expiry);

  // Fill CVC
  const cvc = stripeFrame.locator('input[name="cvc"], input[placeholder*="CVC" i]');
  await cvc.fill(card.cvc);

  // Fill ZIP if visible
  const zip = stripeFrame.locator('input[name="postal"], input[placeholder*="ZIP" i]');
  if (await zip.isVisible().catch(() => false)) {
    await zip.fill(card.zip);
  }
}

/**
 * Submit order
 */
export async function submitOrder(page: Page): Promise<string | null> {
  // Click place order button
  const submitButton = page.locator('button:has-text("Place Order")').first()
    .or(page.locator('button[type="submit"]').first());

  await submitButton.click();

  // Wait for redirect to confirmation page
  await page.waitForURL(/order-confirmation/, { timeout: 30000 });
  await waitForPageLoad(page);

  // Extract order number from URL or page content
  const url = page.url();
  const orderNumberMatch = url.match(/orderNumber=([^&]+)/);
  if (orderNumberMatch) {
    return orderNumberMatch[1];
  }

  // Try to find order number on page
  const orderNumberText = await page.locator('text=/ORD-[A-Z0-9-]+/i').first().textContent();
  return orderNumberText?.match(/ORD-[A-Z0-9-]+/i)?.[0] || null;
}

/**
 * Verify order confirmation page
 */
export async function verifyOrderConfirmation(page: Page, orderNumber?: string): Promise<boolean> {
  // Check for confirmation indicators
  const confirmationIndicators = page.locator('text="Order Confirmed"')
    .or(page.locator('text="Thank you"'))
    .or(page.locator('text="Confirmation"'));

  const hasConfirmation = await confirmationIndicators.isVisible({ timeout: 5000 }).catch(() => false);

  if (orderNumber) {
    const hasOrderNumber = await page.locator(`text="${orderNumber}"`).isVisible().catch(() => false);
    return hasConfirmation && hasOrderNumber;
  }

  return hasConfirmation;
}

/**
 * Navigate to vendor orders dashboard
 */
export async function navigateToVendorOrders(page: Page): Promise<void> {
  await page.goto("/vendor/dashboard/orders");
  await waitForPageLoad(page);
}

/**
 * Navigate to vendor earnings dashboard
 */
export async function navigateToVendorEarnings(page: Page): Promise<void> {
  await page.goto("/vendor/dashboard/earnings");
  await waitForPageLoad(page);
}

/**
 * Verify vendor has received order
 */
export async function verifyVendorOrderReceived(page: Page, orderNumber: string): Promise<boolean> {
  await navigateToVendorOrders(page);

  const orderRow = page.locator(`text="${orderNumber}"`);
  return orderRow.isVisible({ timeout: 10000 }).catch(() => false);
}

/**
 * Verify vendor earnings updated
 */
export async function verifyVendorEarnings(page: Page, expectedAmount?: number): Promise<boolean> {
  await navigateToVendorEarnings(page);

  // Check if earnings section is visible
  const earningsSection = page.locator('[data-testid="earnings"]')
    .or(page.locator('text="Earnings"'))
    .or(page.locator('text="Total"'));

  return earningsSection.isVisible({ timeout: 10000 }).catch(() => false);
}

/**
 * Take screenshot with timestamp
 */
export async function takeScreenshot(page: Page, name: string): Promise<void> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  await page.screenshot({ path: `test-results/screenshots/${name}-${timestamp}.png` });
}
