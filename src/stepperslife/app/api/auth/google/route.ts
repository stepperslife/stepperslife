/**
 * Google OAuth Initiation Route
 *
 * GET /api/auth/google
 * Redirects user to Google OAuth consent screen
 */

import { NextRequest, NextResponse } from "next/server";
import { getGoogleAuthUrl } from "@/lib/auth/google-oauth";
import { randomBytes } from "crypto";

export async function GET(request: NextRequest) {
  try {
    // Generate state for CSRF protection
    const state = randomBytes(32).toString("hex");

    // Get callback URL from query params (optional)
    const callbackUrl = request.nextUrl.searchParams.get("callbackUrl") || "/organizer/events";

    console.log("[Google OAuth Init] State:", state.substring(0, 10) + "...");
    console.log("[Google OAuth Init] Callback URL:", callbackUrl);
    console.log("[Google OAuth Init] Host:", request.headers.get("host"));

    // Store state and callbackUrl in a cookie for verification later
    const googleAuthUrl = getGoogleAuthUrl(state);
    console.log("[Google OAuth Init] Redirecting to Google...");

    const response = NextResponse.redirect(googleAuthUrl);

    // Determine if we're in production
    const isProduction = process.env.NODE_ENV === "production";
    const host = request.headers.get("host") || "";
    const isLocalhost = host.includes("localhost");

    console.log("[Google OAuth Init] isProduction:", isProduction);
    console.log("[Google OAuth Init] isLocalhost:", isLocalhost);

    // Cookie options for OAuth state
    // Using SameSite=None for cross-site redirects (OAuth callback from Google)
    // This requires Secure=true in production
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction && !isLocalhost,
      // Use 'none' for OAuth to work with cross-site redirects
      // 'lax' should work but some browsers are stricter
      sameSite: isProduction ? ("none" as const) : ("lax" as const),
      maxAge: 600, // 10 minutes
      path: "/",
    };

    console.log("[Google OAuth Init] Cookie options:", cookieOptions);

    // Set secure HTTP-only cookies
    response.cookies.set("oauth_state", state, cookieOptions);
    response.cookies.set("oauth_callback_url", callbackUrl, cookieOptions);

    return response;
  } catch (error: any) {
    console.error("[Google OAuth] Initiation error:", error);
    return NextResponse.json({ error: "Failed to initiate Google OAuth" }, { status: 500 });
  }
}
