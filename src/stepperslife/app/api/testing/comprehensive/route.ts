/**
 * API Route to run the comprehensive test setup
 * This creates a complete test environment with events, users, and purchases
 *
 * WARNING: This endpoint is for testing only and is disabled in production
 */

import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Block access in production
function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

export async function GET(request: NextRequest) {
  // Block in production
  if (isProduction()) {
    return NextResponse.json(
      { error: "Testing endpoints are disabled in production" },
      { status: 403 }
    );
  }

  try {
    // Run the comprehensive test setup mutation
    const result = await convex.mutation(
      api.testing.comprehensiveTestSetup.setupCompleteTest,
      {}
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Comprehensive test error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to run comprehensive test" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Block in production
  if (isProduction()) {
    return NextResponse.json(
      { error: "Testing endpoints are disabled in production" },
      { status: 403 }
    );
  }

  try {
    // Get test summary
    const result = await convex.mutation(
      api.testing.comprehensiveTestSetup.getTestSummary,
      {}
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Test summary error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get test summary" },
      { status: 500 }
    );
  }
}
