/**
 * Test account credentials for E2E marketplace tests
 * These are real accounts used for testing vendor/customer flows
 */

export const VENDOR_ACCOUNT = {
  email: "ira@irawatkins.com",
  password: "Bobby321!",
  name: "Test Vendor",
};

export const CUSTOMER_ACCOUNT = {
  email: "ira@irawatkins.com",
  password: "Bobby321!",
  name: "Test Customer",
};

export const TEST_PRODUCT_DATA = {
  name: `E2E Test Product ${Date.now()}`,
  description: "Test product created by E2E marketplace tests. This product is used to verify the complete vendor product creation and customer purchase flow.",
  price: 29.99, // $29.99
  priceInCents: 2999,
  category: "Apparel & Fashion",
  inventoryQuantity: 10,
  status: "ACTIVE" as const,
};

export const TEST_SHIPPING_ADDRESS = {
  name: "Test Customer",
  address1: "123 Test Street",
  address2: "Suite 100",
  city: "Evanston",
  state: "Illinois",
  zipCode: "60201",
  country: "United States",
};

export const STRIPE_TEST_CARD = {
  number: "4242424242424242",
  expiry: "12/30",
  cvc: "123",
  zip: "60601",
};

export function generateUniqueProductName(): string {
  return `E2E Test Product ${Date.now()}-${Math.random().toString(36).substring(7)}`;
}
