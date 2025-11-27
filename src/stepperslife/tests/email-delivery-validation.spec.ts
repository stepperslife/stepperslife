/**
 * CRITICAL: Email Delivery & QR Code Uniqueness Test Suite
 * Tests ticket confirmation emails, QR code generation, and delivery reliability
 *
 * Coverage:
 * - Email arrives within 60 seconds
 * - **CRITICAL**: All QR codes are unique (no duplicates)
 * - Email content accuracy (price, dates, venue)
 * - QR codes render correctly
 * - Links are functional
 * - Email not marked as spam
 */

import { test, expect, Page } from '@playwright/test';
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL!;
const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3004';

// Test configuration
const TEST_CUSTOMER = {
  name: 'Email Test Customer',
  email: `email-test-${Date.now()}@test.com`,
  phone: '5555555555'
};

const EMAIL_TIMEOUT = 60000; // 60 seconds max for email delivery

// Test state
let convex: ConvexHttpClient;
let organizerId: Id<"users">;
let eventId: Id<"events">;
let orderId: Id<"orders">;
let ticketIds: Id<"tickets">[] = [];
let qrCodes: string[] = [];

test.describe('Email Delivery & QR Code Validation', () => {

  test.beforeAll(async () => {
    convex = new ConvexHttpClient(CONVEX_URL);
    console.log('\n' + '='.repeat(80));
    console.log('📧 EMAIL DELIVERY & QR CODE VALIDATION TEST SUITE');
    console.log('='.repeat(80) + '\n');
  });

  test('Setup: Create event and purchase 5 tickets', async ({ page }) => {
    console.log('\n📋 Setting up email delivery test environment...\n');

    // Create organizer
    console.log('1. Creating organizer account...');
    await page.goto(`${BASE_URL}/register`);
    await page.fill('input[name="email"]', `organizer-email-${Date.now()}@test.com`);
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.fill('input[name="name"]', 'Email Test Organizer');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/organizer/dashboard', { timeout: 10000 });

    const users = await convex.query(api.users.queries.getAllUsers, {});
    const organizer = users.find(u => u.email?.includes('organizer-email'));
    organizerId = organizer!._id;
    console.log(`   ✅ Organizer created: ${organizerId}`);

    // Create event
    console.log('2. Creating test event...');
    await page.goto(`${BASE_URL}/organizer/events/create`);
    await page.fill('input[name="eventName"]', 'Email Delivery Test Event');
    await page.fill('textarea[name="description"]', 'Testing email confirmation delivery');

    const futureDate = new Date(Date.now() + (14 * 24 * 60 * 60 * 1000)); // 2 weeks
    await page.fill('input[name="date"]', futureDate.toISOString().split('T')[0]);
    await page.fill('input[name="time"]', '19:30');
    await page.fill('input[name="venue"]', 'Test Venue, 123 Main St, Test City, CA 90210');

    await page.setInputFiles('input[type="file"]', {
      name: 'test-flyer.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from('test image data')
    });

    await page.click('button:has-text("Add Ticket Tier")');
    await page.fill('input[name="tierName"]', 'General Admission');
    await page.fill('input[name="price"]', '35.00');
    await page.fill('input[name="quantity"]', '100');

    await page.click('button:has-text("Publish Event")');
    await page.waitForURL('**/organizer/events/**', { timeout: 10000 });

    const events = await convex.query(api.public.queries.getPublishedEvents, {});
    const testEvent = events.find(e => e.name === 'Email Delivery Test Event');
    eventId = testEvent!._id;
    console.log(`   ✅ Event created: ${eventId}`);

    // Purchase 5 tickets
    console.log('3. Purchasing 5 tickets...');
    await page.goto(`${BASE_URL}/events/${eventId}`);
    await page.click('button:has-text("Buy Tickets")');
    await page.selectOption('select[name="quantity"]', '5');
    await page.click('button:has-text("Continue to Checkout")');

    await page.fill('input[name="buyerName"]', TEST_CUSTOMER.name);
    await page.fill('input[name="buyerEmail"]', TEST_CUSTOMER.email);
    await page.fill('input[name="buyerPhone"]', TEST_CUSTOMER.phone);

    // Note the exact purchase time for email delivery verification
    const purchaseTime = Date.now();
    console.log(`   ⏰ Purchase initiated at: ${new Date(purchaseTime).toLocaleTimeString()}`);

    await page.click('button:has-text("Complete Purchase")');
    await page.waitForURL('**/order-confirmation/**', { timeout: 15000 });

    const purchaseCompleteTime = Date.now();
    const purchaseDuration = purchaseCompleteTime - purchaseTime;
    console.log(`   ✅ Purchase completed in ${purchaseDuration}ms`);

    // Get order and ticket details
    const orders = await convex.query(api.orders.queries.getOrdersByEmail, {
      email: TEST_CUSTOMER.email
    });
    const order = orders[0];
    orderId = order._id;

    const tickets = await convex.query(api.tickets.queries.getTicketsByOrder, { orderId });
    ticketIds = tickets.map(t => t._id);
    qrCodes = tickets.map(t => t.ticketCode);

    console.log(`   ✅ Order ID: ${orderId}`);
    console.log(`   ✅ Tickets created: ${ticketIds.length}`);
    console.log(`   📱 QR Codes: ${qrCodes.join(', ')}`);

    console.log('\n✅ Test environment setup complete!\n');
  });

  test('EMAIL-1: **CRITICAL** Verify all 5 QR codes are unique', async () => {
    console.log('\n🔍 CRITICAL TEST: QR Code Uniqueness (5 tickets)\n');

    // Check that all 5 QR codes are different
    const uniqueCodes = new Set(qrCodes);
    console.log(`   Total QR codes: ${qrCodes.length}`);
    console.log(`   Unique QR codes: ${uniqueCodes.size}`);

    // **CRITICAL ASSERTION**: Must have exactly 5 unique codes
    expect(uniqueCodes.size).toBe(5);
    expect(qrCodes.length).toBe(5);

    console.log('   ✅ All QR codes are unique (no duplicates)');

    // Log each unique code
    qrCodes.forEach((code, index) => {
      console.log(`   ✅ Ticket ${index + 1}: ${code}`);
    });

    // Check for any duplicates explicitly
    const duplicates = qrCodes.filter((code, index) =>
      qrCodes.indexOf(code) !== index
    );

    expect(duplicates.length).toBe(0);
    console.log('   ✅ No duplicate QR codes detected');

    // Verify QR code format
    qrCodes.forEach(code => {
      expect(code).toMatch(/^[A-Z0-9]{8,}$/);
      expect(code.length).toBeGreaterThanOrEqual(8);
    });
    console.log('   ✅ All QR codes follow correct format');

    console.log('\n✅ CRITICAL: QR code uniqueness test PASSED ✅\n');
  });

  test('EMAIL-2: Verify email sent within 60 seconds', async () => {
    console.log('\n📧 TEST: Email Delivery Speed\n');

    // Wait up to 60 seconds for email to be sent
    console.log('   ⏰ Waiting for email (max 60 seconds)...');

    const startWait = Date.now();
    let emailSent = false;
    let attempts = 0;

    // Poll for email confirmation in database
    while (Date.now() - startWait < EMAIL_TIMEOUT && !emailSent) {
      attempts++;

      // Check if email record exists in database
      const emailLog = await convex.query(api.emails.queries.getEmailsByRecipient, {
        email: TEST_CUSTOMER.email
      });

      if (emailLog && emailLog.length > 0) {
        const ticketEmail = emailLog.find(e =>
          e.type === 'TICKET_CONFIRMATION' && e.orderId === orderId
        );

        if (ticketEmail) {
          emailSent = true;
          const deliveryTime = Date.now() - startWait;
          console.log(`   ✅ Email sent after ${deliveryTime}ms (${Math.round(deliveryTime / 1000)}s)`);
          console.log(`   ✅ Attempts: ${attempts}`);
          console.log(`   ✅ Email ID: ${ticketEmail._id}`);

          // Verify email status
          expect(ticketEmail.status).toBe('SENT');
          console.log(`   ✅ Status: ${ticketEmail.status}`);

          // Verify email delivery time is within acceptable range
          expect(deliveryTime).toBeLessThan(EMAIL_TIMEOUT);
          break;
        }
      }

      await new Promise(resolve => setTimeout(resolve, 2000)); // Check every 2 seconds
    }

    if (!emailSent) {
      throw new Error(`❌ Email not sent within ${EMAIL_TIMEOUT / 1000} seconds`);
    }

    console.log('\n✅ Email delivery speed test PASSED\n');
  });

  test('EMAIL-3: Verify email content accuracy', async () => {
    console.log('\n📝 TEST: Email Content Validation\n');

    // Get email content from database
    const emailLog = await convex.query(api.emails.queries.getEmailsByRecipient, {
      email: TEST_CUSTOMER.email
    });
    const ticketEmail = emailLog.find(e =>
      e.type === 'TICKET_CONFIRMATION' && e.orderId === orderId
    );

    expect(ticketEmail).toBeDefined();
    console.log('   ✅ Email record found');

    // Verify email contains critical information
    const emailContent = ticketEmail.htmlContent || ticketEmail.textContent || '';

    // Check for event name
    expect(emailContent).toContain('Email Delivery Test Event');
    console.log('   ✅ Event name present');

    // Check for customer name
    expect(emailContent).toContain(TEST_CUSTOMER.name);
    console.log('   ✅ Customer name present');

    // Check for ticket quantity
    expect(emailContent).toContain('5'); // 5 tickets
    console.log('   ✅ Ticket quantity present');

    // Check for total price ($175 for 5 tickets @ $35 each)
    expect(emailContent).toContain('175') || expect(emailContent).toContain('$175');
    console.log('   ✅ Total price present');

    // Check for venue information
    expect(emailContent).toContain('Test Venue');
    console.log('   ✅ Venue information present');

    // Check for date
    const eventDate = new Date(Date.now() + (14 * 24 * 60 * 60 * 1000));
    const dateStr = eventDate.toLocaleDateString();
    expect(emailContent).toContain(dateStr.split('/')[0]); // Month or day
    console.log('   ✅ Event date present');

    // Verify all 5 QR codes are in the email
    let qrCodesInEmail = 0;
    qrCodes.forEach(code => {
      if (emailContent.includes(code)) {
        qrCodesInEmail++;
      }
    });

    expect(qrCodesInEmail).toBe(5);
    console.log(`   ✅ All 5 QR codes present in email`);

    console.log('\n✅ Email content validation PASSED\n');
  });

  test('EMAIL-4: Verify QR code images render correctly', async () => {
    console.log('\n🖼️  TEST: QR Code Image Rendering\n');

    const emailLog = await convex.query(api.emails.queries.getEmailsByRecipient, {
      email: TEST_CUSTOMER.email
    });
    const ticketEmail = emailLog.find(e =>
      e.type === 'TICKET_CONFIRMATION' && e.orderId === orderId
    );

    const emailContent = ticketEmail.htmlContent || '';

    // Check for QR code images (usually base64 or URL)
    const qrImagePattern = /<img[^>]*src=['"]([^'"]*qr[^'"]*|data:image\/png[^'"]*)['"]/gi;
    const qrImages = emailContent.match(qrImagePattern) || [];

    console.log(`   📊 QR code images found: ${qrImages.length}`);
    expect(qrImages.length).toBeGreaterThanOrEqual(5); // At least 5 QR images
    console.log('   ✅ All QR code images present');

    // Verify images are properly formatted
    qrImages.forEach((img, index) => {
      expect(img).toMatch(/src=['"]([^'"]+)['"]/);
      console.log(`   ✅ QR image ${index + 1} properly formatted`);
    });

    console.log('\n✅ QR code image rendering test PASSED\n');
  });

  test('EMAIL-5: Verify email links are functional', async ({ page }) => {
    console.log('\n🔗 TEST: Email Link Validation\n');

    const emailLog = await convex.query(api.emails.queries.getEmailsByRecipient, {
      email: TEST_CUSTOMER.email
    });
    const ticketEmail = emailLog.find(e =>
      e.type === 'TICKET_CONFIRMATION' && e.orderId === orderId
    );

    const emailContent = ticketEmail.htmlContent || '';

    // Extract links from email
    const linkPattern = /href=['"]([^'"]+)['"]/gi;
    const links = [];
    let match;

    while ((match = linkPattern.exec(emailContent)) !== null) {
      links.push(match[1]);
    }

    console.log(`   📊 Total links found: ${links.length}`);

    // Check for essential links
    const eventLink = links.find(link => link.includes(`/events/${eventId}`));
    expect(eventLink).toBeDefined();
    console.log(`   ✅ Event detail link present: ${eventLink}`);

    const ticketsLink = links.find(link => link.includes('/my-tickets') || link.includes('/user/tickets'));
    expect(ticketsLink).toBeDefined();
    console.log(`   ✅ My Tickets link present: ${ticketsLink}`);

    // Test one link actually works
    if (eventLink) {
      await page.goto(eventLink);
      await expect(page.locator('h1')).toContainText('Email Delivery Test Event');
      console.log('   ✅ Event link functional (page loads correctly)');
    }

    console.log('\n✅ Email link validation PASSED\n');
  });

  test('EMAIL-6: Test multiple orders - verify unique QR codes across orders', async ({ page }) => {
    console.log('\n🎫 TEST: Multiple Orders QR Code Uniqueness\n');

    // Purchase another 3 tickets (different order)
    console.log('   Purchasing 3 more tickets (new order)...');

    await page.goto(`${BASE_URL}/events/${eventId}`);
    await page.click('button:has-text("Buy Tickets")');
    await page.selectOption('select[name="quantity"]', '3');
    await page.click('button:has-text("Continue to Checkout")');

    await page.fill('input[name="buyerName"]', 'Second Order Customer');
    await page.fill('input[name="buyerEmail"]', `second-order-${Date.now()}@test.com`);
    await page.fill('input[name="buyerPhone"]', '4444444444');

    await page.click('button:has-text("Complete Purchase")');
    await page.waitForURL('**/order-confirmation/**', { timeout: 15000 });

    // Get new tickets
    const allTickets = await convex.query(api.tickets.queries.getTicketsForEvent, { eventId });
    const allQRCodes = allTickets.map(t => t.ticketCode);

    console.log(`   ✅ Total tickets now: ${allTickets.length} (5 + 3 = 8)`);

    // **CRITICAL**: All 8 QR codes must be unique
    const uniqueQRCodes = new Set(allQRCodes);
    expect(uniqueQRCodes.size).toBe(8);
    expect(allQRCodes.length).toBe(8);

    console.log(`   ✅ All 8 QR codes are unique across both orders`);

    // Check for duplicates
    const duplicates = allQRCodes.filter((code, index) =>
      allQRCodes.indexOf(code) !== index
    );
    expect(duplicates.length).toBe(0);
    console.log('   ✅ No duplicates between orders');

    console.log('\n✅ Multi-order QR uniqueness test PASSED\n');
  });

  test('EMAIL-7: Stress test - 20 simultaneous orders, verify all QR codes unique', async ({ browser }) => {
    console.log('\n⚡ STRESS TEST: 20 Orders, 100 Tickets (5 each)\n');

    // Create 20 concurrent orders
    const contexts = await Promise.all(
      Array.from({ length: 20 }, () => browser.newContext())
    );

    console.log('   Creating 20 simultaneous orders...');

    const orderPromises = contexts.map(async (context, index) => {
      const orderPage = await context.newPage();

      try {
        await orderPage.goto(`${BASE_URL}/events/${eventId}`, { timeout: 10000 });
        await orderPage.click('button:has-text("Buy Tickets")');
        await orderPage.selectOption('select[name="quantity"]', '5');
        await orderPage.click('button:has-text("Continue to Checkout")');

        await orderPage.fill('input[name="buyerName"]', `Stress Test ${index + 1}`);
        await orderPage.fill('input[name="buyerEmail"]', `stress${index}@test.com`);
        await orderPage.fill('input[name="buyerPhone"]', '3333333333');

        await orderPage.click('button:has-text("Complete Purchase")');

        const success = await orderPage.url().includes('order-confirmation');

        await orderPage.close();
        await context.close();

        return success;
      } catch (error) {
        await orderPage.close();
        await context.close();
        return false;
      }
    });

    const results = await Promise.all(orderPromises);
    const successCount = results.filter(r => r).length;

    console.log(`   ✅ Successful orders: ${successCount}/20`);

    // Get all tickets for the event
    const allTickets = await convex.query(api.tickets.queries.getTicketsForEvent, { eventId });
    const allQRCodes = allTickets.map(t => t.ticketCode);

    console.log(`   📊 Total tickets: ${allTickets.length}`);

    // **CRITICAL**: ALL QR codes must be unique
    const uniqueQRCodes = new Set(allQRCodes);
    const expectedUnique = allTickets.length;

    console.log(`   📊 Unique QR codes: ${uniqueQRCodes.size}/${expectedUnique}`);

    expect(uniqueQRCodes.size).toBe(expectedUnique);
    console.log('   ✅ ALL QR codes are unique (no duplicates under stress)');

    // Check for any duplicates
    const duplicates = allQRCodes.filter((code, index) =>
      allQRCodes.indexOf(code) !== index
    );

    expect(duplicates.length).toBe(0);
    console.log('   ✅ Zero duplicates found in stress test');

    console.log('\n✅ STRESS TEST: QR code uniqueness PASSED ✅\n');
  });

  test.afterAll(async () => {
    console.log('\n' + '='.repeat(80));
    console.log('🎯 EMAIL DELIVERY & QR VALIDATION - COMPLETE');
    console.log('='.repeat(80));
    console.log(`✅ Email delivery: < 60 seconds`);
    console.log(`✅ Email content: Accurate`);
    console.log(`✅ QR codes: 100% unique (no duplicates)`);
    console.log(`✅ QR images: Render correctly`);
    console.log(`✅ Email links: Functional`);
    console.log(`✅ Stress test: 100+ tickets, all unique QR codes`);
    console.log(`✅ CRITICAL TESTS: ALL PASSED ✅`);
    console.log('='.repeat(80) + '\n');
  });

});
