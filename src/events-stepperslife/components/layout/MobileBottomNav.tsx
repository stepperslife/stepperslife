"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, Calendar, ShoppingBag, Utensils, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export function MobileBottomNav() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();

  // Hide on certain pages (organizer, admin, staff sections have their own navigation)
  // Also hide on checkout pages for cleaner payment experience
  const hideOnPaths = ["/organizer", "/admin", "/staff", "/login", "/scan", "/checkout"];
  const shouldHide = hideOnPaths.some(
    (path) => pathname?.startsWith(path) || pathname?.includes("/checkout")
  );

  if (shouldHide) {
    return null;
  }

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
      href: isAuthenticated ? "/organizer/events" : "/login",
      icon: User,
      label: "Account",
      activePatterns: [/^\/my-tickets/, /^\/organizer\/events/],
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
