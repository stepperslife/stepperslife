"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { RestaurantsSubNav } from "@/components/layout/RestaurantsSubNav";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { RestaurantCard } from "@/components/restaurants/RestaurantCard";
import { Heart, Loader2, Utensils } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function FavoritesPage() {
  const currentUser = useQuery(api.users.queries.getCurrentUser);
  const favorites = useQuery(
    api.favoriteRestaurants.getByUser,
    currentUser?._id ? { userId: currentUser._id } : "skip"
  );

  // Loading state
  if (currentUser === undefined) {
    return (
      <>
        <PublicHeader />
        <RestaurantsSubNav />
        <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-orange-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
        <PublicFooter />
      </>
    );
  }

  // Not logged in
  if (!currentUser) {
    return (
      <>
        <PublicHeader />
        <RestaurantsSubNav />
        <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white dark:from-gray-900 dark:to-gray-800">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-md mx-auto text-center">
              <Heart className="h-16 w-16 mx-auto text-gray-300 mb-6" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Sign in to see your favorites
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Create an account or sign in to save your favorite restaurants for quick access.
              </p>
              <Button asChild className="bg-orange-600 hover:bg-orange-700">
                <Link href="/auth/sign-in">Sign In</Link>
              </Button>
            </div>
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
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Heart className="h-8 w-8 text-red-500 fill-red-500" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                My Favorites
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Your saved restaurants for quick access
            </p>
          </div>

          {/* Favorites Grid */}
          {favorites === undefined ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
            </div>
          ) : favorites.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-block p-8 bg-orange-50 dark:bg-orange-900/20 rounded-3xl">
                <Heart className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  No favorites yet
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
                  Click the heart icon on any restaurant to save it to your favorites for quick access.
                </p>
                <Button asChild className="bg-orange-600 hover:bg-orange-700">
                  <Link href="/restaurants">Browse Restaurants</Link>
                </Button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-6">
                {favorites.length} {favorites.length === 1 ? "restaurant" : "restaurants"} saved
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favorites.map((favorite) => (
                  favorite.restaurant && (
                    <RestaurantCard
                      key={favorite._id}
                      restaurant={favorite.restaurant as any}
                    />
                  )
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      <PublicFooter />
    </>
  );
}
