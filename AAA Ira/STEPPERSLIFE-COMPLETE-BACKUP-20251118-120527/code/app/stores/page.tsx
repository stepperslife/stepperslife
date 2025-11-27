import { ProductsGridClient } from "./ProductsGrid.client";
import { StoresFilters } from "./StoresFilters";
import { LeaderboardAd } from "@/app/components/ads/LeaderboardAd";
import { MobileBannerAd } from "@/app/components/ads/MobileBannerAd";
import { SidebarAd } from "@/app/components/ads/SidebarAd";
import { FooterBannerAd } from "@/app/components/ads/FooterBannerAd";
import { StoreProduct } from "@/lib/types/aggregated-content";

interface PageProps {
  searchParams: Promise<{
    category?: string;
    inStock?: string;
    search?: string;
    minPrice?: string;
    maxPrice?: string;
  }>;
}

export default async function StoresPage({ searchParams }: PageProps) {
  const params = await searchParams;

  interface ProductResponse {
    id: string;
    name: string;
    slug: string;
    price: number;
    description?: string;
    category: string;
    image: string;
    storeName: string;
    storeSlug: string;
    inStock?: boolean;
    compareAtPrice?: number;
  }

  // Fetch products directly from stores.stepperslife.com API
  let products: StoreProduct[] = [];
  let pagination = { total: 0, limit: 50, offset: 0, hasMore: false };

  try {
    const storesApiUrl = process.env.NEXT_PUBLIC_STORES_API || 'http://localhost:3008/api';
    const url = new URL(`${storesApiUrl}/products/filter`);

    url.searchParams.append('limit', '50');
    if (params.category) {
      url.searchParams.append('category', params.category);
    }
    if (params.inStock === 'true') {
      url.searchParams.append('inStock', 'true');
    }

    const response = await fetch(url.toString(), {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      // Transform API response to match StoreProduct type
      products = (data.products || []).map((p: ProductResponse) => ({
        ...p,
        images: [p.image], // Convert single image to array
        vendorName: p.storeName,
        vendorSlug: p.storeSlug,
        inStock: p.inStock ?? true,
      }));
      pagination = data.pagination || pagination;
    }
  } catch (error) {
    console.error('Failed to fetch products from stores subdomain:', error);
  }

  // Filter by search query and price range if provided
  let filteredProducts = params.search
    ? products.filter(
        (product) =>
          product.name.toLowerCase().includes(params.search!.toLowerCase()) ||
          (product.description && product.description.toLowerCase().includes(params.search!.toLowerCase()))
      )
    : products;

  // Apply price filters
  if (params.minPrice) {
    const minPrice = parseFloat(params.minPrice);
    filteredProducts = filteredProducts.filter((p) => p.price >= minPrice);
  }
  if (params.maxPrice) {
    const maxPrice = parseFloat(params.maxPrice);
    filteredProducts = filteredProducts.filter((p) => p.price <= maxPrice);
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="border-b bg-muted/30 py-16">
        <div className="container px-4">
          <h1 className="mb-4 text-4xl font-bold">Steppers Stores</h1>
          <p className="text-xl text-muted-foreground">
            Apparel, accessories, and gear for the Chicago Steppin community
          </p>
        </div>
      </section>

      {/* Ad: Top Leaderboard (Desktop) / Mobile Banner */}
      <LeaderboardAd />
      <MobileBannerAd />

      {/* Filters & Content */}
      <section className="container px-4 py-8">
        <div className="flex gap-8">
          {/* Main Content */}
          <div className="flex-1">
            <StoresFilters />
            <div className="mt-8">
              <p className="mb-6 text-sm text-muted-foreground">
                Showing {filteredProducts.length} of {pagination.total} products
              </p>
              <ProductsGridClient products={filteredProducts} />
            </div>
          </div>

          {/* Sidebar with Sticky Ad (Desktop only) */}
          <aside className="hidden lg:block lg:w-[300px]">
            <SidebarAd />
          </aside>
        </div>
      </section>

      {/* Ad: Footer Banner */}
      <FooterBannerAd />
    </div>
  );
}
