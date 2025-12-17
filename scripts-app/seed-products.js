
const { ConvexHttpClient } = require("convex/browser");
const { api } = require("../convex/_generated/api");
require("dotenv").config({ path: ".env.local" });

// Hardcode the production URL we found
const CONVEX_URL = "https://neighborly-swordfish-681.convex.cloud";

const client = new ConvexHttpClient(CONVEX_URL);

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
        primaryImage: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80"
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
        primaryImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=800&q=80"
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
        primaryImage: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80"
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
        primaryImage: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80"
    }
];

async function seedProducts() {
    console.log(`Seeding products to ${CONVEX_URL}...`);

    for (const product of testProducts) {
        try {
            console.log(`Creating ${product.name}...`);
            // We use the mutation directly. 
            // Note: In a real app, we might need admin auth, but for now we'll try calling it directly.
            // If this fails due to auth, we might need to use an internal mutation or set up auth headers.
            // However, createProduct usually requires auth.

            // Let's check if we can use internal mutation or if we need to fake a user.
            // For now, let's try to call it. If it fails, we'll know.

            const productId = await client.mutation(api.products.mutations.createProduct, product);
            console.log(`Created product ${productId}`);
        } catch (error) {
            console.error(`Failed to create ${product.name}:`, error.message);
        }
    }
    console.log("Done seeding.");
}

seedProducts();
