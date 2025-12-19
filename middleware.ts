import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js Middleware
 *
 * Sets the Permissions-Policy header based on the route:
 * - Scanner routes (/staff/scan-tickets, /scan/*): Allow camera
 * - All other routes: Block camera for privacy
 */
export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const pathname = request.nextUrl.pathname;

  // Check if this is a scanner route that needs camera access
  const isScannerRoute =
    pathname === '/staff/scan-tickets' ||
    pathname.startsWith('/scan/');

  // Set Permissions-Policy header based on route
  if (isScannerRoute) {
    response.headers.set(
      'Permissions-Policy',
      'camera=(self), microphone=(), geolocation=(), interest-cohort=()'
    );
  } else {
    response.headers.set(
      'Permissions-Policy',
      'camera=(), microphone=(), geolocation=(), interest-cohort=()'
    );
  }

  return response;
}

// Configure which routes the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (icons, manifest, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|json|woff|woff2|ttf)$).*)',
  ],
};
