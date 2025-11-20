import { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Plus, Package, Eye, Edit, Trash2, AlertCircle } from 'lucide-react'
import { getCurrentUser } from '@/lib/auth'
import { getVendorStores, getVendorProducts } from '@/lib/store/queries'
import { deleteProduct, toggleProductStatus } from '@/lib/store/actions'

export const metadata: Metadata = {
  title: 'My Products | Vendor Dashboard',
  description: 'Manage your product listings',
}

export default async function VendorProductsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/auth/signin?callbackUrl=/vendor/products')
  }

  const stores = await getVendorStores(user.id)

  if (stores.length === 0) {
    redirect('/vendor/dashboard')
  }

  const store = stores[0]
  const products = await getVendorProducts(store.id)

  return (
    <div className="container py-12">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">Products</h1>
            <p className="mt-2 text-muted-foreground">
              Manage your product listings
            </p>
          </div>
          <Link
            href="/vendor/products/new"
            className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Add Product
          </Link>
        </div>

        {/* Products List */}
        {products.length === 0 ? (
          <div className="rounded-lg border border-dashed p-12 text-center">
            <Package className="mx-auto h-16 w-16 text-muted-foreground" />
            <h2 className="mt-4 text-xl font-semibold">No products yet</h2>
            <p className="mt-2 text-muted-foreground">
              Create your first product to start selling
            </p>
            <Link
              href="/vendor/products/new"
              className="mt-6 inline-flex h-10 items-center gap-2 rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              Create Product
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {products.map((product) => {
              const image = product.productImages[0]
              const isLowStock =
                product.trackInventory &&
                product.quantity <= product.lowStockThreshold

              return (
                <div
                  key={product.id}
                  className="rounded-lg border bg-card p-6 transition-all hover:shadow-md"
                >
                  <div className="flex gap-6">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      {image ? (
                        <img
                          src={image.url}
                          alt={product.name}
                          className="h-24 w-24 rounded-md object-cover"
                        />
                      ) : (
                        <div className="flex h-24 w-24 items-center justify-center rounded-md bg-muted">
                          <Package className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between">
                          <div>
                            <Link
                              href={`/stores/${store.slug}/products/${product.slug}`}
                              className="text-lg font-semibold hover:text-primary"
                            >
                              {product.name}
                            </Link>
                            {product.sku && (
                              <p className="text-sm text-muted-foreground">
                                SKU: {product.sku}
                              </p>
                            )}
                          </div>

                          {/* Status Badge */}
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                              product.status === 'ACTIVE'
                                ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400'
                                : product.status === 'DRAFT'
                                ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                                : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400'
                            }`}
                          >
                            {product.status}
                          </span>
                        </div>

                        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                          {product.description}
                        </p>
                      </div>

                      {/* Product Meta */}
                      <div className="mt-4 flex items-center gap-6 text-sm">
                        <div>
                          <span className="text-muted-foreground">Price:</span>{' '}
                          <span className="font-medium">
                            ${(Number(product.price) / 100).toFixed(2)}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Stock:</span>{' '}
                          <span
                            className={`font-medium ${
                              isLowStock ? 'text-destructive' : ''
                            }`}
                          >
                            {product.quantity}
                            {isLowStock && (
                              <AlertCircle className="ml-1 inline h-3 w-3" />
                            )}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Sales:</span>{' '}
                          <span className="font-medium">
                            {product.salesCount}
                          </span>
                        </div>
                        {product._count.productReviews > 0 && (
                          <div>
                            <span className="text-muted-foreground">
                              Reviews:
                            </span>{' '}
                            <span className="font-medium">
                              {product._count.productReviews}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <Link
                        href={`/stores/${store.slug}/products/${product.slug}`}
                        className="inline-flex h-9 items-center justify-center gap-2 rounded-md border px-3 text-sm hover:bg-accent"
                        title="View product"
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </Link>
                      <Link
                        href={`/vendor/products/${product.id}/edit`}
                        className="inline-flex h-9 items-center justify-center gap-2 rounded-md border px-3 text-sm hover:bg-accent"
                        title="Edit product"
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </Link>
                      <form action={deleteProduct.bind(null, product.id)}>
                        <button
                          type="submit"
                          className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-md border border-destructive px-3 text-sm text-destructive hover:bg-destructive/10"
                          title="Delete product"
                          onClick={(e) => {
                            if (
                              !confirm(
                                'Are you sure you want to delete this product? This action cannot be undone.'
                              )
                            ) {
                              e.preventDefault()
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
