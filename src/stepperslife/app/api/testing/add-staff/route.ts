/**
 * API Route to add staff/associates to test events
 */

import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(request: NextRequest) {
  try {
    // First get the test organizer's events
    const status = await convex.query(
      api.testing.realWorldTicketTest.getFullTestStatus,
      {}
    );

    if (!status.setupComplete || status.events.length === 0) {
      return NextResponse.json(
        { error: "No test events found. Please create events first." },
        { status: 400 }
      );
    }

    const results = [];

    // Add staff to each event
    for (const event of status.events) {
      try {
        const result = await convex.mutation(
          api.testing.realWorldTicketTest.createTestStaffAndAssociates,
          { eventId: event.id }
        );
        results.push(result);
      } catch (e: any) {
        results.push({ error: e.message, eventId: event.id });
      }
    }

    const successCount = results.filter((r: any) => r.success).length;

    return NextResponse.json({
      success: true,
      message: `Added staff to ${successCount} of ${status.events.length} events`,
      summary: {
        eventsProcessed: status.events.length,
        staffCreated: successCount,
      },
      details: results,
    });
  } catch (error: any) {
    console.error("Add staff error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to add staff" },
      { status: 500 }
    );
  }
}
