import { NextRequest, NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { convexClient as convex } from "@/lib/auth/convex-client";
import bcrypt from "bcryptjs";

export async function GET(request: NextRequest) {
  const results: Record<string, string> = {};

  // Test 1: Environment variable
  results.convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || "MISSING";

  // Test 2: bcryptjs
  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash("TestPassword123!", salt);
    results.bcrypt = "OK - " + hash.substring(0, 20) + "...";
  } catch (e) {
    results.bcrypt = "FAILED - " + (e instanceof Error ? e.message : String(e));
  }

  // Test 3: Convex query
  try {
    const user = await convex.query(api.users.queries.getUserByEmail, {
      email: "nonexistent@test.com",
    });
    results.convexQuery = user ? "Found user" : "No user (expected)";
  } catch (e) {
    results.convexQuery = "ERROR - " + (e instanceof Error ? e.message : String(e));
  }

  // Test 4: Convex mutation (create then delete test user)
  try {
    const testEmail = `test-${Date.now()}@stepperslife.com`;
    const userId = await convex.mutation(api.users.mutations.createUser, {
      name: "Test User",
      email: testEmail,
      passwordHash: "$2a$10$test123456789012345678901234567890123456",
      role: "user",
    });
    results.convexMutation = "OK - Created user " + userId;
  } catch (e) {
    results.convexMutation = "FAILED - " + (e instanceof Error ? e.message : String(e));
  }

  return NextResponse.json(results);
}
