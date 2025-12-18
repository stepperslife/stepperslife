"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Package, ShoppingCart, DollarSign, AlertCircle, Store, Users, ShoppingBag, Tag, Sparkles, TrendingUp } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { MarketplaceSubNav } from "@/components/layout/MarketplaceSubNav";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ViewToggle, ViewMode, getViewClasses } from "@/components/ui/ViewToggle";

export default function ShopPage() {
  const products = useQuery(api.products.queries.getActiveProducts, {});
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

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
        {/* Epic Hero Section */}
        <section className="relative min-h-[500px] md:min-h-[600px] w-full overflow-hidden">
          {/* Animated Gradient Background */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-teal-900 via-emerald-900 to-cyan-900"
            animate={{
              background: [
                "linear-gradient(135deg, #134e4a 0%, #065f46 50%, #164e63 100%)",
                "linear-gradient(135deg, #065f46 0%, #164e63 50%, #134e4a 100%)",
                "linear-gradient(135deg, #164e63 0%, #134e4a 50%, #065f46 100%)",
                "linear-gradient(135deg, #134e4a 0%, #065f46 50%, #164e63 100%)",
              ],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          />

          {/* Background Pattern */}
          <motion.div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&q=80')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.5 }}
          />

          {/* Floating Shopping Icons */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Shopping Bag */}
            <motion.div
              className="absolute top-24 left-[8%] text-white/20"
              animate={{ y: [0, -25, 0], rotate: [0, 8, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            >
              <ShoppingBag className="w-16 h-16 md:w-20 md:h-20" />
            </motion.div>

            {/* Tag Icon */}
            <motion.div
              className="absolute top-36 right-[12%] text-white/15"
              animate={{ y: [0, 20, 0], rotate: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            >
              <Tag className="w-12 h-12 md:w-16 md:h-16" />
            </motion.div>

            {/* Package Icon */}
            <motion.div
              className="absolute bottom-36 left-[15%] text-white/15"
              animate={{ y: [0, -18, 0], rotate: [0, 12, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            >
              <Package className="w-14 h-14 md:w-18 md:h-18" />
            </motion.div>

            {/* Store Icon */}
            <motion.div
              className="absolute bottom-28 right-[8%] text-white/20"
              animate={{ y: [0, 15, 0], rotate: [0, -8, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
            >
              <Store className="w-12 h-12 md:w-16 md:h-16" />
            </motion.div>

            {/* Sparkles */}
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                style={{
                  left: `${5 + Math.random() * 90}%`,
                  top: `${5 + Math.random() * 90}%`,
                }}
                animate={{
                  opacity: [0.2, 0.6, 0.2],
                  scale: [1, 1.3, 1],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              >
                <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-yellow-400/40" />
              </motion.div>
            ))}
          </div>

          {/* Content */}
          <div className="relative z-10 container mx-auto px-4 h-full flex items-center py-16 md:py-24">
            <div className="max-w-3xl">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-6"
              >
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-sm font-medium">
                  <TrendingUp className="w-4 h-4" />
                  {products.length} Products Available
                </span>
              </motion.div>

              {/* Main Title */}
              <motion.h1
                className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
              >
                Shop the{" "}
                <motion.span
                  className="inline-block bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-300 bg-clip-text text-transparent"
                  animate={{
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                  }}
                  transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                  style={{ backgroundSize: "200% 200%" }}
                >
                  Stepping Life
                </motion.span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
              >
                Discover exclusive merchandise, apparel, and accessories from the Chicago Steppin community.
                Support local vendors and wear your passion.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                className="flex flex-wrap gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
              >
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    size="lg"
                    className="text-lg px-8 py-6 bg-white !text-teal-900 hover:bg-white/90 shadow-xl shadow-teal-900/30"
                    onClick={() => document.getElementById('products-grid')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    <ShoppingBag className="w-5 h-5 mr-2 text-teal-900" />
                    Browse Products
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="text-lg px-8 py-6 bg-white/10 border-white/30 !text-white hover:bg-white/20 backdrop-blur-sm"
                  >
                    <Link href="/vendor/apply">
                      <Store className="w-5 h-5 mr-2 text-white" />
                      Become a Vendor
                    </Link>
                  </Button>
                </motion.div>
              </motion.div>

              {/* Features */}
              <motion.div
                className="mt-12 grid grid-cols-3 gap-6 max-w-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.5 }}
              >
                <div className="text-center">
                  <motion.div
                    className="w-12 h-12 mx-auto mb-2 rounded-full bg-white/10 flex items-center justify-center"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <Package className="w-6 h-6 text-white" />
                  </motion.div>
                  <div className="text-xs text-white/60">Fast Shipping</div>
                </div>
                <div className="text-center">
                  <motion.div
                    className="w-12 h-12 mx-auto mb-2 rounded-full bg-white/10 flex items-center justify-center"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <Store className="w-6 h-6 text-white" />
                  </motion.div>
                  <div className="text-xs text-white/60">Local Vendors</div>
                </div>
                <div className="text-center">
                  <motion.div
                    className="w-12 h-12 mx-auto mb-2 rounded-full bg-white/10 flex items-center justify-center"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <Sparkles className="w-6 h-6 text-white" />
                  </motion.div>
                  <div className="text-xs text-white/60">Exclusive Items</div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Bottom Gradient Fade */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
        </section>

        {/* Main Content */}
        <main id="products-grid" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div>
              <h2 className="text-2xl font-bold text-foreground">All Products</h2>
              <p className="text-muted-foreground">
                {products.length} {products.length === 1 ? "product" : "products"} available
              </p>
            </div>
            <div className="flex items-center gap-4">
              {/* View Toggle */}
              <ViewToggle view={viewMode} onViewChange={setViewMode} />
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
            </div>
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
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Coming Soon!
              </h2>
              <p className="text-muted-foreground">
                Our shop is currently being stocked with amazing products. Check back soon!
              </p>
            </motion.div>
          ) : (
            <motion.div
              className={getViewClasses(viewMode, "products")}
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
                      <h3 className="font-bold text-lg text-card-foreground mb-1 line-clamp-2">
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
                          className="text-xl font-bold text-card-foreground"
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
