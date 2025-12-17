import { test } from '@playwright/test';

test('Open browser for manual sign-in', async ({ page }) => {
  // Set very long timeout - browser stays open
  test.setTimeout(600000); // 10 minutes

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🚀 MANUAL SIGN-IN HELPER');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Step 1: Open sign-in page
  console.log('📍 Opening sign-in page...');
  await page.goto('http://localhost:3004/auth/signin', { waitUntil: 'domcontentloaded' });
  console.log('✅ Sign-in page opened\n');

  console.log('📋 INSTRUCTIONS:');
  console.log('1. Look at the Chromium browser window that just opened');
  console.log('2. Sign in using one of these methods:');
  console.log('   - Click "Sign in with Google"');
  console.log('   - Or use email/password if available');
  console.log('3. After signing in successfully, press Ctrl+C in this terminal\n');

  console.log('⏳ Browser will stay open for 10 minutes...\n');
  console.log('Current URL: http://localhost:3004/auth/signin\n');

  // Wait for user to sign in
  await page.waitForTimeout(600000); // 10 minutes

  console.log('\n✅ Session complete!');
});
