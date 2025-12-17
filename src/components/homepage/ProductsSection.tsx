import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  primaryImage?: string;
  trackInventory?: boolean;
  inventoryQuantity?: number;
}

interface ProductsSectionProps {
  products: Product[];
}

export function ProductsSection({ products }: ProductsSectionProps) {
  const hasProducts = products && products.length > 0;

  return (
    <section className="container mx-auto px-4 py-16">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-foreground dark:text-white flex items-center gap-2">
            <ShoppingBag className="w-8 h-8 text-primary" />
            Marketplace
          </h2>
          <p className="text-muted-foreground mt-2">
            Browse our exclusive stepping merchandise and products
          </p>
        </div>
        <Link href="/marketplace" className="text-primary hover:underline font-medium">
          Visit Marketplace →
        </Link>
      </div>

      {!hasProducts ? (
        <div className="text-center py-12 bg-muted/30 rounded-xl">
          <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Marketplace Coming Soon
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            We&apos;re working on bringing you exclusive stepping merchandise and products from local vendors.
          </p>
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            <ShoppingBag className="w-5 h-5" />
            Explore Marketplace
          </Link>
        </div>
      ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.slice(0, 8).map((product) => (
          <div
            key={product._id}
            className="bg-card rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1 duration-200"
          >
            <Link href={`/marketplace/${product._id}`}>
              <div className="relative h-48 bg-muted">
                {product.primaryImage ? (
                  <Image
                    src={product.primaryImage}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingBag className="w-16 h-16 text-muted-foreground" />
                  </div>
                )}
                {product.compareAtPrice && product.compareAtPrice > product.price && (
                  <div className="absolute top-2 right-2 bg-destructive text-destructive-foreground px-2 py-1 rounded-md text-xs font-bold">
                    SALE
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-foreground dark:text-white mb-2 line-clamp-2">
                  {product.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {product.description}
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xl font-bold text-primary">
                      ${(product.price / 100).toFixed(2)}
                    </span>
                    {product.compareAtPrice && product.compareAtPrice > product.price && (
                      <span className="ml-2 text-sm text-muted-foreground line-through">
                        ${(product.compareAtPrice / 100).toFixed(2)}
                      </span>
                    )}
                  </div>
                  {product.trackInventory && (
                    <span
                      className={`text-xs ${product.inventoryQuantity && product.inventoryQuantity > 0 ? "text-success" : "text-destructive"}`}
                    >
                      {product.inventoryQuantity && product.inventoryQuantity > 0
                        ? `${product.inventoryQuantity} in stock`
                        : "Out of stock"}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
      )}
    </section>
  );
}
