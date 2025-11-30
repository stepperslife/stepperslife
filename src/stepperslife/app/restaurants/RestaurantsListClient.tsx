"use client";

import Link from "next/link";
import { MapPin, Clock, Utensils, Star, Loader2 } from "lucide-react";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { RestaurantsSubNav } from "@/components/layout/RestaurantsSubNav";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function RestaurantsListClient() {
  const restaurants = useQuery(api.public.queries.getActiveRestaurants);

  // Loading state
  if (restaurants === undefined) {
    return (
      <>
        <PublicHeader />
        <RestaurantsSubNav />
        <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-orange-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading restaurants...</p>
          </div>
        </div>
        <PublicFooter />
      </>
    );
  }

  return (
    <>
      <PublicHeader />
      <RestaurantsSubNav />
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white dark:from-gray-900 dark:to-gray-800">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-600/90 to-red-600/90" />
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1600&q=80')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <div className="relative container mx-auto px-4 py-16 md:py-24">
            <div className="max-w-2xl">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Delicious Food,
                <br />
                <span className="text-orange-200">Ready for Pickup</span>
              </h1>
              <p className="text-lg text-white/90 mb-8">
                Order from the best local restaurants in the stepping community.
                Fresh food, fast pickup, no delivery fees.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="#restaurants"
                  className="px-6 py-3 bg-white text-orange-600 rounded-full font-semibold hover:bg-orange-50 transition-colors"
                >
                  Browse Restaurants
                </Link>
                <Link
                  href="/restaurateur/apply"
                  className="px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-full font-semibold hover:bg-white/20 transition-colors border border-white/30"
                >
                  Become a Partner Restaurant
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Restaurants Section */}
        <div id="restaurants" className="container mx-auto px-4 py-12">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3">
              {restaurants.length > 0 ? "Order from Our Restaurants" : "Restaurants Coming Soon"}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
              {restaurants.length > 0
                ? "Browse our selection of amazing restaurants and place your order for pickup"
                : "We're building our restaurant network. Check back soon or apply to join!"
              }
            </p>
          </div>

          {restaurants.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {restaurants.map((restaurant) => (
                <Link
                  key={restaurant._id}
                  href={`/restaurants/${restaurant.slug}`}
                  className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="relative h-48 overflow-hidden">
                    {restaurant.coverImageUrl ? (
                      <img
                        src={restaurant.coverImageUrl}
                        alt={restaurant.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                        <Utensils className="h-16 w-16 text-white opacity-50" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    {/* Status Badge */}
                    <div className="absolute top-4 right-4">
                      {restaurant.acceptingOrders ? (
                        <span className="px-3 py-1 text-xs font-semibold bg-green-500 text-white rounded-full shadow-lg">
                          Open for Orders
                        </span>
                      ) : (
                        <span className="px-3 py-1 text-xs font-semibold bg-gray-500 text-white rounded-full shadow-lg">
                          Currently Closed
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                      {restaurant.name}
                    </h3>

                    {restaurant.cuisine && restaurant.cuisine.length > 0 && (
                      <p className="text-sm text-orange-600 dark:text-orange-400 mb-3">
                        {restaurant.cuisine.join(" • ")}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {restaurant.city}, {restaurant.state}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        ~{restaurant.estimatedPickupTime || 30} min
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="inline-block p-8 bg-orange-50 dark:bg-orange-900/20 rounded-3xl">
                <Utensils className="h-16 w-16 mx-auto text-orange-400 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  No Restaurants Yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md">
                  We're actively onboarding restaurants. Be the first to join our platform!
                </p>
                <Link
                  href="/restaurateur/apply"
                  className="inline-block px-6 py-3 bg-orange-600 text-white rounded-full font-semibold hover:bg-orange-700 transition-colors"
                >
                  Apply Now
                </Link>
              </div>
            </div>
          )}

          {/* CTA Section */}
          <div className="mt-16 text-center">
            <div className="inline-block p-8 bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 rounded-3xl">
              <Utensils className="h-12 w-12 mx-auto text-orange-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Own a Restaurant?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md">
                Join the SteppersLife restaurant network and reach thousands of customers in the stepping community.
              </p>
              <Link
                href="/restaurateur/apply"
                className="inline-block px-6 py-3 bg-orange-600 text-white rounded-full font-semibold hover:bg-orange-700 transition-colors"
              >
                Apply to Join
              </Link>
            </div>
          </div>
        </div>
      </div>
      <PublicFooter />
    </>
  );
}
