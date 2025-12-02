"use client";

import { Heart } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useState } from "react";

interface FavoriteButtonProps {
  restaurantId: Id<"restaurants">;
  userId: Id<"users"> | null;
  size?: "sm" | "md" | "lg";
  showCount?: boolean;
  className?: string;
}

export function FavoriteButton({
  restaurantId,
  userId,
  size = "md",
  showCount = false,
  className = "",
}: FavoriteButtonProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  const isFavorited = useQuery(
    api.favoriteRestaurants.isFavorited,
    userId ? { userId, restaurantId } : "skip"
  );
  const favoriteCount = useQuery(
    api.favoriteRestaurants.getRestaurantFavoriteCount,
    showCount ? { restaurantId } : "skip"
  );
  const toggleFavorite = useMutation(api.favoriteRestaurants.toggle);

  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  const buttonSizeClasses = {
    sm: "p-1.5",
    md: "p-2",
    lg: "p-2.5",
  };

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation if inside a link
    e.stopPropagation();

    if (!userId) {
      // Could redirect to login or show a toast
      window.location.href = "/auth/sign-in";
      return;
    }

    setIsAnimating(true);
    try {
      await toggleFavorite({ userId, restaurantId });
    } catch (err) {
      console.error("Failed to toggle favorite:", err);
    }
    setTimeout(() => setIsAnimating(false), 300);
  };

  return (
    <button
      onClick={handleClick}
      className={`
        ${buttonSizeClasses[size]}
        rounded-full
        transition-all duration-200
        ${isFavorited
          ? "bg-red-50 dark:bg-red-900/30 text-red-500"
          : "bg-white/80 dark:bg-gray-800/80 text-gray-400 hover:text-red-500"
        }
        hover:scale-110
        ${isAnimating ? "scale-125" : ""}
        backdrop-blur-sm
        shadow-sm
        ${className}
      `}
      title={isFavorited ? "Remove from favorites" : "Add to favorites"}
    >
      <Heart
        className={`
          ${sizeClasses[size]}
          transition-all duration-200
          ${isFavorited ? "fill-red-500" : ""}
          ${isAnimating ? "animate-pulse" : ""}
        `}
      />
      {showCount && favoriteCount !== undefined && favoriteCount > 0 && (
        <span className="ml-1 text-xs font-medium">{favoriteCount}</span>
      )}
    </button>
  );
}
