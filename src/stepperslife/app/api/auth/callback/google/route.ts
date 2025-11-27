/**
 * Google OAuth Callback Route
 *
 * GET /api/auth/callback/google
 * Handles OAuth callback from Google and creates/signs in user
 */

import { NextRequest, NextResponse } from "next/server";
import { completeGoogleOAuth } from "@/lib/auth/google-oauth";
import { api } from "@/convex/_generated/api";
import { convexClient as convex } from "@/lib/auth/convex-client";
import { createAndSetSession } from "@/lib/auth/session-manager";
import { getBaseUrl } from "@/lib/constants/app-config";

export async function GET(request: NextRequest) {
  try {
    // Get OAuth code and state from query params
    const code = request.nextUrl.searchParams.get("code");
    const state = request.nextUrl.searchParams.get("state");
    const error = request.nextUrl.searchParams.get("error");

    // Check for errors from Google
    if (error) {
      console.error("[Google OAuth] Error from Google:", error);
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(error)}`, request.url)
      );
    }

    // Validate required params
    if (!code || !state) {
      return NextResponse.redirect(new URL("/login?error=missing_params", request.url));
    }

    // Verify state for CSRF protection
    const storedState = request.cookies.get("oauth_state")?.value;
    if (!storedState || storedState !== state) {
      console.error("[Google OAuth] State mismatch");
      return NextResponse.redirect(new URL("/login?error=invalid_state", request.url));
    }

    // Get callback URL from cookie
    const callbackUrl = request.cookies.get("oauth_callback_url")?.value || "/organizer/events";

    // Exchange code for user info
    const googleUser = await completeGoogleOAuth(code);

    // Create or update user in Convex
    const userId = await convex.mutation(api.users.mutations.upsertUserFromGoogle, {
      googleId: googleUser.id,
      email: googleUser.email,
      name: googleUser.name,
      image: googleUser.picture,
    });

    // Fetch the complete user data to get role
    const user = await convex.query(api.users.queries.getUserById, { userId });

    // Redirect to callback URL with session using centralized base URL utility
    const baseUrl = getBaseUrl(request);
    const response = NextResponse.redirect(new URL(callbackUrl, baseUrl));

    // Create session token and set cookie using centralized utility
    await createAndSetSession(
      response,
      {
        userId: userId,
        email: googleUser.email,
        name: googleUser.name,
        role: user?.role || "user",
      },
      request
    );

    // Clear OAuth cookies
    response.cookies.delete("oauth_state");
    response.cookies.delete("oauth_callback_url");

    return response;
  } catch (error: any) {
    console.error("[Google OAuth] Callback error:", error);
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error.message)}`, request.url)
    );
  }
}
