import { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ShoppingCart, Package, Eye, Calendar } from 'lucide-react'
import { getCurrentUser } from '@/lib/auth'
import { getVendorStores, getVendorOrders } from '@/lib/store/queries'
import { format } from 'date-fns'

export const metadata: Metadata = {
  title: 'Orders | Vendor Dashboard',
  description: 'Manage customer orders',
}

export default async function VendorOrdersPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/auth/signin?callbackUrl=/vendor/orders')
  }

  const stores = await getVendorStores(user.id)

  if (stores.length === 0) {
    redirect('/vendor/dashboard')
  }

  const store = stores[0]
  const orders = await getVendorOrders(store.id)

  return (
    <div className="container py-12">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Orders</h1>
          <p className="mt-2 text-muted-foreground">
            View and manage customer orders
          </p>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="rounded-lg border border-dashed p-12 text-center">
            <ShoppingCart className="mx-auto h-16 w-16 text-muted-foreground" />
            <h2 className="mt-4 text-xl font-semibold">No orders yet</h2>
            <p className="mt-2 text-muted-foreground">
              Orders will appear here when customers purchase your products
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const statusColors = {
                PENDING: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400',
                PROCESSING: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400',
                SHIPPED: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400',
                DELIVERED: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400',
                CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400',
                REFUNDED: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
              }

              return (
                <div
                  key={order.id}
                  className="rounded-lg border bg-card p-6 transition-all hover:shadow-md"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold">
                          #{order.orderNumber}
                        </h3>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            statusColors[order.status as keyof typeof statusColors]
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {order.customer.name || order.customer.email}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-lg font-bold">
                        ${(Number(order.total) / 100).toFixed(2)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {order.storeOrderItems.length}{' '}
                        {order.storeOrderItems.length === 1 ? 'item' : 'items'}
                      </p>
                    </div>
                  </div>

                  {/* Order Items Summary */}
                  <div className="mb-4 space-y-2 rounded-lg bg-muted/50 p-4">
                    {order.storeOrderItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <span>
                          {item.productName} × {item.quantity}
                        </span>
                        <span className="font-medium">
                          ${((Number(item.price) * item.quantity) / 100).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Order Meta */}
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {format(new Date(order.createdAt), 'MMM d, yyyy')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      <span>
                        {order.paymentStatus === 'PAID' ? 'Paid' : 'Pending payment'}
                      </span>
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div className="mt-4 rounded-lg border p-4">
                    <p className="text-sm font-medium mb-2">Shipping Address</p>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>{order.shippingName}</p>
                      <p>{order.shippingAddress1}</p>
                      {order.shippingAddress2 && <p>{order.shippingAddress2}</p>}
                      <p>
                        {order.shippingCity}, {order.shippingState}{' '}
                        {order.shippingZip}
                      </p>
                      {order.shippingPhone && <p>{order.shippingPhone}</p>}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 flex gap-2">
                    <Link
                      href={`/orders/${order.id}`}
                      className="inline-flex h-9 items-center gap-2 rounded-md border px-4 text-sm hover:bg-accent"
                    >
                      <Eye className="h-4 w-4" />
                      View Details
                    </Link>
                    {/* TODO: Add status update actions */}
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
