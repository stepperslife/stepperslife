import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Next.js Middleware for role-based route protection
 *
 * This middleware protects role-specific routes and redirects unauthorized users.
 * It runs on the edge before the request reaches your pages.
 */

// Define protected route patterns
const PROTECTED_ROUTES = {
  admin: /^\/admin/,
  organizer: /^\/organizer/,
  staff: /^\/staff/,
  team: /^\/team/,
  associate: /^\/associate/,
  vendor: /^\/vendor\/dashboard/,
  restaurateur: /^\/restaurateur\/dashboard/,
  user: /^\/user/,
} as const;

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
  "/api/auth",
  "/api/webhooks",
  "/api/public",
  "/api/testing",
  "/vendor/apply",
  "/restaurateur/apply",
  "/_next",
  "/favicon.ico",
  "/manifest.json",
  "/icons",
  "/logos",
];

/**
 * Check if route is public (doesn't require authentication)
 */
function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
}

/**
 * Get required role for a route
 */
function getRequiredRole(
  pathname: string
): keyof typeof PROTECTED_ROUTES | null {
  for (const [role, pattern] of Object.entries(PROTECTED_ROUTES)) {
    if (pattern.test(pathname)) {
      return role as keyof typeof PROTECTED_ROUTES;
    }
  }
  return null;
}

/**
 * Check if user has required role
 */
function hasRequiredRole(
  userRole: string | undefined,
  staffRoles: string[] | undefined,
  isVendor: boolean | undefined,
  isRestaurateur: boolean | undefined,
  requiredRole: string
): boolean {
  // Admin can access everything
  if (userRole === "admin") return true;

  // Check main role
  if (userRole === requiredRole) return true;

  // Check vendor role
  if (requiredRole === "vendor" && isVendor) return true;

  // Check restaurateur role
  if (requiredRole === "restaurateur" && isRestaurateur) return true;

  // Check staff roles (for STAFF, TEAM_MEMBERS, ASSOCIATES)
  if (staffRoles) {
    const upperRequiredRole = requiredRole.toUpperCase();
    if (
      upperRequiredRole === "STAFF" ||
      upperRequiredRole === "TEAM" ||
      upperRequiredRole === "ASSOCIATE"
    ) {
      const staffRoleMap: Record<string, string> = {
        STAFF: "STAFF",
        TEAM: "TEAM_MEMBERS",
        ASSOCIATE: "ASSOCIATES",
      };
      const mappedRole = staffRoleMap[upperRequiredRole];
      if (mappedRole && staffRoles.includes(mappedRole)) {
        return true;
      }
    }
  }

  // User dashboard is accessible to all authenticated users
  if (requiredRole === "user") return true;

  return false;
}

/**
 * Get redirect URL for user based on their role
 */
function getDefaultDashboard(
  userRole: string | undefined,
  staffRoles: string[] | undefined
): string {
  if (userRole === "admin") return "/admin";
  if (userRole === "organizer") return "/organizer/dashboard";

  // Check staff roles in priority order
  if (staffRoles) {
    if (staffRoles.includes("TEAM_MEMBERS")) return "/team/dashboard";
    if (staffRoles.includes("ASSOCIATES")) return "/associate/dashboard";
    if (staffRoles.includes("STAFF")) return "/staff/dashboard";
  }

  // Default to user dashboard
  return "/user/dashboard";
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Check if route requires authentication
  const requiredRole = getRequiredRole(pathname);

  if (!requiredRole) {
    // Not a protected route
    return NextResponse.next();
  }

  // Get user session from auth API
  try {
    const authResponse = await fetch(
      new URL("/api/auth/me", request.url).toString(),
      {
        headers: {
          cookie: request.headers.get("cookie") || "",
        },
      }
    );

    if (!authResponse.ok) {
      // Not authenticated - redirect to login
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const { user } = await authResponse.json();

    // Check if user has required role
    if (!hasRequiredRole(user.role, user.staffRoles, user.isVendor, user.isRestaurateur, requiredRole)) {
      // User doesn't have required role - redirect to their default dashboard
      const defaultDashboard = getDefaultDashboard(user.role, user.staffRoles);
      return NextResponse.redirect(new URL(defaultDashboard, request.url));
    }

    // User has required role - allow access
    return NextResponse.next();
  } catch (error) {
    console.error("Middleware auth check failed:", error);

    // On error, redirect to login to be safe
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }
}

/**
 * Configure which routes this middleware runs on
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
