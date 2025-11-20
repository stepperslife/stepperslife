import { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ShoppingCart, ArrowLeft, ArrowRight } from 'lucide-react'
import { getCurrentUser } from '@/lib/auth'
import { getUserCart } from '@/lib/store/queries'
import { CartItem } from '@/components/store/cart-item'
import { clearCart } from '@/lib/store/actions'

export const metadata: Metadata = {
  title: 'Shopping Cart | SteppersLife',
  description: 'Review your cart and proceed to checkout',
}

export default async function CartPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/auth/signin?callbackUrl=/cart')
  }

  const cart = await getUserCart(user.id)

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container py-12">
        <div className="mx-auto max-w-3xl">
          {/* Empty State */}
          <div className="rounded-lg border border-dashed p-12 text-center">
            <ShoppingCart className="mx-auto h-16 w-16 text-muted-foreground" />
            <h1 className="mt-4 text-2xl font-bold">Your cart is empty</h1>
            <p className="mt-2 text-muted-foreground">
              Add some products to get started
            </p>
            <Link
              href="/stores"
              className="mt-6 inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
            >
              <ArrowLeft className="h-4 w-4" />
              Browse Stores
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-12">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Shopping Cart</h1>
            <p className="mt-2 text-muted-foreground">
              {cart.items.length} {cart.items.length === 1 ? 'item' : 'items'} in your cart
            </p>
          </div>
          <Link
            href="/stores"
            className="inline-flex h-9 items-center gap-2 text-sm text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Continue Shopping
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          {/* Left Column: Cart Items */}
          <div className="space-y-4">
            {cart.items.map((item) => (
              <CartItem key={item.id} item={item} />
            ))}

            {/* Clear Cart Button */}
            <form action={clearCart}>
              <button
                type="submit"
                className="text-sm text-muted-foreground hover:text-destructive transition-colors"
              >
                Clear cart
              </button>
            </form>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="rounded-lg border bg-card p-6 space-y-4">
              <h2 className="text-lg font-semibold">Order Summary</h2>

              {/* Summary Details */}
              <div className="space-y-3 border-t pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">
                    ${(Number(cart.subtotal) / 100).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax (8%)</span>
                  <span className="font-medium">
                    ${(Number(cart.tax) / 100).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium">Calculated at checkout</span>
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between border-t pt-4">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-lg font-bold">
                  ${(Number(cart.total) / 100).toFixed(2)}
                </span>
              </div>

              {/* Checkout Button */}
              <Link
                href="/checkout"
                className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors"
              >
                Proceed to Checkout
                <ArrowRight className="h-4 w-4" />
              </Link>

              {/* Trust Badges */}
              <div className="space-y-2 border-t pt-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-green-500" />
                  Secure checkout
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-green-500" />
                  Free returns within 30 days
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-green-500" />
                  Multiple payment options
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
