/**
 * Store Module - Database Queries
 *
 * Cached database queries for the multi-vendor store system:
 * - Public store listings and product catalogs
 * - Store and product detail pages
 * - Vendor dashboard data
 * - Order history and analytics
 *
 * All queries use React cache() for request-level memoization
 */

import { cache } from 'react'
import { prisma } from '@/lib/db/client'
import { ProductStatus } from '@prisma/client'

// ============================================================================
// Public Queries - Store & Product Discovery
// ============================================================================

/**
 * Get all active vendor stores
 * Used for public store listing page
 */
export const getActiveVendorStores = cache(async () => {
  return prisma.vendorStore.findMany({
    where: {
      isActive: true,
    },
    select: {
      id: true,
      slug: true,
      name: true,
      tagline: true,
      logoUrl: true,
      bannerUrl: true,
      averageRating: true,
      totalReviews: true,
      totalProducts: true,
      isVerified: true,
    },
    orderBy: [
      { isVerified: 'desc' },
      { averageRating: 'desc' },
      { totalSales: 'desc' },
    ],
  })
})

/**
 * Get vendor store by slug with full details
 * Used for store detail/storefront page
 */
export const getVendorStoreBySlug = cache(async (slug: string) => {
  return prisma.vendorStore.findUnique({
    where: { slug },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      products: {
        where: {
          status: ProductStatus.ACTIVE,
        },
        select: {
          id: true,
          slug: true,
          name: true,
          price: true,
          compareAtPrice: true,
          averageRating: true,
          reviewCount: true,
          salesCount: true,
          productImages: {
            take: 1,
            orderBy: { sortOrder: 'asc' },
          },
        },
        orderBy: [
          { salesCount: 'desc' },
          { createdAt: 'desc' },
        ],
      },
      shopRating: true,
    },
  })
})

/**
 * Get published products from a store
 * Used for store product catalog
 */
export const getStoreProducts = cache(async (storeId: string) => {
  return prisma.product.findMany({
    where: {
      vendorStoreId: storeId,
      status: ProductStatus.ACTIVE,
    },
    include: {
      productImages: {
        take: 1,
        orderBy: { sortOrder: 'asc' },
      },
    },
    orderBy: [
      { salesCount: 'desc' },
      { createdAt: 'desc' },
    ],
  })
})

/**
 * Get product by slug with full details
 * Used for product detail page
 */
