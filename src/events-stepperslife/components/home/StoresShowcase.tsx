import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tag } from "lucide-react";

interface Product {
  _id: string;
  name: string;
  description?: string;
  price: number;
  compareAtPrice?: number;
  images?: string[];
  category?: string;
  isActive?: boolean;
}

interface StoresShowcaseProps {
  products: Product[];
}

export function StoresShowcase({ products }: StoresShowcaseProps) {
  const displayProducts = products.slice(0, 6);

  if (displayProducts.length === 0) {
    return null;
  }

  return (
    <section className="bg-background py-16">
      <div className="container px-4 mx-auto">
        <div className="mb-10 flex flex-wrap items-start justify-between gap-4">
          <div className="flex-1 min-w-[250px]">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Steppers Store
            </h2>
            <p className="mt-2 text-muted-foreground">
              Find everything you need for the dance floor
            </p>
          </div>
          <Button asChild variant="outline" className="flex-shrink-0">
            <Link href="/marketplace">Browse Marketplace</Link>
          </Button>
        </div>

        <div className="grid gap-6 grid-cols-2 lg:grid-cols-3">
          {displayProducts.map((product) => {
            const imageUrl = product.images?.[0] || "/images/product-placeholder.jpg";

            return (
              <Link
                key={product._id}
                href={`/marketplace/${product._id}`}
                className="group"
              >
                <article className="overflow-hidden rounded-lg border bg-card transition-all hover:shadow-lg">
                  <div className="relative aspect-square overflow-hidden">
                    <Image
                      src={imageUrl}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      unoptimized={imageUrl.startsWith("http")}
                    />
                    {product.compareAtPrice && product.compareAtPrice > product.price && (
                      <div className="absolute left-2 top-2">
                        <span className="rounded-full bg-destructive px-2 py-1 text-xs font-semibold text-destructive-foreground">
                          SALE
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <p className="mb-1 text-xs text-muted-foreground">
                      SteppersLife
                    </p>
                    <h3 className="mb-2 line-clamp-2 text-sm font-semibold group-hover:text-primary">
                      {product.name}
                    </h3>

                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold">
                        ${product.price.toFixed(2)}
                      </span>
                      {product.compareAtPrice && product.compareAtPrice > product.price && (
                        <span className="text-sm text-muted-foreground line-through">
                          ${product.compareAtPrice.toFixed(2)}
                        </span>
                      )}
                    </div>

                    {product.category && (
                      <div className="mt-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-xs">
                          <Tag className="h-3 w-3" />
                          {product.category}
                        </span>
                      </div>
                    )}
                  </div>
                </article>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
