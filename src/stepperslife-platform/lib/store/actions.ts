'use server'

/**
 * Store Module - Server Actions
 *
 * Handles all mutations for the multi-vendor store system:
 * - Vendor store management (create, update, delete)
 * - Product management (create, update, delete, publish)
 * - Variant management (simple & multi-variant)
 * - Order processing
 * - Vendor operations (withdrawals, settings)
 */

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { prisma } from '@/lib/db/client'
import { requireAuth } from '@/lib/auth'
import { UserRole, ProductStatus, ProductCategory } from '@prisma/client'

// ============================================================================
// Validation Schemas
// ============================================================================

const createVendorStoreSchema = z.object({
  name: z.string().min(2, 'Store name must be at least 2 characters'),
  tagline: z.string().max(100).optional(),
  description: z.string().optional(),
  email: z.string().email(),
  phone: z.string().optional(),
  logoUrl: z.string().url().optional(),
  bannerUrl: z.string().url().optional(),
})

const createProductSchema = z.object({
  name: z.string().min(2, 'Product name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.number().positive('Price must be greater than 0'),
  compareAtPrice: z.number().positive().optional(),
  category: z.nativeEnum(ProductCategory),
  sku: z.string().optional(),
  quantity: z.number().int().nonnegative().default(0),
  trackInventory: z.boolean().default(true),
  lowStockThreshold: z.number().int().nonnegative().default(5),
  tags: z.array(z.string()).default([]),
  hasVariants: z.boolean().default(false),
  useMultiVariants: z.boolean().default(false),
  variantTypes: z.array(z.string()).default([]),
})

// ============================================================================
// Vendor Store Actions
// ============================================================================

/**
 * Create a new vendor store
 * Auto-promotes user to VENDOR role on first store creation
 */
export async function createVendorStore(formData: FormData) {
  try {
    const user = await requireAuth()

    // Parse and validate
    const data = createVendorStoreSchema.parse({
      name: formData.get('name'),
      tagline: formData.get('tagline') || undefined,
      description: formData.get('description') || undefined,
      email: formData.get('email'),
      phone: formData.get('phone') || undefined,
      logoUrl: formData.get('logoUrl') || undefined,
      bannerUrl: formData.get('bannerUrl') || undefined,
    })

    // Generate unique slug
    const baseSlug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    let slug = baseSlug
    let counter = 1

    while (await prisma.vendorStore.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`
      counter++
    }

    // Create store in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create vendor store
      const store = await tx.vendorStore.create({
        data: {
          storeId: `store_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId: user.id,
          slug,
          name: data.name,
          tagline: data.tagline,
          description: data.description,
          email: data.email,
          phone: data.phone,
          logoUrl: data.logoUrl,
          bannerUrl: data.bannerUrl,
          isActive: true,
        },
      })

      // Auto-promote user to VENDOR if not already
      if (user.role === UserRole.USER) {
        await tx.user.update({
          where: { id: user.id },
          data: { role: UserRole.VENDOR },
        })
      }

      return store
    })

    revalidatePath('/vendor/dashboard')
    revalidatePath('/stores')

    return { success: true, storeId: result.id, slug: result.slug }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message }
    }
    console.error('Create vendor store error:', error)
    return { error: 'Failed to create store. Please try again.' }
  }
}

/**
 * Update vendor store details
 */
export async function updateVendorStore(storeId: string, formData: FormData) {
  try {
    const user = await requireAuth()

    // Verify ownership
    const store = await prisma.vendorStore.findUnique({
      where: { id: storeId },
    })

    if (!store) {
      return { error: 'Store not found' }
    }

    if (store.userId !== user.id && user.role !== UserRole.ADMIN) {
      return { error: 'Unauthorized' }
    }

    // Parse and validate
    const data = createVendorStoreSchema.parse({
      name: formData.get('name'),
      tagline: formData.get('tagline') || undefined,
      description: formData.get('description') || undefined,
      email: formData.get('email'),
      phone: formData.get('phone') || undefined,
      logoUrl: formData.get('logoUrl') || undefined,
      bannerUrl: formData.get('bannerUrl') || undefined,
    })

    // Update store
    await prisma.vendorStore.update({
      where: { id: storeId },
      data: {
        name: data.name,
        tagline: data.tagline,
        description: data.description,
        email: data.email,
        phone: data.phone,
        logoUrl: data.logoUrl,
        bannerUrl: data.bannerUrl,
      },
    })

    revalidatePath(`/stores/${store.slug}`)
    revalidatePath('/vendor/dashboard')

    return { success: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message }
    }
    console.error('Update vendor store error:', error)
    return { error: 'Failed to update store. Please try again.' }
  }
}