export const getProductBySlug = cache(async (storeSlug: string, productSlug: string) => {
  return prisma.product.findFirst({
    where: {
      slug: productSlug,
      vendorStore: {
        slug: storeSlug,
      },
    },
    include: {
      vendorStore: {
        select: {
          id: true,
          slug: true,
          name: true,
          logoUrl: true,
          averageRating: true,
          totalReviews: true,
          isVerified: true,
        },
      },
      productImages: {
        orderBy: { sortOrder: 'asc' },
      },
      productVariants: {
        where: { available: true },
        orderBy: { sortOrder: 'asc' },
      },
      variantCombinations: {
        where: { available: true },
        orderBy: { sortOrder: 'asc' },
      },
      variantOptions: {
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      },
      productAddons: {
        where: { isActive: true },
      },
      productReviews: {
        where: { status: 'PUBLISHED' },
        include: {
          customer: {
            select: {
              name: true,
              image: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  })
})

/**
 * Search products across all stores
 * Used for global product search
 */
export const searchProducts = cache(async (query: string, category?: string) => {
  const where: any = {
    status: ProductStatus.ACTIVE,
    vendorStore: {
      isActive: true,
    },
  }

  if (query) {
    where.OR = [
      { name: { contains: query, mode: 'insensitive' } },
      { description: { contains: query, mode: 'insensitive' } },
      { tags: { hasSome: [query] } },
    ]
  }

  if (category) {
    where.category = category
  }

  return prisma.product.findMany({
    where,
    include: {
      vendorStore: {
        select: {
          slug: true,
          name: true,
          isVerified: true,
        },
      },
      productImages: {
        take: 1,
        orderBy: { sortOrder: 'asc' },
      },
    },
    orderBy: [
      { salesCount: 'desc' },
      { averageRating: 'desc' },
    ],
    take: 50,
  })
})

// ============================================================================
// Vendor Queries - Dashboard & Management
// ============================================================================

/**
 * Get vendor's stores
 * Used for vendor dashboard
 */
export const getVendorStores = cache(async (userId: string) => {
  return prisma.vendorStore.findMany({
    where: {
      userId,
    },
    include: {
      _count: {
        select: {
          products: true,
          storeOrders: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
})

/**
 * Get vendor's products
 * Used for vendor product management
 */
export const getVendorProducts = cache(async (storeId: string) => {
  return prisma.product.findMany({
    where: {
      vendorStoreId: storeId,
      status: {
        not: ProductStatus.ARCHIVED,
      },
    },
    include: {
      productImages: {
        take: 1,
        orderBy: { sortOrder: 'asc' },
      },
      _count: {
        select: {
          productReviews: true,
          storeOrderItems: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
})

/**
 * Get vendor's orders
 * Used for vendor order management
 */
export const getVendorOrders = cache(async (storeId: string) => {
  return prisma.storeOrder.findMany({
    where: {
      vendorStoreId: storeId,
    },
    include: {
      customer: {
        select: {
          name: true,
          email: true,
        },
      },
      storeOrderItems: {
        include: {
          product: {
            select: {
              name: true,
              slug: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
})

/**
 * Get vendor store analytics
 * Used for vendor dashboard
 */
export const getVendorStoreStats = cache(async (storeId: string) => {
  const store = await prisma.vendorStore.findUnique({
    where: { id: storeId },
    select: {
      totalProducts: true,
      totalOrders: true,
      totalSales: true,
      averageRating: true,
      totalReviews: true,
      withdrawBalance: true,
    },
  })

  if (!store) return null

  // Get additional stats
  const [draftProducts, pendingOrders, recentOrders, lowStockProducts] = await Promise.all([
    prisma.product.count({
      where: {
        vendorStoreId: storeId,
        status: ProductStatus.DRAFT,
      },
    }),
    prisma.storeOrder.count({
      where: {
        vendorStoreId: storeId,
        status: 'PENDING',
      },
    }),
    prisma.storeOrder.findMany({
      where: {
        vendorStoreId: storeId,
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        orderNumber: true,
        total: true,
        status: true,
        createdAt: true,
        customerName: true,
      },
    }),
    prisma.product.findMany({
      where: {
        vendorStoreId: storeId,
        trackInventory: true,
        quantity: {
          lte: prisma.product.fields.lowStockThreshold,
        },
        status: ProductStatus.ACTIVE,
      },
      select: {
        id: true,
        name: true,
        quantity: true,
        lowStockThreshold: true,
      },
      take: 10,
    }),
  ])

  return {
    ...store,
    draftProducts,
    pendingOrders,
    recentOrders,
    lowStockProducts,
  }
})

// ============================================================================
// Customer Queries - Orders & Purchases
// ============================================================================

/**
 * Get customer's store orders
 * Used for "My Orders" page
 */
export const getCustomerStoreOrders = cache(async (userId: string) => {
  return prisma.storeOrder.findMany({
    where: {
      customerId: userId,
    },
    include: {
      vendorStore: {
        select: {
          slug: true,
          name: true,
          logoUrl: true,
        },
      },
      storeOrderItems: {
        include: {
          product: {
            select: {
              slug: true,
              name: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
})

/**
 * Get order by ID with full details
 * Used for order detail page
 */
export const getOrderById = cache(async (orderId: string) => {
  return prisma.storeOrder.findUnique({
    where: { id: orderId },
    include: {
      vendorStore: {
        select: {
          slug: true,
          name: true,
          email: true,
          phone: true,
        },
      },
      customer: {
        select: {
          name: true,
          email: true,
        },
      },
      storeOrderItems: {
        include: {
          product: {
            select: {
              slug: true,
              name: true,
            },
          },
        },
      },
    },
  })
})

// ============================================================================
// Helper Queries
// ============================================================================

/**
 * Check if user owns a vendor store
 */
export const userHasVendorStore = cache(async (userId: string) => {
  const count = await prisma.vendorStore.count({
    where: {
      userId,
      isActive: true,
    },
  })

  return count > 0
})

/**
 * Get featured products (bestsellers)
 * Used for homepage or featured sections
 */
export const getFeaturedProducts = cache(async (limit: number = 8) => {
  return prisma.product.findMany({
    where: {
      status: ProductStatus.ACTIVE,
      vendorStore: {
        isActive: true,
      },
    },
    include: {
      vendorStore: {
        select: {
          slug: true,
          name: true,
          isVerified: true,
        },
      },
      productImages: {
        take: 1,
        orderBy: { sortOrder: 'asc' },
      },
    },
    orderBy: [
      { salesCount: 'desc' },
      { averageRating: 'desc' },
    ],
    take: limit,
  })
})

/**
 * Get product categories with product counts
 */
export const getProductCategories = cache(async () => {
  const categories = await prisma.product.groupBy({
    by: ['category'],
    where: {
      status: ProductStatus.ACTIVE,
      vendorStore: {
        isActive: true,
      },
    },
    _count: {
      category: true,
    },
    orderBy: {
      _count: {
        category: 'desc',
      },
    },
  })

  return categories
})

/**
 * Get user's shopping cart with all items
 */
export const getUserCart = cache(async (userId: string) => {
  return prisma.shoppingCart.findFirst({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            include: {
              vendorStore: {
                select: {
                  slug: true,
                  name: true,
                },
              },
              productImages: {
                take: 1,
                orderBy: { displayOrder: 'asc' },
              },
            },
          },
          variant: true,
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  })
})
