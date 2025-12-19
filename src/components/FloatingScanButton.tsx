"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { QrCode } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";

/**
 * FloatingScanButton
 *
 * A floating action button for staff/organizers to quickly access the ticket scanner.
 * Appears on mobile devices for authenticated users with scanning permissions.
 *
 * Visibility rules:
 * - Only shows on mobile (md:hidden)
 * - Only for users who can scan tickets (staff, team members with canScan, organizers, admins)
 * - Hidden on scanner pages (already there)
 * - Hidden on checkout pages (cleaner payment experience)
 * - Positioned above bottom navigation where applicable
 */
export function FloatingScanButton() {
  const pathname = usePathname();

  // Query to check if user has any scannable events
  // This implicitly checks authentication and staff permissions
  const scannableEvents = useQuery(api.scanning.queries.getMyScannableEvents);

  // Hide on certain pages
  const hideOnPaths = [
    "/staff/scan-tickets",
    "/scan/",
    "/checkout",
    "/login",
    "/register",
    "/activate",
  ];
  const shouldHide = hideOnPaths.some((path) => pathname?.includes(path));

  // Don't show if:
  // - Still loading (scannableEvents === undefined)
  // - User has no scannable events (not authorized)
  // - Should be hidden based on current route
  if (shouldHide || scannableEvents === undefined || scannableEvents.length === 0) {
    return null;
  }

  // Determine if we're in a dashboard context (has bottom workspace bar)
  const dashboardPaths = [
    "/organizer",
    "/admin",
    "/staff",
    "/team",
    "/associate",
    "/restaurateur",
    "/user",
    "/vendor",
    "/team-member",
  ];
  const isDashboardRoute = dashboardPaths.some((path) => pathname?.startsWith(path));

  // Determine if public bottom nav is visible
  const publicNavHiddenPaths = [
    "/organizer",
    "/admin",
    "/staff",
    "/login",
    "/scan",
    "/checkout",
  ];
  const hasPublicBottomNav = !publicNavHiddenPaths.some(
    (path) => pathname?.startsWith(path) || pathname?.includes("/checkout")
  );

  // Calculate bottom position based on what's below
  // - If dashboard route with workspace bar: bottom-20 (above 56px bar)
  // - If public route with bottom nav: bottom-20 (above 64px nav)
  // - Otherwise: bottom-6
  const bottomPosition = isDashboardRoute || hasPublicBottomNav ? "bottom-20" : "bottom-6";

  return (
    <Link
      href="/staff/scan-tickets"
      className={cn(
        // Base styles - only show on mobile
        "md:hidden fixed right-4 z-40",
        bottomPosition,
        // Button appearance
        "flex items-center justify-center",
        "w-14 h-14 rounded-full",
        "bg-primary text-primary-foreground",
        "shadow-lg shadow-primary/30",
        // Interaction states
        "active:scale-95 transition-all duration-200",
        "hover:bg-primary/90"
      )}
      aria-label="Scan Tickets"
    >
      <QrCode className="w-6 h-6" />
    </Link>
  );
}
