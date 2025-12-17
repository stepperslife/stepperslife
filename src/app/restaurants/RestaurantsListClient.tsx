"use client";

import Link from "next/link";
import { Utensils, Search, X, SlidersHorizontal } from "lucide-react";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { RestaurantsSubNav } from "@/components/layout/RestaurantsSubNav";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useMemo } from "react";
import { RestaurantCard } from "@/components/restaurants/RestaurantCard";
import { motion, AnimatePresence } from "framer-motion";

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
            <motion.div
              className="h-8 w-8 border-4 border-orange-600 border-t-transparent rounded-full mx-auto mb-4"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <motion.p
              className="text-gray-600 dark:text-gray-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Loading restaurants...
            </motion.p>
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
        {/* Hero Section with Parallax Effect */}
        <div className="relative overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-orange-600/90 to-red-600/90"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          />
          <motion.div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1600&q=80')",
              backgroundSize: "contain",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
          <div className="relative container mx-auto px-4 py-16 md:py-24">
            <div className="max-w-2xl">
              <motion.h1
                className="text-4xl md:text-5xl font-bold text-white mb-4"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                Delicious Food,
                <br />
                <motion.span
                  className="text-orange-200"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  Ready for Pickup
                </motion.span>
              </motion.h1>
              <motion.p
                className="text-lg text-white/90 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Order from the best local restaurants in the stepping community.
                Fresh food, fast pickup, no delivery fees.
              </motion.p>
              <motion.div
                className="flex flex-wrap gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    href="#restaurants"
                    className="px-6 py-3 bg-white text-orange-600 rounded-full font-semibold hover:bg-orange-50 transition-colors inline-block"
                  >
                    Browse Restaurants
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    href="/restaurateur/apply"
                    className="px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-full font-semibold hover:bg-white/20 transition-colors border border-white/30 inline-block"
                  >
                    Become a Partner Restaurant
                  </Link>
                </motion.div>
              </motion.div>
            </div>
          </div>

          {/* Animated floating food icons */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-4 h-4 bg-white/10 rounded-full"
                style={{
                  left: `${10 + Math.random() * 80}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -30, 0],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        </div>

        {/* Restaurants Section */}
        <div id="restaurants" className="container mx-auto px-4 py-12">
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3">
              {restaurants.length > 0 ? "Order from Our Restaurants" : "Restaurants Coming Soon"}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
              {restaurants.length > 0
                ? "Browse our selection of amazing restaurants and place your order for pickup"
                : "We're building our restaurant network. Check back soon or apply to join!"
              }
            </p>
          </motion.div>

          {/* Search and Filter Bar */}
          {restaurants.length > 0 && (
            <motion.div
              className="mb-8 space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {/* Search Input */}
              <div className="relative max-w-xl mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <label htmlFor="restaurant-search" className="sr-only">Search restaurants or cuisines</label>
                <input
                  id="restaurant-search"
                  type="text"
                  placeholder="Search restaurants or cuisines..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-10 py-3 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm transition-shadow"
                />
                <AnimatePresence>
                  {searchQuery && (
                    <motion.button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      aria-label="Clear search"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <X className="h-5 w-5" />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>

              {/* Filter Controls */}
              <div className="flex flex-wrap items-center justify-center gap-3">
                {/* Toggle Filters Button (Mobile) */}
                <motion.button
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  className="md:hidden flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                  aria-expanded={showFilters}
                  aria-label="Toggle filters"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                  {hasActiveFilters && (
                    <motion.span
                      className="w-2 h-2 rounded-full bg-orange-500"
                      aria-label="Active filters"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                    />
                  )}
                </motion.button>

                {/* City Filter */}
                <div className={`${showFilters ? 'flex' : 'hidden'} md:flex`}>
                  <label htmlFor="city-filter" className="sr-only">Filter by city</label>
                  <select
                    id="city-filter"
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
                  <label htmlFor="sort-by" className="sr-only">Sort restaurants by</label>
                  <select
                    id="sort-by"
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
                <AnimatePresence>
                  {hasActiveFilters && (
                    <motion.button
                      type="button"
                      onClick={clearFilters}
                      className="flex items-center gap-1 px-4 py-2 rounded-full text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 text-sm font-medium"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      whileHover={{ scale: 1.05 }}
                    >
                      <X className="h-4 w-4" />
                      Clear Filters
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>

              {/* Cuisine Filter Chips */}
              {availableCuisines.length > 0 && (
                <motion.div
                  className={`${showFilters ? 'flex' : 'hidden'} md:flex flex-wrap justify-center gap-2`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {availableCuisines.map((cuisine, index) => (
                    <motion.button
                      key={cuisine}
                      type="button"
                      onClick={() => toggleCuisine(cuisine)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        selectedCuisines.includes(cuisine)
                          ? "bg-orange-600 text-white"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                      }`}
                      aria-pressed={selectedCuisines.includes(cuisine)}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 + index * 0.03 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {cuisine}
                    </motion.button>
                  ))}
                </motion.div>
              )}

              {/* Results Count */}
              <AnimatePresence>
                {hasActiveFilters && (
                  <motion.p
                    className="text-center text-sm text-gray-500 dark:text-gray-400"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    Showing {filteredRestaurants.length} of {restaurants.length} restaurants
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {filteredRestaurants.length > 0 ? (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              initial="hidden"
              animate="visible"
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.1,
                  },
                },
              }}
            >
              {filteredRestaurants.map((restaurant) => (
                <motion.div
                  key={restaurant._id}
                  variants={{
                    hidden: { opacity: 0, y: 30 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  transition={{ duration: 0.5 }}
                >
                  <motion.div
                    whileHover={{ y: -8 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <RestaurantCard restaurant={restaurant} />
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              className="text-center py-16"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-block p-8 bg-orange-50 dark:bg-orange-900/20 rounded-3xl">
                {hasActiveFilters ? (
                  <>
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <Search className="h-16 w-16 mx-auto text-orange-400 mb-4" />
                    </motion.div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      No Restaurants Found
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md">
                      No restaurants match your current filters. Try adjusting your search or filters.
                    </p>
                    <motion.button
                      type="button"
                      onClick={clearFilters}
                      className="inline-block px-6 py-3 bg-orange-600 text-white rounded-full font-semibold hover:bg-orange-700 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Clear Filters
                    </motion.button>
                  </>
                ) : (
                  <>
                    <motion.div
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <Utensils className="h-16 w-16 mx-auto text-orange-400 mb-4" />
                    </motion.div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      No Restaurants Yet
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md">
                      We're actively onboarding restaurants. Be the first to join our platform!
                    </p>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Link
                        href="/restaurateur/apply"
                        className="inline-block px-6 py-3 bg-orange-600 text-white rounded-full font-semibold hover:bg-orange-700 transition-colors"
                      >
                        Apply Now
                      </Link>
                    </motion.div>
                  </>
                )}
              </div>
            </motion.div>
          )}

          {/* CTA Section */}
          <motion.div
            className="mt-16 text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <motion.div
              className="inline-block p-8 bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 rounded-3xl"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <Utensils className="h-12 w-12 mx-auto text-orange-600 mb-4" />
              </motion.div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Own a Restaurant?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md">
                Join the SteppersLife restaurant network and reach thousands of customers in the stepping community.
              </p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/restaurateur/apply"
                  className="inline-block px-6 py-3 bg-orange-600 text-white rounded-full font-semibold hover:bg-orange-700 transition-colors"
                >
                  Apply to Join
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
      <PublicFooter />
    </>
  );
}
