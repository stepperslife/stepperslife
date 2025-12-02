/**
 * Google OAuth Callback Route
 *
 * GET /api/auth/callback/google
 * Handles OAuth callback from Google and creates/signs in user
 *
 * Uses stateless OAuth with encrypted state parameter - no cookies needed.
 */

import { NextRequest, NextResponse } from "next/server";
import { completeGoogleOAuth, decryptOAuthState } from "@/lib/auth/google-oauth";
import { api } from "@/convex/_generated/api";
import { convexClient as convex } from "@/lib/auth/convex-client";
import { createAndSetSession } from "@/lib/auth/session-manager";
import { getBaseUrl } from "@/lib/constants/app-config";

export async function GET(request: NextRequest) {
  try {
    // Get OAuth code and state from query params
    const code = request.nextUrl.searchParams.get("code");
    const encryptedState = request.nextUrl.searchParams.get("state");
    const error = request.nextUrl.searchParams.get("error");

    console.log("[Google OAuth] Callback received");
    console.log("[Google OAuth] Host:", request.headers.get("host"));
    console.log("[Google OAuth] URL:", request.url);

    // Check for errors from Google
    if (error) {
      console.error("[Google OAuth] Error from Google:", error);
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(error)}`, request.url)
      );
    }

    // Validate required params
    if (!code || !encryptedState) {
      console.error("[Google OAuth] Missing params - code:", !!code, "state:", !!encryptedState);
      return NextResponse.redirect(new URL("/login?error=missing_params", request.url));
    }

    // Decrypt and verify the state parameter
    // This replaces cookie-based state verification
    const stateData = decryptOAuthState(encryptedState);
    console.log("[Google OAuth] State decryption:", stateData ? "success" : "failed");

    if (!stateData) {
      console.error("[Google OAuth] Failed to decrypt state or state expired");
      return NextResponse.redirect(new URL("/login?error=invalid_state", request.url));
    }

    // Get callback URL from decrypted state
    const callbackUrl = stateData.callbackUrl || "/organizer/events";
    console.log("[Google OAuth] Callback URL:", callbackUrl);
    console.log("[Google OAuth] State nonce:", stateData.nonce.substring(0, 10) + "...");

    // Exchange code for user info
    console.log("[Google OAuth] Exchanging code for user info...");
    const googleUser = await completeGoogleOAuth(code);
    console.log("[Google OAuth] Got user:", googleUser.email);

    // Create or update user in Convex
    console.log("[Google OAuth] Upserting user in Convex...");
    const userId = await convex.mutation(api.users.mutations.upsertUserFromGoogle, {
      googleId: googleUser.id,
      email: googleUser.email,
      name: googleUser.name,
      image: googleUser.picture,
    });
    console.log("[Google OAuth] User ID:", userId);

    // Fetch the complete user data to get role
    const user = await convex.query(api.users.queries.getUserById, { userId });
    console.log("[Google OAuth] User role:", user?.role);

    // Redirect to callback URL with session using centralized base URL utility
    const baseUrl = getBaseUrl(request);
    console.log("[Google OAuth] Base URL:", baseUrl);
    console.log("[Google OAuth] Full redirect URL:", new URL(callbackUrl, baseUrl).toString());

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
    console.log("[Google OAuth] Session created successfully");

    // No cookies to clear - using stateless OAuth

    return response;
  } catch (error: any) {
    console.error("[Google OAuth] Callback error:", error);
    console.error("[Google OAuth] Error stack:", error.stack);
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error.message)}`, request.url)
    );
  }
}
