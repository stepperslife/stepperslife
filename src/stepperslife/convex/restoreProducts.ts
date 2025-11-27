
import { mutation } from "./_generated/server";
import { v } from "convex/values";

// This is a temporary public mutation to restore the products
// We will delete this file after running it
export const restoreProducts = mutation({
    args: {},
    handler: async (ctx) => {
        const testProducts = [
            {
                name: "SteppersLife Tee",
                description: "Official SteppersLife branded t-shirt. High quality cotton.",
                price: 2500,
                compareAtPrice: 3000,
                sku: "SL-TEE-001",
                inventoryQuantity: 100,
                trackInventory: true,
                category: "Apparel",
                status: "ACTIVE",
                primaryImage: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80",
                hasVariants: false,
                requiresShipping: true,
            },
            {
                name: "Chicago Steppin' Guide",
                description: "Comprehensive guide to Chicago Steppin' moves and history.",
                price: 1500,
                sku: "SL-BOOK-001",
                inventoryQuantity: 50,
                trackInventory: true,
                category: "Books",
                status: "ACTIVE",
                primaryImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=800&q=80",
                hasVariants: false,
                requiresShipping: true,
            },
            {
                name: "Dance Shoes - Men",
                description: "Professional grade dance shoes for men. Leather sole.",
                price: 8500,
                compareAtPrice: 12000,
                sku: "SL-SHOE-M-001",
                inventoryQuantity: 20,
                trackInventory: true,
                category: "Footwear",
                status: "ACTIVE",
                primaryImage: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80",
                hasVariants: false,
                requiresShipping: true,
            },
            {
                name: "Dance Shoes - Women",
                description: "Elegant and comfortable dance shoes for women.",
                price: 8500,
                compareAtPrice: 12000,
                sku: "SL-SHOE-W-001",
                inventoryQuantity: 20,
                trackInventory: true,
                category: "Footwear",
                status: "ACTIVE",
                primaryImage: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80",
                hasVariants: false,
                requiresShipping: true,
            }
        ];

        // Get an admin user to attribute creation to
        const user = await ctx.db.query("users").first();

        let userId;
        if (user) {
            userId = user._id;
        } else {
            userId = await ctx.db.insert("users", {
                email: "admin@stepperslife.com",
                name: "System Admin",
                role: "admin",
                createdAt: Date.now(),
                updatedAt: Date.now()
            });
        }

        let createdCount = 0;

        for (const product of testProducts) {
            // Check if product already exists to avoid duplicates
            const existing = await ctx.db
                .query("products")
                .withIndex("by_sku", (q) => q.eq("sku", product.sku))
                .first();

            if (!existing) {
                await ctx.db.insert("products", {
                    ...product,
                    // @ts-ignore
                    status: product.status,
                    createdBy: userId,
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                });
                createdCount++;
            }
        }

        return `Restored ${createdCount} products.`;
    },
});
