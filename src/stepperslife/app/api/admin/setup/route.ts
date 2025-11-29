import { NextRequest, NextResponse } from "next/server";
import { convexClient as convex } from "@/lib/auth/convex-client";
import { api } from "@/convex/_generated/api";

/**
 * Admin setup endpoint - ONE TIME USE
 * Updates specific users to admin role using a secret key
 *
 * This should be removed or secured after initial setup
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { secretKey, email } = body;

    if (!secretKey || !email) {
      return NextResponse.json(
        { error: "secretKey and email are required" },
        { status: 400 }
      );
    }

    // Call the bootstrapAdmin mutation
    const result = await convex.mutation(api.users.mutations.bootstrapAdmin, {
      email: email.toLowerCase(),
      secretKey,
    });

    return NextResponse.json(result);

  } catch (error: any) {
    console.error("Admin setup error:", error);
    return NextResponse.json(
      { error: error.message || "Setup failed" },
      { status: 500 }
    );
  }
}
