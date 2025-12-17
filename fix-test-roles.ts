/**
 * Quick script to fix test user roles
 * Run with: npx tsx fix-test-roles.ts
 */

import { ConvexHttpClient } from "convex/browser";

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || "https://dazzling-mockingbird-241.convex.cloud";

async function fixRoles() {
  const client = new ConvexHttpClient(CONVEX_URL);

  console.log("🔧 Fixing test user roles...");
  console.log(`📡 Connected to: ${CONVEX_URL}`);

  try {
    // We need to call this as an internal action, but we can't do that from client
    // Instead, let's use the admin panel to get user IDs first
    console.log("\n⚠️  This script requires admin authentication.");
    console.log("\n📋 Manual steps required:");
    console.log("1. Open Convex Dashboard: https://dashboard.convex.dev");
    console.log("2. Select deployment: dazzling-mockingbird-241");
    console.log("3. Go to Data > users table");
    console.log("4. Find user: admin-test@stepperslife.com");
    console.log("5. Edit and set: role = 'admin', canCreateTicketedEvents = true");
    console.log("6. Find user: user-test@stepperslife.com");
    console.log("7. Edit and set: role = 'user'");
    console.log("\n✅ Then re-run tests: npx playwright test tests/dashboard-tests.spec.ts");
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

fixRoles();
