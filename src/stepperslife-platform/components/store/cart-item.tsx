'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Minus, Plus, Trash2, Loader2 } from 'lucide-react'
import { updateCartItemQuantity, removeFromCart } from '@/lib/store/actions'
import { useRouter } from 'next/navigation'

interface CartItemProps {
  item: {
    id: string
    quantity: number
    price: any
    product: {
      id: string
      slug: string
      name: string
      quantity: number
      trackInventory: boolean
      productImages: {
        url: string
        altText?: string | null
      }[]
      vendorStore: {
        slug: string
        name: string
      }
    }
    variant?: {
      id: string
      name: string
      value: string
      price?: any
    } | null
  }
}

export function CartItem({ item }: CartItemProps) {
  const [quantity, setQuantity] = useState(item.quantity)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)
  const router = useRouter()

  const productImage = item.product.productImages[0]
  const itemPrice = Number(item.price) / 100
  const variantPrice = item.variant?.price ? Number(item.variant.price) / 100 : 0
  const totalPrice = (itemPrice + variantPrice) * quantity

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1) return
    if (item.product.trackInventory && newQuantity > item.product.quantity) {
      alert('Not enough stock available')
      return
    }

    setQuantity(newQuantity)
    setIsUpdating(true)

    const result = await updateCartItemQuantity(item.id, newQuantity)

    if (result.error) {
      alert(result.error)
      setQuantity(item.quantity) // Revert on error
    } else {
      router.refresh()
    }

    setIsUpdating(false)
  }

  const handleRemove = async () => {
    if (!confirm('Remove this item from your cart?')) return

    setIsRemoving(true)

    const result = await removeFromCart(item.id)

    if (result.error) {
      alert(result.error)
      setIsRemoving(false)
    } else {
      router.refresh()
    }
  }

  return (
    <div className="relative rounded-lg border bg-card p-4 transition-all">
      {/* Loading Overlay */}
      {(isUpdating || isRemoving) && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-background/50 backdrop-blur-sm">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}

      <div className="flex gap-4">
        {/* Product Image */}
        <Link
          href={`/stores/${item.product.vendorStore.slug}/products/${item.product.slug}`}
          className="flex-shrink-0"
        >
          {productImage ? (
            <img
              src={productImage.url}
              alt={productImage.altText || item.product.name}
              className="h-24 w-24 rounded-md object-cover hover:opacity-80 transition-opacity"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-md bg-muted">
              <span className="text-xs text-muted-foreground">No image</span>
            </div>
          )}
        </Link>

        {/* Product Info */}
        <div className="flex flex-1 flex-col justify-between">
          <div>
            {/* Store Name */}
            <Link
              href={`/stores/${item.product.vendorStore.slug}`}
              className="text-xs text-muted-foreground hover:text-primary"
            >
              {item.product.vendorStore.name}
            </Link>

            {/* Product Name */}
            <Link
              href={`/stores/${item.product.vendorStore.slug}/products/${item.product.slug}`}
              className="mt-1 block font-semibold hover:text-primary"
            >
              {item.product.name}
            </Link>

            {/* Variant Info */}
            {item.variant && (
              <p className="mt-1 text-sm text-muted-foreground">
                {item.variant.name}: {item.variant.value}
                {variantPrice > 0 && (
                  <span className="ml-2 font-medium">+${variantPrice.toFixed(2)}</span>
                )}
              </p>
            )}

            {/* Price */}
            <p className="mt-2 text-sm font-medium">
              ${itemPrice.toFixed(2)}
              {variantPrice > 0 && ` + $${variantPrice.toFixed(2)}`}
            </p>
          </div>

          {/* Quantity Controls & Remove */}
          <div className="mt-4 flex items-center justify-between">
            {/* Quantity */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 1 || isUpdating}
                className="flex h-8 w-8 items-center justify-center rounded-md border hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Minus className="h-4 w-4" />
              </button>

              <span className="w-12 text-center font-medium">{quantity}</span>

              <button
                onClick={() => handleQuantityChange(quantity + 1)}
                disabled={isUpdating}
                className="flex h-8 w-8 items-center justify-center rounded-md border hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="h-4 w-4" />
              </button>

              {/* Stock Warning */}
              {item.product.trackInventory && quantity >= item.product.quantity && (
                <span className="ml-2 text-xs text-destructive">
                  Max: {item.product.quantity}
                </span>
              )}
            </div>

            {/* Remove Button */}
            <button
              onClick={handleRemove}
              disabled={isRemoving}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
              Remove
            </button>
          </div>
        </div>

        {/* Item Total */}
        <div className="flex-shrink-0 text-right">
          <p className="font-bold">${totalPrice.toFixed(2)}</p>
        </div>
      </div>
    </div>
  )
}
