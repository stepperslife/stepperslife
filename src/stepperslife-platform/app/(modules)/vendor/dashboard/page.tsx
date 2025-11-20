import { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  Store,
  Package,
  ShoppingCart,
  DollarSign,
  Star,
  TrendingUp,
  ArrowRight,
  AlertCircle,
  Plus,
} from 'lucide-react'
import { getCurrentUser } from '@/lib/auth'
import { getVendorStores, getVendorStoreStats } from '@/lib/store/queries'

export const metadata: Metadata = {
  title: 'Vendor Dashboard | SteppersLife',
  description: 'Manage your store, products, and orders',
}

export default async function VendorDashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/auth/signin?callbackUrl=/vendor/dashboard')
  }

  const stores = await getVendorStores(user.id)

  // If no store, show setup prompt
  if (stores.length === 0) {
    return (
      <div className="container py-12">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-lg border border-dashed p-12 text-center">
            <Store className="mx-auto h-16 w-16 text-muted-foreground" />
            <h1 className="mt-4 text-2xl font-bold">Welcome to Vendor Dashboard</h1>
            <p className="mt-2 text-muted-foreground">
              You don't have a store yet. Create one to start selling your products.
            </p>
            <Link
              href="/settings"
              className="mt-6 inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              Create Your Store
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Get the first (primary) store
  const store = stores[0]
  const stats = await getVendorStoreStats(store.id)

  return (
    <div className="container py-12">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold">{store.name}</h1>
              <p className="mt-2 text-muted-foreground">
                Manage your store, products, and orders
              </p>
            </div>
            <Link
              href={`/stores/${store.slug}`}
              className="inline-flex h-9 items-center gap-2 rounded-md border px-4 text-sm hover:bg-accent"
            >
              View Store
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {/* Total Products */}
          <div className="rounded-lg border bg-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Products
                </p>
                <p className="mt-2 text-3xl font-bold">
                  {stats?.totalProducts || 0}
                </p>
              </div>
              <Package className="h-10 w-10 text-muted-foreground" />
            </div>
            {stats && stats.draftProducts > 0 && (
              <p className="mt-4 text-xs text-muted-foreground">
                {stats.draftProducts} drafts
              </p>
            )}
          </div>

          {/* Total Orders */}
          <div className="rounded-lg border bg-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Orders
                </p>
                <p className="mt-2 text-3xl font-bold">
                  {stats?.totalOrders || 0}
                </p>
              </div>
              <ShoppingCart className="h-10 w-10 text-muted-foreground" />
            </div>
            {stats && stats.pendingOrders > 0 && (
              <p className="mt-4 text-xs text-yellow-600 dark:text-yellow-400">
                {stats.pendingOrders} pending
              </p>
            )}
          </div>

          {/* Total Revenue */}
          <div className="rounded-lg border bg-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Revenue
                </p>
                <p className="mt-2 text-3xl font-bold">
                  ${(Number(stats?.totalSales || 0) / 100).toFixed(2)}
                </p>
              </div>
              <DollarSign className="h-10 w-10 text-muted-foreground" />
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Withdrawal: ${(Number(stats?.withdrawBalance || 0) / 100).toFixed(2)}
            </p>
          </div>

          {/* Average Rating */}
          <div className="rounded-lg border bg-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Average Rating
                </p>
                <p className="mt-2 text-3xl font-bold">
                  {stats?.averageRating
                    ? Number(stats.averageRating).toFixed(1)
                    : 'N/A'}
                </p>
              </div>
              <Star className="h-10 w-10 text-muted-foreground" />
            </div>
            {stats && stats.totalReviews > 0 && (
              <p className="mt-4 text-xs text-muted-foreground">
                {stats.totalReviews} reviews
              </p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <Link
            href="/vendor/products/new"
            className="group rounded-lg border bg-card p-6 hover:border-primary transition-colors"
          >
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-primary/10 p-3">
                <Plus className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold group-hover:text-primary">
                  Add Product
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Create a new product listing
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/vendor/products"
            className="group rounded-lg border bg-card p-6 hover:border-primary transition-colors"
          >
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-primary/10 p-3">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold group-hover:text-primary">
                  Manage Products
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Edit, publish, or delete products
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/vendor/orders"
            className="group rounded-lg border bg-card p-6 hover:border-primary transition-colors"
          >
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-primary/10 p-3">
                <ShoppingCart className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold group-hover:text-primary">
                  View Orders
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Process and fulfill orders
                </p>
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Activity / Low Stock Alerts */}
        {stats && stats.lowStockProducts.length > 0 && (
          <div className="rounded-lg border bg-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              <h2 className="text-lg font-semibold">Low Stock Alert</h2>
            </div>
            <div className="space-y-3">
              {stats.lowStockProducts.map((product: any) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Only {product.quantity} left in stock
                    </p>
                  </div>
                  <Link
                    href={`/vendor/products/${product.id}/edit`}
                    className="text-sm text-primary hover:underline"
                  >
                    Update Stock
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
