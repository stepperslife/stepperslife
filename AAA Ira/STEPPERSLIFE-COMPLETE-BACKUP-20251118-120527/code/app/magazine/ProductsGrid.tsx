import React from "react";
import Image from "next/image";
import Link from "next/link";
import { DollarSign, Store } from "lucide-react";
import { InFeedAd } from "@/app/components/ads/InFeedAd";

interface MagazineProduct {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  imageUrl: string;
  category: string;
  price: number;
  storeName: string;
  storeId: string;
  isFeatured: boolean;
  publishedAt: string;
}

interface ProductsGridProps {
  products: MagazineProduct[];
}

export function ProductsGrid({ products }: ProductsGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center rounded-lg border border-dashed">
        <div className="text-center">
          <p className="text-lg font-medium">No products found</p>
          <p className="text-sm text-muted-foreground">
            Check back soon for featured products from our stores
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product, index) => (
        <React.Fragment key={product.id}>
          {/* Show in-feed ad after every 6 products */}
          {index > 0 && index % 6 === 0 && (
            <div className="sm:col-span-2 lg:col-span-3">
              <InFeedAd />
            </div>
          )}
          <Link
            href={`/stores/${product.storeId}/products/${product.slug}`}
            className="group"
          >
            <article className="overflow-hidden rounded-lg border bg-card transition-all hover:shadow-xl">
              <div className="relative aspect-[16/9] overflow-hidden">
                <Image
                  src={product.imageUrl}
                  alt={product.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {product.isFeatured && (
                  <div className="absolute right-3 top-3">
                    <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                      Featured
                    </span>
                  </div>
                )}
                <div className="absolute left-3 top-3">
                  <span className="rounded-full bg-background/90 px-3 py-1 text-xs font-semibold">
                    {product.category}
                  </span>
                </div>
              </div>

              <div className="p-5">
                <h3 className="mb-2 text-xl font-bold group-hover:text-primary">
                  {product.title}
                </h3>
                <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
                  {product.excerpt}
                </p>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Store className="h-4 w-4" />
                      <span>{product.storeName}</span>
                    </div>
                    <div className="flex items-center gap-1 font-bold text-primary">
                      <DollarSign className="h-4 w-4" />
                      <span>{product.price.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          </Link>
        </React.Fragment>
      ))}
    </div>
  );
}
