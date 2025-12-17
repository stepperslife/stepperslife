import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || process.env.JWT_SECRET || "your-secret-key-change-this-in-production"
);

// Define protected route patterns with required roles
const PROTECTED_ROUTES: Record<string, string[]> = {
  "/admin": ["admin"],
  "/organizer": ["admin", "organizer"],
  "/staff": ["admin", "STAFF", "TEAM_MEMBERS", "ASSOCIATES"],
  "/team": ["admin", "TEAM_MEMBERS"],
  "/associate": ["admin", "ASSOCIATES"],
  "/vendor/dashboard": ["admin", "vendor"],
  "/restaurateur/dashboard": ["admin", "restaurateur"],
  "/user": ["admin", "organizer", "user"], // Any authenticated user
  "/my-tickets": ["admin", "organizer", "user"],
};

// Routes that should redirect to home if already authenticated
const authRoutes = ["/login"];

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  "/",
  "/events",
  "/marketplace",
  "/restaurants",
  "/classes",
  "/services",
  "/magazine",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/vendor/apply",
  "/restaurateur/apply",
];

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
}

function getRequiredRoles(pathname: string): string[] | null {
  for (const [route, roles] of Object.entries(PROTECTED_ROUTES)) {
    if (pathname.startsWith(route)) {
      return roles;
    }
  }
  return null;
}

function hasRequiredRole(
  userRole: string | undefined,
  staffRoles: string[] | undefined,
  isVendor: boolean | undefined,
  isRestaurateur: boolean | undefined,
  requiredRoles: string[]
): boolean {
  // Admin can access everything
  if (userRole === "admin") return true;

  // Check if user role matches any required role
  if (userRole && requiredRoles.includes(userRole)) return true;

  // Check vendor role
  if (requiredRoles.includes("vendor") && isVendor) return true;

  // Check restaurateur role
  if (requiredRoles.includes("restaurateur") && isRestaurateur) return true;

  // Check staff roles
  if (staffRoles) {
    for (const staffRole of staffRoles) {
      if (requiredRoles.includes(staffRole)) return true;
    }
  }

  // "user" role means any authenticated user
  if (requiredRoles.includes("user") && userRole) return true;

  return false;
}

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes without authentication
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Check for both cookie names (session_token is current, auth-token is legacy)
  const token = request.cookies.get("session_token")?.value || request.cookies.get("auth-token")?.value;

  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));
  const requiredRoles = getRequiredRoles(pathname);

  // Verify token if it exists
  let isAuthenticated = false;
  let userRole: string | undefined;
  let staffRoles: string[] | undefined;
  let isVendor: boolean | undefined;
  let isRestaurateur: boolean | undefined;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      isAuthenticated = true;
      userRole = payload.role as string;
      staffRoles = payload.staffRoles as string[] | undefined;
      isVendor = payload.isVendor as boolean | undefined;
      isRestaurateur = payload.isRestaurateur as boolean | undefined;
    } catch {
      // Token is invalid, clear both cookies
      if (!isAuthRoute && !pathname.startsWith("/register")) {
        const response = NextResponse.redirect(new URL("/login", request.url));
        response.cookies.delete("auth-token");
        response.cookies.delete("session_token");
        return response;
      }
      const response = NextResponse.next();
      response.cookies.delete("auth-token");
      response.cookies.delete("session_token");
      return response;
    }
  }

  // Redirect to login if trying to access protected route without auth
  if (requiredRoles && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Check role-based access for protected routes
  if (requiredRoles && isAuthenticated) {
    if (!hasRequiredRole(userRole, staffRoles, isVendor, isRestaurateur, requiredRoles)) {
      // Redirect to home if user doesn't have required role
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Redirect authenticated users away from login page
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|events/[^/]+$).*)",
  ],
};
