/**
 * API Route to fix missing payment configs for all published events
 * This is needed because events without payment configs won't show tickets
 */

import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(request: NextRequest) {
  try {
    // Run the fix payment configs mutation
    const result = await convex.mutation(
      api.testing.fixPaymentConfigs.fixMissingPaymentConfigs,
      {}
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Fix payment configs error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fix payment configs" },
      { status: 500 }
    );
  }
}
