import { NextRequest, NextResponse } from 'next/server';

// Fetch products from stores subdomain
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const limit = searchParams.get('limit') || '20';
    const featured = searchParams.get('featured') === 'true';

    // Build the stores API URL
    const storesApiUrl = process.env.NEXT_PUBLIC_STORES_API || 'http://localhost:3008/api';
    const url = new URL(`${storesApiUrl}/products/filter`);

    // Add query parameters
    url.searchParams.append('limit', limit);
    if (category) {
      url.searchParams.append('category', category);
    }
    if (featured) {
      url.searchParams.append('featured', 'true');
    }

    // Fetch products from stores subdomain
    const response = await fetch(url.toString(), {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Disable caching for fresh product data
    });

    if (!response.ok) {
      throw new Error(`Stores API returned ${response.status}`);
    }

    const data = await response.json();

    interface StoreProduct {
      id: string;
      name: string;
      slug: string;
      description?: string;
      images?: Array<{ url: string }>;
      imageUrl?: string;
      category?: string;
      price: number;
      storeName: string;
      storeId: string;
      isFeatured?: boolean;
      createdAt?: string;
    }

    // Transform products into magazine-friendly format
    const magazineProducts = data.products?.map((product: StoreProduct) => ({
      id: product.id,
      title: product.name,
      slug: product.slug,
      excerpt: product.description?.substring(0, 200) || '',
      imageUrl: product.images?.[0]?.url || product.imageUrl || '/placeholder-product.jpg',
      category: product.category || 'Products',
      price: product.price,
      storeName: product.storeName,
      storeId: product.storeId,
      isFeatured: product.isFeatured || false,
      publishedAt: product.createdAt || new Date().toISOString(),
    })) || [];

    return NextResponse.json({
      products: magazineProducts,
      pagination: {
        total: data.pagination?.total || magazineProducts.length,
        limit: parseInt(limit),
        offset: 0,
        hasMore: data.pagination?.hasMore || false,
      },
    });
  } catch (error) {
    console.error('Error fetching products from stores:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch products from stores subdomain',
        products: [],
        pagination: { total: 0, limit: 20, offset: 0, hasMore: false }
      },
      { status: 500 }
    );
  }
}
