"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { MarketplaceSubNav } from "@/components/layout/MarketplaceSubNav";
import {
  Package,
  Loader2,
  Truck,
  Store,
  Search,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  Mail,
  ImageIcon,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

type FulfillmentStatus = "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

const statusConfig: Record<FulfillmentStatus, { label: string; color: string; icon: typeof Clock }> = {
  PENDING: { label: "Pending", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400", icon: Clock },
  PROCESSING: { label: "Processing", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400", icon: Package },
  SHIPPED: { label: "Shipped", color: "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400", icon: Truck },
  DELIVERED: { label: "Delivered", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400", icon: CheckCircle },
  CANCELLED: { label: "Cancelled", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400", icon: XCircle },
};

const paymentStatusConfig: Record<PaymentStatus, { label: string; color: string }> = {
  PENDING: { label: "Payment Pending", color: "text-yellow-600 dark:text-yellow-400" },
  PAID: { label: "Paid", color: "text-green-600 dark:text-green-400" },
  FAILED: { label: "Payment Failed", color: "text-red-600 dark:text-red-400" },
  REFUNDED: { label: "Refunded", color: "text-gray-600 dark:text-gray-400" },
};

export default function MyOrdersPage() {
  const [email, setEmail] = useState("");
  const [searchEmail, setSearchEmail] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const orders = useQuery(
    api.productOrders.queries.getOrdersByEmail,
    searchEmail ? { email: searchEmail } : "skip"
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSearchEmail(email.trim().toLowerCase());
      setHasSearched(true);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      <PublicHeader />
      <MarketplaceSubNav />
      <div className="min-h-screen bg-background">
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="text-center mb-8">
            <Package className="w-16 h-16 text-primary mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-foreground mb-2">My Orders</h1>
            <p className="text-muted-foreground">
              Enter your email address to view your order history
            </p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="max-w-md mx-auto mb-8">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full pl-10 pr-4 py-3 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2"
              >
                <Search className="w-5 h-5" />
                <span className="hidden sm:inline">Search</span>
              </button>
            </div>
          </form>

          {/* Loading State */}
          {searchEmail && orders === undefined && (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Loading your orders...</p>
            </div>
          )}

          {/* No Orders Found */}
          {hasSearched && orders !== undefined && orders.length === 0 && (
            <div className="bg-card rounded-xl shadow-md p-8 text-center">
              <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">No Orders Found</h2>
              <p className="text-muted-foreground mb-6">
                We couldn't find any orders associated with {searchEmail}
              </p>
              <Link
                href="/marketplace"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors"
              >
                Start Shopping
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          )}

          {/* Orders List */}
          {orders && orders.length > 0 && (
            <div className="space-y-6">
              <p className="text-sm text-muted-foreground">
                Found {orders.length} order{orders.length !== 1 ? "s" : ""} for {searchEmail}
              </p>

              {orders.map((order) => {
                const status = statusConfig[order.fulfillmentStatus as FulfillmentStatus];
                const paymentStatus = paymentStatusConfig[order.paymentStatus as PaymentStatus];
                const StatusIcon = status.icon;

                return (
                  <div
                    key={order._id}
                    className="bg-card rounded-xl shadow-md overflow-hidden"
                  >
                    {/* Order Header */}
                    <div className="p-4 sm:p-6 border-b border-border bg-muted/30">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Order Number</p>
                          <p className="font-bold text-foreground">{order.orderNumber}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {formatDate(order.createdAt)}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
                            <StatusIcon className="w-4 h-4" />
                            {status.label}
                          </span>
                          <span className={`text-sm font-medium ${paymentStatus.color}`}>
                            {paymentStatus.label}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="p-4 sm:p-6">
                      <div className="space-y-4 mb-4">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex gap-4">
                            {/* Product Image */}
                            <div className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                              {item.productImage ? (
                                <Image
                                  src={item.productImage}
                                  alt={item.productName}
                                  width={80}
                                  height={80}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <ImageIcon className="w-6 h-6 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                            {/* Product Details */}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground truncate">
                                {item.productName}
                              </p>
                              {item.variantName && (
                                <p className="text-sm text-muted-foreground">{item.variantName}</p>
                              )}
                              <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                            </div>
                            {/* Price */}
                            <p className="font-medium text-foreground">
                              ${((item.price * item.quantity) / 100).toFixed(2)}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Order Totals */}
                      <div className="border-t border-border pt-4 space-y-1">
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Subtotal</span>
                          <span>${(order.subtotal / 100).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Shipping</span>
                          <span>
                            {order.shippingCost === 0 ? (
                              <span className="text-green-600">Free</span>
                            ) : (
                              `$${(order.shippingCost / 100).toFixed(2)}`
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Tax</span>
                          <span>${(order.taxAmount / 100).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-foreground pt-2">
                          <span>Total</span>
                          <span className="text-primary">${(order.totalAmount / 100).toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Shipping/Pickup Info */}
                      <div className="mt-4 pt-4 border-t border-border">
                        <div className="flex items-center gap-2 text-sm">
                          {order.shippingCost === 0 ? (
                            <>
                              <Store className="w-4 h-4 text-primary" />
                              <span className="text-muted-foreground">Local Pickup</span>
                            </>
                          ) : (
                            <>
                              <Truck className="w-4 h-4 text-primary" />
                              <span className="text-muted-foreground">
                                {order.shippingAddress?.city}, {order.shippingAddress?.state}
                              </span>
                            </>
                          )}
                        </div>

                        {/* Tracking Info */}
                        {order.trackingNumber && (
                          <div className="mt-2 text-sm">
                            <span className="text-muted-foreground">Tracking: </span>
                            {order.trackingUrl ? (
                              <a
                                href={order.trackingUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                              >
                                {order.trackingNumber}
                              </a>
                            ) : (
                              <span className="text-foreground">{order.trackingNumber}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Initial State - No Search Yet */}
          {!hasSearched && (
            <div className="bg-card rounded-xl shadow-md p-8 text-center">
              <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Look Up Your Orders
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Enter the email address you used when placing your order to view your order history and track your purchases.
              </p>
            </div>
          )}
        </main>
      </div>
      <PublicFooter />
    </>
  );
}
