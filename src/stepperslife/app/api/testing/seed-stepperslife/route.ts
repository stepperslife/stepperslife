/**
 * API Route to seed SteppersLife events
 * Creates realistic stepping events for thestepperslife@gmail.com organizer
 *
 * GET /api/testing/seed-stepperslife - Create SteppersLife events
 * DELETE /api/testing/seed-stepperslife - Clean up SteppersLife events
 */

import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(request: NextRequest) {
  try {
    // Run the SteppersLife seed mutation
    const result = await convex.mutation(
      api.testing.seedSteppersLifeEvents.seedSteppersLifeEvents,
      {}
    );

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("Seed SteppersLife error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to seed SteppersLife events" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Run the cleanup mutation
    const result = await convex.mutation(
      api.testing.seedSteppersLifeEvents.cleanupSteppersLifeEvents,
      {}
    );

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("Cleanup error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to clean up SteppersLife events" },
      { status: 500 }
    );
  }
}
