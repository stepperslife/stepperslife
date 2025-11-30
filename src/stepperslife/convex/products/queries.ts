import { query } from "../_generated/server";
import { v } from "convex/values";

// Get all products (for admin)
export const getAllProducts = query({
  args: {
    status: v.optional(v.union(v.literal("ACTIVE"), v.literal("DRAFT"), v.literal("ARCHIVED"))),
  },
  handler: async (ctx, args) => {
    if (args.status) {
      const products = await ctx.db
        .query("products")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .order("desc")
        .collect();
      return products;
    }

    const products = await ctx.db.query("products").order("desc").collect();
    return products;
  },
});

// Get active products only (for customers)
export const getActiveProducts = query({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db
      .query("products")
      .withIndex("by_status", (q) => q.eq("status", "ACTIVE"))
      .order("desc")
      .collect();

    // Enrich products with vendor info
    const enrichedProducts = await Promise.all(
      products.map(async (product) => {
        if (product.vendorId) {
          const vendor = await ctx.db.get(product.vendorId);
          return {
            ...product,
            vendor: vendor ? {
              _id: vendor._id,
              storeName: vendor.storeName,
              slug: vendor.slug,
              logo: vendor.logo,
            } : null,
          };
        }
        return { ...product, vendor: null };
      })
    );

    return enrichedProducts;
  },
});

// Get single product by ID
export const getProductById = query({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.productId);
    if (!product) return null;

    // Enrich with vendor info
    if (product.vendorId) {
      const vendor = await ctx.db.get(product.vendorId);
      return {
        ...product,
        vendor: vendor ? {
          _id: vendor._id,
          storeName: vendor.storeName,
          slug: vendor.slug,
          logo: vendor.logo,
          description: vendor.description,
        } : null,
      };
    }
    return { ...product, vendor: null };
  },
});

// Get products by category
export const getProductsByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, args) => {
    const products = await ctx.db
      .query("products")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .filter((q) => q.eq(q.field("status"), "ACTIVE"))
      .order("desc")
      .collect();

    return products;
  },
});

// Get products by vendor (for vendor dashboard)
export const getProductsByVendor = query({
  args: {
    vendorId: v.id("vendors"),
    status: v.optional(v.union(v.literal("ACTIVE"), v.literal("DRAFT"), v.literal("ARCHIVED"))),
  },
  handler: async (ctx, args) => {
    let products = await ctx.db
      .query("products")
      .withIndex("by_vendor", (q) => q.eq("vendorId", args.vendorId))
      .order("desc")
      .collect();

    if (args.status) {
      products = products.filter((p) => p.status === args.status);
    }

    return products;
  },
});

// Get active products by vendor (for storefront)
export const getActiveProductsByVendor = query({
  args: { vendorId: v.id("vendors") },
  handler: async (ctx, args) => {
    const products = await ctx.db
      .query("products")
      .withIndex("by_vendor", (q) => q.eq("vendorId", args.vendorId))
      .filter((q) => q.eq(q.field("status"), "ACTIVE"))
      .order("desc")
      .collect();

    return products;
  },
});