/**
 * Delete vendor store (soft delete - set isActive to false)
 */
export async function deleteVendorStore(storeId: string) {
  try {
    const user = await requireAuth()

    // Verify ownership
    const store = await prisma.vendorStore.findUnique({
      where: { id: storeId },
    })

    if (!store) {
      return { error: 'Store not found' }
    }

    if (store.userId !== user.id && user.role !== UserRole.ADMIN) {
      return { error: 'Unauthorized' }
    }

    // Soft delete
    await prisma.vendorStore.update({
      where: { id: storeId },
      data: { isActive: false },
    })

    revalidatePath('/vendor/dashboard')
    revalidatePath('/stores')

    return { success: true }
  } catch (error) {
    console.error('Delete vendor store error:', error)
    return { error: 'Failed to delete store. Please try again.' }
  }
}

// ============================================================================
// Product Actions
// ============================================================================

/**
 * Create a new product
 */
export async function createProduct(storeId: string, formData: FormData) {
  try {
    const user = await requireAuth()

    // Verify store ownership
    const store = await prisma.vendorStore.findUnique({
      where: { id: storeId },
    })

    if (!store) {
      return { error: 'Store not found' }
    }

    if (store.userId !== user.id && user.role !== UserRole.ADMIN) {
      return { error: 'Unauthorized' }
    }

    // Parse and validate
    const data = createProductSchema.parse({
      name: formData.get('name'),
      description: formData.get('description'),
      price: Number(formData.get('price')),
      compareAtPrice: formData.get('compareAtPrice') ? Number(formData.get('compareAtPrice')) : undefined,
      category: formData.get('category') as ProductCategory,
      sku: formData.get('sku') || undefined,
      quantity: formData.get('quantity') ? Number(formData.get('quantity')) : 0,
      trackInventory: formData.get('trackInventory') === 'true',
      lowStockThreshold: formData.get('lowStockThreshold') ? Number(formData.get('lowStockThreshold')) : 5,
      tags: formData.get('tags') ? JSON.parse(formData.get('tags') as string) : [],
      hasVariants: formData.get('hasVariants') === 'true',
      useMultiVariants: formData.get('useMultiVariants') === 'true',
      variantTypes: formData.get('variantTypes') ? JSON.parse(formData.get('variantTypes') as string) : [],
    })

    // Generate unique slug
    const baseSlug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    let slug = baseSlug
    let counter = 1

    while (await prisma.product.findUnique({ where: { vendorStoreId_slug: { vendorStoreId: storeId, slug } } })) {
      slug = `${baseSlug}-${counter}`
      counter++
    }

    // Create product
    const product = await prisma.$transaction(async (tx) => {
      const newProduct = await tx.product.create({
        data: {
          vendorStoreId: storeId,
          name: data.name,
          slug,
          description: data.description,
          price: data.price,
          compareAtPrice: data.compareAtPrice,
          category: data.category,
          sku: data.sku,
          quantity: data.quantity,
          trackInventory: data.trackInventory,
          lowStockThreshold: data.lowStockThreshold,
          tags: data.tags,
          hasVariants: data.hasVariants,
          useMultiVariants: data.useMultiVariants,
          variantTypes: data.variantTypes,
          status: ProductStatus.DRAFT,
        },
      })

      // Increment store product count
      await tx.vendorStore.update({
        where: { id: storeId },
        data: { totalProducts: { increment: 1 } },
      })

      return newProduct
    })

    revalidatePath(`/vendor/store/${store.slug}/products`)
    revalidatePath(`/stores/${store.slug}`)

    return { success: true, productId: product.id, slug: product.slug }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message }
    }
    console.error('Create product error:', error)
    return { error: 'Failed to create product. Please try again.' }
  }
}

/**
 * Update product details
 */
