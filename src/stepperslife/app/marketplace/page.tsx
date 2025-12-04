"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Package, ShoppingCart, DollarSign, AlertCircle, Store, Users } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { MarketplaceSubNav } from "@/components/layout/MarketplaceSubNav";

export default function ShopPage() {
  const products = useQuery(api.products.queries.getActiveProducts, {});
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  // Timeout fallback - after 10 seconds, show error state
  useEffect(() => {
    if (products === undefined) {
      const timer = setTimeout(() => {
        setLoadingTimeout(true);
      }, 10000);
      return () => clearTimeout(timer);
    } else {
      setLoadingTimeout(false);
    }
  }, [products]);

  // Show timeout error state
  if (loadingTimeout && products === undefined) {
    return (
      <>
        <PublicHeader />
        <MarketplaceSubNav />
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-12">
            <div className="text-center">
              <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Connection Issue
              </h3>
              <p className="text-muted-foreground mb-4">
                Unable to load products. Please check your connection and try again.
              </p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
        <PublicFooter />
      </>
    );
  }

  if (!products) {
    return (
      <>
        <PublicHeader />
        <MarketplaceSubNav />
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading products...</p>
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
        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground dark:text-white">SteppersLife Shop</h1>
              <p className="text-muted-foreground mt-2">
                Official merchandise and vendor products
              </p>
            </div>
            <Link
              href="/marketplace/vendors"
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
            >
              <Store className="w-5 h-5" />
              Browse Vendors
            </Link>
          </div>

          {products.length === 0 ? (
            <div className="bg-card rounded-lg shadow-md p-12 text-center">
              <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground dark:text-white mb-2">
                Coming Soon!
              </h2>
              <p className="text-muted-foreground">
                Our shop is currently being stocked with amazing products. Check back soon!
              </p>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-foreground dark:text-white">All Products</h2>
                <p className="text-muted-foreground">
                  {products.length} {products.length === 1 ? "product" : "products"} available
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <div
                    key={product._id}
                    className="bg-card rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
                  >
                    {/* Product Image */}
                    <div className="aspect-square bg-muted relative">
                      {product.primaryImage ? (
                        <Image
                          src={product.primaryImage}
                          alt={product.name}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                          className="object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-16 h-16 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-4">
                      <h3 className="font-bold text-lg text-foreground dark:text-white mb-1 line-clamp-2">
                        {product.name}
                      </h3>

                      {/* Vendor Badge */}
                      {product.vendor ? (
                        <Link
                          href={`/marketplace/vendors/${product.vendor.slug}`}
                          className="inline-flex items-center gap-1.5 text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 mb-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Store className="w-3 h-3" />
                          <span>Sold by {product.vendor.storeName}</span>
                        </Link>
                      ) : (
                        <div className="flex items-center gap-1.5 text-xs text-primary mb-2">
                          <Users className="w-3 h-3" />
                          <span>SteppersLife Official</span>
                        </div>
                      )}

                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {product.description}
                      </p>

                      <div className="flex items-center gap-2 mb-4">
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                        <span className="text-xl font-bold text-foreground dark:text-white">
                          ${(product.price / 100).toFixed(2)}
                        </span>
                        {product.compareAtPrice && (
                          <span className="text-sm text-muted-foreground line-through">
                            ${(product.compareAtPrice / 100).toFixed(2)}
                          </span>
                        )}
                      </div>

                      {product.trackInventory && (
                        <div className="text-sm text-muted-foreground mb-4">
                          {product.inventoryQuantity > 0 ? (
                            <span className="text-success">
                              {product.inventoryQuantity} in stock
                            </span>
                          ) : (
                            <span className="text-destructive">Out of stock</span>
                          )}
                        </div>
                      )}

                      {product.category && (
                        <span className="inline-block px-2 py-1 bg-accent text-primary text-xs rounded mb-4">
                          {product.category}
                        </span>
                      )}

                      {/* Add to Cart Button */}
                      <Link
                        href={`/marketplace/${product._id}`}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        View Product
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>

        {/* Footer Note */}
        <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-accent dark:bg-accent/10 border border-border rounded-lg p-6 text-center">
            <p className="text-foreground font-medium">
              Shopping cart and checkout functionality coming soon!
            </p>
            <p className="text-primary text-sm mt-2">
              Currently accepting orders through our admin panel. Contact us to place an order.
            </p>
          </div>
        </footer>
        <PublicFooter />
      </div>
    </>
  );
}
