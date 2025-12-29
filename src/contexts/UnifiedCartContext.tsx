"use client";

/**
 * UnifiedCartContext - Facade for all cart types in SteppersLife
 *
 * Provides a unified API for managing all cart types:
 * - Products (marketplace)
 * - Events (tickets, seats, hotels)
 * - Food (restaurant orders)
 *
 * Each cart type has its own storage strategy and business logic,
 * but this context provides a single point of access.
 */

import React, { createContext, useContext, useMemo } from "react";
import { useCart, CartItem as ProductCartItem, VendorGroup } from "./CartContext";
import {
  useEventCart,
  EventCartItem,
  TicketCartItem,
  SeatCartItem,
  HotelCartItem,
} from "./EventCartContext";
import { useFoodCart, FoodCartItem, FoodCart } from "./FoodCartContext";

// Re-export item types for convenience
export type {
  ProductCartItem,
  VendorGroup,
  EventCartItem,
  TicketCartItem,
  SeatCartItem,
  HotelCartItem,
  FoodCartItem,
  FoodCart,
};

// Unified item type for cross-cart operations
export type UnifiedCartItemType = "product" | "ticket" | "seat" | "hotel" | "food";

export interface UnifiedCartSummary {
  totalItemCount: number;
  totalAmountCents: number;
  hasProducts: boolean;
  hasEvents: boolean;
  hasFood: boolean;
  productCount: number;
  ticketCount: number;
  seatCount: number;
  hotelCount: number;
  foodCount: number;
}

interface UnifiedCartContextType {
  // Summary across all carts
  getSummary: () => UnifiedCartSummary;
  getTotalItemCount: () => number;
  getTotalAmountCents: () => number;

  // Product cart access
  products: {
    items: ProductCartItem[];
    addToCart: (item: ProductCartItem) => void;
    removeFromCart: (productId: string, variantId?: string) => void;
    updateQuantity: (productId: string, quantity: number, variantId?: string) => void;
    clearCart: () => void;
    getItemCount: () => number;
    getSubtotal: () => number;
    getItemsByVendor: () => VendorGroup[];
    getVendorCount: () => number;
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
  };

  // Event cart access
  events: {
    eventId: string | null;
    items: EventCartItem[];
    setEventId: (eventId: string) => void;
    // Tickets
    addTicket: (tier: { id: string; name: string; description?: string; priceCents: number }, quantity: number) => void;
    updateTicketQuantity: (tierId: string, quantity: number) => void;
    removeTicket: (tierId: string) => void;
    getTicketQuantity: (tierId: string) => number;
    // Seats
    addSeats: (table: { id: string; number: string | number }, seats: Array<{ id: string; number: string }>, pricePerSeatCents: number) => void;
    removeSeats: (tableId: string) => void;
    clearAllSeats: () => void;
    getSelectedSeats: () => SeatCartItem[];
    // Hotels
    addHotelRoom: (hotel: {
      packageId: string;
      hotelName: string;
      roomTypeId: string;
      roomTypeName: string;
      checkInDate: number;
      checkOutDate: number;
      nights: number;
      numberOfRooms: number;
      numberOfGuests: number;
      pricePerNightCents: number;
      platformFeeCents: number;
      totalCents: number;
    }) => void;
    updateHotelRoom: (id: string, updates: Partial<HotelCartItem>) => void;
    removeHotelRoom: (id: string) => void;
    // Totals
    getSubtotalCents: () => number;
    getItemCount: () => number;
    getTicketCount: () => number;
    getSeatCount: () => number;
    getHotelRoomCount: () => number;
    clearCart: () => void;
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    getCheckoutItems: () => {
      tickets: TicketCartItem[];
      seats: SeatCartItem[];
      hotels: HotelCartItem[];
    };
  };

  // Food cart access
  food: {
    cart: FoodCart;
    addToCart: (restaurantId: string, restaurantSlug: string, restaurantName: string, item: Omit<FoodCartItem, "quantity">) => void;
    removeFromCart: (menuItemId: string) => void;
    updateQuantity: (menuItemId: string, quantity: number) => void;
    clearCart: () => void;
    getItemCount: () => number;
    getSubtotal: () => number;
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    reorderItems: (restaurantId: string, restaurantSlug: string, restaurantName: string, items: FoodCartItem[]) => void;
  };

  // Convenience methods
  clearAllCarts: () => void;
  hasAnyItems: () => boolean;
}

const UnifiedCartContext = createContext<UnifiedCartContextType | undefined>(undefined);

