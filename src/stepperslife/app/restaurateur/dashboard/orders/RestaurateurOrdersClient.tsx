"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/useAuth";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { RestaurantsSubNav } from "@/components/layout/RestaurantsSubNav";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { Id } from "@/convex/_generated/dataModel";
import {
  ChefHat,
  Clock,
  CheckCircle,
  XCircle,
  Package,
  Phone,
  Mail,
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  LogIn,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type OrderStatus = "PENDING" | "CONFIRMED" | "PREPARING" | "READY_FOR_PICKUP" | "COMPLETED" | "CANCELLED";

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bgColor: string; icon: typeof Clock }> = {
  PENDING: { label: "New Order", color: "text-yellow-700", bgColor: "bg-yellow-100 dark:bg-yellow-900/30", icon: Clock },
  CONFIRMED: { label: "Confirmed", color: "text-blue-700", bgColor: "bg-blue-100 dark:bg-blue-900/30", icon: CheckCircle },
  PREPARING: { label: "Preparing", color: "text-orange-700", bgColor: "bg-orange-100 dark:bg-orange-900/30", icon: ChefHat },
  READY_FOR_PICKUP: { label: "Ready", color: "text-green-700", bgColor: "bg-green-100 dark:bg-green-900/30", icon: Package },
  COMPLETED: { label: "Completed", color: "text-gray-700", bgColor: "bg-gray-100 dark:bg-gray-800", icon: CheckCircle },
  CANCELLED: { label: "Cancelled", color: "text-red-700", bgColor: "bg-red-100 dark:bg-red-900/30", icon: XCircle },
};

const STATUS_FLOW: OrderStatus[] = ["PENDING", "CONFIRMED", "PREPARING", "READY_FOR_PICKUP", "COMPLETED"];

