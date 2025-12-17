"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { RestaurantsSubNav } from "@/components/layout/RestaurantsSubNav";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { CheckCircle, Clock, MapPin, Phone, Receipt, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Id } from "@/convex/_generated/dataModel";

export default function OrderConfirmationPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  const orderId = searchParams.get("orderId");

  const restaurant = useQuery(api.restaurants.getBySlug, { slug });
  const order = useQuery(
    api.foodOrders.getById,
    orderId ? { id: orderId as Id<"foodOrders"> } : "skip"
  );

  if (restaurant === undefined || order === undefined) {
    return (
      <>
        <PublicHeader />
        <RestaurantsSubNav />
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
        <PublicFooter />
      </>
    );
  }

  if (restaurant === null || !orderId || order === null) {
    return (
      <>
        <PublicHeader />
        <RestaurantsSubNav />
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-8 text-center">
            <h1 className="text-2xl font-bold mb-4">Order not found</h1>
            <Link
              href="/restaurants"
              className="text-orange-600 hover:underline"
            >
              Browse restaurants
            </Link>
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
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          {/* Success Message */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Order Placed!</h1>
            <p className="text-muted-foreground">
              Your order has been submitted to {restaurant.name}
            </p>
          </div>

          {/* Order Details Card */}
          <div className="bg-card rounded-lg border p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Receipt className="h-5 w-5 text-orange-600" />
              <h2 className="text-xl font-semibold">Order Details</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b">
                <span className="text-muted-foreground">Order Number</span>
                <span className="font-mono font-medium">{order.orderNumber}</span>
              </div>

              <div className="flex items-center justify-between py-3 border-b">
                <span className="text-muted-foreground">Status</span>
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-full text-sm font-medium">
                  <Clock className="h-3 w-3" />
                  {order.status === "PENDING" ? "Preparing" : order.status}
                </span>
              </div>

              <div className="flex items-center justify-between py-3 border-b">
                <span className="text-muted-foreground">Payment</span>
                <span className="text-sm">
                  {order.paymentStatus === "paid" ? "Paid" : "Pay at Pickup"}
                </span>
              </div>

              <div className="flex items-center justify-between py-3 border-b">
                <span className="text-muted-foreground">Estimated Pickup</span>
                <span className="font-medium">~{restaurant.estimatedPickupTime} minutes</span>
              </div>

              <div className="flex items-center justify-between py-3">
                <span className="text-muted-foreground">Total</span>
                <span className="font-bold text-lg">${(order.total / 100).toFixed(2)}</span>
              </div>
            </div>

            {/* Order Items */}
            <div className="mt-6 pt-4 border-t">
              <h3 className="font-medium mb-3">Items Ordered</h3>
              <div className="space-y-2">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span>{item.quantity}x {item.name}</span>
                    <span>${((item.price * item.quantity) / 100).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pickup Location Card */}
          <div className="bg-card rounded-lg border p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="h-5 w-5 text-orange-600" />
              <h2 className="text-xl font-semibold">Pickup Location</h2>
            </div>

            <div className="space-y-3">
              <p className="font-semibold text-lg">{restaurant.name}</p>
              <p className="text-muted-foreground">
                {restaurant.address}<br />
                {restaurant.city}, {restaurant.state} {restaurant.zipCode}
              </p>
              <a
                href={`tel:${restaurant.phone}`}
                className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700"
              >
                <Phone className="h-4 w-4" />
                {restaurant.phone}
              </a>
            </div>
          </div>

          {/* What's Next */}
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800 p-6 mb-8">
            <h3 className="font-semibold mb-3">What happens next?</h3>
            <ol className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="inline-flex items-center justify-center w-5 h-5 bg-orange-600 text-white rounded-full text-xs flex-shrink-0 mt-0.5">1</span>
                <span>The restaurant is preparing your order</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="inline-flex items-center justify-center w-5 h-5 bg-orange-600 text-white rounded-full text-xs flex-shrink-0 mt-0.5">2</span>
                <span>You'll receive an email when your order is ready</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="inline-flex items-center justify-center w-5 h-5 bg-orange-600 text-white rounded-full text-xs flex-shrink-0 mt-0.5">3</span>
                <span>Pick up your order and pay at the restaurant</span>
              </li>
            </ol>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href={`/restaurants/${slug}`}
              className="flex-1 py-3 px-6 border rounded-lg font-medium text-center hover:bg-accent transition-colors"
            >
              Order More
            </Link>
            <Link
              href="/restaurants"
              className="flex-1 py-3 px-6 bg-orange-600 text-white rounded-lg font-medium text-center hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
            >
              Browse Restaurants
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
      <PublicFooter />
    </>
  );
}
