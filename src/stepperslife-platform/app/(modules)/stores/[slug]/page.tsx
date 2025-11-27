import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getVendorStoreBySlug } from '@/lib/store'
import { Store, Star, MapPin, Mail, Phone, CheckCircle } from 'lucide-react'

interface StorePageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: StorePageProps): Promise<Metadata> {
  const store = await getVendorStoreBySlug(params.slug)

  if (!store) {
    return {
      title: 'Store Not Found',
    }
  }

  return {
    title: `${store.name} | SteppersLife`,
    description: store.tagline || store.description || `Shop products from ${store.name}`,
  }
}

export default async function StorePage({ params }: StorePageProps) {
  const store = await getVendorStoreBySlug(params.slug)

  if (!store) {
    notFound()
  }

  return (
    <div className="min-h-screen">
      {/* Store Header */}
      <div className="border-b bg-muted/30">
        <div className="container py-8">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col gap-6 md:flex-row md:items-start">
              {/* Store Logo */}
              <div className="flex-shrink-0">
                {store.logoUrl ? (
                  <div className="h-24 w-24 overflow-hidden rounded-lg border bg-background">
                    <img
                      src={store.logoUrl}
                      alt={store.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-lg border bg-background">
                    <Store className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Store Info */}
              <div className="flex-1">
                <div className="flex items-start gap-3">
                  <h1 className="text-3xl font-bold">{store.name}</h1>
                  {store.isVerified && (
                    <div className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                      <CheckCircle className="inline-block h-3 w-3 mr-1" />
                      Verified
                    </div>
                  )}
                </div>

                {store.tagline && (
                  <p className="mt-2 text-lg text-muted-foreground">{store.tagline}</p>
                )}

                {store.description && (
                  <p className="mt-3 text-sm text-muted-foreground">{store.description}</p>
                )}

                {/* Store Stats */}
                <div className="mt-4 flex flex-wrap gap-4 text-sm">
                  {/* Rating */}
                  {store.averageRating && store.totalReviews > 0 ? (
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">
                        {Number(store.averageRating).toFixed(1)}
                      </span>
                      <span className="text-muted-foreground">
                        ({store.totalReviews} reviews)
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Star className="h-4 w-4" />
                      <span>No reviews yet</span>
                    </div>
                  )}
                </div>

                {/* Contact Info */}
                <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
                  {store.email && (
                    <a
                      href={`mailto:${store.email}`}
                      className="flex items-center gap-2 hover:text-primary"
                    >
                      <Mail className="h-4 w-4" />
                      {store.email}
                    </a>
                  )}
                  {store.phone && (
                    <a
                      href={`tel:${store.phone}`}
                      className="flex items-center gap-2 hover:text-primary"
                    >
                      <Phone className="h-4 w-4" />
                      {store.phone}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="container py-12">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-2xl font-bold mb-6">Products</h2>

          {store.products.length === 0 ? (
            <div className="rounded-lg border border-dashed p-12 text-center">
              <Store className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 font-medium">No products yet</p>
              <p className="mt-2 text-sm text-muted-foreground">
                This store is setting up. Check back soon!
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {store.products.map((product) => {
                const image = product.productImages[0]

                return (
                  <Link
                    key={product.id}
                    href={`/stores/${store.slug}/products/${product.slug}`}
                    className="group rounded-lg border bg-card transition-all hover:shadow-lg"
                  >
                    {/* Product Image */}
                    <div className="relative aspect-square overflow-hidden rounded-t-lg bg-muted">
                      {image ? (
                        <img
                          src={image.url}
                          alt={product.name}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Store className="h-16 w-16 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-4">
                      <h3 className="font-semibold line-clamp-2 group-hover:text-primary">
                        {product.name}
                      </h3>

                      {/* Price */}
                      <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-lg font-bold">
                          ${(Number(product.price) / 100).toFixed(2)}
                        </span>
                        {product.compareAtPrice && (
                          <span className="text-sm text-muted-foreground line-through">
                            ${(Number(product.compareAtPrice) / 100).toFixed(2)}
                          </span>
                        )}
                      </div>

                      {/* Rating */}
                      {product.averageRating && product.reviewCount > 0 ? (
                        <div className="mt-2 flex items-center gap-1 text-sm">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">
                            {Number(product.averageRating).toFixed(1)}
                          </span>
                          <span className="text-muted-foreground">
                            ({product.reviewCount})
                          </span>
                        </div>
                      ) : null}

                      {/* Sales Count */}
                      {product.salesCount > 0 && (
                        <p className="mt-2 text-xs text-muted-foreground">
                          {product.salesCount} sold
                        </p>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
