/**
 * API Route to run the complete E2E ticket test
 * Creates events, staff, purchases, tickets, and simulates scanning
 */

import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(request: NextRequest) {
  try {
    // Run the complete E2E test mutation
    const result = await convex.mutation(
      api.testing.realWorldTicketTest.runCompleteE2ETest,
      {}
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("E2E test error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to run E2E test" },
      { status: 500 }
    );
  }
}
