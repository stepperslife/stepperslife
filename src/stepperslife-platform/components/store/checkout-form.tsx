'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, CreditCard, Check } from 'lucide-react'
import { createOrderFromCart, processOrderPayment } from '@/lib/store/actions'

interface CheckoutFormProps {
  cart: any
  user: any
}

export function CheckoutForm({ cart, user }: CheckoutFormProps) {
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [useSameAddress, setUseSameAddress] = useState(true)
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'square' | 'paypal'>('stripe')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setIsProcessing(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      // Shipping Address
      shippingName: formData.get('shippingName') as string,
      shippingAddress1: formData.get('shippingAddress1') as string,
      shippingAddress2: formData.get('shippingAddress2') as string || undefined,
      shippingCity: formData.get('shippingCity') as string,
      shippingState: formData.get('shippingState') as string,
      shippingZip: formData.get('shippingZip') as string,
      shippingCountry: 'US',
      shippingPhone: formData.get('shippingPhone') as string || undefined,

      // Billing Address
      useSameAddress,
      billingName: useSameAddress ? undefined : formData.get('billingName') as string,
      billingAddress1: useSameAddress ? undefined : formData.get('billingAddress1') as string,
      billingAddress2: useSameAddress ? undefined : formData.get('billingAddress2') as string,
      billingCity: useSameAddress ? undefined : formData.get('billingCity') as string,
      billingState: useSameAddress ? undefined : formData.get('billingState') as string,
      billingZip: useSameAddress ? undefined : formData.get('billingZip') as string,

      // Notes
      orderNotes: formData.get('orderNotes') as string || undefined,
    }

    try {
      // Step 1: Create order
      const orderResult = await createOrderFromCart(data)

      if (orderResult.error) {
        setError(orderResult.error)
        setIsProcessing(false)
        return
      }

      if (!orderResult.orderId) {
        setError('Failed to create order')
        setIsProcessing(false)
        return
      }

      // Step 2: Process payment
      const paymentResult = await processOrderPayment(
        orderResult.orderId,
        paymentMethod,
        {} // Payment details would come from Stripe/Square/PayPal SDK
      )

      if (paymentResult.error) {
        setError(paymentResult.error)
        setIsProcessing(false)
        return
      }

      // Success - redirect to confirmation
      router.push(`/orders/${orderResult.orderId}?success=true`)
    } catch (err) {
      console.error('Checkout error:', err)
      setError('An unexpected error occurred. Please try again.')
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Shipping Address */}
      <div className="rounded-lg border bg-card p-6 space-y-4">
        <h2 className="text-lg font-semibold">Shipping Address</h2>

        <div className="grid gap-4">
          <div>
            <label htmlFor="shippingName" className="block text-sm font-medium mb-1.5">
              Full Name *
            </label>
            <input
              type="text"
              id="shippingName"
              name="shippingName"
              required
              defaultValue={user.name || ''}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label htmlFor="shippingAddress1" className="block text-sm font-medium mb-1.5">
              Address Line 1 *
            </label>
            <input
              type="text"
              id="shippingAddress1"
              name="shippingAddress1"
              required
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label htmlFor="shippingAddress2" className="block text-sm font-medium mb-1.5">
              Address Line 2
            </label>
            <input
              type="text"
              id="shippingAddress2"
              name="shippingAddress2"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="shippingCity" className="block text-sm font-medium mb-1.5">
                City *
              </label>
              <input
                type="text"
                id="shippingCity"
                name="shippingCity"
                required
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label htmlFor="shippingState" className="block text-sm font-medium mb-1.5">
                State *
              </label>
              <input
                type="text"
                id="shippingState"
                name="shippingState"
                required
                maxLength={2}
                placeholder="CA"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="shippingZip" className="block text-sm font-medium mb-1.5">
                ZIP Code *
              </label>
              <input
                type="text"
                id="shippingZip"
                name="shippingZip"
                required
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label htmlFor="shippingPhone" className="block text-sm font-medium mb-1.5">
                Phone
              </label>
              <input
                type="tel"
                id="shippingPhone"
                name="shippingPhone"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Billing Address */}
      <div className="rounded-lg border bg-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Billing Address</h2>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={useSameAddress}
              onChange={(e) => setUseSameAddress(e.target.checked)}
              className="rounded"
            />
            Same as shipping
          </label>
        </div>

        {!useSameAddress && (
          <div className="grid gap-4">
            <div>
              <label htmlFor="billingName" className="block text-sm font-medium mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                id="billingName"
                name="billingName"
                required={!useSameAddress}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label htmlFor="billingAddress1" className="block text-sm font-medium mb-1.5">
                Address Line 1 *
              </label>
              <input
                type="text"
                id="billingAddress1"
                name="billingAddress1"
                required={!useSameAddress}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label htmlFor="billingAddress2" className="block text-sm font-medium mb-1.5">
                Address Line 2
              </label>
              <input
                type="text"
                id="billingAddress2"
                name="billingAddress2"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="billingCity" className="block text-sm font-medium mb-1.5">
                  City *
                </label>
                <input
                  type="text"
                  id="billingCity"
                  name="billingCity"
                  required={!useSameAddress}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label htmlFor="billingState" className="block text-sm font-medium mb-1.5">
                  State *
                </label>
                <input
                  type="text"
                  id="billingState"
                  name="billingState"
                  required={!useSameAddress}
                  maxLength={2}
                  placeholder="CA"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="billingZip" className="block text-sm font-medium mb-1.5">
                ZIP Code *
              </label>
              <input
                type="text"
                id="billingZip"
                name="billingZip"
                required={!useSameAddress}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>
        )}
      </div>

      {/* Payment Method */}
      <div className="rounded-lg border bg-card p-6 space-y-4">
        <h2 className="text-lg font-semibold">Payment Method</h2>

        <div className="space-y-2">
          <label className="flex items-center gap-3 rounded-lg border p-4 cursor-pointer hover:bg-accent transition-colors">
            <input
              type="radio"
              name="paymentMethod"
              value="stripe"
              checked={paymentMethod === 'stripe'}
              onChange={(e) => setPaymentMethod(e.target.value as any)}
              className="h-4 w-4"
            />
            <CreditCard className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1">
              <p className="font-medium">Credit / Debit Card</p>
              <p className="text-xs text-muted-foreground">Powered by Stripe</p>
            </div>
          </label>

          <label className="flex items-center gap-3 rounded-lg border p-4 cursor-pointer hover:bg-accent transition-colors">
            <input
              type="radio"
              name="paymentMethod"
              value="paypal"
              checked={paymentMethod === 'paypal'}
              onChange={(e) => setPaymentMethod(e.target.value as any)}
              className="h-4 w-4"
            />
            <div className="flex h-5 w-5 items-center justify-center rounded bg-[#0070ba] text-white text-xs font-bold">
              P
            </div>
            <div className="flex-1">
              <p className="font-medium">PayPal</p>
              <p className="text-xs text-muted-foreground">Pay with PayPal</p>
            </div>
          </label>

          <label className="flex items-center gap-3 rounded-lg border p-4 cursor-pointer hover:bg-accent transition-colors">
            <input
              type="radio"
              name="paymentMethod"
              value="square"
              checked={paymentMethod === 'square'}
              onChange={(e) => setPaymentMethod(e.target.value as any)}
              className="h-4 w-4"
            />
            <div className="flex h-5 w-5 items-center justify-center rounded bg-black text-white text-xs font-bold">
              ▪
            </div>
            <div className="flex-1">
              <p className="font-medium">Square</p>
              <p className="text-xs text-muted-foreground">Powered by Square</p>
            </div>
          </label>
        </div>

        <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
          <p className="font-medium text-foreground mb-1">Demo Mode</p>
          <p>
            Payment processing is in demo mode. Your order will be created but no actual
            payment will be charged. In production, this would integrate with the selected
            payment provider.
          </p>
        </div>
      </div>

      {/* Order Notes */}
      <div className="rounded-lg border bg-card p-6 space-y-4">
        <h2 className="text-lg font-semibold">Order Notes (Optional)</h2>
        <textarea
          id="orderNotes"
          name="orderNotes"
          rows={4}
          placeholder="Add any special instructions for your order..."
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isProcessing}
        className="w-full flex items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Processing Order...
          </>
        ) : (
          <>
            <Check className="h-5 w-5" />
            Place Order
          </>
        )}
      </button>
    </form>
  )
}