export async function updateProduct(productId: string, formData: FormData) {
  try {
    const user = await requireAuth()

    // Verify ownership
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { vendorStore: true },
    })

    if (!product) {
      return { error: 'Product not found' }
    }

    if (product.vendorStore.userId !== user.id && user.role !== UserRole.ADMIN) {
      return { error: 'Unauthorized' }
    }

    // Parse and validate
    const data = createProductSchema.parse({
      name: formData.get('name'),
      description: formData.get('description'),
      price: Number(formData.get('price')),
      compareAtPrice: formData.get('compareAtPrice') ? Number(formData.get('compareAtPrice')) : undefined,
      category: formData.get('category') as ProductCategory,
      sku: formData.get('sku') || undefined,
      quantity: formData.get('quantity') ? Number(formData.get('quantity')) : 0,
      trackInventory: formData.get('trackInventory') === 'true',
      lowStockThreshold: formData.get('lowStockThreshold') ? Number(formData.get('lowStockThreshold')) : 5,
      tags: formData.get('tags') ? JSON.parse(formData.get('tags') as string) : [],
      hasVariants: formData.get('hasVariants') === 'true',
      useMultiVariants: formData.get('useMultiVariants') === 'true',
      variantTypes: formData.get('variantTypes') ? JSON.parse(formData.get('variantTypes') as string) : [],
    })

    // Update product
    await prisma.product.update({
      where: { id: productId },
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        compareAtPrice: data.compareAtPrice,
        category: data.category,
        sku: data.sku,
        quantity: data.quantity,
        trackInventory: data.trackInventory,
        lowStockThreshold: data.lowStockThreshold,
        tags: data.tags,
        hasVariants: data.hasVariants,
        useMultiVariants: data.useMultiVariants,
        variantTypes: data.variantTypes,
      },
    })

    revalidatePath(`/stores/${product.vendorStore.slug}/products/${product.slug}`)
    revalidatePath(`/vendor/store/${product.vendorStore.slug}/products`)

    return { success: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message }
    }
    console.error('Update product error:', error)
    return { error: 'Failed to update product. Please try again.' }
  }
}

/**
 * Publish product (make it available to customers)
 */
export async function publishProduct(productId: string) {
  try {
    const user = await requireAuth()

    // Verify ownership
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { vendorStore: true },
    })

    if (!product) {
      return { error: 'Product not found' }
    }

    if (product.vendorStore.userId !== user.id && user.role !== UserRole.ADMIN) {
      return { error: 'Unauthorized' }
    }

    // Update product status
    await prisma.product.update({
      where: { id: productId },
      data: {
        status: ProductStatus.ACTIVE,
        publishedAt: new Date(),
      },
    })

    revalidatePath(`/stores/${product.vendorStore.slug}`)
    revalidatePath(`/stores/${product.vendorStore.slug}/products/${product.slug}`)

    return { success: true }
  } catch (error) {
    console.error('Publish product error:', error)
    return { error: 'Failed to publish product. Please try again.' }
  }
}

/**
 * Delete product (soft delete - set status to ARCHIVED)
 */
export async function deleteProduct(productId: string) {
  try {
    const user = await requireAuth()

    // Verify ownership
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { vendorStore: true },
    })

    if (!product) {
      return { error: 'Product not found' }
    }

    if (product.vendorStore.userId !== user.id && user.role !== UserRole.ADMIN) {
      return { error: 'Unauthorized' }
    }

    // Soft delete
    await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id: productId },
        data: { status: ProductStatus.ARCHIVED },
      })

      // Decrement store product count
      await tx.vendorStore.update({
        where: { id: product.vendorStoreId },
        data: { totalProducts: { decrement: 1 } },
      })
    })

    revalidatePath(`/vendor/store/${product.vendorStore.slug}/products`)
    revalidatePath(`/stores/${product.vendorStore.slug}`)

    return { success: true }
  } catch (error) {
    console.error('Delete product error:', error)
    return { error: 'Failed to delete product. Please try again.' }
  }
}

// ============================================================================
// Vendor Operations
// ============================================================================

/**
 * Toggle store active status
 */
