/**
 * API Route to simulate ticket scanning for test events
 */

import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(request: NextRequest) {
  try {
    // Get scan percentage from query params
    const searchParams = request.nextUrl.searchParams;
    const scanPercentage = parseInt(searchParams.get("percentage") || "30");

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
    let totalScanned = 0;

    // Simulate scanning for each event
    for (const event of status.events) {
      try {
        const result = await convex.mutation(
          api.testing.realWorldTicketTest.simulateTicketScanning,
          { eventId: event.id, scanPercentage }
        );
        results.push(result);
        totalScanned += result.summary?.scannedNow || 0;
      } catch (e: any) {
        results.push({ error: e.message, eventId: event.id });
      }
    }

    const successCount = results.filter((r: any) => r.success).length;

    return NextResponse.json({
      success: true,
      message: `Scanned ${totalScanned} tickets across ${successCount} events (${scanPercentage}% check-in rate)`,
      summary: {
        eventsProcessed: status.events.length,
        ticketsScanned: totalScanned,
        scanPercentage: scanPercentage,
      },
      details: results,
      testingInstructions: {
        step1: "View scan statistics at /staff/scan-statistics",
        step2: "Check scanned history at /staff/scanned-tickets",
        step3: "Try scanning more tickets manually at /scan/[eventId]",
        step4: "View check-in rates on organizer dashboard",
      },
    });
  } catch (error: any) {
    console.error("Simulate scanning error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to simulate scanning" },
      { status: 500 }
    );
  }
}