export function UnifiedCartProvider({ children }: { children: React.ReactNode }) {
  // Use the individual cart hooks
  const productCart = useCart();
  const eventCart = useEventCart();
  const foodCart = useFoodCart();

  // Memoized unified interface
  const value = useMemo<UnifiedCartContextType>(() => ({
    // Summary across all carts
    getSummary: () => {
      const productCount = productCart.getItemCount();
      const ticketCount = eventCart.getTicketCount();
      const seatCount = eventCart.getSeatCount();
      const hotelCount = eventCart.getHotelRoomCount();
      const foodCount = foodCart.getItemCount();

      return {
        totalItemCount: productCount + ticketCount + seatCount + hotelCount + foodCount,
        totalAmountCents: (productCart.getSubtotal() * 100) + eventCart.getSubtotalCents() + (foodCart.getSubtotal() * 100),
        hasProducts: productCount > 0,
        hasEvents: (ticketCount + seatCount + hotelCount) > 0,
        hasFood: foodCount > 0,
        productCount,
        ticketCount,
        seatCount,
        hotelCount,
        foodCount,
      };
    },

    getTotalItemCount: () => {
      return productCart.getItemCount() +
        eventCart.getTicketCount() +
        eventCart.getSeatCount() +
        eventCart.getHotelRoomCount() +
        foodCart.getItemCount();
    },

    getTotalAmountCents: () => {
      // Product cart stores prices in dollars, event cart in cents, food cart in dollars
      return (productCart.getSubtotal() * 100) +
        eventCart.getSubtotalCents() +
        (foodCart.getSubtotal() * 100);
    },

    // Product cart access
    products: {
      items: productCart.items,
      addToCart: productCart.addToCart,
      removeFromCart: (productId, variantId) =>
        productCart.removeFromCart(productId as any, variantId),
      updateQuantity: (productId, quantity, variantId) =>
        productCart.updateQuantity(productId as any, quantity, variantId),
      clearCart: productCart.clearCart,
      getItemCount: productCart.getItemCount,
      getSubtotal: productCart.getSubtotal,
      getItemsByVendor: productCart.getItemsByVendor,
      getVendorCount: productCart.getVendorCount,
      isOpen: productCart.isCartOpen,
      setIsOpen: productCart.setIsCartOpen,
    },

    // Event cart access
    events: {
      eventId: eventCart.eventId,
      items: eventCart.items,
      setEventId: eventCart.setEventId,
      addTicket: eventCart.addTicket,
      updateTicketQuantity: eventCart.updateTicketQuantity,
      removeTicket: eventCart.removeTicket,
      getTicketQuantity: eventCart.getTicketQuantity,
      addSeats: eventCart.addSeats,
      removeSeats: eventCart.removeSeats,
      clearAllSeats: eventCart.clearAllSeats,
      getSelectedSeats: eventCart.getSelectedSeats,
      addHotelRoom: eventCart.addHotelRoom,
      updateHotelRoom: eventCart.updateHotelRoom,
      removeHotelRoom: eventCart.removeHotelRoom,
      getSubtotalCents: eventCart.getSubtotalCents,
      getItemCount: eventCart.getItemCount,
      getTicketCount: eventCart.getTicketCount,
      getSeatCount: eventCart.getSeatCount,
      getHotelRoomCount: eventCart.getHotelRoomCount,
      clearCart: eventCart.clearCart,
      isOpen: eventCart.isCartOpen,
      setIsOpen: eventCart.setIsCartOpen,
      getCheckoutItems: eventCart.getCheckoutItems,
    },

    // Food cart access
    food: {
      cart: foodCart.cart,
      addToCart: foodCart.addToCart,
      removeFromCart: foodCart.removeFromCart,
      updateQuantity: foodCart.updateQuantity,
      clearCart: foodCart.clearCart,
      getItemCount: foodCart.getItemCount,
      getSubtotal: foodCart.getSubtotal,
      isOpen: foodCart.isCartOpen,
      setIsOpen: foodCart.setIsCartOpen,
      reorderItems: foodCart.reorderItems,
    },

    // Convenience methods
    clearAllCarts: () => {
      productCart.clearCart();
      eventCart.clearCart();
      foodCart.clearCart();
    },

    hasAnyItems: () => {
      return productCart.getItemCount() > 0 ||
        eventCart.getItemCount() > 0 ||
        foodCart.getItemCount() > 0;
    },
  }), [productCart, eventCart, foodCart]);

  return (
    <UnifiedCartContext.Provider value={value}>
      {children}
    </UnifiedCartContext.Provider>
  );
}

/**
 * Hook to access the unified cart context
 *
 * @example
 * ```tsx
 * const { products, events, food, getSummary } = useUnifiedCart();
 *
 * // Add a product
 * products.addToCart(item);
 *
 * // Add event tickets
 * events.addTicket(tier, 2);
 *
 * // Get total across all carts
 * const summary = getSummary();
 * console.log(summary.totalItemCount, summary.totalAmountCents);
 * ```
 */
export function useUnifiedCart() {
  const context = useContext(UnifiedCartContext);
  if (context === undefined) {
    throw new Error("useUnifiedCart must be used within a UnifiedCartProvider");
  }
  return context;
}

/**
 * Convenience hooks for accessing individual cart types through unified context
 */
export function useUnifiedProductCart() {
  const { products } = useUnifiedCart();
  return products;
}

export function useUnifiedEventCart() {
  const { events } = useUnifiedCart();
  return events;
}

export function useUnifiedFoodCart() {
  const { food } = useUnifiedCart();
  return food;
}
