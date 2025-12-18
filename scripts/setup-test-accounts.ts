/**
 * Setup Test Accounts for Payment Audit
 * Creates admin, organizer, and user test accounts
 */

const BASE_URL = process.env.BASE_URL || "https://stepperslife.com";

interface TestAccount {
  name: string;
  email: string;
  password: string;
  role: "admin" | "organizer" | "user";
}

const TEST_ACCOUNTS: TestAccount[] = [
  {
    name: "E2E Test Admin",
    email: "admin-test@stepperslife.com",
    password: "TestPassword123!",
    role: "admin",
  },
  {
    name: "E2E Test Organizer",
    email: "e2e-organizer@stepperslife.com",
    password: "TestPassword123!",
    role: "organizer",
  },
  {
    name: "E2E Test User",
    email: "e2e-test@stepperslife.com",
    password: "TestPassword123!",
    role: "user",
  },
];

async function createAccount(account: TestAccount): Promise<boolean> {
  console.log(`Creating account: ${account.email} (${account.role})...`);

  try {
    const response = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: account.name,
        email: account.email,
        password: account.password,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log(`  ✅ Created: ${account.email}`);
      return true;
    } else if (response.status === 409) {
      console.log(`  ⏭️  Already exists: ${account.email}`);
      return true; // Account exists, that's fine
    } else {
      console.log(`  ❌ Failed: ${data.error || "Unknown error"}`);
      return false;
    }
  } catch (error) {
    console.log(`  ❌ Error: ${error}`);
    return false;
  }
}

async function verifyLogin(email: string, password: string): Promise<boolean> {
  console.log(`Verifying login: ${email}...`);

  try {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      console.log(`  ✅ Login verified`);
      return true;
    } else {
      const data = await response.json();
      console.log(`  ❌ Login failed: ${data.error || "Unknown error"}`);
      return false;
    }
  } catch (error) {
    console.log(`  ❌ Login error: ${error}`);
    return false;
  }
}

async function main() {
  console.log("=".repeat(50));
  console.log("  Test Account Setup for Payment Audit");
  console.log(`  Target: ${BASE_URL}`);
  console.log("=".repeat(50));
  console.log("");

  let successCount = 0;
  let failCount = 0;

  // Create accounts
  console.log("Creating test accounts...\n");
  for (const account of TEST_ACCOUNTS) {
    const success = await createAccount(account);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
  }

  console.log("");
  console.log("Verifying logins...\n");

  // Verify logins
  let loginSuccess = 0;
  for (const account of TEST_ACCOUNTS) {
    const success = await verifyLogin(account.email, account.password);
    if (success) {
      loginSuccess++;
    }
  }

  // Summary
  console.log("");
  console.log("=".repeat(50));
  console.log("  Summary");
  console.log("=".repeat(50));
  console.log(`Accounts created: ${successCount}/${TEST_ACCOUNTS.length}`);
  console.log(`Logins verified: ${loginSuccess}/${TEST_ACCOUNTS.length}`);
  console.log("");

  if (loginSuccess === TEST_ACCOUNTS.length) {
    console.log("✅ All test accounts ready!");
    console.log("");
    console.log("Test credentials:");
    TEST_ACCOUNTS.forEach((acc) => {
      console.log(`  ${acc.role}: ${acc.email} / ${acc.password}`);
    });
  } else {
    console.log("⚠️  Some accounts need attention");
  }

  console.log("");
}

main().catch(console.error);
