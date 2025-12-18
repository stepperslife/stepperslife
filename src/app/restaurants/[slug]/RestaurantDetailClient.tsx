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
import { RestaurantReviews } from "@/components/restaurants/RestaurantReviews";
import { StarRating } from "@/components/restaurants/StarRating";
import { FavoriteButton } from "@/components/restaurants/FavoriteButton";
import { ShareButton } from "@/components/restaurants/ShareButton";
import { useFoodCart } from "@/contexts/FoodCartContext";

export default function RestaurantDetailClient({ slug }: { slug: string }) {
  const router = useRouter();
  const { cart, addToCart: addToFoodCart, removeFromCart, getItemCount, getSubtotal, isCartOpen, setIsCartOpen } = useFoodCart();
  const [showCart, setShowCart] = useState(false);

  // Fetch restaurant data
  const restaurant = useQuery(api.restaurants.getBySlug, { slug });

  // Fetch menu data only when we have a valid restaurant
  const menuItems = useQuery(
    api.menuItems.getByRestaurant,
    restaurant ? { restaurantId: restaurant._id } : "skip"
  );
  const categories = useQuery(
    api.menuItems.getCategories,
    restaurant ? { restaurantId: restaurant._id } : "skip"
  );

  // Fetch user and review data
  const currentUser = useQuery(api.users.queries.getCurrentUser);
  const reviewStats = useQuery(
    api.restaurantReviews.getRestaurantStats,
    restaurant ? { restaurantId: restaurant._id } : "skip"
  );

  // Loading state
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

  // Not found state
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

  // Cart helper functions using FoodCartContext
  const addToCart = (item: { _id: string; name: string; price: number }) => {
    if (!restaurant) return;
    addToFoodCart(restaurant._id, slug, restaurant.name, {
      menuItemId: item._id,
      name: item.name,
      price: item.price,
    });
  };

  // Use cart from context, but only show items for this restaurant
  const isThisRestaurant = cart.restaurantId === restaurant?._id;
  const cartItems = isThisRestaurant ? cart.items : [];
  const cartTotal = isThisRestaurant ? getSubtotal() : 0;
  const cartCount = isThisRestaurant ? getItemCount() : 0;

  const handleCheckout = () => {
    // Cart is now stored in context/sessionStorage, no need for URL params
    router.push(`/restaurants/${slug}/checkout`);
  };

  // Group menu items by category
  const itemsByCategory = menuItems?.reduce((acc, item) => {
    const catId = (item.categoryId as string) || "uncategorized";
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
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold">{restaurant.name}</h1>
                  <FavoriteButton
                    restaurantId={restaurant._id}
                    userId={currentUser?._id || null}
                    size="lg"
                  />
                  <ShareButton
                    title={restaurant.name}
                    text={`Check out ${restaurant.name} on SteppersLife! ${restaurant.cuisine?.join(", ") || "Great food"} - Order for pickup today.`}
                    variant="icon"
                    size="lg"
                  />
                </div>
                {/* Rating Display */}
                {reviewStats && reviewStats.totalReviews > 0 && (
                  <div className="flex items-center gap-2 mt-2">
                    <StarRating rating={reviewStats.averageRating} size="md" showValue />
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      ({reviewStats.totalReviews} {reviewStats.totalReviews === 1 ? "review" : "reviews"})
                    </span>
                  </div>
                )}
                {restaurant.cuisine && restaurant.cuisine.length > 0 && (
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

            {/* Operating Hours */}
            {restaurant.operatingHours && (
              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Operating Hours
                </h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map((day) => {
                    const hours = (restaurant.operatingHours as Record<string, { open: string; close: string; closed: boolean }>)?.[day];
                    const isToday = new Date().toLocaleDateString("en-US", { weekday: "long" }).toLowerCase() === day;
                    return (
                      <div key={day} className={`flex justify-between ${isToday ? "font-semibold text-orange-600" : ""}`}>
                        <span className="capitalize">{day}</span>
                        <span>
                          {hours?.closed ? "Closed" : hours ? `${hours.open} - ${hours.close}` : "Not set"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Menu */}
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-6">Menu</h2>

            {menuItems === undefined ? (
              <div className="animate-pulse space-y-4">
                <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg" />
              </div>
            ) : !menuItems || menuItems.length === 0 ? (
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
                          className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow"
                        >
                          {/* Menu Item Image */}
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                            />
                          ) : (
                            <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-lg flex-shrink-0 flex items-center justify-center">
                              <Utensils className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium">{item.name}</h4>
                            {item.description && (
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                                {item.description}
                              </p>
                            )}
                            <p className="text-orange-600 font-semibold mt-2">
                              ${(item.price / 100).toFixed(2)}
                            </p>
                          </div>
                          {restaurant.acceptingOrders && (
                            <button
                              type="button"
                              onClick={() => addToCart(item)}
                              className="p-3 min-w-[44px] min-h-[44px] bg-orange-600 text-white rounded-full hover:bg-orange-700 flex items-center justify-center flex-shrink-0"
                              aria-label={`Add ${item.name} to cart`}
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
                {(itemsByCategory?.["uncategorized"]?.length ?? 0) > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Other Items</h3>
                    <div className="grid gap-4">
                      {itemsByCategory?.["uncategorized"]?.filter(item => item.isAvailable).map((item) => (
                        <div
                          key={item._id}
                          className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow"
                        >
                          {/* Menu Item Image */}
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                            />
                          ) : (
                            <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-lg flex-shrink-0 flex items-center justify-center">
                              <Utensils className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium">{item.name}</h4>
                            {item.description && (
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                                {item.description}
                              </p>
                            )}
                            <p className="text-orange-600 font-semibold mt-2">
                              ${(item.price / 100).toFixed(2)}
                            </p>
                          </div>
                          {restaurant.acceptingOrders && (
                            <button
                              type="button"
                              onClick={() => addToCart(item)}
                              className="p-3 min-w-[44px] min-h-[44px] bg-orange-600 text-white rounded-full hover:bg-orange-700 flex items-center justify-center flex-shrink-0"
                              aria-label={`Add ${item.name} to cart`}
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

          {/* Reviews Section */}
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold mb-6">Reviews & Ratings</h2>
            <RestaurantReviews
              restaurantId={restaurant._id}
              userId={currentUser?._id || null}
            />
          </div>
        </div>

        {/* Floating Cart Button */}
        {cartCount > 0 && (
          <button
            type="button"
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
          <div
            className="fixed inset-0 z-50 flex justify-end"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-title"
          >
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setShowCart(false)}
              aria-label="Close cart"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setShowCart(false)}
            />
            <div className="relative w-full max-w-md bg-white dark:bg-gray-900 h-full overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 id="cart-title" className="text-xl font-bold">Your Order</h2>
                  <button
                    type="button"
                    onClick={() => setShowCart(false)}
                    className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                    aria-label="Close cart"
                  >
                    <span className="text-xl">✕</span>
                  </button>
                </div>

                {cartItems.length === 0 ? (
                  <p className="text-gray-500">Your cart is empty</p>
                ) : (
                  <>
                    <div className="space-y-4">
                      {cartItems.map((item) => (
                        <div key={item.menuItemId} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-gray-500">
                              ${(item.price / 100).toFixed(2)} each
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => removeFromCart(item.menuItemId)}
                              className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                              aria-label={`Remove one ${item.name} from cart`}
                            >
                              <Minus className="h-5 w-5" />
                            </button>
                            <span className="w-8 text-center" aria-label={`${item.quantity} ${item.name} in cart`}>{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => addToCart({ _id: item.menuItemId, name: item.name, price: item.price })}
                              className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                              aria-label={`Add one more ${item.name} to cart`}
                            >
                              <Plus className="h-5 w-5" />
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
                        type="button"
                        onClick={handleCheckout}
                        className="w-full mt-4 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 min-h-[44px]"
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
