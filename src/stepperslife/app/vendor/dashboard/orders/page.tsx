"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/useAuth";
import { Id } from "@/convex/_generated/dataModel";
import {
  Package,
  Search,
  Filter,
  Eye,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  ShoppingBag,
} from "lucide-react";

type FulfillmentStatus = "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";

const STATUS_CONFIG: Record<FulfillmentStatus, { label: string; color: string; icon: typeof Clock }> = {
  PENDING: { label: "Pending", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300", icon: Clock },
  PROCESSING: { label: "Processing", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300", icon: Package },
  SHIPPED: { label: "Shipped", color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300", icon: Truck },
  DELIVERED: { label: "Delivered", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300", icon: CheckCircle },
  CANCELLED: { label: "Cancelled", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300", icon: XCircle },
};

export default function VendorOrdersPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<FulfillmentStatus | "">("");
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

  // Get vendor
  const vendor = useQuery(
    api.vendors.getByOwner,
    user?._id ? { ownerId: user._id as Id<"users"> } : "skip"
  );

  // Get vendor orders
  const orders = useQuery(
    api.productOrders.getOrdersByVendor,
    vendor?._id
      ? {
          vendorId: vendor._id,
          fulfillmentStatus: statusFilter || undefined,
        }
      : "skip"
  );

  // Filter orders by search
  const filteredOrders = orders?.filter((order) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      order.orderNumber.toLowerCase().includes(query) ||
      order.customerName.toLowerCase().includes(query) ||
      order.customerEmail.toLowerCase().includes(query)
    );
  });

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  // Calculate stats
  const stats = {
    total: orders?.length || 0,
    pending: orders?.filter((o) => o.fulfillmentStatus === "PENDING").length || 0,
    processing: orders?.filter((o) => o.fulfillmentStatus === "PROCESSING").length || 0,
    shipped: orders?.filter((o) => o.fulfillmentStatus === "SHIPPED").length || 0,
  };

  if (!vendor) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Orders</h1>
        <p className="text-muted-foreground">Manage orders containing your products</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total Orders</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.pending}</p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.processing}</p>
              <p className="text-sm text-muted-foreground">Processing</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <Truck className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.shipped}</p>
              <p className="text-sm text-muted-foreground">Shipped</p>
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
              placeholder="Search by order number, customer name, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-input rounded-lg bg-background focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-muted-foreground" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as FulfillmentStatus | "")}
              className="px-4 py-2 border border-input rounded-lg bg-background focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="PROCESSING">Processing</option>
              <option value="SHIPPED">Shipped</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders List */}
      {orders === undefined ? (
        <div className="bg-card rounded-xl border border-border p-8 flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : filteredOrders && filteredOrders.length > 0 ? (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const statusConfig = STATUS_CONFIG[order.fulfillmentStatus as FulfillmentStatus];
            const StatusIcon = statusConfig.icon;
            const isExpanded = selectedOrder === order._id;

            return (
              <div
                key={order._id}
                className="bg-card rounded-xl border border-border overflow-hidden"
              >
                {/* Order Header */}
                <div
                  className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => setSelectedOrder(isExpanded ? null : order._id)}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                        <ShoppingBag className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-bold text-foreground">{order.orderNumber}</p>
                        <p className="text-sm text-muted-foreground">
                          {order.customerName} • {formatDate(order.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold text-foreground">
                          {formatCurrency(order.vendorSubtotal)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {order.totalItems} item{order.totalItems !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${statusConfig.color}`}
                      >
                        <StatusIcon className="w-4 h-4" />
                        {statusConfig.label}
                      </span>
                      <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                        <Eye className="w-5 h-5 text-muted-foreground" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-border p-4 bg-muted/30">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Customer Info */}
                      <div>
                        <h4 className="font-medium text-foreground mb-2">Customer Information</h4>
                        <div className="space-y-1 text-sm">
                          <p className="text-muted-foreground">
                            <span className="font-medium text-foreground">Name:</span>{" "}
                            {order.customerName}
                          </p>
                          <p className="text-muted-foreground">
                            <span className="font-medium text-foreground">Email:</span>{" "}
                            {order.customerEmail}
                          </p>
                          {order.customerPhone && (
                            <p className="text-muted-foreground">
                              <span className="font-medium text-foreground">Phone:</span>{" "}
                              {order.customerPhone}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Shipping Address */}
                      <div>
                        <h4 className="font-medium text-foreground mb-2">Shipping Address</h4>
                        <div className="text-sm text-muted-foreground">
                          <p>{order.shippingAddress.name}</p>
                          <p>{order.shippingAddress.address1}</p>
                          {order.shippingAddress.address2 && (
                            <p>{order.shippingAddress.address2}</p>
                          )}
                          <p>
                            {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                            {order.shippingAddress.zipCode}
                          </p>
                          <p>{order.shippingAddress.country}</p>
                        </div>
                      </div>
                    </div>

                    {/* Your Items */}
                    <div className="mt-6">
                      <h4 className="font-medium text-foreground mb-3">Your Items</h4>
                      <div className="space-y-3">
                        {order.vendorItems.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-3 bg-background rounded-lg border border-border"
                          >
                            <div>
                              <p className="font-medium text-foreground">{item.productName}</p>
                              {item.variantName && (
                                <p className="text-sm text-muted-foreground">{item.variantName}</p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-foreground">
                                {formatCurrency(item.totalPrice)}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {item.quantity} × {formatCurrency(item.price)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Tracking Info */}
                    {order.trackingNumber && (
                      <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-2">
                          Tracking Information
                        </h4>
                        <p className="text-sm text-purple-800 dark:text-purple-200">
                          Tracking #: {order.trackingNumber}
                        </p>
                        {order.trackingUrl && (
                          <a
                            href={order.trackingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-purple-600 hover:text-purple-700 underline"
                          >
                            Track Package
                          </a>
                        )}
                      </div>
                    )}

                    {/* Order Timeline */}
                    <div className="mt-6">
                      <h4 className="font-medium text-foreground mb-3">Order Timeline</h4>
                      <div className="space-y-2 text-sm">
                        <p className="text-muted-foreground">
                          <span className="font-medium text-foreground">Created:</span>{" "}
                          {formatDate(order.createdAt)}
                        </p>
                        {order.paidAt && (
                          <p className="text-muted-foreground">
                            <span className="font-medium text-foreground">Paid:</span>{" "}
                            {formatDate(order.paidAt)}
                          </p>
                        )}
                        {order.shippedAt && (
                          <p className="text-muted-foreground">
                            <span className="font-medium text-foreground">Shipped:</span>{" "}
                            {formatDate(order.shippedAt)}
                          </p>
                        )}
                        {order.deliveredAt && (
                          <p className="text-muted-foreground">
                            <span className="font-medium text-foreground">Delivered:</span>{" "}
                            {formatDate(order.deliveredAt)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-2">No orders yet</h3>
          <p className="text-muted-foreground max-w-sm mx-auto">
            When customers purchase your products, their orders will appear here.
          </p>
        </div>
      )}
    </div>
  );
}
