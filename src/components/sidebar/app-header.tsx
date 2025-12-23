"use client";

import * as React from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, User, Settings, Ticket, Calendar, BookOpen, Utensils, ShieldCheck, Package, ShoppingBag, Home } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  // Fetch user from cookie-based auth API
  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/auth/me");
        if (response.ok) {
          const data = await response.json();
          setCurrentUser(data.user);
        } else {
          setCurrentUser(null);
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [pathname]);

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (response.ok) {
        router.push("/login");
        router.refresh();
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Generate breadcrumbs from pathname - role-aware
  const getBreadcrumbs = () => {
    const paths = pathname.split("/").filter(Boolean);
    const section = paths[0];

    // Section-specific dashboard config
    const sectionConfig: Record<string, { label: string; dashboardPath: string }> = {
      organizer: { label: "Organizer", dashboardPath: "/organizer/events" },
      admin: { label: "Admin", dashboardPath: "/admin" },
      staff: { label: "Staff", dashboardPath: "/staff/dashboard" },
      vendor: { label: "Vendor", dashboardPath: "/vendor/dashboard" },
      restaurateur: { label: "Restaurant", dashboardPath: "/restaurateur/dashboard" },
      team: { label: "Team", dashboardPath: "/team/dashboard" },
      associate: { label: "Associate", dashboardPath: "/associate/dashboard" },
      user: { label: "Account", dashboardPath: "/user/dashboard" },
    };

    const config = sectionConfig[section];
    if (!config) {
      return [{ label: "Dashboard", href: "/", isLast: true }];
    }

    // Special handling for organizer events
    if (section === "organizer") {
      if (paths.length === 1 || (paths.length === 2 && paths[1] === "events")) {
        return [{ label: "Dashboard", href: config.dashboardPath, isLast: true }];
      }
      if (paths[1] === "events" && paths[2] === "create") {
        return [
          { label: "Dashboard", href: config.dashboardPath, isLast: false },
          { label: "Create Event", href: pathname, isLast: true },
        ];
      }
      if (paths[1] === "events" && paths[2]) {
        return [
          { label: "Dashboard", href: config.dashboardPath, isLast: false },
          { label: "Event Details", href: pathname, isLast: true },
        ];
      }
      if (paths[1] === "classes" && paths[2] === "create") {
        return [
          { label: "Dashboard", href: config.dashboardPath, isLast: false },
          { label: "Create Class", href: pathname, isLast: true },
        ];
      }
      if (paths[1] === "classes" && paths[2]) {
        return [
          { label: "Dashboard", href: config.dashboardPath, isLast: false },
          { label: "Class Details", href: pathname, isLast: true },
        ];
      }
    }

    // Admin section breadcrumbs
    if (section === "admin") {
      if (paths.length === 1) {
        return [{ label: "Admin Dashboard", href: config.dashboardPath, isLast: true }];
      }
      const subSection = paths[1]?.charAt(0).toUpperCase() + paths[1]?.slice(1);
      return [
        { label: "Admin", href: config.dashboardPath, isLast: false },
        { label: subSection || "Dashboard", href: pathname, isLast: true },
      ];
    }

    // Staff section breadcrumbs
    if (section === "staff") {
      if (paths.length === 1 || paths[1] === "dashboard") {
        return [{ label: "Staff Dashboard", href: config.dashboardPath, isLast: true }];
      }
      const subSection = paths[1]?.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
      return [
        { label: "Staff", href: config.dashboardPath, isLast: false },
        { label: subSection || "Dashboard", href: pathname, isLast: true },
      ];
    }

    // Vendor section breadcrumbs
    if (section === "vendor") {
      if (paths.length <= 2 && paths[1] === "dashboard") {
        return [{ label: "Vendor Dashboard", href: config.dashboardPath, isLast: true }];
      }
      if (paths[1] === "dashboard" && paths[2]) {
        const subSection = paths[2]?.charAt(0).toUpperCase() + paths[2]?.slice(1);
        return [
          { label: "Vendor", href: config.dashboardPath, isLast: false },
          { label: subSection || "Dashboard", href: pathname, isLast: true },
        ];
      }
    }

    // Restaurateur section breadcrumbs
    if (section === "restaurateur") {
      if (paths.length <= 2 && paths[1] === "dashboard") {
        return [{ label: "Restaurant Dashboard", href: config.dashboardPath, isLast: true }];
      }
      if (paths[1] === "dashboard" && paths[2]) {
        const subSection = paths[2]?.charAt(0).toUpperCase() + paths[2]?.slice(1);
        return [
          { label: "Restaurant", href: config.dashboardPath, isLast: false },
          { label: subSection || "Dashboard", href: pathname, isLast: true },
        ];
      }
    }

    // Team section breadcrumbs
    if (section === "team") {
      if (paths.length === 1 || paths[1] === "dashboard") {
        return [{ label: "Team Dashboard", href: config.dashboardPath, isLast: true }];
      }
      const subSection = paths[1]?.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
      return [
        { label: "Team", href: config.dashboardPath, isLast: false },
        { label: subSection || "Dashboard", href: pathname, isLast: true },
      ];
    }

    // User section breadcrumbs
    if (section === "user") {
      if (paths.length === 1 || paths[1] === "dashboard") {
        return [{ label: "My Account", href: config.dashboardPath, isLast: true }];
      }
      const subSection = paths[1]?.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
      return [
        { label: "Account", href: config.dashboardPath, isLast: false },
        { label: subSection || "Dashboard", href: pathname, isLast: true },
      ];
    }

    // Default for recognized sections
    return [{ label: config.label + " Dashboard", href: config.dashboardPath, isLast: true }];
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 sticky top-0 bg-background z-10">
      <SidebarTrigger className="-ml-1" />
      <Separator className="mr-2 h-4" orientation="vertical" />

      {/* Home Link with Logo */}
      <Link href="/" className="flex items-center gap-2 mr-2 hover:opacity-80 transition-opacity" title="Go to Homepage">
        <Image
          src="/logo.png"
          alt="SteppersLife"
          width={28}
          height={28}
          className="w-7 h-7"
        />
        <Home className="w-4 h-4 text-muted-foreground" />
      </Link>

      <Separator className="mr-2 h-4" orientation="vertical" />
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb.href}>
              {index > 0 && <BreadcrumbSeparator className="hidden md:block" />}
              <BreadcrumbItem className="hidden md:block">
                {crumb.isLast ? (
                  <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>

      {/* User Menu - Right Side */}
      <div className="ml-auto flex items-center gap-2">
        {loading ? (
          <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
        ) : currentUser ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                <User className="h-4 w-4" />
                <span className="hidden md:inline">{currentUser.name || currentUser.email}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{currentUser.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">{currentUser.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/my-tickets")}>
                <Ticket className="mr-2 h-4 w-4" />
                <span>My Tickets</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/organizer/events")}>
                <Calendar className="mr-2 h-4 w-4" />
                <span>My Events</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/organizer/classes")}>
                <BookOpen className="mr-2 h-4 w-4" />
                <span>My Classes</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/restaurants/my-orders")}>
                <ShoppingBag className="mr-2 h-4 w-4" />
                <span>My Food Orders</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/marketplace/orders")}>
                <Package className="mr-2 h-4 w-4" />
                <span>My Marketplace Orders</span>
              </DropdownMenuItem>
              {/* Role-specific menu items */}
              {(currentUser.role === "vendor" || currentUser.role === "admin") && (
                <DropdownMenuItem onClick={() => router.push("/vendor/dashboard")}>
                  <Package className="mr-2 h-4 w-4" />
                  <span>Vendor Dashboard</span>
                </DropdownMenuItem>
              )}
              {(currentUser.role === "restaurateur" || currentUser.role === "admin") && (
                <DropdownMenuItem onClick={() => router.push("/restaurateur/dashboard")}>
                  <Utensils className="mr-2 h-4 w-4" />
                  <span>My Restaurant</span>
                </DropdownMenuItem>
              )}
              {(currentUser.role === "staff" || currentUser.role === "admin") && (
                <DropdownMenuItem onClick={() => router.push("/staff/dashboard")}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Staff Dashboard</span>
                </DropdownMenuItem>
              )}
              {(currentUser.role === "team" || currentUser.role === "admin") && (
                <DropdownMenuItem onClick={() => router.push("/team/dashboard")}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Team Dashboard</span>
                </DropdownMenuItem>
              )}
              {currentUser.role === "admin" && (
                <DropdownMenuItem onClick={() => router.push("/admin")}>
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  <span>Admin Panel</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </div>
    </header>
  );
}
