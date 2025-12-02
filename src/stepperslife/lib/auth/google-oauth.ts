/**
 * Google OAuth Helper Library
 *
 * Handles Google OAuth 2.0 authentication flow
 */

import { randomBytes } from "crypto";

const GOOGLE_CLIENT_ID = process.env.AUTH_GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.AUTH_GOOGLE_CLIENT_SECRET!;

/**
 * Get the OAuth redirect URI based on environment
 *
 * Priority:
 * 1. NEXTAUTH_URL environment variable (if set)
 * 2. VERCEL_URL (automatically set by Vercel in production/preview)
 * 3. Production domain (stepperslife.com) if NODE_ENV is production
 * 4. localhost:3004 for local development
 */
function getRedirectUri(): string {
  let uri: string;

  // Check NEXTAUTH_URL first (explicit configuration)
  if (process.env.NEXTAUTH_URL) {
    uri = `${process.env.NEXTAUTH_URL}/api/auth/callback/google`;
  }
  // Check VERCEL_URL (automatically set by Vercel)
  else if (process.env.VERCEL_URL) {
    uri = `https://${process.env.VERCEL_URL}/api/auth/callback/google`;
  }
  // Production fallback to main domain
  else if (process.env.NODE_ENV === "production") {
    uri = "https://stepperslife.com/api/auth/callback/google";
  }
  // Local development fallback
  else {
    uri = "http://localhost:3004/api/auth/callback/google";
  }

  console.log("[Google OAuth] Redirect URI:", uri);
  console.log("[Google OAuth] Environment:", {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL ? "set" : "not set",
    VERCEL_URL: process.env.VERCEL_URL ? "set" : "not set",
    NODE_ENV: process.env.NODE_ENV,
  });

  return uri;
}

const REDIRECT_URI = getRedirectUri();


/**
 * Generate OAuth authorization URL
 * User will be redirected here to sign in with Google
 */
export function getGoogleAuthUrl(state?: string): string {
  const stateParam = state || randomBytes(32).toString("hex");

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: "code",
    scope: "openid email profile",
    state: stateParam,
    access_type: "offline",
    prompt: "consent",
  });

  const url = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  return url;
}

/**
 * Exchange authorization code for access token and user info
 */
export async function exchangeCodeForToken(code: string): Promise<{
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
}> {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      grant_type: "authorization_code",
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to exchange code for token: ${error}`);
  }

  const data = await response.json();
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
  };
}

/**
 * Get user info from Google using access token
 */
export async function getGoogleUserInfo(accessToken: string): Promise<{
  id: string;
  email: string;
  name: string;
  picture?: string;
  emailVerified: boolean;
}> {
  const response = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to get user info from Google");
  }

  const data = await response.json();
  return {
    id: data.id,
    email: data.email,
    name: data.name,
    picture: data.picture,
    emailVerified: data.verified_email,
  };
}

/**
 * Complete OAuth flow: exchange code and get user info
 */
export async function completeGoogleOAuth(code: string) {
  const { accessToken } = await exchangeCodeForToken(code);
  const userInfo = await getGoogleUserInfo(accessToken);
  return userInfo;
}
