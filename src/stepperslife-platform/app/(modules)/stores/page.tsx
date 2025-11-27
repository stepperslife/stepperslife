import { Metadata } from 'next'
import Link from 'next/link'
import { getActiveVendorStores } from '@/lib/store'
import { Store, Star, ShoppingBag, CheckCircle, Plus } from 'lucide-react'
import { getCurrentUser } from '@/lib/auth'

export const metadata: Metadata = {
  title: 'Browse Stores | SteppersLife',
  description: 'Discover unique products from our community of vendors',
}

export default async function StoresPage() {
  const stores = await getActiveVendorStores()
  const user = await getCurrentUser()

  const isVendor = user?.role === 'ADMIN' || user?.role === 'VENDOR'

  // Determine the button props based on user role
  const getButtonProps = () => {
    if (!user) {
      return {
        href: '/auth?redirect=/settings',
        text: 'Open a Store',
      }
    }
    if (isVendor) {
      return {
        href: '/vendor/dashboard',
        text: 'My Store',
      }
    }
    return {
      href: '/settings',
      text: 'Become a Vendor',
    }
  }

  const buttonProps = getButtonProps()

  return (
    <div className="container py-12">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Browse Stores</h1>
            <p className="mt-2 text-muted-foreground">
              Discover unique products from our community of vendors
            </p>
          </div>
          <Link
            href={buttonProps.href}
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <Plus className="h-4 w-4" />
            {buttonProps.text}
          </Link>
        </div>

        {/* Stores Grid */}
        {stores.length === 0 ? (
          <div className="rounded-lg border border-dashed p-12 text-center">
            <Store className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 font-medium">No stores yet</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Be the first to open a store on SteppersLife
            </p>
            <Link
              href="/settings"
              className="mt-4 inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
            >
              Open Your Store
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {stores.map((store) => (
              <Link
                key={store.id}
                href={`/stores/${store.slug}`}
                className="group rounded-lg border bg-card transition-all hover:shadow-lg"
              >
                {/* Store Banner/Logo */}
                <div className="relative aspect-[16/9] overflow-hidden rounded-t-lg bg-gradient-to-br from-primary/20 to-primary/5">
                  {store.bannerUrl ? (
                    <img
                      src={store.bannerUrl}
                      alt={store.name}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  ) : store.logoUrl ? (
                    <div className="flex h-full items-center justify-center">
                      <img
                        src={store.logoUrl}
                        alt={store.name}
                        className="h-24 w-24 object-contain"
                      />
                    </div>
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Store className="h-16 w-16 text-muted-foreground" />
                    </div>
                  )}

                  {/* Verified Badge */}
                  {store.isVerified && (
                    <div className="absolute right-3 top-3 rounded-full bg-primary px-2 py-1 text-xs font-medium text-primary-foreground shadow-lg">
                      <CheckCircle className="inline-block h-3 w-3 mr-1" />
                      Verified
                    </div>
                  )}
                </div>

                {/* Store Info */}
                <div className="p-4">
                  <h3 className="font-semibold group-hover:text-primary">
                    {store.name}
                  </h3>

                  {store.tagline && (
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                      {store.tagline}
                    </p>
                  )}

                  {/* Stats */}
                  <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                    {/* Rating */}
                    {store.averageRating && store.totalReviews > 0 ? (
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium text-foreground">
                          {Number(store.averageRating).toFixed(1)}
                        </span>
                        <span>({store.totalReviews})</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4" />
                        <span>New</span>
                      </div>
                    )}

                    {/* Products Count */}
                    <div className="flex items-center gap-1">
                      <ShoppingBag className="h-4 w-4" />
                      <span>{store.totalProducts} products</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Call to Action */}
        {stores.length > 0 && (
          <div className="mt-12 rounded-lg border bg-muted/50 p-8 text-center">
            <h2 className="text-xl font-semibold">Want to Sell on SteppersLife?</h2>
            <p className="mt-2 text-muted-foreground">
              Join our community of vendors and start selling your products today
            </p>
            <Link
              href="/settings"
              className="mt-4 inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
            >
              Open Your Store
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
