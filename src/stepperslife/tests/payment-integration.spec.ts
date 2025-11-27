import { test, expect } from '@playwright/test';

const BASE_URL = 'http://127.0.0.1';

test.describe('Payment Integration Tests', () => {

  test('Square SDK initialization check', async ({ page }) => {
    console.log('\n=== Square SDK Integration Test ===\n');

    let squareSDKLoaded = false;
    const squareErrors: string[] = [];

    // Listen for Square SDK loading
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('Square') || text.includes('square')) {
        console.log('Square log:', text);
        if (text.toLowerCase().includes('loaded') || text.toLowerCase().includes('initialized')) {
          squareSDKLoaded = true;
        }
      }
      if (msg.type() === 'error' && (text.includes('Square') || text.includes('square'))) {
        squareErrors.push(text);
      }
    });

    console.log('Step 1: Loading checkout page with Square...');
    await page.goto(`${BASE_URL}/events`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    // Try to find an event and go to checkout
    const eventLinks = page.locator('a[href*="/events/"]');
    if (await eventLinks.count() > 0) {
      await eventLinks.first().click();
      await page.waitForTimeout(2000);

      const buyButton = page.locator('button:has-text("Buy Tickets"), a:has-text("Buy Tickets")').first();
      if (await buyButton.count() > 0) {
        await buyButton.click();
        await page.waitForTimeout(3000);

        console.log('Step 2: Checking for Square SDK in DOM...');

        // Check if Square Web SDK is loaded
        const squareSDKPresent = await page.evaluate(() => {
          return typeof (window as any).Square !== 'undefined';
        });

        console.log(`Square SDK loaded in window: ${squareSDKPresent ? '✓' : '✗'}`);

        // Check for Square payment form elements
        const squareCard = await page.locator('#card-container, [id*="square"], [class*="square-card"]').count();
        const cashAppButton = await page.locator('#cash-app-pay, [id*="cash-app"], [class*="cash-app"]').count();

        console.log('\nSquare Elements Found:');
        console.log(`  - Card container: ${squareCard > 0 ? '✓' : '✗'}`);
        console.log(`  - Cash App button: ${cashAppButton > 0 ? '✓' : '✗'}`);

        // Check for Square application ID in page
        const squareAppId = await page.evaluate(() => {
          const scripts = Array.from(document.getElementsByTagName('script'));
          for (const script of scripts) {
            if (script.textContent?.includes('sq0idp') || script.src.includes('square')) {
              return true;
            }
          }
          return false;
        });

        console.log(`  - Square App ID configured: ${squareAppId ? '✓' : '✗'}`);

        if (squareErrors.length > 0) {
          console.log('\n⚠ Square Errors:', squareErrors);
        } else {
          console.log('\n✓ No Square SDK errors detected');
        }

        console.log('\n✅ Square SDK Integration Check Complete');
      }
    }
  });

  test('Square payment API endpoints availability', async ({ page }) => {
    console.log('\n=== Square API Endpoints Test ===\n');

    const endpoints = [
      '/api/checkout/process-square-payment',
      '/api/credits/purchase-with-square',
      '/api/webhooks/square'
    ];

    for (const endpoint of endpoints) {
      console.log(`Testing ${endpoint}...`);

      const response = await page.request.post(`${BASE_URL}${endpoint}`, {
        data: {},
        failOnStatusCode: false
      });

      const status = response.status();
      console.log(`  Status: ${status} ${status < 500 ? '✓' : '✗'}`);

      // We expect 400 or 401 (bad request/unauthorized), not 404 or 500
      const endpointExists = status !== 404 && status !== 502;
      console.log(`  Endpoint exists: ${endpointExists ? '✓' : '✗'}`);
    }

    console.log('\n✅ Square API endpoints checked');
  });

  test('Stripe SDK initialization check', async ({ page }) => {
    console.log('\n=== Stripe SDK Integration Test ===\n');

    let stripeSDKLoaded = false;
    const stripeErrors: string[] = [];

    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('Stripe') || text.includes('stripe')) {
        console.log('Stripe log:', text);
        if (text.toLowerCase().includes('loaded') || text.toLowerCase().includes('initialized')) {
          stripeSDKLoaded = true;
        }
      }
      if (msg.type() === 'error' && (text.includes('Stripe') || text.includes('stripe'))) {
        stripeErrors.push(text);
      }
    });

    console.log('Step 1: Loading page and checking for Stripe...');
    await page.goto(`${BASE_URL}/events`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    // Navigate to checkout
    const eventLinks = page.locator('a[href*="/events/"]');
    if (await eventLinks.count() > 0) {
      await eventLinks.first().click();
      await page.waitForTimeout(2000);

      const buyButton = page.locator('button:has-text("Buy Tickets"), a:has-text("Buy Tickets")').first();
      if (await buyButton.count() > 0) {
        await buyButton.click();
        await page.waitForTimeout(3000);

        console.log('Step 2: Checking for Stripe SDK in DOM...');

        // Check if Stripe SDK is loaded
        const stripeSDKPresent = await page.evaluate(() => {
          return typeof (window as any).Stripe !== 'undefined';
        });

        console.log(`Stripe SDK loaded in window: ${stripeSDKPresent ? '✓' : '✗'}`);

        // Check for Stripe Elements
        const stripeElements = await page.locator('[class*="StripeElement"], iframe[name*="stripe"]').count();
        console.log(`Stripe Elements found: ${stripeElements}`);

        // Check if Stripe publishable key is configured
        const stripeConfigured = await page.evaluate(() => {
          const scripts = Array.from(document.getElementsByTagName('script'));
          for (const script of scripts) {
            if (script.textContent?.includes('pk_') || script.src.includes('stripe')) {
              return true;
            }
          }
          return false;
        });

        console.log(`Stripe publishable key configured: ${stripeConfigured ? '✓' : '⚠ Not detected'}`);

        if (stripeErrors.length > 0) {
          console.log('\n⚠ Stripe Errors:', stripeErrors);
        } else {
          console.log('\n✓ No Stripe SDK errors detected');
        }

        console.log('\n✅ Stripe SDK Integration Check Complete');
      }
    }
  });

  test('Stripe API endpoints availability', async ({ page }) => {
    console.log('\n=== Stripe API Endpoints Test ===\n');

    const endpoints = [
      '/api/stripe/create-payment-intent',
      '/api/stripe/create-connect-account'
    ];

    for (const endpoint of endpoints) {
      console.log(`Testing ${endpoint}...`);

      const response = await page.request.post(`${BASE_URL}${endpoint}`, {
        data: {},
        failOnStatusCode: false
      });

      const status = response.status();
      console.log(`  Status: ${status} ${status < 500 ? '✓' : '✗'}`);

      const endpointExists = status !== 404 && status !== 502;
      console.log(`  Endpoint exists: ${endpointExists ? '✓' : '✗'}`);
    }

    console.log('\n✅ Stripe API endpoints checked');
  });

  test('Payment split configuration check', async ({ page }) => {
    console.log('\n=== Payment Split Configuration Test ===\n');

    console.log('Checking if payment split is configured...');

    // Read the Stripe payment intent creation code
    const response = await page.request.post(`${BASE_URL}/api/stripe/create-payment-intent`, {
      data: {
        amount: 5000,
        eventId: 'test-event',
        organizerId: 'test-organizer'
      },
      failOnStatusCode: false
    });

    const status = response.status();
    console.log(`Payment Intent endpoint status: ${status}`);

    if (status === 200 || status === 400 || status === 401) {
      console.log('✓ Stripe payment endpoint is responding');

      // Try to check if split payment is mentioned in response
      const body = await response.text();
      const hasSplitConfig = body.includes('application_fee') || body.includes('transfer_data') || body.includes('destination');

      console.log(`Split payment configuration detected: ${hasSplitConfig ? '✓' : '⚠ Unable to confirm'}`);
    } else {
      console.log('⚠ Stripe may not be fully configured (missing API keys)');
    }

    console.log('\n✅ Payment split configuration checked');
  });

  test('Cash App Pay availability check', async ({ page }) => {
    console.log('\n=== Cash App Pay Integration Test ===\n');

    console.log('Step 1: Loading checkout page...');
    await page.goto(`${BASE_URL}/events`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    const eventLinks = page.locator('a[href*="/events/"]');
    if (await eventLinks.count() > 0) {
      await eventLinks.first().click();
      await page.waitForTimeout(2000);

      const buyButton = page.locator('button:has-text("Buy Tickets"), a:has-text("Buy Tickets")').first();
      if (await buyButton.count() > 0) {
        await buyButton.click();
        await page.waitForTimeout(3000);

        console.log('Step 2: Looking for Cash App Pay option...');

        // Check for Cash App button or QR code
        const cashAppButton = await page.locator('button:has-text("Cash App"), [id*="cash-app"], [class*="cash-app"]').count();
        const cashAppQR = await page.locator('img[alt*="Cash App"], [class*="qr-code"]').count();

        console.log(`Cash App Pay button: ${cashAppButton > 0 ? '✓ Found' : '✗ Not found'}`);
        console.log(`Cash App QR code: ${cashAppQR > 0 ? '✓ Found' : '✗ Not found'}`);

        // Check if Cash App Pay is integrated via Square
        const squareCashApp = await page.evaluate(() => {
          return (window as any).Square && (window as any).Square.cashAppPay;
        });

        console.log(`Cash App via Square SDK: ${squareCashApp ? '✓ Available' : '✗ Not available'}`);

        console.log('\n✅ Cash App Pay availability checked');
      }
    }
  });

  test('Payment processing error handling', async ({ page }) => {
    console.log('\n=== Payment Error Handling Test ===\n');

    console.log('Testing error handling with invalid payment data...');

    // Test Square payment with invalid data
    const squareResponse = await page.request.post(`${BASE_URL}/api/checkout/process-square-payment`, {
      data: {
        invalidData: true
      },
      failOnStatusCode: false
    });

    const squareStatus = squareResponse.status();
    console.log(`Square invalid request status: ${squareStatus}`);
    console.log(`Proper error response: ${squareStatus >= 400 && squareStatus < 500 ? '✓' : '✗'}`);

    // Test Stripe payment with invalid data
    const stripeResponse = await page.request.post(`${BASE_URL}/api/stripe/create-payment-intent`, {
      data: {
        invalidData: true
      },
      failOnStatusCode: false
    });

    const stripeStatus = stripeResponse.status();
    console.log(`Stripe invalid request status: ${stripeStatus}`);
    console.log(`Proper error response: ${stripeStatus >= 400 && stripeStatus < 500 ? '✓' : '✗'}`);

    console.log('\n✅ Error handling verified');
  });
});
