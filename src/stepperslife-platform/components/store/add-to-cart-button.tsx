'use client'

import { useState } from 'react'
import { ShoppingCart, Check, Loader2 } from 'lucide-react'
import { addToCart } from '@/lib/store/actions'
import { useRouter } from 'next/navigation'

interface AddToCartButtonProps {
  productId: string
  productName: string
  price: number
  available: boolean
  variantId?: string
  className?: string
}

export function AddToCartButton({
  productId,
  productName,
  price,
  available,
  variantId,
  className = '',
}: AddToCartButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isAdded, setIsAdded] = useState(false)
  const router = useRouter()

  const handleAddToCart = async () => {
    if (!available) return

    setIsLoading(true)

    try {
      const result = await addToCart(productId, 1, variantId)

      if (result.error) {
        alert(result.error)
        setIsLoading(false)
        return
      }

      // Show success state
      setIsAdded(true)

      // Reset after 2 seconds
      setTimeout(() => {
        setIsAdded(false)
      }, 2000)

      // Refresh to update any cart indicators
      router.refresh()
    } catch (error) {
      console.error('Add to cart error:', error)
      alert('Failed to add item to cart')
    } finally {
      setIsLoading(false)
    }
  }

  if (!available) {
    return (
      <button
        disabled
        className={`w-full rounded-md bg-muted px-6 py-3 font-medium text-muted-foreground ${className}`}
      >
        Out of Stock
      </button>
    )
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleAddToCart}
        disabled={isLoading || isAdded}
        className={`
          w-full flex items-center justify-center gap-2 rounded-md px-6 py-3 font-medium
          transition-all shadow-sm
          ${
            isAdded
              ? 'bg-green-600 text-white'
              : 'bg-primary text-primary-foreground hover:bg-primary/90'
          }
          disabled:opacity-50 disabled:cursor-not-allowed
          ${className}
        `}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Adding...
          </>
        ) : isAdded ? (
          <>
            <Check className="h-5 w-5" />
            Added to Cart!
          </>
        ) : (
          <>
            <ShoppingCart className="h-5 w-5" />
            Add to Cart
          </>
        )}
      </button>

      {isAdded && (
        <button
          onClick={() => router.push('/cart')}
          className="w-full rounded-md border border-primary px-6 py-2 text-sm font-medium text-primary hover:bg-primary/5 transition-colors"
        >
          View Cart
        </button>
      )}
    </div>
  )
}