export default function RestaurateurOrdersClient() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [selectedRestaurant, setSelectedRestaurant] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">("ALL");

  // Get restaurants owned by user
  const restaurants = useQuery(
    api.restaurants.getByOwner,
    user?._id ? { ownerId: user._id as Id<"users"> } : "skip"
  );

  // Get orders for selected restaurant
  const orders = useQuery(
    api.foodOrders.getByRestaurant,
    selectedRestaurant ? { restaurantId: selectedRestaurant as Id<"restaurants"> } : "skip"
  );

  const updateStatus = useMutation(api.foodOrders.updateStatus);
  const updatePaymentStatus = useMutation(api.foodOrders.updatePaymentStatus);

  // Loading state
  if (authLoading) {
    return (
      <>
        <PublicHeader />
        <RestaurantsSubNav />
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
        <PublicFooter />
      </>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <>
        <PublicHeader />
        <RestaurantsSubNav />
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-md mx-auto bg-card rounded-2xl shadow-lg p-8 text-center border border-border">
              <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <LogIn className="w-8 h-8 text-orange-600" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-4">Sign In Required</h1>
              <p className="text-muted-foreground mb-8">
                Please sign in to manage your restaurant orders.
              </p>
              <Link
                href={`/login?redirect=${encodeURIComponent("/restaurateur/dashboard/orders")}`}
                className="block w-full px-6 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
        <PublicFooter />
      </>
    );
  }

  // No restaurants
  if (restaurants && restaurants.length === 0) {
    return (
      <>
        <PublicHeader />
        <RestaurantsSubNav />
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-md mx-auto bg-card rounded-2xl shadow-lg p-8 text-center border border-border">
              <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-8 h-8 text-orange-600" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-4">No Restaurants Found</h1>
              <p className="text-muted-foreground mb-8">
                You don't have any restaurants registered yet. Apply to become a restaurant partner!
              </p>
              <Link
                href="/restaurateur/apply"
                className="block w-full px-6 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-colors"
              >
                Apply Now
              </Link>
            </div>
          </div>
        </div>
        <PublicFooter />
      </>
    );
  }

  // Auto-select first restaurant if none selected
  if (restaurants && restaurants.length > 0 && !selectedRestaurant) {
    setSelectedRestaurant(restaurants[0]._id);
  }

  const handleStatusUpdate = async (orderId: Id<"foodOrders">, newStatus: OrderStatus) => {
    await updateStatus({ id: orderId, status: newStatus });
  };

  const handleMarkPaid = async (orderId: Id<"foodOrders">) => {
    await updatePaymentStatus({ id: orderId, paymentStatus: "paid", paymentMethod: "cash" });
  };

  const filteredOrders = orders?.filter(order =>
    statusFilter === "ALL" || order.status === statusFilter
  ) || [];

  const activeOrders = orders?.filter(order =>
    !["COMPLETED", "CANCELLED"].includes(order.status)
  ).length || 0;

  return (
    <>
      <PublicHeader />
      <RestaurantsSubNav />
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-gradient-to-br from-orange-600 to-red-600 py-6">
          <div className="container mx-auto px-4">
            <Link
              href="/restaurateur/dashboard"
              className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <ChefHat className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Order Management</h1>
                  <p className="text-white/80">{activeOrders} active orders</p>
                </div>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
          {/* Restaurant Selector */}
          {restaurants && restaurants.length > 1 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Select Restaurant
              </label>
              <select
                value={selectedRestaurant || ""}
                onChange={(e) => setSelectedRestaurant(e.target.value)}
                className="w-full max-w-xs px-4 py-2 bg-card border border-input rounded-lg"
              >
                {restaurants.map((r) => (
                  <option key={r._id} value={r._id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Status Filters */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setStatusFilter("ALL")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                statusFilter === "ALL"
                  ? "bg-orange-600 text-white"
                  : "bg-card border border-input hover:bg-muted"
              }`}
            >
              All Orders
            </button>
            {(Object.keys(STATUS_CONFIG) as OrderStatus[]).map((status) => {
              const config = STATUS_CONFIG[status];
              const count = orders?.filter(o => o.status === status).length || 0;
              return (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                    statusFilter === status
                      ? "bg-orange-600 text-white"
                      : "bg-card border border-input hover:bg-muted"
                  }`}
                >
                  {config.label}
                  {count > 0 && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      statusFilter === status ? "bg-white/20" : config.bgColor
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Orders List */}
          {orders === undefined ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-xl border border-border">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Orders Found</h3>
              <p className="text-muted-foreground">
                {statusFilter === "ALL"
                  ? "No orders have been placed yet."
                  : `No ${STATUS_CONFIG[statusFilter].label.toLowerCase()} orders.`}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => {
                const statusConfig = STATUS_CONFIG[order.status as OrderStatus] || STATUS_CONFIG.PENDING;
                const StatusIcon = statusConfig.icon;
                const currentStatusIndex = STATUS_FLOW.indexOf(order.status as OrderStatus);
                const nextStatus = currentStatusIndex >= 0 && currentStatusIndex < STATUS_FLOW.length - 1
                  ? STATUS_FLOW[currentStatusIndex + 1]
                  : null;

                return (
                  <div
                    key={order._id}
                    className="bg-card rounded-xl border border-border p-6"
                  >
                    {/* Order Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-lg">
                            #{order.orderNumber}
                          </span>
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${statusConfig.bgColor} ${statusConfig.color}`}>
                            <StatusIcon className="w-4 h-4" />
                            {statusConfig.label}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Placed {new Date(order.placedAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-xl">${(order.total / 100).toFixed(2)}</p>
                        <p className={`text-sm ${order.paymentStatus === "paid" ? "text-green-600" : "text-yellow-600"}`}>
                          {order.paymentStatus === "paid" ? "Paid" : "Payment Pending"}
                        </p>
                      </div>
                    </div>

                    {/* Customer Info */}
                    <div className="bg-muted/50 rounded-lg p-4 mb-4">
                      <h4 className="font-medium mb-2">Customer</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                        <span className="font-medium">{order.customerName}</span>
                        <a href={`tel:${order.customerPhone}`} className="flex items-center gap-1 text-orange-600 hover:underline">
                          <Phone className="w-3 h-3" />
                          {order.customerPhone}
                        </a>
                        <a href={`mailto:${order.customerEmail}`} className="flex items-center gap-1 text-orange-600 hover:underline">
                          <Mail className="w-3 h-3" />
                          {order.customerEmail}
                        </a>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="mb-4">
                      <h4 className="font-medium mb-2">Items</h4>
                      <div className="space-y-2">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span>
                              {item.quantity}x {item.name}
                              {item.notes && (
                                <span className="text-muted-foreground ml-2">({item.notes})</span>
                              )}
                            </span>
                            <span className="font-medium">${((item.price * item.quantity) / 100).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                      {order.specialInstructions && (
                        <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                          <p className="text-sm">
                            <span className="font-medium">Special Instructions:</span>{" "}
                            {order.specialInstructions}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Order Totals */}
                    <div className="border-t pt-4 mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>${(order.subtotal / 100).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Tax</span>
                        <span>${(order.tax / 100).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-bold">
                        <span>Total</span>
                        <span>${(order.total / 100).toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    {order.status !== "COMPLETED" && order.status !== "CANCELLED" && (
                      <div className="flex flex-wrap gap-3">
                        {nextStatus && (
                          <button
                            onClick={() => handleStatusUpdate(order._id, nextStatus)}
                            className="flex-1 sm:flex-none px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors"
                          >
                            Mark as {STATUS_CONFIG[nextStatus].label}
                          </button>
                        )}
                        {order.paymentStatus !== "paid" && (
                          <button
                            onClick={() => handleMarkPaid(order._id)}
                            className="flex-1 sm:flex-none px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                          >
                            Mark as Paid
                          </button>
                        )}
                        {order.status === "PENDING" && (
                          <button
                            onClick={() => handleStatusUpdate(order._id, "CANCELLED")}
                            className="px-4 py-2 border border-red-300 text-red-600 rounded-lg font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          >
                            Cancel Order
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <PublicFooter />
    </>
  );
}
