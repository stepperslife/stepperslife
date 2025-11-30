/**
 * API Route to run the real-world ticket test setup
 * This creates test events with ticket tiers, bundles, and discount codes
 *
 * GET /api/testing/setup-events - Create test events
 * DELETE /api/testing/setup-events - Clean up test events
 */

import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(request: NextRequest) {
  try {
    // Check for organizer email parameter
    const searchParams = request.nextUrl.searchParams;
    const organizerEmail = searchParams.get("email");

    // Run the test setup mutation
    const result = await convex.mutation(
      api.testing.realWorldTicketTest.createRealWorldTestEvents,
      { organizerEmail: organizerEmail || undefined }
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Test setup error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to set up test events" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Run the cleanup mutation
    const result = await convex.mutation(
      api.testing.realWorldTicketTest.cleanupTestEvents,
      {}
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Cleanup error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to clean up test events" },
      { status: 500 }
    );
  }
}
