"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { MapPin, Phone, Clock, Utensils, Plus, Minus, ShoppingCart } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { RestaurantsSubNav } from "@/components/layout/RestaurantsSubNav";
import { PublicFooter } from "@/components/layout/PublicFooter";

interface CartItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
}

export default function RestaurantDetailClient({ slug }: { slug: string }) {
  const router = useRouter();
  const restaurant = useQuery(api.restaurants.getBySlug, { slug });
  const menuItems = restaurant ? useQuery(api.menuItems.getByRestaurant, { restaurantId: restaurant._id }) : undefined;
  const categories = restaurant ? useQuery(api.menuItems.getCategories, { restaurantId: restaurant._id }) : undefined;

  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);

  if (restaurant === undefined) {
    return (
      <>
        <PublicHeader />
        <RestaurantsSubNav />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg mb-6" />
            <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
            <div className="h-4 w-96 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </div>
        <PublicFooter />
      </>
    );
  }

  if (restaurant === null) {
    return (
      <>
        <PublicHeader />
        <RestaurantsSubNav />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold">Restaurant not found</h1>
          <Link href="/restaurants" className="text-orange-600 hover:underline mt-4 inline-block">
            Back to restaurants
          </Link>
        </div>
        <PublicFooter />
      </>
    );
  }

  const addToCart = (item: { _id: string; name: string; price: number }) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.menuItemId === item._id);
      if (existing) {
        return prev.map((i) =>
          i.menuItemId === item._id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { menuItemId: item._id, name: item.name, price: item.price, quantity: 1 }];
    });
  };

  const removeFromCart = (menuItemId: string) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.menuItemId === menuItemId);
      if (existing && existing.quantity > 1) {
        return prev.map((i) =>
          i.menuItemId === menuItemId ? { ...i, quantity: i.quantity - 1 } : i
        );
      }
      return prev.filter((i) => i.menuItemId !== menuItemId);
    });
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = () => {
    const cartParam = encodeURIComponent(JSON.stringify(cart));
    router.push(`/restaurants/${slug}/checkout?cart=${cartParam}`);
  };

  // Group menu items by category
  const itemsByCategory = menuItems?.reduce((acc, item) => {
    const catId = item.categoryId || "uncategorized";
    if (!acc[catId]) acc[catId] = [];
    acc[catId].push(item);
    return acc;
  }, {} as Record<string, typeof menuItems>);

  return (
    <>
      <PublicHeader />
      <RestaurantsSubNav />
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="relative">
            {restaurant.coverImageUrl ? (
              <img
                src={restaurant.coverImageUrl}
                alt={restaurant.name}
                className="w-full h-64 object-cover rounded-lg"
              />
            ) : (
              <div className="w-full h-64 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center">
                <Utensils className="h-24 w-24 text-white opacity-50" />
              </div>
            )}
          </div>

          <div className="mt-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold">{restaurant.name}</h1>
                {restaurant.cuisine.length > 0 && (
                  <p className="text-gray-500 dark:text-gray-400 mt-1">
                    {restaurant.cuisine.join(" • ")}
                  </p>
                )}
              </div>
              {restaurant.acceptingOrders ? (
                <span className="px-3 py-1 text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full">
                  Accepting Orders
                </span>
              ) : (
                <span className="px-3 py-1 text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded-full">
                  Closed
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-600 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {restaurant.address}, {restaurant.city}, {restaurant.state} {restaurant.zipCode}
              </span>
              <span className="flex items-center gap-1">
                <Phone className="h-4 w-4" />
                {restaurant.phone}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                ~{restaurant.estimatedPickupTime} min pickup
              </span>
            </div>

            {restaurant.description && (
              <p className="mt-4 text-gray-700 dark:text-gray-300">{restaurant.description}</p>
            )}
          </div>

          {/* Menu */}
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-6">Menu</h2>
            
            {!menuItems || menuItems.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-gray-500">No menu items available yet</p>
              </div>
            ) : (
              <div className="space-y-8">
                {categories?.map((category) => (
                  <div key={category._id}>
                    <h3 className="text-xl font-semibold mb-4">{category.name}</h3>
                    <div className="grid gap-4">
                      {itemsByCategory?.[category._id]?.filter(item => item.isAvailable).map((item) => (
                        <div
                          key={item._id}
                          className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow"
                        >
                          <div className="flex-1">
                            <h4 className="font-medium">{item.name}</h4>
                            {item.description && (
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {item.description}
                              </p>
                            )}
                            <p className="text-orange-600 font-semibold mt-2">
                              ${(item.price / 100).toFixed(2)}
                            </p>
                          </div>
                          {restaurant.acceptingOrders && (
                            <button
                              onClick={() => addToCart(item)}
                              className="ml-4 p-2 bg-orange-600 text-white rounded-full hover:bg-orange-700"
                            >
                              <Plus className="h-5 w-5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                
                {/* Uncategorized items */}
                {itemsByCategory?.["uncategorized"]?.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Other Items</h3>
                    <div className="grid gap-4">
                      {itemsByCategory["uncategorized"].filter(item => item.isAvailable).map((item) => (
                        <div
                          key={item._id}
                          className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow"
                        >
                          <div className="flex-1">
                            <h4 className="font-medium">{item.name}</h4>
                            {item.description && (
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {item.description}
                              </p>
                            )}
                            <p className="text-orange-600 font-semibold mt-2">
                              ${(item.price / 100).toFixed(2)}
                            </p>
                          </div>
                          {restaurant.acceptingOrders && (
                            <button
                              onClick={() => addToCart(item)}
                              className="ml-4 p-2 bg-orange-600 text-white rounded-full hover:bg-orange-700"
                            >
                              <Plus className="h-5 w-5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Floating Cart Button */}
        {cartCount > 0 && (
          <button
            onClick={() => setShowCart(true)}
            className="fixed bottom-6 right-6 flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-full shadow-lg hover:bg-orange-700 transition-colors"
          >
            <ShoppingCart className="h-5 w-5" />
            <span className="font-medium">View Cart ({cartCount})</span>
            <span className="font-bold">${(cartTotal / 100).toFixed(2)}</span>
          </button>
        )}

        {/* Cart Sidebar */}
        {showCart && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowCart(false)} />
            <div className="relative w-full max-w-md bg-white dark:bg-gray-900 h-full overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">Your Order</h2>
                  <button onClick={() => setShowCart(false)} className="text-gray-500 hover:text-gray-700">
                    ✕
                  </button>
                </div>
                
                {cart.length === 0 ? (
                  <p className="text-gray-500">Your cart is empty</p>
                ) : (
                  <>
                    <div className="space-y-4">
                      {cart.map((item) => (
                        <div key={item.menuItemId} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-gray-500">
                              ${(item.price / 100).toFixed(2)} each
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => removeFromCart(item.menuItemId)}
                              className="p-1 bg-gray-100 dark:bg-gray-700 rounded"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <button
                              onClick={() => addToCart({ _id: item.menuItemId, name: item.name, price: item.price })}
                              className="p-1 bg-gray-100 dark:bg-gray-700 rounded"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="border-t mt-6 pt-6">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span>${(cartTotal / 100).toFixed(2)}</span>
                      </div>
                      <button
                        onClick={handleCheckout}
                        className="w-full mt-4 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700"
                      >
                        Proceed to Checkout
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      <PublicFooter />
    </>
  );
}
