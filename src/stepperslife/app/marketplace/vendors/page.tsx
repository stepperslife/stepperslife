"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Store, MapPin, Package, ArrowRight, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { MarketplaceSubNav } from "@/components/layout/MarketplaceSubNav";

export default function VendorsPage() {
  const vendors = useQuery(api.vendors.getApprovedVendors, {});
  const [searchQuery, setSearchQuery] = useState("");

  // Filter vendors by search
  const filteredVendors = vendors?.filter((vendor) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      vendor.storeName.toLowerCase().includes(query) ||
      (vendor.description?.toLowerCase().includes(query) ?? false) ||
      (vendor.city?.toLowerCase().includes(query) ?? false) ||
      (vendor.state?.toLowerCase().includes(query) ?? false)
    );
  });

  if (!vendors) {
    return (
      <>
        <PublicHeader />
        <MarketplaceSubNav />
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading vendors...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PublicHeader />
      <MarketplaceSubNav />
      <div className="min-h-screen bg-background">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground dark:text-white">Vendor Stores</h1>
            <p className="text-muted-foreground mt-2">
              Browse products from our verified vendors and sellers
            </p>
          </div>

          {/* Search */}
          <div className="bg-card rounded-xl border border-border p-4 mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search vendors by name, description, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-input rounded-lg bg-background focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          {filteredVendors && filteredVendors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVendors.map((vendor) => (
                <Link
                  key={vendor._id}
                  href={`/marketplace/vendors/${vendor.slug}`}
                  className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg hover:border-purple-300 dark:hover:border-purple-700 transition-all group"
                >
                  {/* Vendor Header/Logo */}
                  <div className="h-32 bg-gradient-to-br from-purple-600 to-purple-800 relative">
                    {vendor.logo ? (
                      <img
                        src={vendor.logo}
                        alt={vendor.storeName}
                        className="absolute bottom-0 left-4 translate-y-1/2 w-20 h-20 rounded-xl border-4 border-card object-cover shadow-lg"
                      />
                    ) : (
                      <div className="absolute bottom-0 left-4 translate-y-1/2 w-20 h-20 rounded-xl border-4 border-card bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center shadow-lg">
                        <Store className="w-10 h-10 text-purple-600" />
                      </div>
                    )}
                  </div>

                  {/* Vendor Info */}
                  <div className="pt-14 p-4">
                    <h3 className="font-bold text-lg text-foreground group-hover:text-purple-600 transition-colors">
                      {vendor.storeName}
                    </h3>

                    {(vendor.city || vendor.state) && (
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                        <MapPin className="w-4 h-4" />
                        <span>
                          {[vendor.city, vendor.state].filter(Boolean).join(", ")}
                        </span>
                      </div>
                    )}

                    {vendor.description && (
                      <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                        {vendor.description}
                      </p>
                    )}

                    {/* Categories */}
                    {vendor.categories && vendor.categories.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {vendor.categories.slice(0, 3).map((category) => (
                          <span
                            key={category}
                            className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs rounded-full"
                          >
                            {category}
                          </span>
                        ))}
                        {vendor.categories.length > 3 && (
                          <span className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded-full">
                            +{vendor.categories.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Stats & CTA */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Package className="w-4 h-4" />
                        <span>{vendor.productCount || 0} products</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-purple-600 dark:text-purple-400 font-medium group-hover:gap-2 transition-all">
                        <span>Visit Store</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-card rounded-xl border border-border p-12 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Store className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">
                {searchQuery ? "No vendors found" : "No vendors yet"}
              </h3>
              <p className="text-muted-foreground max-w-sm mx-auto">
                {searchQuery
                  ? "Try adjusting your search query to find more vendors."
                  : "Check back soon as more vendors join our marketplace."}
              </p>
            </div>
          )}

          {/* Become a Vendor CTA */}
          <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-xl p-8 mt-12">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="text-white">
                <h3 className="text-xl font-bold mb-2">Want to sell on SteppersLife?</h3>
                <p className="text-purple-100">
                  Join our marketplace and reach thousands of stepping enthusiasts.
                </p>
              </div>
              <Link
                href="/vendor/apply"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-purple-600 rounded-lg font-bold hover:bg-purple-50 transition-colors whitespace-nowrap"
              >
                <Store className="w-5 h-5" />
                Apply to Sell
              </Link>
            </div>
          </div>
        </main>
        <PublicFooter />
      </div>
    </>
  );
}
