"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { RestaurantsSubNav } from "@/components/layout/RestaurantsSubNav";
import { PublicFooter } from "@/components/layout/PublicFooter";
import {
  ChefHat,
  Utensils,
  ClipboardList,
  Settings,
  BarChart3,
  Clock,
  LogIn,
  Construction,
} from "lucide-react";

export default function RestaurateurDashboardClient() {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Loading state
  if (isLoading) {
    return (
      <>
        <PublicHeader />
        <RestaurantsSubNav />
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </>
    );
  }

  // Not signed in
  if (!isAuthenticated) {
    return (
      <>
        <PublicHeader />
        <RestaurantsSubNav />
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-md mx-auto bg-card rounded-2xl shadow-lg p-8 text-center border border-border">
              <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <LogIn className="w-8 h-8 text-orange-600" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-4">
                Sign In Required
              </h1>
              <p className="text-muted-foreground mb-8">
                Please sign in to access your restaurant dashboard.
              </p>
              <Link
                href={`/login?redirect=${encodeURIComponent("/restaurateur/dashboard")}`}
                className="block w-full px-6 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
        <PublicFooter />
      </>
    );
  }

  // Dashboard items
  const dashboardItems = [
    {
      icon: ClipboardList,
      title: "Orders",
      description: "View and manage incoming orders",
      href: "/restaurateur/dashboard/orders",
      comingSoon: false,
    },
    {
      icon: Utensils,
      title: "Menu",
      description: "Edit your menu items and prices",
      href: "/restaurateur/dashboard/menu",
      comingSoon: true,
    },
    {
      icon: BarChart3,
      title: "Analytics",
      description: "Track your sales and performance",
      href: "/restaurateur/dashboard/analytics",
      comingSoon: true,
    },
    {
      icon: Clock,
      title: "Hours",
      description: "Set your operating hours",
      href: "/restaurateur/dashboard/hours",
      comingSoon: true,
    },
    {
      icon: Settings,
      title: "Settings",
      description: "Manage restaurant settings",
      href: "/restaurateur/dashboard/settings",
      comingSoon: true,
    },
  ];

  return (
    <>
      <PublicHeader />
      <RestaurantsSubNav />
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-gradient-to-br from-orange-600 to-red-600 py-8">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <ChefHat className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Restaurant Dashboard</h1>
                <p className="text-white/80">Welcome back, {user?.name || "Restaurant Owner"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Coming Soon Notice */}
        <div className="container mx-auto px-4 py-8">
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <Construction className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h2 className="text-lg font-semibold text-amber-800 dark:text-amber-200 mb-2">
                  Dashboard Coming Soon
                </h2>
                <p className="text-amber-700 dark:text-amber-300">
                  We're building a powerful dashboard for restaurant owners. In the meantime,
                  if you've submitted an application, our team will reach out to you soon.
                </p>
              </div>
            </div>
          </div>

          {/* Dashboard Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dashboardItems.map((item) => {
              const Icon = item.icon;
              const CardContent = (
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground">{item.title}</h3>
                      {item.comingSoon && (
                        <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded">
                          Coming Soon
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              );

              if (item.comingSoon) {
                return (
                  <div
                    key={item.title}
                    className="bg-card rounded-xl border border-border p-6 opacity-60"
                  >
                    {CardContent}
                  </div>
                );
              }

              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className="bg-card rounded-xl border border-border p-6 hover:border-orange-300 hover:shadow-md transition-all"
                >
                  {CardContent}
                </Link>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="mt-8 bg-card rounded-xl border border-border p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/restaurateur/apply"
                className="px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors"
              >
                Submit New Application
              </Link>
              <Link
                href="/restaurants"
                className="px-4 py-2 border border-input rounded-lg font-medium hover:bg-muted transition-colors"
              >
                View All Restaurants
              </Link>
            </div>
          </div>
        </div>
      </div>
      <PublicFooter />
    </>
  );
}
