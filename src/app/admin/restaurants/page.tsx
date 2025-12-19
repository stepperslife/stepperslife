"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import Link from "next/link";
import {
  UtensilsCrossed,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  MoreVertical,
  MapPin,
  Phone,
  ShoppingBag,
} from "lucide-react";
import toast from "react-hot-toast";

type RestaurantStatus = "pending" | "active" | "suspended";

const STATUS_CONFIG: Record<RestaurantStatus, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: "Pending", color: "bg-warning/20 text-warning-foreground dark:bg-warning/20 dark:text-warning", icon: Clock },
  active: { label: "Active", color: "bg-success/20 text-success dark:bg-success/20 dark:text-success", icon: CheckCircle },
  suspended: { label: "Suspended", color: "bg-destructive/20 text-destructive dark:bg-destructive/20 dark:text-destructive", icon: AlertTriangle },
};

export default function AdminRestaurantsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<RestaurantStatus | "">("");
  const [selectedRestaurant, setSelectedRestaurant] = useState<string | null>(null);
  const [actionModal, setActionModal] = useState<{
    type: "approve" | "reject" | "suspend" | "reactivate";
    restaurantId: string;
    restaurantName: string;
  } | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // Get all restaurants (admin query)
  const allRestaurants = useQuery(api.restaurants.getAll, {});
  const pendingRestaurants = useQuery(api.restaurants.getPending, {});

  // Combine and categorize restaurants
  const restaurants = [
    ...(pendingRestaurants || []).map((r) => ({ ...r, status: "pending" as const })),
    ...(allRestaurants || []).map((r) => ({ ...r, status: r.isActive ? "active" as const : "suspended" as const })),
  ].filter((r, i, arr) => arr.findIndex((x) => x._id === r._id) === i); // Remove duplicates

  // Mutations
  const approveRestaurant = useMutation(api.restaurants.approve);
  const rejectRestaurant = useMutation(api.restaurants.reject);
  const suspendRestaurant = useMutation(api.restaurants.suspend);

  // Filter restaurants by search
  const filteredRestaurants = restaurants?.filter((restaurant) => {
    // Filter by status
    if (statusFilter) {
      const isActive = restaurant.isActive;
      if (statusFilter === "active" && !isActive) return false;
      if (statusFilter === "pending" && isActive) return false;
      if (statusFilter === "suspended" && isActive) return false;
    }

    // Filter by search
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      restaurant.name.toLowerCase().includes(query) ||
      restaurant.slug.toLowerCase().includes(query) ||
      restaurant.city?.toLowerCase().includes(query) ||
      restaurant.cuisine?.some((c) => c.toLowerCase().includes(query))
    );
  });

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Stats
  const stats = {
    total: restaurants?.length || 0,
    pending: pendingRestaurants?.length || 0,
    active: allRestaurants?.filter((r) => r.isActive).length || 0,
    suspended: restaurants?.filter((r) => !r.isActive && r.status !== "pending").length || 0,
  };

  const handleAction = async () => {
    if (!actionModal) return;

    try {
      switch (actionModal.type) {
        case "approve":
          await approveRestaurant({ restaurantId: actionModal.restaurantId as Id<"restaurants"> });
          toast.success(`${actionModal.restaurantName} has been approved`);
          break;
        case "reject":
          if (!rejectionReason.trim()) {
            toast.error("Please provide a rejection reason");
            return;
          }
          await rejectRestaurant({
            restaurantId: actionModal.restaurantId as Id<"restaurants">,
            reason: rejectionReason,
          });
          toast.success(`${actionModal.restaurantName} has been rejected`);
          break;
        case "suspend":
          if (!rejectionReason.trim()) {
            toast.error("Please provide a suspension reason");
            return;
          }
          await suspendRestaurant({
            restaurantId: actionModal.restaurantId as Id<"restaurants">,
            reason: rejectionReason,
          });
          toast.success(`${actionModal.restaurantName} has been suspended`);
          break;
        case "reactivate":
          await approveRestaurant({ restaurantId: actionModal.restaurantId as Id<"restaurants"> });
          toast.success(`${actionModal.restaurantName} has been reactivated`);
          break;
      }
      setActionModal(null);
      setRejectionReason("");
    } catch (error) {
      console.error("Action error:", error);
      toast.error("Failed to perform action");
    }
  };

  const getRestaurantStatus = (restaurant: (typeof restaurants)[0]): RestaurantStatus => {
    if (!restaurant.isActive) {
      // Check if it's pending (newly created) vs suspended
      return pendingRestaurants?.some((p) => p._id === restaurant._id) ? "pending" : "suspended";
    }
    return "active";
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Restaurant Management</h1>
        <p className="text-muted-foreground">Manage restaurant partners and their applications</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 dark:bg-primary/20 rounded-lg flex items-center justify-center">
              <UtensilsCrossed className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-warning/20 dark:bg-warning/20 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.pending}</p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-success/20 dark:bg-success/20 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.active}</p>
              <p className="text-sm text-muted-foreground">Active</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-destructive/20 dark:bg-destructive/20 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.suspended}</p>
              <p className="text-sm text-muted-foreground">Suspended</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-xl border border-border p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search restaurants by name, city, or cuisine..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-input rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-muted-foreground" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as RestaurantStatus | "")}
              className="px-4 py-2 border border-input rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {/* Restaurants List */}
      {restaurants === undefined ? (
        <div className="bg-card rounded-xl border border-border p-8 flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : filteredRestaurants && filteredRestaurants.length > 0 ? (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Restaurant</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Location</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Cuisine</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Orders</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Created</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRestaurants.map((restaurant) => {
                  const status = getRestaurantStatus(restaurant);
                  const statusConfig = STATUS_CONFIG[status];
                  const StatusIcon = statusConfig.icon;

                  return (
                    <tr key={restaurant._id} className="border-b border-border last:border-0">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {restaurant.logoUrl ? (
                            <img
                              src={restaurant.logoUrl}
                              alt={restaurant.name}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-primary/10 dark:bg-primary/20 rounded-lg flex items-center justify-center">
                              <UtensilsCrossed className="w-5 h-5 text-primary" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-foreground">{restaurant.name}</p>
                            <p className="text-sm text-muted-foreground">/{restaurant.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-sm text-foreground">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          {restaurant.city}, {restaurant.state}
                        </div>
                        {restaurant.phone && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                            <Phone className="w-4 h-4" />
                            {restaurant.phone}
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {restaurant.cuisine?.slice(0, 2).map((c) => (
                            <span
                              key={c}
                              className="px-2 py-0.5 bg-muted rounded text-xs text-muted-foreground"
                            >
                              {c}
                            </span>
                          ))}
                          {restaurant.cuisine && restaurant.cuisine.length > 2 && (
                            <span className="px-2 py-0.5 bg-muted rounded text-xs text-muted-foreground">
                              +{restaurant.cuisine.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <ShoppingBag className="w-4 h-4 text-muted-foreground" />
                          <span className="text-foreground">
                            {restaurant.acceptingOrders ? "Active" : "Paused"}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {statusConfig.label}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {formatDate(restaurant.createdAt)}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/restaurants/${restaurant.slug}`}
                            className="p-2 hover:bg-muted rounded-lg transition-colors"
                            target="_blank"
                          >
                            <Eye className="w-4 h-4 text-muted-foreground" />
                          </Link>
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedRestaurant(
                                  selectedRestaurant === restaurant._id ? null : restaurant._id
                                )
                              }
                              className="p-2 hover:bg-muted rounded-lg transition-colors"
                            >
                              <MoreVertical className="w-4 h-4 text-muted-foreground" />
                            </button>
                            {selectedRestaurant === restaurant._id && (
                              <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-10">
                                {status === "pending" && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setActionModal({
                                          type: "approve",
                                          restaurantId: restaurant._id,
                                          restaurantName: restaurant.name,
                                        });
                                        setSelectedRestaurant(null);
                                      }}
                                      className="w-full px-4 py-2 text-left text-sm text-success hover:bg-muted transition-colors"
                                    >
                                      Approve
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setActionModal({
                                          type: "reject",
                                          restaurantId: restaurant._id,
                                          restaurantName: restaurant.name,
                                        });
                                        setSelectedRestaurant(null);
                                      }}
                                      className="w-full px-4 py-2 text-left text-sm text-destructive hover:bg-muted transition-colors"
                                    >
                                      Reject
                                    </button>
                                  </>
                                )}
                                {status === "active" && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActionModal({
                                        type: "suspend",
                                        restaurantId: restaurant._id,
                                        restaurantName: restaurant.name,
                                      });
                                      setSelectedRestaurant(null);
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm text-destructive hover:bg-muted transition-colors"
                                  >
                                    Suspend
                                  </button>
                                )}
                                {status === "suspended" && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActionModal({
                                        type: "reactivate",
                                        restaurantId: restaurant._id,
                                        restaurantName: restaurant.name,
                                      });
                                      setSelectedRestaurant(null);
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm text-success hover:bg-muted transition-colors"
                                  >
                                    Reactivate
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <UtensilsCrossed className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-2">No restaurants found</h3>
          <p className="text-muted-foreground max-w-sm mx-auto">
            {searchQuery || statusFilter
              ? "Try adjusting your search or filter criteria"
              : "No restaurants have applied yet"}
          </p>
        </div>
      )}

      {/* Action Modal */}
      {actionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-xl border border-border p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-foreground mb-2">
              {actionModal.type === "approve" && "Approve Restaurant"}
              {actionModal.type === "reject" && "Reject Restaurant"}
              {actionModal.type === "suspend" && "Suspend Restaurant"}
              {actionModal.type === "reactivate" && "Reactivate Restaurant"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {actionModal.type === "approve" &&
                `Are you sure you want to approve "${actionModal.restaurantName}"? They will be able to accept orders on the platform.`}
              {actionModal.type === "reject" &&
                `Please provide a reason for rejecting "${actionModal.restaurantName}".`}
              {actionModal.type === "suspend" &&
                `Please provide a reason for suspending "${actionModal.restaurantName}". They will not be able to accept orders.`}
              {actionModal.type === "reactivate" &&
                `Are you sure you want to reactivate "${actionModal.restaurantName}"?`}
            </p>

            {(actionModal.type === "reject" || actionModal.type === "suspend") && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Reason *
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-input rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  placeholder="Provide a reason..."
                />
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => {
                  setActionModal(null);
                  setRejectionReason("");
                }}
                className="px-4 py-2 border border-border rounded-lg font-medium hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAction}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  actionModal.type === "approve" || actionModal.type === "reactivate"
                    ? "bg-success text-white hover:bg-success/80"
                    : "bg-destructive text-white hover:bg-destructive/80"
                }`}
              >
                {actionModal.type === "approve" && "Approve"}
                {actionModal.type === "reject" && "Reject"}
                {actionModal.type === "suspend" && "Suspend"}
                {actionModal.type === "reactivate" && "Reactivate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
