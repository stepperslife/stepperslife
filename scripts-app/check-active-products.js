
const { ConvexHttpClient } = require("convex/browser");
const { api } = require("../convex/_generated/api");
require("dotenv").config({ path: ".env.local" });

async function checkProducts() {
    const convexUrl = "https://neighborly-swordfish-681.convex.cloud";
    if (!convexUrl) {
        console.error("NEXT_PUBLIC_CONVEX_URL is not set");
        process.exit(1);
    }

    console.log(`Connecting to Convex: ${convexUrl}`);
    const convex = new ConvexHttpClient(convexUrl);

    try {
        console.log("Fetching all products...");
        // We can't use internal queries directly from outside, so we have to rely on public queries.
        // Let's try to use the getAllProducts query if it's available publicly or via admin auth.
        // Since we are in a script, we might not have admin auth easily.
        // But getActiveProducts is public.

        const activeProducts = await convex.query(api.products.queries.getActiveProducts);
        console.log(`Active Products Found: ${activeProducts.length}`);

        if (activeProducts.length > 0) {
            console.log("First 3 active products:", JSON.stringify(activeProducts.slice(0, 3), null, 2));
        } else {
            console.log("No active products found.");
        }

    } catch (error) {
        console.error("Error fetching products:", error);
    }
}

checkProducts();
