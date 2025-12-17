"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/useAuth";
import { VendorSidebar } from "@/components/layout/VendorSidebar";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { Id } from "@/convex/_generated/dataModel";
import { AlertCircle, Clock, Store } from "lucide-react";
import Link from "next/link";

export default function VendorDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // Get vendor for current user
  const vendor = useQuery(
    api.vendors.getByOwner,
    user?._id ? { ownerId: user._id as Id<"users"> } : "skip"
  );

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent("/vendor/dashboard")}`);
    }
  }, [authLoading, isAuthenticated, router]);

  // Loading state
  if (authLoading || vendor === undefined) {
    return (
      <>
        <PublicHeader />
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </>
    );
  }

  // No vendor found - show apply prompt
  if (!vendor) {
    return (
      <>
        <PublicHeader />
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-md mx-auto bg-card rounded-2xl shadow-lg p-8 text-center border border-border">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <Store className="w-8 h-8 text-purple-600" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-4">
                Become a Vendor
              </h1>
              <p className="text-muted-foreground mb-8">
                You don't have a vendor account yet. Apply to become a vendor and start
                selling your products on SteppersLife.
              </p>
              <Link
                href="/vendor/apply"
                className="block w-full px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
              >
                Apply to Sell
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Vendor pending approval
  if (vendor.status === "PENDING") {
    return (
      <>
        <PublicHeader />
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-md mx-auto bg-card rounded-2xl shadow-lg p-8 text-center border border-border">
              <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-4">
                Application Under Review
              </h1>
              <p className="text-muted-foreground mb-6">
                Your vendor application for <strong>{vendor.name}</strong> is currently
                being reviewed. We'll notify you by email once it's been approved.
              </p>
              <div className="bg-muted/50 rounded-lg p-4 text-left text-sm">
                <p className="font-medium text-foreground mb-2">Application Details:</p>
                <ul className="text-muted-foreground space-y-1">
                  <li>Store Name: {vendor.name}</li>
                  <li>Submitted: {new Date(vendor.createdAt).toLocaleDateString()}</li>
                  <li>Status: Pending Review</li>
                </ul>
              </div>
              <Link
                href="/marketplace"
                className="block w-full mt-6 px-6 py-3 border border-border rounded-lg font-semibold hover:bg-muted transition-colors"
              >
                Browse Marketplace
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Vendor rejected
  if (vendor.status === "REJECTED") {
    return (
      <>
        <PublicHeader />
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-md mx-auto bg-card rounded-2xl shadow-lg p-8 text-center border border-border">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-4">
                Application Not Approved
              </h1>
              <p className="text-muted-foreground mb-6">
                Unfortunately, your vendor application for <strong>{vendor.name}</strong>{" "}
                was not approved.
              </p>
              {vendor.rejectionReason && (
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 text-left text-sm mb-6">
                  <p className="font-medium text-red-900 dark:text-red-100 mb-1">
                    Reason:
                  </p>
                  <p className="text-red-700 dark:text-red-300">
                    {vendor.rejectionReason}
                  </p>
                </div>
              )}
              <p className="text-sm text-muted-foreground">
                If you believe this was an error, please contact our support team.
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Vendor suspended
  if (vendor.status === "SUSPENDED") {
    return (
      <>
        <PublicHeader />
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-md mx-auto bg-card rounded-2xl shadow-lg p-8 text-center border border-border">
              <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-8 h-8 text-orange-600" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-4">
                Account Suspended
              </h1>
              <p className="text-muted-foreground mb-6">
                Your vendor account for <strong>{vendor.name}</strong> has been suspended.
              </p>
              {vendor.rejectionReason && (
                <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 text-left text-sm mb-6">
                  <p className="font-medium text-orange-900 dark:text-orange-100 mb-1">
                    Reason:
                  </p>
                  <p className="text-orange-700 dark:text-orange-300">
                    {vendor.rejectionReason}
                  </p>
                </div>
              )}
              <p className="text-sm text-muted-foreground">
                Please contact our support team to resolve this issue.
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Approved vendor - show dashboard
  return (
    <>
      <PublicHeader />
      <div className="flex min-h-screen bg-background">
        <VendorSidebar vendorName={vendor.name} vendorSlug={vendor.slug} />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </>
  );
}