export async function toggleStoreActive(storeId: string) {
  try {
    const user = await requireAuth()

    // Verify ownership
    const store = await prisma.vendorStore.findUnique({
      where: { id: storeId },
    })

    if (!store) {
      return { error: 'Store not found' }
    }

    if (store.userId !== user.id && user.role !== UserRole.ADMIN) {
      return { error: 'Unauthorized' }
    }

    // Toggle active status
    await prisma.vendorStore.update({
      where: { id: storeId },
      data: { isActive: !store.isActive },
    })

    revalidatePath('/vendor/dashboard')
    revalidatePath(`/stores/${store.slug}`)

    return { success: true, isActive: !store.isActive }
  } catch (error) {
    console.error('Toggle store active error:', error)
    return { error: 'Failed to update store status. Please try again.' }
  }
}

/**
 * Request vendor withdrawal
 */
export async function requestWithdrawal(storeId: string, amount: number, method: string) {
  try {
    const user = await requireAuth()

    // Verify ownership
    const store = await prisma.vendorStore.findUnique({
      where: { id: storeId },
    })

    if (!store) {
      return { error: 'Store not found' }
    }

    if (store.userId !== user.id) {
      return { error: 'Unauthorized' }
    }

    // Validate amount
    if (amount < store.minimumWithdraw.toNumber()) {
      return { error: `Minimum withdrawal amount is $${store.minimumWithdraw}` }
    }

    if (amount > store.withdrawBalance.toNumber()) {
      return { error: 'Insufficient balance' }
    }

    // Create withdrawal request
    await prisma.vendorWithdraw.create({
      data: {
        vendorStoreId: storeId,
        amount,
        method: method as any,
        status: 'PENDING',
      },
    })

    revalidatePath('/vendor/dashboard')

    return { success: true }
  } catch (error) {
    console.error('Request withdrawal error:', error)
    return { error: 'Failed to request withdrawal. Please try again.' }
  }
}

// ============================================================================
// Shopping Cart Actions
// ============================================================================

/**
 * Helper: Get or create shopping cart for user
 */
async function getOrCreateCart(userId: string) {
  let cart = await prisma.shoppingCart.findFirst({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            include: {
              vendorStore: true,
              productImages: true,
            },
          },
          variant: true,
        },
      },
    },
  })

  if (!cart) {
    cart = await prisma.shoppingCart.create({
      data: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                vendorStore: true,
                productImages: true,
              },
            },
            variant: true,
          },
        },
      },
    })
  }

  return cart
}

/**
 * Add item to cart
 */
export async function addToCart(productId: string, quantity: number = 1, variantId?: string) {
  try {
    const user = await requireAuth()

    // Get product
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        vendorStore: true,
      },
    })

    if (!product) {
      return { error: 'Product not found' }
    }

    if (!product.isActive || product.status !== 'ACTIVE') {
      return { error: 'Product is not available' }
    }

    if (product.trackInventory && product.quantity < quantity) {
      return { error: 'Not enough stock available' }
    }

    // Get or create cart
    const cart = await getOrCreateCart(user.id)

    // Check if item already exists in cart
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId,
        ...(variantId && { variantId }),
      },
    })

    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + quantity

      if (product.trackInventory && product.quantity < newQuantity) {
        return { error: 'Not enough stock available' }
      }

      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      })
    } else {
      // Add new item
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          variantId,
          quantity,
          price: product.price,
        },
      })
    }

    // Update cart totals
    await updateCartTotals(cart.id)

    revalidatePath('/cart')

    return { success: true }
  } catch (error) {
    console.error('Add to cart error:', error)
    return { error: 'Failed to add item to cart. Please try again.' }
  }
}

/**
 * Update cart item quantity
 */
export async function updateCartItemQuantity(itemId: string, quantity: number) {
  try {
    const user = await requireAuth()

    const item = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: {
        cart: true,
        product: true,
      },
    })

    if (!item || item.cart.userId !== user.id) {
      return { error: 'Cart item not found' }
    }

    if (quantity <= 0) {
      return { error: 'Quantity must be greater than 0' }
    }

    if (item.product.trackInventory && item.product.quantity < quantity) {
      return { error: 'Not enough stock available' }
    }

    await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    })

    // Update cart totals
    await updateCartTotals(item.cartId)

    revalidatePath('/cart')

    return { success: true }
  } catch (error) {
    console.error('Update cart item error:', error)
    return { error: 'Failed to update item. Please try again.' }
  }
}

