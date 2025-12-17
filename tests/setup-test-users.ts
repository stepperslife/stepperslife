/**
 * Setup Test Users for Dashboard Testing
 * Creates test accounts for all 5 user roles
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import * as bcrypt from "bcryptjs";

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || "https://neighborly-swordfish-681.convex.cloud";
const client = new ConvexHttpClient(CONVEX_URL);

// Test user credentials
export const TEST_USERS = {
  admin: {
    email: "admin-test@stepperslife.com",
    password: "AdminTest123!",
    name: "Admin Test User",
    role: "admin" as const,
    dashboardUrl: "/admin"
  },
  organizer: {
    email: "organizer-test@stepperslife.com",
    password: "OrganizerTest123!",
    name: "Organizer Test User",
    role: "organizer" as const,
    dashboardUrl: "/organizer/dashboard"
  },
  user: {
    email: "user-test@stepperslife.com",
    password: "UserTest123!",
    name: "User Test Account",
    role: "user" as const,
    dashboardUrl: "/my-tickets"
  },
  staff: {
    email: "staff-test@stepperslife.com",
    password: "StaffTest123!",
    name: "Staff Test User",
    role: "user" as const, // Base role is user, staff role comes from eventStaff table
    staffRole: "STAFF" as const,
    dashboardUrl: "/staff/dashboard"
  },
  teamMember: {
    email: "team-test@stepperslife.com",
    password: "TeamTest123!",
    name: "Team Member Test User",
    role: "user" as const, // Base role is user, team role comes from eventStaff table
    staffRole: "TEAM_MEMBERS" as const,
    dashboardUrl: "/team/dashboard"
  }
};

async function createTestEvent(organizerId: string) {
  console.log("Creating test event for staff assignments...");

  try {
    const startDate = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days from now
    const eventId = await client.mutation(api.events.mutations.createEvent, {
      name: "Dashboard Test Event",
      description: "Event created for testing staff dashboards",
      startDate: startDate,
      endDate: startDate + 4 * 60 * 60 * 1000, // 4 hours later
      timezone: "America/Los_Angeles",
      location: {
        venueName: "Test Venue",
        address: "123 Test St",
        city: "Test City",
        state: "CA",
        zipCode: "90210",
        country: "US",
      },
      eventType: "TICKETED_EVENT" as const,
      categories: ["SOCIAL"],
      imageUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30",
    });

    console.log(`✅ Created test event: ${eventId}`);
    return eventId;
  } catch (error) {
    console.error("❌ Failed to create test event:", error);
    throw error;
  }
}

async function setupTestUsers() {
  console.log("🚀 Setting up test users for dashboard testing...\n");

  try {
    // 1. Create Admin user
    console.log("1️⃣  Creating Admin user...");
    const adminPasswordHash = await bcrypt.hash(TEST_USERS.admin.password, 10);
    await client.mutation(api.users.mutations.createUser, {
      name: TEST_USERS.admin.name,
      email: TEST_USERS.admin.email,
      passwordHash: adminPasswordHash,
    });
    console.log(`✅ Admin user created: ${TEST_USERS.admin.email}`);

    // Note: Need to manually update role to admin after creation
    console.log("⚠️  Note: Admin role must be set manually via updateUserRole mutation\n");

    // 2. Create Organizer user
    console.log("2️⃣  Creating Organizer user...");
    const organizerPasswordHash = await bcrypt.hash(TEST_USERS.organizer.password, 10);
    await client.mutation(api.users.mutations.createUser, {
      name: TEST_USERS.organizer.name,
      email: TEST_USERS.organizer.email,
      passwordHash: organizerPasswordHash,
    });
    console.log(`✅ Organizer user created: ${TEST_USERS.organizer.email}`);
    console.log("   (Default role: organizer)\n");

    // 3. Create Regular User
    console.log("3️⃣  Creating Regular User...");
    const userPasswordHash = await bcrypt.hash(TEST_USERS.user.password, 10);
    await client.mutation(api.users.mutations.createUser, {
      name: TEST_USERS.user.name,
      email: TEST_USERS.user.email,
      passwordHash: userPasswordHash,
    });
    console.log(`✅ Regular user created: ${TEST_USERS.user.email}\n`);

    // 4. Create Staff User (base account)
    console.log("4️⃣  Creating Staff user...");
    const staffPasswordHash = await bcrypt.hash(TEST_USERS.staff.password, 10);
    await client.mutation(api.users.mutations.createUser, {
      name: TEST_USERS.staff.name,
      email: TEST_USERS.staff.email,
      passwordHash: staffPasswordHash,
    });
    console.log(`✅ Staff base account created: ${TEST_USERS.staff.email}`);

    // 5. Create Team Member User (base account)
    console.log("5️⃣  Creating Team Member user...");
    const teamPasswordHash = await bcrypt.hash(TEST_USERS.teamMember.password, 10);
    await client.mutation(api.users.mutations.createUser, {
      name: TEST_USERS.teamMember.name,
      email: TEST_USERS.teamMember.email,
      passwordHash: teamPasswordHash,
    });
    console.log(`✅ Team Member base account created: ${TEST_USERS.teamMember.email}\n`);

    // Create test event (need organizer to be logged in)
    console.log("6️⃣  Creating test event for staff assignments...");
    console.log("⚠️  Note: Event creation requires organizer authentication");
    console.log("   Run this step manually after logging in as organizer\n");

    // Staff assignments need to be done after event creation
    console.log("7️⃣  Staff assignments needed:");
    console.log("   - Add staff-test@stepperslife.com as STAFF role");
    console.log("   - Add team-test@stepperslife.com as TEAM_MEMBERS role");
    console.log("   Use: api.staff.mutations.addStaffMember\n");

    console.log("✅ Test user setup complete!\n");
    console.log("📋 Summary:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Admin:        ", TEST_USERS.admin.email);
    console.log("Organizer:    ", TEST_USERS.organizer.email);
    console.log("User:         ", TEST_USERS.user.email);
    console.log("Staff:        ", TEST_USERS.staff.email);
    console.log("Team Member:  ", TEST_USERS.teamMember.email);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Password (all): Use the pattern [Role]Test123!");
    console.log("\n📝 Next steps:");
    console.log("1. Update admin user role to 'admin'");
    console.log("2. Login as organizer and create event");
    console.log("3. Add staff assignments to event");
    console.log("4. Run dashboard tests");

  } catch (error: any) {
    console.error("\n❌ Error setting up test users:");
    console.error(error.message || error);

    if (error.message?.includes("already exists")) {
      console.log("\n💡 Tip: Test users may already exist. Use different emails or delete existing users.");
    }
  }
}

// Run if executed directly
if (require.main === module) {
  setupTestUsers()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { setupTestUsers };
