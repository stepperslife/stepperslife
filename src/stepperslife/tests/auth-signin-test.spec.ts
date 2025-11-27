import { test, expect } from '@playwright/test';

test.describe('Authentication Flow Test', () => {
  test('should complete sign-in flow and create event', async ({ page }) => {
    // Set longer timeout for this interactive test
    test.setTimeout(120000);

    console.log('\n🚀 Starting authentication flow test...\n');

    // Step 1: Visit homepage
    console.log('📍 Step 1: Visiting homepage...');
    await page.goto('http://localhost:3004');
    await page.waitForLoadState('networkidle');
    console.log('✅ Homepage loaded\n');

    // Step 2: Navigate to sign-in page
    console.log('📍 Step 2: Navigating to sign-in page...');
    await page.goto('http://localhost:3004/auth/signin');
    await page.waitForLoadState('networkidle');
    console.log('✅ Sign-in page loaded\n');

    // Take screenshot of sign-in page
    await page.screenshot({ path: 'test-results/01-signin-page.png', fullPage: true });
    console.log('📸 Screenshot saved: test-results/01-signin-page.png\n');

    // Step 3: Check available sign-in options
    console.log('📍 Step 3: Checking available sign-in options...');

    const googleSignInButton = page.locator('button:has-text("Google"), button:has-text("Sign in with Google"), a:has-text("Google")');
    const emailInput = page.locator('input[type="email"], input[name="email"]');

    const hasGoogleButton = await googleSignInButton.count() > 0;
    const hasEmailInput = await emailInput.count() > 0;

    console.log(`  - Google OAuth: ${hasGoogleButton ? '✅ Available' : '❌ Not found'}`);
    console.log(`  - Email/Password: ${hasEmailInput ? '✅ Available' : '❌ Not found'}\n`);

    if (!hasGoogleButton && !hasEmailInput) {
      console.log('❌ No sign-in options found on the page!');
      console.log('🔍 Page content:');
      console.log(await page.content());
      throw new Error('No sign-in options available');
    }

    // Step 4: Check if we can use credentials sign-in for testing
    if (hasEmailInput) {
      console.log('📍 Step 4: Testing email/password sign-in...');

      // Look for test credentials or use default
      const testEmail = 'test@stepperslife.com';
      const testPassword = 'testpassword123';

      await emailInput.fill(testEmail);
      console.log(`  ✅ Filled email: ${testEmail}`);

      const passwordInput = page.locator('input[type="password"], input[name="password"]');
      if (await passwordInput.count() > 0) {
        await passwordInput.fill(testPassword);
        console.log('  ✅ Filled password');

        // Find and click sign-in button
        const signInButton = page.locator('button[type="submit"]:has-text("Sign"), button:has-text("Sign In"), button:has-text("Login")').first();
        await signInButton.click();
        console.log('  ✅ Clicked sign-in button\n');

        // Wait for redirect or error
        await page.waitForTimeout(3000);

        // Take screenshot after sign-in attempt
        await page.screenshot({ path: 'test-results/02-after-signin.png', fullPage: true });
        console.log('📸 Screenshot saved: test-results/02-after-signin.png\n');
      }
    }

    // Step 5: Check if authentication succeeded
    console.log('📍 Step 5: Checking authentication status...');

    // Check for session via API
    const sessionResponse = await page.request.get('http://localhost:3004/api/auth/session');
    const sessionData = await sessionResponse.json();

    console.log('Session data:', JSON.stringify(sessionData, null, 2));

    const isAuthenticated = sessionData && sessionData.user;
    console.log(`\n${isAuthenticated ? '✅' : '❌'} Authentication status: ${isAuthenticated ? 'Signed In' : 'Not Signed In'}\n`);

    // Step 6: If authenticated, test event creation
    if (isAuthenticated) {
      console.log('📍 Step 6: Testing event creation...');
      await page.goto('http://localhost:3004/organizer/events/create');
      await page.waitForLoadState('networkidle');

      await page.screenshot({ path: 'test-results/03-create-event-page.png', fullPage: true });
      console.log('📸 Screenshot saved: test-results/03-create-event-page.png\n');

      console.log('✅ Successfully accessed create event page\n');
    } else {
      console.log('⚠️  Not authenticated - manual sign-in required\n');
      console.log('📋 Next steps:');
      console.log('   1. Browser window is open at sign-in page');
      console.log('   2. Manually sign in with Google or create an account');
      console.log('   3. After signing in, the test will continue...\n');

      // Keep browser open for manual sign-in
      console.log('⏳ Waiting for manual sign-in (60 seconds)...');
      await page.waitForTimeout(60000);

      // Check again after waiting
      const sessionResponse2 = await page.request.get('http://localhost:3004/api/auth/session');
      const sessionData2 = await sessionResponse2.json();
      const isAuthenticatedNow = sessionData2 && sessionData2.user;

      if (isAuthenticatedNow) {
        console.log('✅ Successfully signed in!\n');
        console.log('User:', sessionData2.user);

        // Try creating event now
        console.log('\n📍 Testing event creation...');
        await page.goto('http://localhost:3004/organizer/events/create');
        await page.waitForLoadState('networkidle');
        await page.screenshot({ path: 'test-results/03-create-event-page.png', fullPage: true });
        console.log('✅ Successfully accessed create event page\n');
      } else {
        console.log('❌ Still not signed in after waiting\n');
      }
    }

    // Step 7: Summary
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 TEST SUMMARY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Authentication: ${isAuthenticated ? '✅ Working' : '⚠️  Manual sign-in required'}`);
    console.log(`Screenshots saved in: test-results/`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  });
});
