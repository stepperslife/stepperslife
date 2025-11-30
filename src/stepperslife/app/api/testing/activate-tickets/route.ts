/**
 * API Route to activate all tickets for all events
 * Creates payment configs and sets ticketsVisible=true
 */

import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(request: NextRequest) {
  try {
    // Run the activate all tickets mutation
    const result = await convex.mutation(
      api.activateAllTickets.activateAllTickets,
      {}
    );

    return NextResponse.json({
      ...result,
      message: "All tickets activated! Payment configs created for events without one.",
      note: "Refresh the event pages to see ticket selection now visible.",
    });
  } catch (error: any) {
    console.error("Activate tickets error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to activate tickets" },
      { status: 500 }
    );
  }
}
