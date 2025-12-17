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
import { PageHero } from "@/components/ui/PageHero";
import { motion } from "framer-motion";

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
            <motion.div
              className="text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, repeat: 2 }}
              >
                <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
              </motion.div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Connection Issue
              </h3>
              <p className="text-muted-foreground mb-4">
                Unable to load products. Please check your connection and try again.
              </p>
              <motion.button
                type="button"
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Retry
              </motion.button>
            </motion.div>
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
            <motion.div
              className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <motion.p
              className="mt-4 text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Loading products...
            </motion.p>
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
        {/* Hero Section */}
        <PageHero
          title="SteppersLife Shop"
          subtitle="Official merchandise and vendor products"
          imageUrl="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80"
          imageAlt="Shopping and merchandise"
        />

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href="/marketplace/vendors"
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
              >
                <Store className="w-5 h-5" />
                Browse Vendors
              </Link>
            </motion.div>
          </motion.div>

          {products.length === 0 ? (
            <motion.div
              className="bg-card rounded-lg shadow-md p-12 text-center"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              </motion.div>
              <h2 className="text-2xl font-bold text-foreground dark:text-white mb-2">
                Coming Soon!
              </h2>
              <p className="text-muted-foreground">
                Our shop is currently being stocked with amazing products. Check back soon!
              </p>
            </motion.div>
          ) : (
            <div>
              <motion.div
                className="flex items-center justify-between mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <h2 className="text-2xl font-bold text-foreground dark:text-white">All Products</h2>
                <p className="text-muted-foreground">
                  {products.length} {products.length === 1 ? "product" : "products"} available
                </p>
              </motion.div>

              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                initial="hidden"
                animate="visible"
                variants={{
                  visible: {
                    transition: {
                      staggerChildren: 0.08,
                    },
                  },
                }}
              >
                {products.map((product, index) => (
                  <motion.div
                    key={product._id}
                    variants={{
                      hidden: { opacity: 0, y: 30, scale: 0.95 },
                      visible: { opacity: 1, y: 0, scale: 1 },
                    }}
                    transition={{ duration: 0.4 }}
                  >
                    <motion.div
                      className="bg-card rounded-lg shadow-md overflow-hidden h-full"
                      whileHover={{
                        y: -8,
                        boxShadow: "0 20px 40px -10px rgba(0,0,0,0.15)",
                      }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      {/* Product Image */}
                      <div className="aspect-square bg-muted relative overflow-hidden group">
                        {product.primaryImage ? (
                          <Image
                            src={product.primaryImage}
                            alt={product.name}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <motion.div
                              animate={{ rotate: [0, 5, -5, 0] }}
                              transition={{ duration: 3, repeat: Infinity }}
                            >
                              <Package className="w-16 h-16 text-muted-foreground" />
                            </motion.div>
                          </div>
                        )}
                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                          <span className="text-white font-medium text-sm">View Product</span>
                        </div>
                        {/* Sale badge */}
                        {product.compareAtPrice && product.compareAtPrice > product.price && (
                          <motion.div
                            className="absolute top-2 right-2 bg-destructive text-destructive-foreground px-2 py-1 rounded-md text-xs font-bold"
                            initial={{ scale: 0, rotate: -10 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", delay: 0.2 + index * 0.05 }}
                          >
                            SALE
                          </motion.div>
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
                          <motion.span
                            className="text-xl font-bold text-foreground dark:text-white"
                            whileHover={{ scale: 1.05 }}
                          >
                            ${(product.price / 100).toFixed(2)}
                          </motion.span>
                          {product.compareAtPrice && (
                            <span className="text-sm text-muted-foreground line-through">
                              ${(product.compareAtPrice / 100).toFixed(2)}
                            </span>
                          )}
                        </div>

                        {product.trackInventory && (
                          <motion.div
                            className="text-sm text-muted-foreground mb-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 + index * 0.05 }}
                          >
                            {product.inventoryQuantity > 0 ? (
                              <span className="text-success">
                                {product.inventoryQuantity} in stock
                              </span>
                            ) : (
                              <span className="text-destructive">Out of stock</span>
                            )}
                          </motion.div>
                        )}

                        {product.category && (
                          <motion.span
                            className="inline-block px-2 py-1 bg-accent text-primary text-xs rounded mb-4"
                            whileHover={{ scale: 1.05 }}
                          >
                            {product.category}
                          </motion.span>
                        )}

                        {/* Add to Cart Button */}
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Link
                            href={`/marketplace/${product._id}`}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                          >
                            <ShoppingCart className="w-4 h-4" />
                            View Product
                          </Link>
                        </motion.div>
                      </div>
                    </motion.div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          )}
        </main>

        {/* Footer Note */}
        <motion.footer
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <motion.div
            className="bg-accent dark:bg-accent/10 border border-border rounded-lg p-6 text-center"
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <p className="text-foreground font-medium">
              Shopping cart and checkout functionality coming soon!
            </p>
            <p className="text-primary text-sm mt-2">
              Currently accepting orders through our admin panel. Contact us to place an order.
            </p>
          </motion.div>
        </motion.footer>
        <PublicFooter />
      </div>
    </>
  );
}
