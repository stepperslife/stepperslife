/**
 * API Route to simulate customer purchases for test events
 */

import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(request: NextRequest) {
  try {
    // Get number of purchases from query params
    const searchParams = request.nextUrl.searchParams;
    const numPurchases = parseInt(searchParams.get("count") || "5");

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
    let totalOrders = 0;
    let totalTickets = 0;

    // Simulate purchases for each event
    for (const event of status.events) {
      try {
        const result = await convex.mutation(
          api.testing.realWorldTicketTest.simulateCustomerPurchases,
          { eventId: event.id, numberOfPurchases: numPurchases }
        );
        results.push(result);
        totalOrders += result.summary?.totalOrders || 0;
        totalTickets += result.summary?.totalTickets || 0;
      } catch (e: any) {
        results.push({ error: e.message, eventId: event.id });
      }
    }

    const successCount = results.filter((r: any) => r.success).length;

    return NextResponse.json({
      success: true,
      message: `Created ${totalOrders} orders with ${totalTickets} tickets across ${successCount} events`,
      summary: {
        eventsProcessed: status.events.length,
        ordersCreated: totalOrders,
        ticketsGenerated: totalTickets,
      },
      details: results,
      testingInstructions: {
        step1: "View tickets at /ticket/[ticketCode] - each has a unique QR code",
        step2: "Customers can view their tickets at /my-tickets",
        step3: "Organizer can see all sales at /organizer/events/[eventId]",
        step4: "Staff can scan tickets at /staff/scan-tickets or /scan/[eventId]",
      },
    });
  } catch (error: any) {
    console.error("Simulate purchases error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to simulate purchases" },
      { status: 500 }
    );
  }
}
