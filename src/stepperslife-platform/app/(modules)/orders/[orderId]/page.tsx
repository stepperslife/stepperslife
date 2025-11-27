import { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { CheckCircle, Package, Truck, Calendar, MapPin, CreditCard, ChevronRight } from 'lucide-react'
import { getCurrentUser } from '@/lib/auth'
import { getOrderById } from '@/lib/store/queries'
import { format } from 'date-fns'

interface OrderPageProps {
  params: {
    orderId: string
  }
  searchParams: {
    success?: string
  }
}

export async function generateMetadata({ params }: OrderPageProps): Promise<Metadata> {
  return {
    title: 'Order Confirmation | SteppersLife',
    description: 'Your order has been placed successfully',
  }
}

export default async function OrderPage({ params, searchParams }: OrderPageProps) {
  const user = await getCurrentUser()

  if (!user) {
    redirect(`/auth/signin?callbackUrl=/orders/${params.orderId}`)
  }

  const order = await getOrderById(params.orderId)

  if (!order || order.customerId !== user.id) {
    notFound()
  }

  const showSuccessBanner = searchParams.success === 'true'

  return (
    <div className="container py-12">
      <div className="mx-auto max-w-4xl">
        {/* Success Banner */}
        {showSuccessBanner && (
          <div className="mb-8 rounded-lg border border-green-500 bg-green-50 dark:bg-green-950 p-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              <div>
                <h2 className="text-xl font-semibold text-green-900 dark:text-green-100">
                  Order Placed Successfully!
                </h2>
                <p className="mt-1 text-sm text-green-700 dark:text-green-300">
                  Thank you for your purchase. Your order is being processed.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Order Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold">Order Details</h1>
              <p className="mt-2 text-muted-foreground">
                Order #{order.orderNumber}
              </p>
            </div>
            <div className="rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              {order.status}
            </div>
          </div>

          {/* Order Meta */}
          <div className="mt-6 grid gap-4 sm:grid-cols-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                Placed {format(new Date(order.createdAt), 'MMM d, yyyy')}
              </span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Package className="h-4 w-4" />
              <span>{order.storeOrderItems.length} items</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <CreditCard className="h-4 w-4" />
              <span className="capitalize">{order.paymentMethod || 'Pending'}</span>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_350px]">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Order Items */}
            <div className="rounded-lg border bg-card p-6">
              <h2 className="text-lg font-semibold mb-4">Order Items</h2>
              <div className="space-y-4">
                {order.storeOrderItems.map((item) => (
                  <div key={item.id} className="flex gap-4 pb-4 border-b last:border-0 last:pb-0">
                    <div className="flex-1">
                      <Link
                        href={`/stores/${order.vendorStore.slug}/products/${item.product.slug}`}
                        className="font-medium hover:text-primary"
                      >
                        {item.productName}
                      </Link>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        ${(Number(item.price) / 100).toFixed(2)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Total: ${((Number(item.price) * item.quantity) / 100).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="rounded-lg border bg-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <h2 className="text-lg font-semibold">Shipping Address</h2>
              </div>
              <div className="text-sm space-y-1">
                <p className="font-medium">{order.shippingName}</p>
                <p className="text-muted-foreground">{order.shippingAddress1}</p>
                {order.shippingAddress2 && (
                  <p className="text-muted-foreground">{order.shippingAddress2}</p>
                )}
                <p className="text-muted-foreground">
                  {order.shippingCity}, {order.shippingState} {order.shippingZip}
                </p>
                {order.shippingPhone && (
                  <p className="text-muted-foreground">{order.shippingPhone}</p>
                )}
              </div>
            </div>

            {/* Store Info */}
            <div className="rounded-lg border bg-card p-6">
              <h2 className="text-lg font-semibold mb-4">Vendor Store</h2>
              <div className="space-y-2 text-sm">
                <Link
                  href={`/stores/${order.vendorStore.slug}`}
                  className="font-medium hover:text-primary"
                >
                  {order.vendorStore.name}
                </Link>
                {order.vendorStore.email && (
                  <p className="text-muted-foreground">
                    Email: {order.vendorStore.email}
                  </p>
                )}
                {order.vendorStore.phone && (
                  <p className="text-muted-foreground">
                    Phone: {order.vendorStore.phone}
                  </p>
                )}
              </div>
            </div>

            {/* Order Notes */}
            {order.notes && (
              <div className="rounded-lg border bg-card p-6">
                <h2 className="text-lg font-semibold mb-4">Order Notes</h2>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {order.notes}
                </p>
              </div>
            )}
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="rounded-lg border bg-card p-6 space-y-4">
              <h2 className="text-lg font-semibold">Order Summary</h2>

              <div className="space-y-3 border-t pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">
                    ${(Number(order.subtotal) / 100).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium">
                    ${(Number(order.shippingCost) / 100).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span className="font-medium">
                    ${(Number(order.tax) / 100).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex justify-between border-t pt-4">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-lg font-bold">
                  ${(Number(order.total) / 100).toFixed(2)}
                </span>
              </div>

              {/* Payment Status */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Payment Status</span>
                  <span className={`font-medium ${
                    order.paymentStatus === 'PAID'
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-yellow-600 dark:text-yellow-400'
                  }`}>
                    {order.paymentStatus || 'Pending'}
                  </span>
                </div>
                {order.paidAt && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Paid on {format(new Date(order.paidAt), 'MMM d, yyyy')}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="border-t pt-4 space-y-2">
                <Link
                  href="/stores"
                  className="flex w-full items-center justify-center gap-2 rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent transition-colors"
                >
                  Continue Shopping
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
