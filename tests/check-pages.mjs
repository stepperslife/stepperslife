import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage();

// Check pricing page
console.log('Checking pricing page...');
await page.goto('https://stepperslife.com/restaurants/pricing');
await page.waitForTimeout(5000);

// Look for plan links
const starterLink = await page.$('a[href*="plan=starter"]');
const growthLink = await page.$('a[href*="plan=growth"]');
const proLink = await page.$('a[href*="plan=professional"]');

console.log('Starter link found:', !!starterLink);
console.log('Growth link found:', !!growthLink);
console.log('Professional link found:', !!proLink);

// Get all anchor hrefs
const links = await page.$$eval('a[href*="restaurateur/apply"]', els => els.map(e => e.href));
console.log('Apply links found:', links);

await page.screenshot({ path: 'test-results/pricing-page.png', fullPage: true });
console.log('Screenshot saved to test-results/pricing-page.png');

// Now check apply page with plan param
console.log('\nChecking apply page with plan=starter...');
await page.goto('https://stepperslife.com/restaurateur/apply?plan=starter');
await page.waitForTimeout(5000);

const hasStarterPlan = await page.$('text=Starter Plan');
console.log('Starter Plan text found:', !!hasStarterPlan);

// Get page text
const pageText = await page.textContent('body');
console.log('Page contains "Starter":', pageText.includes('Starter'));
console.log('Page contains "Plan":', pageText.includes('Plan'));
console.log('Page contains "Free":', pageText.includes('Free'));
console.log('Page contains "Selected":', pageText.includes('Selected'));

await page.screenshot({ path: 'test-results/apply-page.png', fullPage: true });
console.log('Screenshot saved to test-results/apply-page.png');

await browser.close();
console.log('\nDone!');
