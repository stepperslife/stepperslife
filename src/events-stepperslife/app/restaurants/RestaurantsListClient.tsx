"use client";

import Link from "next/link";
import { MapPin, Clock, Utensils, Star } from "lucide-react";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { RestaurantsSubNav } from "@/components/layout/RestaurantsSubNav";
import { PublicFooter } from "@/components/layout/PublicFooter";

// Mock restaurant data with Framer-style imagery
const mockRestaurants = [
  {
    id: "1",
    slug: "soul-kitchen-chicago",
    name: "Soul Kitchen Chicago",
    cuisine: ["Soul Food", "Southern"],
    city: "Chicago",
    state: "IL",
    estimatedPickupTime: 25,
    acceptingOrders: true,
    rating: 4.8,
    coverImageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80",
  },
  {
    id: "2",
    slug: "stepping-bites",
    name: "Stepping Bites",
    cuisine: ["American", "Comfort Food"],
    city: "Atlanta",
    state: "GA",
    estimatedPickupTime: 30,
    acceptingOrders: true,
    rating: 4.6,
    coverImageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80",
  },
  {
    id: "3",
    slug: "rhythm-cafe",
    name: "Rhythm & Blues Café",
    cuisine: ["Cajun", "Creole"],
    city: "New Orleans",
    state: "LA",
    estimatedPickupTime: 35,
    acceptingOrders: false,
    rating: 4.9,
    coverImageUrl: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&q=80",
  },
  {
    id: "4",
    slug: "groove-grill",
    name: "The Groove Grill",
    cuisine: ["BBQ", "Southern"],
    city: "Memphis",
    state: "TN",
    estimatedPickupTime: 20,
    acceptingOrders: true,
    rating: 4.7,
    coverImageUrl: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&q=80",
  },
  {
    id: "5",
    slug: "steppers-soul",
    name: "Stepper's Soul Food",
    cuisine: ["Soul Food", "Home Cooking"],
    city: "Detroit",
    state: "MI",
    estimatedPickupTime: 25,
    acceptingOrders: true,
    rating: 4.5,
    coverImageUrl: "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800&q=80",
  },
  {
    id: "6",
    slug: "midnight-kitchen",
    name: "Midnight Kitchen",
    cuisine: ["Late Night", "Comfort Food"],
    city: "Houston",
    state: "TX",
    estimatedPickupTime: 30,
    acceptingOrders: true,
    rating: 4.4,
    coverImageUrl: "https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=800&q=80",
  },
];

export default function RestaurantsListClient() {
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
              <span className="inline-block px-4 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-4">
                Coming Soon
              </span>
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
                <button className="px-6 py-3 bg-white text-orange-600 rounded-full font-semibold hover:bg-orange-50 transition-colors">
                  Get Notified When We Launch
                </button>
                <Link 
                  href="/restaurateur"
                  className="px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-full font-semibold hover:bg-white/20 transition-colors border border-white/30"
                >
                  Become a Partner Restaurant
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Preview Section */}
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3">
              Featured Restaurants Preview
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
              Here's a sneak peek at some of the amazing restaurants joining our platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockRestaurants.map((restaurant) => (
              <div
                key={restaurant.id}
                className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={restaurant.coverImageUrl}
                    alt={restaurant.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  {/* Status Badge */}
                  <div className="absolute top-4 right-4">
                    {restaurant.acceptingOrders ? (
                      <span className="px-3 py-1 text-xs font-semibold bg-green-500 text-white rounded-full shadow-lg">
                        Open Soon
                      </span>
                    ) : (
                      <span className="px-3 py-1 text-xs font-semibold bg-gray-500 text-white rounded-full shadow-lg">
                        Coming Soon
                      </span>
                    )}
                  </div>

                  {/* Rating */}
                  <div className="absolute bottom-4 left-4 flex items-center gap-1 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-lg">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm font-semibold text-gray-900">{restaurant.rating}</span>
                  </div>
                </div>
                
                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                    {restaurant.name}
                  </h3>
                  
                  <p className="text-sm text-orange-600 dark:text-orange-400 mb-3">
                    {restaurant.cuisine.join(" • ")}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {restaurant.city}, {restaurant.state}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      ~{restaurant.estimatedPickupTime} min
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

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
                href="/restaurateur"
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