/**
 * Remove item from cart
 */
export async function removeFromCart(itemId: string) {
  try {
    const user = await requireAuth()

    const item = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true },
    })

    if (!item || item.cart.userId !== user.id) {
      return { error: 'Cart item not found' }
    }

    await prisma.cartItem.delete({
      where: { id: itemId },
    })

    // Update cart totals
    await updateCartTotals(item.cartId)

    revalidatePath('/cart')

    return { success: true }
  } catch (error) {
    console.error('Remove from cart error:', error)
    return { error: 'Failed to remove item. Please try again.' }
  }
}

/**
 * Clear entire cart
 */
export async function clearCart() {
  try {
    const user = await requireAuth()

    const cart = await prisma.shoppingCart.findFirst({
      where: { userId: user.id },
    })

    if (!cart) {
      return { success: true }
    }

    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    })

    await prisma.shoppingCart.update({
      where: { id: cart.id },
      data: {
        subtotal: 0,
        tax: 0,
        total: 0,
      },
    })

    revalidatePath('/cart')

    return { success: true }
  } catch (error) {
    console.error('Clear cart error:', error)
    return { error: 'Failed to clear cart. Please try again.' }
  }
}

/**
 * Helper: Update cart totals
 */
async function updateCartTotals(cartId: string) {
  const items = await prisma.cartItem.findMany({
    where: { cartId },
  })

  const subtotal = items.reduce(
    (sum, item) => sum + item.price.toNumber() * item.quantity,
    0
  )

  // Simple tax calculation (adjust based on your needs)
  const tax = subtotal * 0.08 // 8% tax rate

  const total = subtotal + tax

  await prisma.shoppingCart.update({
    where: { id: cartId },
    data: {
      subtotal,
      tax,
      total,
    },
  })
}

// ============================================================================
// Checkout & Order Actions
// ============================================================================

const checkoutSchema = z.object({
  // Shipping Address
  shippingName: z.string().min(2),
  shippingAddress1: z.string().min(5),
  shippingAddress2: z.string().optional(),
  shippingCity: z.string().min(2),
  shippingState: z.string().min(2),
  shippingZip: z.string().min(5),
  shippingCountry: z.string().default('US'),
  shippingPhone: z.string().optional(),

  // Billing Address (optional - can use shipping)
  useSameAddress: z.boolean().default(true),
  billingName: z.string().optional(),
  billingAddress1: z.string().optional(),
  billingAddress2: z.string().optional(),
  billingCity: z.string().optional(),
  billingState: z.string().optional(),
  billingZip: z.string().optional(),
  billingCountry: z.string().optional(),

  // Notes
  orderNotes: z.string().optional(),
})

/**
 * Create order from cart
 * This prepares the order but doesn't process payment yet
 */
