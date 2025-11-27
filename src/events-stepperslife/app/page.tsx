import { Suspense } from "react";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { HomePageContent } from "@/components/homepage/HomePageContent";
import { ProductsSection } from "@/components/homepage/ProductsSection";

// Initialize Convex client for server-side data fetching
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL!;
const convex = new ConvexHttpClient(convexUrl);

// Force dynamic rendering - always fetch fresh data (no static caching)
// This ensures events appear immediately after being published
export const dynamic = "force-dynamic";
export const revalidate = 0; // Disable ISR caching

// Helper function to fetch with timeout
async function fetchWithTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = 10000,
  fallback: T
): Promise<T> {
  const timeoutPromise = new Promise<T>((_, reject) =>
    setTimeout(() => reject(new Error("Query timeout")), timeoutMs)
  );
  
  try {
    return await Promise.race([promise, timeoutPromise]);
  } catch (error) {
    console.error("[HomePage] Query error:", error);
    return fallback;
  }
}

// Server Component - fetches data at build time or on request
export default async function Home() {
  // Fetch upcoming events on the server with timeout and error handling
  const events = await fetchWithTimeout(
    convex.query(api.public.queries.getPublishedEvents, { limit: 100 }),
    10000,
    []
  );

  // Fetch active products on the server with timeout and error handling
  const products = await fetchWithTimeout(
    convex.query(api.products.queries.getActiveProducts),
    10000,
    []
  );

  // Remove duplicates (just in case)
  const uniqueEvents = events.filter(
    (event, index, self) => index === self.findIndex((e) => e._id === event._id)
  );

  return (
    <>
      <PublicHeader />
      <div className="min-h-screen bg-background">
        {/* Client Island: Interactive event browsing */}
        <Suspense fallback={<LoadingSkeleton />}>
          <HomePageContent initialEvents={uniqueEvents} />
        </Suspense>

        {/* Server Component: Products section */}
        <Suspense fallback={null}>
          <ProductsSection products={products} />
        </Suspense>

        {/* Footer */}
        <PublicFooter />
      </div>
    </>
  );
}

// Loading skeleton for better UX
function LoadingSkeleton() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8 h-32 bg-muted rounded-lg animate-pulse"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-64 bg-muted rounded-lg animate-pulse"></div>
        ))}
      </div>
    </main>
  );
}
