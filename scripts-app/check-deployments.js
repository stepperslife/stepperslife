
const { ConvexHttpClient } = require("convex/browser");
const { api } = require("../convex/_generated/api");
require("dotenv").config({ path: ".env.local" });

async function checkAllDeployments() {
    // Check the URL currently in .env.local (likely the dev one)
    const devUrl = "https://dazzling-mockingbird-241.convex.cloud";
    const prodUrl = "https://neighborly-swordfish-681.convex.cloud";

    console.log("Checking products on DEV deployment:", devUrl);
    try {
        const clientDev = new ConvexHttpClient(devUrl);
        const productsDev = await clientDev.query(api.products.queries.getActiveProducts);
        console.log(`- Found ${productsDev.length} active products on DEV.`);
        if (productsDev.length > 0) {
            productsDev.forEach(p => console.log(`  - ${p.name} (${p.status})`));
        }
    } catch (e) {
        console.log("- Error checking DEV:", e.message);
    }

    console.log("\nChecking products on PROD deployment:", prodUrl);
    try {
        const clientProd = new ConvexHttpClient(prodUrl);
        const productsProd = await clientProd.query(api.products.queries.getActiveProducts);
        console.log(`- Found ${productsProd.length} active products on PROD.`);
        if (productsProd.length > 0) {
            productsProd.forEach(p => console.log(`  - ${p.name} (${p.status})`));
        }
    } catch (e) {
        console.log("- Error checking PROD:", e.message);
    }
}

checkAllDeployments();
