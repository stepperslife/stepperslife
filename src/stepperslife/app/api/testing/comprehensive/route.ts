/**
 * API Route to run the comprehensive test setup
 * This creates a complete test environment with events, users, and purchases
 */

import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(request: NextRequest) {
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
