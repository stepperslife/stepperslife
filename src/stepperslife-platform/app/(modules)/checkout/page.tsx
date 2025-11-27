import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { getUserCart } from '@/lib/store/queries'
import { CheckoutForm } from '@/components/store/checkout-form'

export const metadata: Metadata = {
  title: 'Checkout | SteppersLife',
  description: 'Complete your purchase',
}

export default async function CheckoutPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/auth/signin?callbackUrl=/checkout')
  }

  const cart = await getUserCart(user.id)

  if (!cart || cart.items.length === 0) {
    redirect('/cart')
  }

  return (
    <div className="container py-12">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Checkout</h1>
          <p className="mt-2 text-muted-foreground">
            Complete your order and choose your payment method
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          {/* Left: Checkout Form */}
          <div>
            <CheckoutForm cart={cart} user={user} />
          </div>

          {/* Right: Order Summary */}
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="rounded-lg border bg-card p-6 space-y-4">
              <h2 className="text-lg font-semibold">Order Summary</h2>

              {/* Items List */}
              <div className="space-y-3 border-t pt-4 max-h-[400px] overflow-y-auto">
                {cart.items.map((item) => {
                  const image = item.product.productImages[0]
                  const itemPrice = Number(item.price) / 100
                  const variantPrice = item.variant?.price
                    ? Number(item.variant.price) / 100
                    : 0
                  const totalPrice = (itemPrice + variantPrice) * item.quantity

                  return (
                    <div key={item.id} className="flex gap-3">
                      {/* Image */}
                      {image ? (
                        <img
                          src={image.url}
                          alt={item.product.name}
                          className="h-16 w-16 rounded object-cover"
                        />
                      ) : (
                        <div className="h-16 w-16 rounded bg-muted" />
                      )}

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {item.product.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.product.vendorStore.name}
                        </p>
                        {item.variant && (
                          <p className="text-xs text-muted-foreground">
                            {item.variant.name}: {item.variant.value}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Qty: {item.quantity}
                        </p>
                      </div>

                      {/* Price */}
                      <div className="text-sm font-medium">
                        ${totalPrice.toFixed(2)}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Summary Totals */}
              <div className="space-y-3 border-t pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">
                    ${(Number(cart.subtotal) / 100).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium">$10.00</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax (8%)</span>
                  <span className="font-medium">
                    ${(Number(cart.tax) / 100).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between border-t pt-4">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-lg font-bold">
                  ${((Number(cart.total) + 1000) / 100).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
