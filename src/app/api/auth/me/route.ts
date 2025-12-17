import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { convexClient as convex } from "@/lib/auth/convex-client";
import { getJwtSecretEncoded } from "@/lib/auth/jwt-secret";

const JWT_SECRET = getJwtSecretEncoded();

export async function GET(request: NextRequest) {
  try {
    const token =
      request.cookies.get("session_token")?.value || request.cookies.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Verify JWT
    const { payload } = await jwtVerify(token, JWT_SECRET);

    // Get fresh user data from Convex (without password hash)
    const user = await convex.query(api.users.queries.getUserByIdPublic, {
      userId: payload.userId as Id<"users">,
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error("[Auth /me] Verification error:", error);
    console.error("[Auth /me] Error name:", error instanceof Error ? error.name : typeof error);
    console.error("[Auth /me] Error message:", error instanceof Error ? error.message : String(error));
    return NextResponse.json({
      error: "Invalid token",
      debug: error instanceof Error ? error.message : String(error)
    }, { status: 401 });
  }
}