export async function createOrderFromCart(data: z.infer<typeof checkoutSchema>) {
  try {
    const user = await requireAuth()

    // Validate input
    const validated = checkoutSchema.parse(data)

    // Get cart
    const cart = await prisma.shoppingCart.findFirst({
      where: { userId: user.id },
      include: {
        items: {
          include: {
            product: {
              include: {
                vendorStore: true,
              },
            },
            variant: true,
          },
        },
      },
    })

    if (!cart || cart.items.length === 0) {
      return { error: 'Your cart is empty' }
    }

    // Validate stock availability
    for (const item of cart.items) {
      if (item.product.trackInventory && item.product.quantity < item.quantity) {
        return {
          error: `Not enough stock for ${item.product.name}. Only ${item.product.quantity} available.`
        }
      }
    }

    // Group items by vendor store
    const itemsByStore = cart.items.reduce((acc, item) => {
      const storeId = item.product.vendorStoreId
      if (!acc[storeId]) {
        acc[storeId] = []
      }
      acc[storeId].push(item)
      return acc
    }, {} as Record<string, typeof cart.items>)

    // Create separate order for each vendor
    const orderIds: string[] = []

    for (const [storeId, items] of Object.entries(itemsByStore)) {
      const store = items[0].product.vendorStore

      // Calculate order totals for this vendor
      const subtotal = items.reduce(
        (sum, item) => sum + item.price.toNumber() * item.quantity,
        0
      )
      const tax = subtotal * 0.08
      const shippingCost = 10.00 // Flat rate for now
      const total = subtotal + tax + shippingCost

      // Create order
      const order = await prisma.storeOrder.create({
        data: {
          vendorStoreId: storeId,
          customerId: user.id,
          orderNumber: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          status: 'PENDING',

          // Amounts
          subtotal,
          tax,
          shippingCost,
          total,

          // Shipping Address
          shippingName: validated.shippingName,
          shippingAddress1: validated.shippingAddress1,
          shippingAddress2: validated.shippingAddress2,
          shippingCity: validated.shippingCity,
          shippingState: validated.shippingState,
          shippingZip: validated.shippingZip,
          shippingCountry: validated.shippingCountry,
          shippingPhone: validated.shippingPhone,

          // Billing Address
          billingName: validated.useSameAddress
            ? validated.shippingName
            : validated.billingName,
          billingAddress1: validated.useSameAddress
            ? validated.shippingAddress1
            : validated.billingAddress1,
          billingAddress2: validated.useSameAddress
            ? validated.shippingAddress2
            : validated.billingAddress2,
          billingCity: validated.useSameAddress
            ? validated.shippingCity
            : validated.billingCity,
          billingState: validated.useSameAddress
            ? validated.shippingState
            : validated.billingState,
          billingZip: validated.useSameAddress
            ? validated.shippingZip
            : validated.billingZip,
          billingCountry: validated.useSameAddress
            ? validated.shippingCountry
            : validated.billingCountry,

          notes: validated.orderNotes,

          // Create order items
          storeOrderItems: {
            create: items.map((item) => ({
              productId: item.productId,
              variantId: item.variantId,
              quantity: item.quantity,
              price: item.price,
              productName: item.product.name,
            })),
          },
        },
      })

      orderIds.push(order.id)
    }

    // Clear cart after creating orders
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    })

    await prisma.shoppingCart.update({
      where: { id: cart.id },
      data: {
        subtotal: 0,
        tax: 0,
        total: 0,
      },
    })

    revalidatePath('/cart')

    return {
      success: true,
      orderIds,
      // Return first order ID for redirect
      orderId: orderIds[0],
    }
  } catch (error) {
    console.error('Create order error:', error)
    return { error: 'Failed to create order. Please try again.' }
  }
}

/**
 * Process payment for order
 * This would integrate with Stripe, Square, PayPal, etc.
 */
export async function processOrderPayment(
  orderId: string,
  paymentMethod: 'stripe' | 'square' | 'paypal',
  paymentDetails: any
) {
  try {
    const user = await requireAuth()

    const order = await prisma.storeOrder.findUnique({
      where: { id: orderId },
      include: {
        customer: true,
        vendorStore: true,
      },
    })

    if (!order || order.customerId !== user.id) {
      return { error: 'Order not found' }
    }

    if (order.status !== 'PENDING') {
      return { error: 'Order cannot be processed' }
    }

    // TODO: Integrate with payment providers
    // For now, just mark as paid (DEMO MODE)

    const updatedOrder = await prisma.storeOrder.update({
      where: { id: orderId },
      data: {
        status: 'PROCESSING',
        paymentMethod,
        paymentStatus: 'PAID',
        paidAt: new Date(),
      },
    })

    // Decrement product inventory
    const orderItems = await prisma.storeOrderItem.findMany({
      where: { orderId },
      include: { product: true },
    })

    for (const item of orderItems) {
      if (item.product.trackInventory) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            quantity: { decrement: item.quantity },
            salesCount: { increment: item.quantity },
          },
        })
      }
    }

    // Update vendor store revenue
    await prisma.vendorStore.update({
      where: { id: order.vendorStoreId },
      data: {
        totalRevenue: { increment: order.total },
        withdrawBalance: {
          increment: order.total - (order.total * 0.1) // 10% platform fee
        },
      },
    })

    revalidatePath(`/orders/${orderId}`)

    return { success: true, order: updatedOrder }
  } catch (error) {
    console.error('Process payment error:', error)
    return { error: 'Failed to process payment. Please try again.' }
  }
}
