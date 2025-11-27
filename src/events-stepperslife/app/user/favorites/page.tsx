"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Calendar, MapPin, ShoppingCart, X } from "lucide-react";
import Link from "next/link";

export default function FavoritesPage() {
  const currentUser = useQuery(api.users.queries.getCurrentUser);

  // Mock data - will be replaced with actual Convex query
  const favorites = [];

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Favorite Events</h1>
        <p className="text-muted-foreground mt-2">
          {favorites.length} {favorites.length === 1 ? "event" : "events"} saved for later
        </p>
      </div>

      {/* Favorites List */}
      {favorites.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Heart className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
            <p className="text-muted-foreground mb-2">No favorite events yet</p>
            <p className="text-sm text-muted-foreground mb-4">
              Browse events and save your favorites to see them here
            </p>
            <Button asChild>
              <Link href="/user/browse-events">Browse Events</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {favorites.map((event: any) => (
            <Card key={event.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Header with Remove Button */}
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-semibold line-clamp-2 flex-1">
                      {event.name}
                    </h3>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 -mr-2"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Event Details */}
                  <div className="space-y-2">
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mt-0.5" />
                      <div>
                        <div>{formatDate(event.startDate)}</div>
                        <div>{formatTime(event.startDate)}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mt-0.5" />
                      <span className="line-clamp-2">{event.location || "Location TBA"}</span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="pt-2 border-t">
                    <div className="text-sm text-muted-foreground">From</div>
                    <div className="text-2xl font-bold text-primary">
                      ${event.basePrice || "0"}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button asChild className="flex-1">
                      <Link href={`/events/${event.id}`}>View Event</Link>
                    </Button>
                    <Button size="icon" variant="outline">
                      <ShoppingCart className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Availability Status */}
                  {event.ticketsRemaining !== undefined && (
                    <div className="text-xs text-center">
                      {event.ticketsRemaining > 0 ? (
                        <span className="text-green-600">
                          {event.ticketsRemaining} tickets remaining
                        </span>
                      ) : (
                        <span className="text-red-600">Sold out</span>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
