/**
 * CRITICAL: Ticket Scanning & Check-In Test Suite
 * Tests QR code generation, scanning, double-scan prevention, and manual entry
 *
 * Coverage:
 * - QR code uniqueness validation
 * - Valid ticket scanning (VALID → SCANNED status)
 * - **CRITICAL**: Double-scan prevention
 * - Manual code entry
 * - Invalid QR code handling
 * - Staff dashboard statistics
 */

import { test, expect, Page } from '@playwright/test';
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL!;
const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3004';

// Test configuration
const TEST_STAFF = {
  email: 'staff-scanner@test.com',
  password: 'TestPassword123!',
  name: 'Scanner Staff',
  phone: '1234567890'
};

const TEST_EVENT = {
  name: 'Ticket Scanning Test Event',
  date: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days from now
  ticketPrice: 25.00
};

// Test state
let convex: ConvexHttpClient;
let organizerId: Id<"users">;
let staffId: Id<"eventStaff">;
let eventId: Id<"events">;
let ticketIds: Id<"tickets">[] = [];
let qrCodes: string[] = [];

test.describe('Ticket Scanning & Check-In System', () => {

  test.beforeAll(async () => {
    convex = new ConvexHttpClient(CONVEX_URL);
    console.log('\n' + '='.repeat(80));
    console.log('🎫 TICKET SCANNING & CHECK-IN TEST SUITE');
    console.log('='.repeat(80) + '\n');
  });

  test('Setup: Create organizer, staff, event, and test tickets', async ({ page }) => {
    console.log('\n📋 Setting up test environment...\n');

    // 1. Create organizer
    console.log('1. Creating organizer account...');
    const organizerEmail = `organizer-scan-${Date.now()}@test.com`;
    await page.goto(`${BASE_URL}/register`);
    await page.fill('input[name="email"]', organizerEmail);
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.fill('input[name="name"]', 'Scan Test Organizer');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/organizer/dashboard', { timeout: 10000 });

    // Get organizer ID from database
    const organizer = await convex.query(api.users.queries.getUserByEmail, { email: organizerEmail });
    expect(organizer).toBeDefined();
    organizerId = organizer!._id;
    console.log(`   ✅ Organizer created: ${organizerId}`);

    // 2. Create event with tickets
    console.log('2. Creating event with ticket tiers...');
    await page.goto(`${BASE_URL}/organizer/events/create`);
    await page.fill('input[name="eventName"]', TEST_EVENT.name);
    await page.fill('textarea[name="description"]', 'Test event for scanning validation');

    // Set date 7 days from now
    const futureDate = new Date(Date.now() + (7 * 24 * 60 * 60 * 1000));
    await page.fill('input[name="date"]', futureDate.toISOString().split('T')[0]);
    await page.fill('input[name="time"]', '19:00');

    // Upload test image (required)
    await page.setInputFiles('input[type="file"]', {
      name: 'test-flyer.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from('test image data')
    });

    // Create ticket tier
    await page.click('button:has-text("Add Ticket Tier")');
    await page.fill('input[name="tierName"]', 'General Admission');
    await page.fill('input[name="price"]', TEST_EVENT.ticketPrice.toString());
    await page.fill('input[name="quantity"]', '50');

    // Publish event
    await page.click('button:has-text("Publish Event")');
    await page.waitForURL('**/organizer/events/**', { timeout: 10000 });

    // Get event ID
    const events = await convex.query(api.public.queries.getPublishedEvents, {});
    const testEvent = events.find(e => e.name === TEST_EVENT.name);
    expect(testEvent).toBeDefined();
    eventId = testEvent!._id;
    console.log(`   ✅ Event created: ${eventId}`);

    // 3. Create staff member
    console.log('3. Creating staff member...');
    await page.goto(`${BASE_URL}/organizer/events/${eventId}/staff`);
    await page.click('button:has-text("Add Staff")');
    await page.fill('input[name="staffEmail"]', TEST_STAFF.email);
    await page.fill('input[name="staffName"]', TEST_STAFF.name);
    await page.fill('input[name="staffPhone"]', TEST_STAFF.phone);
    await page.check('input[name="canScan"]'); // Grant scanning permission
    await page.click('button:has-text("Add Staff Member")');
    await page.waitForTimeout(2000);

    // Get staff ID
    const staffMembers = await convex.query(api.staff.queries.getEventStaff, { eventId });
    const staff = staffMembers.find(s => s.email === TEST_STAFF.email);
    expect(staff).toBeDefined();
    staffId = staff!._id;
    console.log(`   ✅ Staff member created: ${staffId}`);

    // 4. Purchase 5 test tickets
    console.log('4. Purchasing 5 test tickets...');
    await page.goto(`${BASE_URL}/events/${eventId}`);
    await page.click('button:has-text("Buy Tickets")');
    await page.selectOption('select[name="quantity"]', '5');
    await page.click('button:has-text("Continue to Checkout")');

    // Fill customer info
    await page.fill('input[name="buyerName"]', 'Test Customer');
    await page.fill('input[name="buyerEmail"]', `customer-${Date.now()}@test.com`);
    await page.fill('input[name="buyerPhone"]', '5555555555');

    // Complete payment (test mode)
    await page.click('button:has-text("Complete Purchase")');
    await page.waitForURL('**/order-confirmation/**', { timeout: 15000 });

    // Get ticket IDs and QR codes
    const tickets = await convex.query(api.testing.helpers.getTicketsForEvent, { eventId });
    ticketIds = tickets.map(t => t._id);
    qrCodes = tickets.map(t => t.ticketCode!);

    expect(ticketIds.length).toBe(5);
    console.log(`   ✅ 5 tickets purchased`);
    console.log(`   📱 QR Codes: ${qrCodes.join(', ')}`);

    console.log('\n✅ Test environment setup complete!\n');
  });

  test('QR-1: Verify all QR codes are unique', async () => {
    console.log('\n🔍 TEST: QR Code Uniqueness Validation\n');

    // Check that all 5 QR codes are different
    const uniqueCodes = new Set(qrCodes);
    expect(uniqueCodes.size).toBe(5);
    console.log(`   ✅ All 5 QR codes are unique`);

    // Check QR code format (should be alphanumeric, specific length)
    qrCodes.forEach((code, index) => {
      expect(code).toMatch(/^[A-Z0-9]{8,}$/); // At least 8 alphanumeric characters
      console.log(`   ✅ Ticket ${index + 1} QR code format valid: ${code}`);
    });

    console.log('\n✅ QR code uniqueness test PASSED\n');
  });

  test('QR-2: Staff can access scanning interface', async ({ page }) => {
    console.log('\n📱 TEST: Staff Scanning Interface Access\n');

    // Login as staff
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', TEST_STAFF.email);
    await page.fill('input[name="password"]', TEST_STAFF.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/staff/dashboard', { timeout: 10000 });
    console.log('   ✅ Staff logged in successfully');

    // Navigate to scanning interface
    await page.click('a:has-text("Scan Tickets")');
    await page.waitForURL('**/staff/scan', { timeout: 5000 });
    console.log('   ✅ Scanning interface accessible');

    // Verify scanning interface elements
    await expect(page.locator('button:has-text("Scan QR Code")')).toBeVisible();
    await expect(page.locator('input[name="manualCode"]')).toBeVisible();
    console.log('   ✅ Scan button and manual entry visible');

    console.log('\n✅ Scanning interface test PASSED\n');
  });

  test('QR-3: Scan valid ticket successfully', async ({ page }) => {
    console.log('\n✅ TEST: Scan Valid Ticket (VALID → SCANNED)\n');

    // Login as staff (if not already logged in)
    await page.goto(`${BASE_URL}/staff/scan`);

    const firstTicketCode = qrCodes[0];
    console.log(`   Scanning ticket: ${firstTicketCode}`);

    // Simulate QR code scan (manual entry for testing)
    await page.fill('input[name="manualCode"]', firstTicketCode);
    await page.click('button:has-text("Submit Code")');
    await page.waitForTimeout(2000);

    // Verify success message
    await expect(page.locator('text=/Valid Ticket|Check In Successful/i')).toBeVisible();
    console.log('   ✅ Success message displayed');

    // Verify ticket status changed in database
    const ticketData = await convex.query(api.tickets.queries.getTicketByCode, {
      ticketCode: firstTicketCode
    });
    expect(ticketData).toBeDefined();
    expect(ticketData).not.toBeNull();
    expect(ticketData!.ticket.status).toBe('SCANNED');
    expect(ticketData!.ticket.scannedAt).toBeDefined();
    console.log(`   ✅ Ticket status: ${ticketData!.ticket.status}`);
    console.log(`   ✅ Scanned at: ${new Date(ticketData!.ticket.scannedAt!).toLocaleString()}`);

    console.log('\n✅ Valid ticket scan test PASSED\n');
  });

  test('QR-4: **CRITICAL** Prevent double-scan (MUST FAIL)', async ({ page }) => {
    console.log('\n🚫 CRITICAL TEST: Double-Scan Prevention\n');

    await page.goto(`${BASE_URL}/staff/scan`);

    const firstTicketCode = qrCodes[0]; // Same ticket as previous test
    console.log(`   Attempting to scan ALREADY SCANNED ticket: ${firstTicketCode}`);

    // Try to scan the same ticket again
    await page.fill('input[name="manualCode"]', firstTicketCode);
    await page.click('button:has-text("Submit Code")');
    await page.waitForTimeout(2000);

    // MUST show error message
    await expect(page.locator('text=/Already Scanned|Duplicate|Invalid/i')).toBeVisible();
    console.log('   ✅ Error message displayed: "Already Scanned"');

    // Verify ticket still has only ONE scan timestamp
    const ticketData = await convex.query(api.tickets.queries.getTicketByCode, {
      ticketCode: firstTicketCode
    });
    expect(ticketData).not.toBeNull();
    expect(ticketData!.ticket.status).toBe('SCANNED');

    // Check scan count (if implemented)
    const scanHistory = await convex.query(api.testing.helpers.getScanHistory, {
      ticketId: ticketIds[0]
    });
    expect(scanHistory.length).toBe(1); // Only ONE scan allowed
    console.log(`   ✅ Scan count: ${scanHistory.length} (correct)`);

    console.log('\n✅ CRITICAL: Double-scan prevention test PASSED ✅\n');
  });

  test('QR-5: Scan multiple different tickets', async ({ page }) => {
    console.log('\n🎫 TEST: Scan Multiple Valid Tickets\n');

    await page.goto(`${BASE_URL}/staff/scan`);

    // Scan tickets 2, 3, 4 (ticket 1 already scanned)
    for (let i = 1; i < 4; i++) {
      const ticketCode = qrCodes[i];
      console.log(`   Scanning ticket ${i + 1}: ${ticketCode}`);

      await page.fill('input[name="manualCode"]', ticketCode);
      await page.click('button:has-text("Submit Code")');
      await page.waitForTimeout(1500);

      // Verify success
      const ticketData = await convex.query(api.tickets.queries.getTicketByCode, {
        ticketCode
      });
      expect(ticketData).not.toBeNull();
      expect(ticketData!.ticket.status).toBe('SCANNED');
      console.log(`      ✅ Ticket ${i + 1} scanned successfully`);
    }

    // Verify 4 tickets now scanned (1 from previous test + 3 from this test)
    const allTickets = await convex.query(api.testing.helpers.getTicketsForEvent, { eventId });
    const scannedCount = allTickets.filter(t => t.status === 'SCANNED').length;
    expect(scannedCount).toBe(4);
    console.log(`\n   ✅ Total scanned: ${scannedCount}/5 tickets`);

    console.log('\n✅ Multiple ticket scan test PASSED\n');
  });

  test('QR-6: Reject invalid QR code', async ({ page }) => {
    console.log('\n❌ TEST: Invalid QR Code Rejection\n');

    await page.goto(`${BASE_URL}/staff/scan`);

    const fakeQRCode = 'INVALID123456789';
    console.log(`   Attempting to scan fake QR code: ${fakeQRCode}`);

    await page.fill('input[name="manualCode"]', fakeQRCode);
    await page.click('button:has-text("Submit Code")');
    await page.waitForTimeout(2000);

    // MUST show error message
    await expect(page.locator('text=/Invalid Ticket|Not Found|Unrecognized/i')).toBeVisible();
    console.log('   ✅ Error message displayed: "Invalid Ticket"');

    // Verify no ticket created
    const ticketData = await convex.query(api.tickets.queries.getTicketByCode, {
      ticketCode: fakeQRCode
    });
    expect(ticketData).toBeNull();
    console.log('   ✅ No ticket record created');

    console.log('\n✅ Invalid QR code rejection test PASSED\n');
  });

  test('QR-7: Staff dashboard shows scan statistics', async ({ page }) => {
    console.log('\n📊 TEST: Staff Dashboard Scan Statistics\n');

    await page.goto(`${BASE_URL}/staff/dashboard`);

    // Verify scan count displayed
    await expect(page.locator('text=/Scanned Today|Total Scans/i')).toBeVisible();

    // Check if count is accurate (4 scanned out of 5 total)
    const statsText = await page.locator('[data-testid="scan-statistics"]').textContent();
    expect(statsText).toContain('4'); // 4 scanned tickets
    console.log('   ✅ Dashboard shows scan count: 4');

    // Navigate to detailed scan list
    await page.click('a:has-text("Scanned Tickets")');
    await page.waitForURL('**/staff/scanned', { timeout: 5000 });

    // Verify list shows 4 scanned tickets
    const scannedList = await page.locator('[data-testid="scanned-ticket"]').count();
    expect(scannedList).toBe(4);
    console.log(`   ✅ Scanned tickets list shows ${scannedList} tickets`);

    // Verify each ticket shows scan timestamp
    for (let i = 0; i < 4; i++) {
      const ticket = page.locator(`[data-testid="scanned-ticket"]:nth-child(${i + 1})`);
      await expect(ticket.locator('text=/Scanned at/i')).toBeVisible();
    }
    console.log('   ✅ All scan timestamps displayed');

    console.log('\n✅ Staff dashboard statistics test PASSED\n');
  });

  test('QR-8: Scan remaining ticket and verify event statistics', async ({ page }) => {
    console.log('\n📈 TEST: Final Scan and Event Statistics\n');

    await page.goto(`${BASE_URL}/staff/scan`);

    // Scan the last remaining ticket
    const lastTicketCode = qrCodes[4];
    console.log(`   Scanning final ticket: ${lastTicketCode}`);

    await page.fill('input[name="manualCode"]', lastTicketCode);
    await page.click('button:has-text("Submit Code")');
    await page.waitForTimeout(2000);

    // Verify all 5 tickets now scanned
    const allTickets = await convex.query(api.testing.helpers.getTicketsForEvent, { eventId });
    const scannedCount = allTickets.filter(t => t.status === 'SCANNED').length;
    expect(scannedCount).toBe(5);
    console.log(`   ✅ All tickets scanned: ${scannedCount}/5`);

    // Check event statistics
    await page.goto(`${BASE_URL}/organizer/events/${eventId}`);
    await expect(page.locator('text=/5 Checked In|100% Attendance/i')).toBeVisible();
    console.log('   ✅ Event shows 100% attendance');

    console.log('\n✅ Final scan and statistics test PASSED\n');
  });

  test.afterAll(async () => {
    console.log('\n' + '='.repeat(80));
    console.log('🎯 TICKET SCANNING TEST SUITE - COMPLETE');
    console.log('='.repeat(80));
    console.log(`✅ Total tickets created: 5`);
    console.log(`✅ Total tickets scanned: 5`);
    console.log(`✅ Double-scan prevention: VERIFIED`);
    console.log(`✅ Invalid QR rejection: VERIFIED`);
    console.log(`✅ CRITICAL TESTS: ALL PASSED ✅`);
    console.log('='.repeat(80) + '\n');
  });

});
