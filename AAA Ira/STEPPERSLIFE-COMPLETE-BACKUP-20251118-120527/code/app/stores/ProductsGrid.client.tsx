"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { StoreProduct } from "@/lib/types/aggregated-content";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { InFeedAd } from "@/app/components/ads/InFeedAd";

interface ProductsGridProps {
  products: StoreProduct[];
}

export function ProductsGridClient({ products }: ProductsGridProps) {
  const handleAddToCart = (e: React.MouseEvent, product: StoreProduct) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation();
    // TODO: Implement actual cart functionality
    console.log("Adding to cart:", product);
    alert(`Added ${product.name} to cart!`);
  };

  if (products.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center rounded-lg border border-dashed">
        <div className="text-center">
          <p className="text-lg font-medium">No products found</p>
          <p className="text-sm text-muted-foreground">
            Try adjusting your filters
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product, index) => {
        // Handle images - could be string or array
        const firstImage = product.images?.[0];
        let imageUrl = '/placeholder-product.jpg';

        if (typeof firstImage === 'string') {
          imageUrl = firstImage;
        } else if (firstImage && typeof firstImage === 'object' && 'url' in firstImage) {
          imageUrl = (firstImage as { url: string }).url;
        }

        return (
          <React.Fragment key={product.id}>
            {/* Show in-feed ad after every 6 products */}
            {index > 0 && index % 6 === 0 && (
              <div className="sm:col-span-2 lg:col-span-3 xl:col-span-4">
                <InFeedAd />
              </div>
            )}
            <article className="group overflow-hidden rounded-lg border bg-card transition-all hover:shadow-xl">
              <Link href={`/stores/${product.slug}`} className="block">
                <div className="relative aspect-square overflow-hidden">
                  <Image
                    src={imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    unoptimized={imageUrl.startsWith('http')}
                  />
                  {!product.inStock && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                      <span className="rounded-full bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground">
                        Out of Stock
                      </span>
                    </div>
                  )}
                  {product.compareAtPrice && product.compareAtPrice > product.price && (
                    <div className="absolute right-3 top-3">
                      <span className="rounded-full bg-green-500 px-3 py-1 text-xs font-semibold text-white">
                        Sale
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <div className="mb-1">
                    <span className="text-xs text-muted-foreground">
                      {product.category}
                    </span>
                  </div>
                  <h3 className="mb-2 font-bold group-hover:text-primary">
                    {product.name}
                  </h3>
                  <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
                    {product.description}
                  </p>

                  <div className="mb-3 text-xs text-muted-foreground">
                    by {product.vendorName}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-2xl font-bold">
                        ${product.price.toFixed(2)}
                      </span>
                      {product.compareAtPrice && product.compareAtPrice > product.price && (
                        <span className="text-sm text-muted-foreground line-through">
                          ${product.compareAtPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
              {/* Add to cart button outside the link */}
              <div className="px-4 pb-4">
                <Button
                  size="sm"
                  disabled={!product.inStock}
                  onClick={(e) => handleAddToCart(e, product)}
                  className="w-full"
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Add to Cart
                </Button>
              </div>
            </article>
          </React.Fragment>
        );
      })}
    </div>
  );
}
