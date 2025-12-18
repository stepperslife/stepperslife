"use client";

import Link from "next/link";
import { Utensils, Search, X, SlidersHorizontal, Coffee, ChefHat, Flame, Clock, MapPin, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { RestaurantsSubNav } from "@/components/layout/RestaurantsSubNav";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useMemo } from "react";
import { RestaurantCard } from "@/components/restaurants/RestaurantCard";
import { motion, AnimatePresence } from "framer-motion";
import { ViewToggle, ViewMode, getViewClasses } from "@/components/ui/ViewToggle";
import { PortfolioGrid } from "@/components/shadcn-studio/blocks/portfolio-01/portfolio-01";

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
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

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
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <motion.div
              className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <motion.p
              className="text-muted-foreground"
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
      <div className="min-h-screen bg-background">
        {/* EPIC Hero Section */}
        <section className="relative min-h-[500px] md:min-h-[600px] w-full overflow-hidden">
          {/* Animated Gradient Background */}
          <motion.div
            className="absolute inset-0"
            animate={{
              background: [
                "linear-gradient(135deg, #c2410c 0%, #dc2626 50%, #ea580c 100%)",
                "linear-gradient(135deg, #dc2626 0%, #ea580c 50%, #c2410c 100%)",
                "linear-gradient(135deg, #ea580c 0%, #c2410c 50%, #dc2626 100%)",
                "linear-gradient(135deg, #c2410c 0%, #dc2626 50%, #ea580c 100%)",
              ],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          />

          {/* Background Food Image */}
          <motion.div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1920&q=80')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.5 }}
          />

          {/* Gradient Overlay for depth */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/50" />

          {/* Floating Food Icons */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Utensils Icon */}
            <motion.div
              className="absolute top-[15%] left-[10%] text-white/20"
              animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              <Utensils className="h-16 w-16 md:h-24 md:w-24" />
            </motion.div>

            {/* Coffee Icon */}
            <motion.div
              className="absolute top-[25%] right-[15%] text-white/15"
              animate={{ y: [0, 15, 0], rotate: [0, -8, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            >
              <Coffee className="h-14 w-14 md:h-20 md:w-20" />
            </motion.div>

            {/* ChefHat Icon */}
            <motion.div
              className="absolute bottom-[30%] left-[8%] text-white/15"
              animate={{ y: [0, -15, 0], scale: [1, 1.05, 1] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            >
              <ChefHat className="h-12 w-12 md:h-16 md:w-16" />
            </motion.div>

            {/* Flame Icon */}
            <motion.div
              className="absolute top-[40%] right-[8%] text-white/20"
              animate={{ y: [0, -25, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
            >
              <Flame className="h-10 w-10 md:h-14 md:w-14" />
            </motion.div>

            {/* Steam/Smoke Particles */}
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: Math.random() * 8 + 4 + "px",
                  height: Math.random() * 8 + 4 + "px",
                  left: `${5 + Math.random() * 90}%`,
                  bottom: `${Math.random() * 40}%`,
                  background: `rgba(255, 255, 255, ${0.1 + Math.random() * 0.2})`,
                }}
                animate={{
                  y: [0, -100 - Math.random() * 100],
                  opacity: [0, 0.6, 0],
                  scale: [0.5, 1.5, 2],
                }}
                transition={{
                  duration: 4 + Math.random() * 3,
                  repeat: Infinity,
                  delay: Math.random() * 3,
                  ease: "easeOut",
                }}
              />
            ))}
          </div>

          {/* Main Content */}
          <div className="relative z-10 container mx-auto px-4 py-16 md:py-20 flex flex-col items-center justify-center min-h-[500px] md:min-h-[600px]">
            {/* Restaurant Count Badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6"
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium">
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Utensils className="h-4 w-4" />
                </motion.span>
                {restaurants.length} {restaurants.length === 1 ? "Restaurant" : "Restaurants"} Available
              </span>
            </motion.div>

            {/* Main Title with Gradient Animation */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-6"
            >
              <span className="text-white drop-shadow-lg">Taste the</span>
              <br />
              <motion.span
                className="bg-gradient-to-r from-yellow-300 via-orange-200 to-amber-300 bg-clip-text text-transparent bg-[length:200%_auto]"
                animate={{ backgroundPosition: ["0% center", "200% center"] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              >
                Community Flavors
              </motion.span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-white/90 text-center max-w-2xl mb-8"
            >
              Order from the best local restaurants in the stepping community.
              Fresh food, fast pickup, no delivery fees.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 mb-12"
            >
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Button
                  size="lg"
                  onClick={() => document.getElementById("restaurants")?.scrollIntoView({ behavior: "smooth" })}
                  className="bg-white !text-orange-600 hover:bg-orange-50 font-semibold px-8 py-6 text-lg rounded-full shadow-lg"
                >
                  <Utensils className="mr-2 h-5 w-5 text-orange-600" />
                  Browse Restaurants
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="border-2 border-white/50 !text-white bg-white/10 backdrop-blur-sm hover:bg-white/20 font-semibold px-8 py-6 text-lg rounded-full"
                >
                  <Link href="/restaurateur/apply">
                    <ChefHat className="mr-2 h-5 w-5 text-white" />
                    Partner With Us
                  </Link>
                </Button>
              </motion.div>
            </motion.div>

            {/* Stats/Features Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="grid grid-cols-3 gap-4 md:gap-8"
            >
              <div className="text-center">
                <motion.div
                  className="flex items-center justify-center mb-2"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Clock className="h-6 w-6 md:h-8 md:w-8 text-yellow-300" />
                </motion.div>
                <p className="text-white font-bold text-lg md:text-2xl">15-30</p>
                <p className="text-white/70 text-xs md:text-sm">Min Pickup</p>
              </div>
              <div className="text-center">
                <motion.div
                  className="flex items-center justify-center mb-2"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                >
                  <Star className="h-6 w-6 md:h-8 md:w-8 text-yellow-300" />
                </motion.div>
                <p className="text-white font-bold text-lg md:text-2xl">500+</p>
                <p className="text-white/70 text-xs md:text-sm">Happy Customers</p>
              </div>
              <div className="text-center">
                <motion.div
                  className="flex items-center justify-center mb-2"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                >
                  <MapPin className="h-6 w-6 md:h-8 md:w-8 text-yellow-300" />
                </motion.div>
                <p className="text-white font-bold text-lg md:text-2xl">20+</p>
                <p className="text-white/70 text-xs md:text-sm">Cities</p>
              </div>
            </motion.div>
          </div>

          {/* Bottom Gradient Fade */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
        </section>

        {/* Restaurants Section */}
        <div id="restaurants" className="container mx-auto px-4 py-12">
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
              {restaurants.length > 0 ? "Order from Our Restaurants" : "Restaurants Coming Soon"}
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
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
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <label htmlFor="restaurant-search" className="sr-only">Search restaurants or cuisines</label>
                <input
                  id="restaurant-search"
                  type="text"
                  placeholder="Search restaurants or cuisines..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-10 py-3 rounded-full border border-border bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent shadow-sm transition-shadow"
                />
                <AnimatePresence>
                  {searchQuery && (
                    <motion.button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
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
                  className="md:hidden flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card text-card-foreground"
                  aria-expanded={showFilters}
                  aria-label="Toggle filters"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                  {hasActiveFilters && (
                    <motion.span
                      className="w-2 h-2 rounded-full bg-primary"
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
                    className="px-4 py-2 rounded-full border border-border bg-card text-card-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
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
                    className="px-4 py-2 rounded-full border border-border bg-card text-card-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="name">Sort by Name</option>
                    <option value="pickup_time">Fastest Pickup</option>
                    <option value="newest">Newest First</option>
                  </select>
                </div>

                {/* View Toggle */}
                <ViewToggle view={viewMode} onViewChange={setViewMode} />

                {/* Clear Filters */}
                <AnimatePresence>
                  {hasActiveFilters && (
                    <motion.button
                      type="button"
                      onClick={clearFilters}
                      className="flex items-center gap-1 px-4 py-2 rounded-full text-primary hover:bg-accent text-sm font-medium"
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
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
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
                    className="text-center text-sm text-muted-foreground"
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
            viewMode === "masonry" ? (
              <PortfolioGrid
                items={filteredRestaurants}
                getKey={(restaurant) => restaurant._id}
                renderItem={(restaurant) => (
                  <motion.div
                    whileHover={{ y: -8 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <RestaurantCard restaurant={restaurant} />
                  </motion.div>
                )}
              />
            ) : (
              <motion.div
                className={getViewClasses(viewMode, "restaurants")}
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
            )
          ) : (
            <motion.div
              className="text-center py-16"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-block p-8 bg-accent rounded-3xl">
                {hasActiveFilters ? (
                  <>
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <Search className="h-16 w-16 mx-auto text-primary mb-4" />
                    </motion.div>
                    <h3 className="text-xl font-bold text-foreground mb-2">
                      No Restaurants Found
                    </h3>
                    <p className="text-muted-foreground mb-4 max-w-md">
                      No restaurants match your current filters. Try adjusting your search or filters.
                    </p>
                    <motion.button
                      type="button"
                      onClick={clearFilters}
                      className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-full font-semibold hover:bg-primary/90 transition-colors"
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
                      <Utensils className="h-16 w-16 mx-auto text-primary mb-4" />
                    </motion.div>
                    <h3 className="text-xl font-bold text-foreground mb-2">
                      No Restaurants Yet
                    </h3>
                    <p className="text-muted-foreground mb-4 max-w-md">
                      We're actively onboarding restaurants. Be the first to join our platform!
                    </p>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Link
                        href="/restaurateur/apply"
                        className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-full font-semibold hover:bg-primary/90 transition-colors"
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
              className="inline-block p-8 bg-accent border border-border rounded-3xl"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <Utensils className="h-12 w-12 mx-auto text-primary mb-4" />
              </motion.div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                Own a Restaurant?
              </h3>
              <p className="text-muted-foreground mb-4 max-w-md">
                Join the SteppersLife restaurant network and reach thousands of customers in the stepping community.
              </p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/restaurateur/apply"
                  className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-full font-semibold hover:bg-primary/90 transition-colors"
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
