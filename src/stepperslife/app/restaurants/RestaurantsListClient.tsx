"use client";

import Link from "next/link";
import { Utensils, Loader2, Search, X, SlidersHorizontal } from "lucide-react";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { RestaurantsSubNav } from "@/components/layout/RestaurantsSubNav";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useMemo } from "react";
import { RestaurantCard } from "@/components/restaurants/RestaurantCard";

// All available cuisine types
const ALL_CUISINES = [
  "Soul Food",
  "Southern",
  "BBQ",
  "Seafood",
  "Caribbean",
  "African",
  "American",
  "Mexican",
  "Chinese",
  "Italian",
  "Pizza",
  "Burgers",
  "Sandwiches",
  "Vegetarian",
  "Vegan",
  "Desserts",
];

type SortOption = "name" | "pickup_time" | "newest";

export default function RestaurantsListClient() {
  const restaurants = useQuery(api.public.queries.getActiveRestaurants);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [sortBy, setSortBy] = useState<SortOption>("name");
  const [showFilters, setShowFilters] = useState(false);

  // Get unique cities from restaurants
  const cities = useMemo(() => {
    if (!restaurants) return [];
    const citySet = new Set(restaurants.map(r => r.city).filter(Boolean));
    return Array.from(citySet).sort();
  }, [restaurants]);

  // Get cuisines that are actually used by restaurants
  const availableCuisines = useMemo(() => {
    if (!restaurants) return [];
    const cuisineSet = new Set<string>();
    restaurants.forEach(r => {
      r.cuisine?.forEach(c => cuisineSet.add(c));
    });
    return ALL_CUISINES.filter(c => cuisineSet.has(c));
  }, [restaurants]);

  // Filter and sort restaurants
  const filteredRestaurants = useMemo(() => {
    if (!restaurants) return [];

    let filtered = [...restaurants];

    // Search by name or cuisine
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(r =>
        r.name.toLowerCase().includes(query) ||
        r.cuisine?.some(c => c.toLowerCase().includes(query))
      );
    }

    // Filter by cuisines
    if (selectedCuisines.length > 0) {
      filtered = filtered.filter(r =>
        selectedCuisines.some(cuisine => r.cuisine?.includes(cuisine))
      );
    }

    // Filter by city
    if (selectedCity) {
      filtered = filtered.filter(r => r.city === selectedCity);
    }

    // Sort
    switch (sortBy) {
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "pickup_time":
        filtered.sort((a, b) => (a.estimatedPickupTime || 30) - (b.estimatedPickupTime || 30));
        break;
      case "newest":
        filtered.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        break;
    }

    return filtered;
  }, [restaurants, searchQuery, selectedCuisines, selectedCity, sortBy]);

  // Toggle cuisine filter
  const toggleCuisine = (cuisine: string) => {
    setSelectedCuisines(prev =>
      prev.includes(cuisine)
        ? prev.filter(c => c !== cuisine)
        : [...prev, cuisine]
    );
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCuisines([]);
    setSelectedCity("");
    setSortBy("name");
  };

  const hasActiveFilters = searchQuery || selectedCuisines.length > 0 || selectedCity;

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
          <div className="text-center mb-8">
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

          {/* Search and Filter Bar */}
          {restaurants.length > 0 && (
            <div className="mb-8 space-y-4">
              {/* Search Input */}
              <div className="relative max-w-xl mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search restaurants or cuisines..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-10 py-3 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>

              {/* Filter Controls */}
              <div className="flex flex-wrap items-center justify-center gap-3">
                {/* Toggle Filters Button (Mobile) */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="md:hidden flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                  {hasActiveFilters && (
                    <span className="w-2 h-2 rounded-full bg-orange-500" />
                  )}
                </button>

                {/* City Filter */}
                <div className={`${showFilters ? 'flex' : 'hidden'} md:flex`}>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">All Cities</option>
                    {cities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                {/* Sort Dropdown */}
                <div className={`${showFilters ? 'flex' : 'hidden'} md:flex`}>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="name">Sort by Name</option>
                    <option value="pickup_time">Fastest Pickup</option>
                    <option value="newest">Newest First</option>
                  </select>
                </div>

                {/* Clear Filters */}
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1 px-4 py-2 rounded-full text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 text-sm font-medium"
                  >
                    <X className="h-4 w-4" />
                    Clear Filters
                  </button>
                )}
              </div>

              {/* Cuisine Filter Chips */}
              {availableCuisines.length > 0 && (
                <div className={`${showFilters ? 'flex' : 'hidden'} md:flex flex-wrap justify-center gap-2`}>
                  {availableCuisines.map(cuisine => (
                    <button
                      key={cuisine}
                      onClick={() => toggleCuisine(cuisine)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        selectedCuisines.includes(cuisine)
                          ? "bg-orange-600 text-white"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                      }`}
                    >
                      {cuisine}
                    </button>
                  ))}
                </div>
              )}

              {/* Results Count */}
              {hasActiveFilters && (
                <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                  Showing {filteredRestaurants.length} of {restaurants.length} restaurants
                </p>
              )}
            </div>
          )}

          {filteredRestaurants.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRestaurants.map((restaurant) => (
                <RestaurantCard key={restaurant._id} restaurant={restaurant} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="inline-block p-8 bg-orange-50 dark:bg-orange-900/20 rounded-3xl">
                {hasActiveFilters ? (
                  <>
                    <Search className="h-16 w-16 mx-auto text-orange-400 mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      No Restaurants Found
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md">
                      No restaurants match your current filters. Try adjusting your search or filters.
                    </p>
                    <button
                      onClick={clearFilters}
                      className="inline-block px-6 py-3 bg-orange-600 text-white rounded-full font-semibold hover:bg-orange-700 transition-colors"
                    >
                      Clear Filters
                    </button>
                  </>
                ) : (
                  <>
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
                  </>
                )}
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
