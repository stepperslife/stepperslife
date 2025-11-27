import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getProductBySlug } from '@/lib/store'
import { Store, Star, CheckCircle, ChevronRight, ShoppingCart } from 'lucide-react'
import { AddToCartButton } from '@/components/store/add-to-cart-button'
import { ProductImageGallery } from '@/components/store/product-image-gallery'
import { ProductReviews } from '@/components/store/product-reviews'

interface ProductPageProps {
  params: {
    slug: string
    productSlug: string
  }
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await getProductBySlug(params.slug, params.productSlug)

  if (!product) {
    return {
      title: 'Product Not Found',
    }
  }

  return {
    title: `${product.name} | ${product.vendorStore.name} | SteppersLife`,
    description: product.description || `Buy ${product.name} from ${product.vendorStore.name}`,
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProductBySlug(params.slug, params.productSlug)

  if (!product) {
    notFound()
  }

  const store = product.vendorStore
  const hasVariants = product.hasVariants && product.productVariants.length > 0
  const hasImages = product.productImages.length > 0

  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <div className="border-b bg-muted/30">
        <div className="container py-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/stores" className="hover:text-primary">
              Stores
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link href={`/stores/${store.slug}`} className="hover:text-primary">
              {store.name}
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">{product.name}</span>
          </div>
        </div>
      </div>

      {/* Product Detail */}
      <div className="container py-12">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Left Column - Images */}
            <div>
              {hasImages ? (
                <ProductImageGallery images={product.productImages} />
              ) : (
                <div className="aspect-square rounded-lg border bg-muted flex items-center justify-center">
                  <Store className="h-24 w-24 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Right Column - Product Info */}
            <div>
              {/* Store Info */}
              <Link
                href={`/stores/${store.slug}`}
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
              >
                {store.logoUrl ? (
                  <img
                    src={store.logoUrl}
                    alt={store.name}
                    className="h-6 w-6 rounded object-cover"
                  />
                ) : (
                  <Store className="h-4 w-4" />
                )}
                <span>{store.name}</span>
                {store.isVerified && (
                  <CheckCircle className="h-4 w-4 text-primary" />
                )}
              </Link>

              {/* Product Name */}
              <h1 className="mt-3 text-3xl font-bold">{product.name}</h1>

              {/* Rating */}
              {product.averageRating && product.reviewCount > 0 ? (
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(Number(product.averageRating))
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-muted'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium">
                    {Number(product.averageRating).toFixed(1)}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    ({product.reviewCount} reviews)
                  </span>
                </div>
              ) : null}

              {/* Price */}
              <div className="mt-6 flex items-baseline gap-3">
                <span className="text-3xl font-bold">
                  ${(Number(product.price) / 100).toFixed(2)}
                </span>
                {product.compareAtPrice && (
                  <>
                    <span className="text-xl text-muted-foreground line-through">
                      ${(Number(product.compareAtPrice) / 100).toFixed(2)}
                    </span>
                    <span className="rounded-full bg-destructive/10 px-2 py-1 text-sm font-medium text-destructive">
                      {Math.round(
                        ((Number(product.compareAtPrice) - Number(product.price)) /
                          Number(product.compareAtPrice)) *
                          100
                      )}
                      % OFF
                    </span>
                  </>
                )}
              </div>

              {/* Sales Count */}
              {product.salesCount > 0 && (
                <p className="mt-2 text-sm text-muted-foreground">
                  {product.salesCount} sold
                </p>
              )}

              {/* Description */}
              <div className="mt-6">
                <h2 className="text-lg font-semibold">Description</h2>
                <p className="mt-2 text-muted-foreground whitespace-pre-wrap">
                  {product.description}
                </p>
              </div>

              {/* Variants (if any) */}
              {hasVariants && (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold">Variants</h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {product.productVariants.map((variant) => (
                      <button
                        key={variant.id}
                        className="rounded-md border px-4 py-2 text-sm hover:border-primary hover:bg-primary/5"
                      >
                        {variant.name}: {variant.value}
                        {variant.price && (
                          <span className="ml-2 font-medium">
                            +${(Number(variant.price) / 100).toFixed(2)}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Stock Status */}
              <div className="mt-6">
                {product.quantity > 0 ? (
                  <div className="flex items-center gap-2 text-sm">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <span className="text-green-700">
                      {product.quantity > 10 ? 'In Stock' : `Only ${product.quantity} left`}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm">
                    <div className="h-2 w-2 rounded-full bg-destructive" />
                    <span className="text-destructive">Out of Stock</span>
                  </div>
                )}
              </div>

              {/* Add to Cart Button */}
              <div className="mt-8">
                <AddToCartButton
                  productId={product.id}
                  productName={product.name}
                  price={Number(product.price)}
                  available={product.quantity > 0}
                />
              </div>

              {/* Additional Info */}
              <div className="mt-8 space-y-3 rounded-lg border p-4 text-sm">
                {product.sku && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">SKU:</span>
                    <span className="font-medium">{product.sku}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Category:</span>
                  <span className="font-medium">
                    {product.category.replace(/_/g, ' ')}
                  </span>
                </div>
                {product.tags.length > 0 && (
                  <div>
                    <span className="text-muted-foreground">Tags:</span>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {product.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-muted px-2 py-1 text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          {product.productReviews.length > 0 && (
            <div className="mt-16">
              <ProductReviews
                reviews={product.productReviews}
                averageRating={product.averageRating}
                reviewCount={product.reviewCount}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
