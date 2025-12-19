"use client";

import Link from "next/link";
import { MapPin, Clock, Utensils } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { StarRating } from "./StarRating";
import { FavoriteButton } from "./FavoriteButton";
import { ShareButton } from "./ShareButton";

interface RestaurantCardProps {
  restaurant: {
    _id: Id<"restaurants">;
    name: string;
    slug: string;
    coverImageUrl?: string;
    cuisine?: string[];
    city: string;
    state: string;
    estimatedPickupTime?: number;
    acceptingOrders: boolean;
  };
}

export function RestaurantCard({ restaurant }: RestaurantCardProps) {
  const currentUser = useQuery(api.users.queries.getCurrentUser);
  const reviewStats = useQuery(api.restaurantReviews.getRestaurantStats, {
    restaurantId: restaurant._id,
  });

  return (
    <Link
      href={`/restaurants/${restaurant.slug}`}
      className="group bg-white dark:bg-card rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
    >
      <div className="relative h-48 overflow-hidden">
        {restaurant.coverImageUrl ? (
          <img
            src={restaurant.coverImageUrl}
            alt={restaurant.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              // Replace with fallback gradient on image load error
              const target = e.currentTarget;
              target.style.display = 'none';
              const fallback = target.nextElementSibling as HTMLElement;
              if (fallback) fallback.style.display = 'flex';
            }}
          />
        ) : null}
        <div
          className="w-full h-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center"
          style={{ display: restaurant.coverImageUrl ? 'none' : 'flex' }}
        >
          <Utensils className="h-16 w-16 text-white opacity-50" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Status Badge */}
        <div className="absolute top-4 right-4">
          {restaurant.acceptingOrders ? (
            <span className="px-3 py-1 text-xs font-semibold bg-success text-white rounded-full shadow-lg">
              Open for Orders
            </span>
          ) : (
            <span className="px-3 py-1 text-xs font-semibold bg-card0 text-white rounded-full shadow-lg">
              Currently Closed
            </span>
          )}
        </div>

        {/* Favorite & Share Buttons */}
        <div className="absolute top-4 left-4 flex gap-2">
          <FavoriteButton
            restaurantId={restaurant._id}
            userId={currentUser?._id || null}
            size="md"
          />
          <ShareButton
            title={restaurant.name}
            text={`Check out ${restaurant.name} on SteppersLife!`}
            url={`/restaurants/${restaurant.slug}`}
            variant="icon"
            size="md"
          />
        </div>
      </div>

      <div className="p-5">
        <h3 className="text-lg font-bold text-foreground dark:text-white mb-1">
          {restaurant.name}
        </h3>

        {/* Rating Display */}
        {reviewStats && reviewStats.totalReviews > 0 && (
          <div className="flex items-center gap-2 mb-2">
            <StarRating rating={reviewStats.averageRating} size="sm" />
            <span className="text-sm text-muted-foreground dark:text-muted-foreground">
              {reviewStats.averageRating.toFixed(1)} ({reviewStats.totalReviews})
            </span>
          </div>
        )}

        {restaurant.cuisine && restaurant.cuisine.length > 0 && (
          <p className="text-sm text-orange-600 dark:text-orange-400 mb-3">
            {restaurant.cuisine.join(" • ")}
          </p>
        )}

        <div className="flex items-center justify-between text-sm text-muted-foreground dark:text-muted-foreground">
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
  );
}
