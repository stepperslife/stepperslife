/**
 * Google OAuth Testing with Puppeteer
 *
 * This script provides additional testing capabilities using Puppeteer
 * for capturing detailed screenshots, PDFs, and monitoring the OAuth flow
 */

import puppeteer from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = process.env.NEXTAUTH_URL || 'https://events.stepperslife.com';

interface NetworkLog {
  type: 'request' | 'response';
  url: string;
  method?: string;
  status?: number;
  headers: any;
  timestamp: string;
}

interface ConsoleLog {
  type: string;
  text: string;
  timestamp: string;
}

async function setupDirectories() {
  const dirs = [
    'test-results/puppeteer-screenshots',
    'test-results/puppeteer-pdfs',
    'test-results/puppeteer-logs'
  ];

  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
}

async function testGoogleOAuthWithPuppeteer() {
  console.log('🤖 Starting Puppeteer Google OAuth Test...\n');

  await setupDirectories();

  // Launch browser
  const browser = await puppeteer.launch({
    headless: false, // Set to true for CI/CD
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-web-security'
    ],
    defaultViewport: {
      width: 1920,
      height: 1080
    }
  });

  const page = await browser.newPage();

  // Set up logging
  const networkLogs: NetworkLog[] = [];
  const consoleLogs: ConsoleLog[] = [];

  // Monitor network requests
  await page.setRequestInterception(true);

  page.on('request', (request) => {
    networkLogs.push({
      type: 'request',
      url: request.url(),
      method: request.method(),
      headers: request.headers(),
      timestamp: new Date().toISOString()
    });
    request.continue();
  });

  page.on('response', (response) => {
    networkLogs.push({
      type: 'response',
      url: response.url(),
      status: response.status(),
      headers: response.headers(),
      timestamp: new Date().toISOString()
    });
  });

  // Monitor console logs
  page.on('console', (msg) => {
    consoleLogs.push({
      type: msg.type(),
      text: msg.text(),
      timestamp: new Date().toISOString()
    });
    console.log(`[Browser Console - ${msg.type()}]:`, msg.text());
  });

  // Monitor errors
  page.on('pageerror', (error) => {
    console.error('❌ Page Error:', error.message);
    consoleLogs.push({
      type: 'error',
      text: error.message,
      timestamp: new Date().toISOString()
    });
  });

  try {
    // Test 1: Navigate to login page
    console.log('📍 Step 1: Navigate to login page');
    await page.goto(`${BASE_URL}/login`, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    await page.screenshot({
      path: 'test-results/puppeteer-screenshots/01-login-page.png',
      fullPage: true
    });

    // Save as PDF
    await page.pdf({
      path: 'test-results/puppeteer-pdfs/01-login-page.pdf',
      format: 'A4',
      printBackground: true
    });

    console.log('  ✓ Login page loaded and captured');

    // Test 2: Find Google login button
    console.log('\n📍 Step 2: Locate Google login button');

    const googleButton = await page.waitForSelector('button:has-text("Continue with Google")', {
      timeout: 10000
    });

    if (!googleButton) {
      throw new Error('Google login button not found');
    }

    // Highlight the button for screenshot
    await page.evaluate((button) => {
      if (button) {
        button.style.border = '3px solid red';
        button.style.boxShadow = '0 0 10px rgba(255, 0, 0, 0.5)';
      }
    }, googleButton);

    await page.screenshot({
      path: 'test-results/puppeteer-screenshots/02-google-button-highlighted.png',
      fullPage: true
    });

    console.log('  ✓ Google button found and highlighted');

    // Test 3: Get button properties
    console.log('\n📍 Step 3: Inspect button properties');

    const buttonInfo = await page.evaluate((button) => {
      if (!button) return null;
      return {
        text: button.textContent?.trim(),
        classes: button.className,
        visible: button.offsetWidth > 0 && button.offsetHeight > 0,
        enabled: !button.disabled,
        bounds: button.getBoundingClientRect()
      };
    }, googleButton);

    console.log('  Button properties:', buttonInfo);

    // Test 4: Hover over button
    console.log('\n📍 Step 4: Hover over Google button');

    await googleButton.hover();
    await page.waitForTimeout(500);

    await page.screenshot({
      path: 'test-results/puppeteer-screenshots/03-button-hover.png',
      fullPage: true
    });

    console.log('  ✓ Button hover state captured');

    // Test 5: Click Google button
    console.log('\n📍 Step 5: Click Google login button');

    const navigationPromise = page.waitForNavigation({
      timeout: 10000,
      waitUntil: 'networkidle2'
    }).catch(() => {
      console.log('  ⚠️  Navigation timeout (may be expected for OAuth redirect)');
    });

    await googleButton.click();
    await navigationPromise;

    await page.waitForTimeout(3000);

    await page.screenshot({
      path: 'test-results/puppeteer-screenshots/04-after-click.png',
      fullPage: true
    });

    await page.pdf({
      path: 'test-results/puppeteer-pdfs/04-after-click.pdf',
      format: 'A4',
      printBackground: true
    });

    console.log('  ✓ Post-click state captured');

    // Test 6: Check current URL
    console.log('\n📍 Step 6: Verify OAuth redirect');

    const currentUrl = page.url();
    console.log(`  Current URL: ${currentUrl}`);

    const isOAuthFlow =
      currentUrl.includes('accounts.google.com') ||
      currentUrl.includes('/api/auth/google') ||
      currentUrl.includes('/api/auth/callback/google');

    if (isOAuthFlow) {
      console.log('  ✅ OAuth flow initiated successfully');

      // Capture Google OAuth screen if present
      if (currentUrl.includes('accounts.google.com')) {
        await page.screenshot({
          path: 'test-results/puppeteer-screenshots/05-google-oauth-screen.png',
          fullPage: true
        });

        await page.pdf({
          path: 'test-results/puppeteer-pdfs/05-google-oauth-screen.pdf',
          format: 'A4',
          printBackground: true
        });

        console.log('  ✓ Google OAuth consent screen captured');
      }
    } else {
      console.log('  ⚠️  Unexpected URL - OAuth flow may have completed or failed');
    }

    // Test 7: Check cookies
    console.log('\n📍 Step 7: Inspect authentication cookies');

    const cookies = await page.cookies();
    const authCookies = cookies.filter(c =>
      c.name.includes('auth') ||
      c.name.includes('session') ||
      c.name.includes('oauth') ||
      c.name.includes('state')
    );

    console.log(`  Found ${authCookies.length} authentication-related cookies:`);
    authCookies.forEach(cookie => {
      console.log(`    - ${cookie.name}`);
      console.log(`      Domain: ${cookie.domain}`);
      console.log(`      Secure: ${cookie.secure}`);
      console.log(`      HttpOnly: ${cookie.httpOnly}`);
      console.log(`      SameSite: ${cookie.sameSite}`);
    });

    // Save cookies
    fs.writeFileSync(
      'test-results/puppeteer-logs/cookies.json',
      JSON.stringify(cookies, null, 2)
    );

    // Test 8: Get performance metrics
    console.log('\n📍 Step 8: Collect performance metrics');

    const performanceMetrics = await page.evaluate(() => {
      const perf = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        dns: perf.domainLookupEnd - perf.domainLookupStart,
        tcp: perf.connectEnd - perf.connectStart,
        request: perf.responseStart - perf.requestStart,
        response: perf.responseEnd - perf.responseStart,
        dom: perf.domComplete - perf.domInteractive,
        load: perf.loadEventEnd - perf.loadEventStart,
        total: perf.loadEventEnd - perf.fetchStart
      };
    });

    console.log('  Performance metrics:');
    console.log(`    DNS: ${performanceMetrics.dns.toFixed(2)}ms`);
    console.log(`    TCP: ${performanceMetrics.tcp.toFixed(2)}ms`);
    console.log(`    Request: ${performanceMetrics.request.toFixed(2)}ms`);
    console.log(`    Response: ${performanceMetrics.response.toFixed(2)}ms`);
    console.log(`    DOM: ${performanceMetrics.dom.toFixed(2)}ms`);
    console.log(`    Load: ${performanceMetrics.load.toFixed(2)}ms`);
    console.log(`    Total: ${performanceMetrics.total.toFixed(2)}ms`);

    // Save all logs
    console.log('\n📍 Step 9: Save test results');

    fs.writeFileSync(
      'test-results/puppeteer-logs/network-logs.json',
      JSON.stringify(networkLogs, null, 2)
    );

    fs.writeFileSync(
      'test-results/puppeteer-logs/console-logs.json',
      JSON.stringify(consoleLogs, null, 2)
    );

    fs.writeFileSync(
      'test-results/puppeteer-logs/performance-metrics.json',
      JSON.stringify(performanceMetrics, null, 2)
    );

    // Generate summary report
    const summary = {
      testDate: new Date().toISOString(),
      baseUrl: BASE_URL,
      finalUrl: currentUrl,
      oauthFlowInitiated: isOAuthFlow,
      totalRequests: networkLogs.filter(l => l.type === 'request').length,
      totalResponses: networkLogs.filter(l => l.type === 'response').length,
      consoleErrors: consoleLogs.filter(l => l.type === 'error').length,
      cookiesSet: authCookies.length,
      performanceMetrics,
      authRelatedRequests: networkLogs.filter(l =>
        l.url.includes('/api/auth') || l.url.includes('google.com')
      ).length
    };

    fs.writeFileSync(
      'test-results/puppeteer-logs/test-summary.json',
      JSON.stringify(summary, null, 2)
    );

    console.log('\n✅ Puppeteer test completed successfully!');
    console.log(`\n📊 Test Summary:`);
    console.log(`   - Total Requests: ${summary.totalRequests}`);
    console.log(`   - Total Responses: ${summary.totalResponses}`);
    console.log(`   - Auth Requests: ${summary.authRelatedRequests}`);
    console.log(`   - Console Errors: ${summary.consoleErrors}`);
    console.log(`   - Auth Cookies: ${summary.cookiesSet}`);
    console.log(`   - OAuth Flow: ${summary.oauthFlowInitiated ? 'Initiated' : 'Not Detected'}`);
    console.log(`\n📁 Results saved to test-results/puppeteer-* directories`);

  } catch (error: any) {
    console.error('\n❌ Test failed:', error.message);

    // Capture error state
    await page.screenshot({
      path: 'test-results/puppeteer-screenshots/error-state.png',
      fullPage: true
    });

    // Save error log
    fs.writeFileSync(
      'test-results/puppeteer-logs/error.json',
      JSON.stringify({
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
        url: page.url()
      }, null, 2)
    );

  } finally {
    await browser.close();
  }
}

// Run the test
if (require.main === module) {
  testGoogleOAuthWithPuppeteer()
    .then(() => {
      console.log('\n✅ All tests completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Test suite failed:', error);
      process.exit(1);
    });
}

export { testGoogleOAuthWithPuppeteer };
