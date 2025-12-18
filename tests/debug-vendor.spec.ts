import { test, expect } from "@playwright/test";

test("debug vendor product creation", async ({ page }) => {
  // Login
  await page.goto("/login");
  await page.waitForTimeout(2000);

  const passwordBtn = page.locator('button:has-text("Sign in with password")');
  if (await passwordBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await passwordBtn.click();
    await page.waitForTimeout(500);
  }

  await page.getByTestId('password-email-input').fill('ira@irawatkins.com');
  await page.locator('input[type="password"]').fill('Bobby321!');
  await page.locator('form:has(input[type="password"]) button[type="submit"]').click();
  await page.waitForTimeout(3000);

  // Go to create product
  await page.goto('/vendor/dashboard/products/create');
  await page.waitForTimeout(3000);

  console.log('Page URL:', page.url());

  // Fill form
  await page.fill('input[name="name"]', 'Debug Test Product');
  await page.fill('textarea[name="description"]', 'Test description for debugging');
  await page.locator('input[name="price"]').fill('19.99');

  // Check form state
  const nameValue = await page.inputValue('input[name="name"]');
  const descValue = await page.inputValue('textarea[name="description"]');
  const priceValue = await page.inputValue('input[name="price"]');

  console.log('Form values:', { nameValue, descValue, priceValue });

  // Click submit
  const submitBtn = page.locator('form button[type="submit"]');
  console.log('Submit button visible:', await submitBtn.isVisible());
  console.log('Submit button text:', await submitBtn.textContent());

  // Take screenshot before click
  await page.screenshot({ path: 'test-results/debug-before-click.png' });

  await submitBtn.click();
  console.log('Clicked submit button');

  await page.waitForTimeout(10000);

  console.log('After submit URL:', page.url());

  // Take screenshot after click
  await page.screenshot({ path: 'test-results/debug-after-click.png' });

  // This test is just for debugging - always pass
  expect(true).toBe(true);
});
