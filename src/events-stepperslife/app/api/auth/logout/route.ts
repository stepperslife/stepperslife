import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const response = NextResponse.json(
    { success: true, message: "Logged out successfully" },
    { status: 200 }
  );

  // Detect if localhost or production
  const isLocalhost = request.headers.get('host')?.includes('localhost');

  // Clear both auth cookies (old and new names) with proper domain
  response.cookies.set("auth-token", "", {
    httpOnly: true,
    secure: !isLocalhost,
    sameSite: "lax",
    maxAge: 0, // Expire immediately
    path: "/",
    domain: isLocalhost ? undefined : ".stepperslife.com",
  });

  response.cookies.set("session_token", "", {
    httpOnly: true,
    secure: !isLocalhost,
    sameSite: "lax",
    maxAge: 0, // Expire immediately
    path: "/",
    domain: isLocalhost ? undefined : ".stepperslife.com",
  });

  return response;
}
