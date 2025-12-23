"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, Calendar, ShoppingBag, Utensils, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

// Helper to determine the best account route based on user role
function getAccountRoute(user: any): string {
  if (!user) return "/login";

  // Check role and return appropriate dashboard
  switch (user.role) {
    case "admin":
      return "/admin";
    case "vendor":
      return "/vendor/dashboard";
    case "restaurateur":
      return "/restaurateur/dashboard";
    case "staff":
      return "/staff/dashboard";
    case "team":
      return "/team/dashboard";
    case "associate":
      return "/associate/dashboard";
    case "organizer":
      return "/organizer/events";
    default:
      // Regular user - go to my tickets
      return "/my-tickets";
  }
}

export function MobileBottomNav() {
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuth();

  // Hide on dashboard sections that have their own navigation
  // Also hide on checkout and scan pages for cleaner experience
  const hideOnPaths = [
    "/organizer",
    "/admin",
    "/staff",
    "/vendor/dashboard",
    "/restaurateur",
    "/team",
    "/associate",
    "/login",
    "/scan",
    "/checkout",
  ];
  const shouldHide = hideOnPaths.some(
    (path) => pathname?.startsWith(path) || pathname?.includes("/checkout")
  );

  if (shouldHide) {
    return null;
  }

  // Determine the best account route based on user role
  const accountRoute = getAccountRoute(user);

  const navItems = [
    {
      href: "/",
      icon: Home,
      label: "Home",
      activePatterns: [/^\/$/],
    },
    {
      href: "/events",
      icon: Calendar,
      label: "Events",
      activePatterns: [/^\/events/],
    },
    {
      href: "/marketplace",
      icon: ShoppingBag,
      label: "Shop",
      activePatterns: [/^\/marketplace/],
    },
    {
      href: "/restaurants",
      icon: Utensils,
      label: "Food",
      activePatterns: [/^\/restaurants/],
    },
    {
      href: accountRoute,
      icon: User,
      label: "Account",
      activePatterns: [/^\/my-tickets/, /^\/user\//],
    },
  ];

  const isActive = (patterns: RegExp[]) => {
    return patterns.some((pattern) => pattern.test(pathname || ""));
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.activePatterns);

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center flex-1 h-full relative"
            >
              <div className="relative">
                <Icon
                  className={`w-6 h-6 transition-colors ${
                    active ? "text-primary" : "text-muted-foreground"
                  }`}
                />
                {active && (
                  <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full" />
                )}
              </div>
              <span
                className={`text-xs mt-1 transition-colors ${
                  active ? "text-primary font-medium" : "text-muted-foreground"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
