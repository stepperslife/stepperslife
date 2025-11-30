"use client";

import { useCart } from "@/contexts/CartContext";
import { ArrowLeft, Package, Loader2, Truck, Store, CheckCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { MarketplaceSubNav } from "@/components/layout/MarketplaceSubNav";
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getSubtotal, clearCart } = useCart();
  const createOrder = useMutation(api.productOrders.mutations.createProductOrder);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [shippingMethod, setShippingMethod] = useState<"DELIVERY" | "PICKUP">("DELIVERY");

  // Form state
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  // Shipping address state
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [country, setCountry] = useState("United States");

  // Pickup location
  const [pickupLocation, setPickupLocation] = useState("");

  const TAX_RATE = 0.0875; // 8.75% tax rate
  const subtotal = getSubtotal();
  const estimatedShipping = shippingMethod === "DELIVERY" ? 999 : 0; // $9.99 flat rate for now
  const tax = Math.round(subtotal * TAX_RATE);
  const total = subtotal + estimatedShipping + tax;

  if (items.length === 0) {
    return (
      <>
        <PublicHeader />
        <MarketplaceSubNav />
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="bg-card rounded-xl shadow-lg p-8 max-w-md w-full text-center">
            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground dark:text-white mb-2">
              Your cart is empty
            </h2>
            <p className="text-muted-foreground mb-6">
              Add some products to your cart before checking out.
            </p>
            <Link
              href="/marketplace"
              className="block w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Browse Products
            </Link>
          </div>
        </div>
        <PublicFooter />
      </>
    );
  }

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!customerName.trim() || !customerEmail.trim()) {
        throw new Error("Please fill in your name and email");
      }

      if (shippingMethod === "DELIVERY") {
        if (!address1.trim() || !city.trim() || !state.trim() || !zipCode.trim()) {
          throw new Error("Please fill in your complete shipping address");
        }
      }

      // Prepare order items
      const orderItems = items.map((item) => ({
        productId: item.productId as Id<"products">,
        productName: item.productName,
        variantId: item.variantId,
        variantName: item.variantName,
        quantity: item.quantity,
        price: item.productPrice,
      }));

      // Submit order
      const result = await createOrder({
        items: orderItems,
        customerEmail: customerEmail.trim(),
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim() || undefined,
        shippingMethod,
        shippingAddress: {
          name: customerName.trim(),
          address1: address1.trim(),
          address2: address2.trim() || undefined,
          city: city.trim(),
          state: state.trim(),
          zipCode: zipCode.trim(),
          country: country.trim(),
          phone: customerPhone.trim() || undefined,
        },
        pickupLocation: shippingMethod === "PICKUP" ? pickupLocation : undefined,
      });

      // Clear cart and redirect to confirmation
      clearCart();
      router.push(`/marketplace/order-confirmation?orderNumber=${result.orderNumber}`);
    } catch (err: any) {
      setError(err.message || "Failed to place order. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <PublicHeader />
      <MarketplaceSubNav />
      <div className="min-h-screen bg-background">
        {/* Back Link */}
        <div className="bg-card shadow-sm border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link
              href="/marketplace"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Shop
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-foreground mb-8">Checkout</h1>

          <form onSubmit={handleSubmitOrder}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Forms */}
              <div className="lg:col-span-2 space-y-6">
                {/* Contact Information */}
                <div className="bg-card rounded-xl shadow-md p-6">
                  <h2 className="text-xl font-semibold text-foreground mb-4">
                    Contact Information
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                          Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          value={customerEmail}
                          onChange={(e) => setCustomerEmail(e.target.value)}
                          className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                          placeholder="john@example.com"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                          Phone
                        </label>
                        <input
                          type="tel"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                          placeholder="(555) 123-4567"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Shipping Method */}
                <div className="bg-card rounded-xl shadow-md p-6">
                  <h2 className="text-xl font-semibold text-foreground mb-4">
                    Shipping Method
                  </h2>
                  <div className="space-y-3">
                    <label
                      className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-colors ${
                        shippingMethod === "DELIVERY"
                          ? "border-primary bg-primary/5"
                          : "border-input hover:border-primary/50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="shippingMethod"
                        value="DELIVERY"
                        checked={shippingMethod === "DELIVERY"}
                        onChange={() => setShippingMethod("DELIVERY")}
                        className="w-4 h-4 text-primary"
                      />
                      <Truck className="w-6 h-6 text-primary" />
                      <div className="flex-1">
                        <p className="font-medium text-foreground">Standard Shipping</p>
                        <p className="text-sm text-muted-foreground">
                          Delivered to your address in 5-7 business days
                        </p>
                      </div>
                      <span className="font-semibold text-foreground">$9.99</span>
                    </label>

                    <label
                      className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-colors ${
                        shippingMethod === "PICKUP"
                          ? "border-primary bg-primary/5"
                          : "border-input hover:border-primary/50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="shippingMethod"
                        value="PICKUP"
                        checked={shippingMethod === "PICKUP"}
                        onChange={() => setShippingMethod("PICKUP")}
                        className="w-4 h-4 text-primary"
                      />
                      <Store className="w-6 h-6 text-primary" />
                      <div className="flex-1">
                        <p className="font-medium text-foreground">Local Pickup</p>
                        <p className="text-sm text-muted-foreground">
                          Pick up from vendor location
                        </p>
                      </div>
                      <span className="font-semibold text-green-600">Free</span>
                    </label>
                  </div>
                </div>

                {/* Shipping Address */}
                {shippingMethod === "DELIVERY" && (
                  <div className="bg-card rounded-xl shadow-md p-6">
                    <h2 className="text-xl font-semibold text-foreground mb-4">
                      Shipping Address
                    </h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                          Street Address <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={address1}
                          onChange={(e) => setAddress1(e.target.value)}
                          className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                          placeholder="123 Main Street"
                          required={shippingMethod === "DELIVERY"}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                          Apt, Suite, etc. (optional)
                        </label>
                        <input
                          type="text"
                          value={address2}
                          onChange={(e) => setAddress2(e.target.value)}
                          className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                          placeholder="Apartment 4B"
                        />
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <div className="col-span-2 sm:col-span-1">
                          <label className="block text-sm font-medium text-foreground mb-1">
                            City <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder="Chicago"
                            required={shippingMethod === "DELIVERY"}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1">
                            State <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={state}
                            onChange={(e) => setState(e.target.value)}
                            className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder="IL"
                            required={shippingMethod === "DELIVERY"}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1">
                            ZIP Code <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={zipCode}
                            onChange={(e) => setZipCode(e.target.value)}
                            className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder="60601"
                            required={shippingMethod === "DELIVERY"}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                          Country
                        </label>
                        <select
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                          <option value="United States">United States</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Pickup Location */}
                {shippingMethod === "PICKUP" && (
                  <div className="bg-card rounded-xl shadow-md p-6">
                    <h2 className="text-xl font-semibold text-foreground mb-4">
                      Pickup Information
                    </h2>
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-4">
                      <p className="text-sm text-foreground">
                        After placing your order, the vendor will contact you with pickup location details and available times.
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">
                        Preferred Pickup Location (optional)
                      </label>
                      <textarea
                        value={pickupLocation}
                        onChange={(e) => setPickupLocation(e.target.value)}
                        className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Any preferred location or notes for the vendor..."
                        rows={3}
                      />
                    </div>
                  </div>
                )}

                {/* Payment Notice */}
                <div className="bg-card rounded-xl shadow-md p-6">
                  <h2 className="text-xl font-semibold text-foreground mb-4">
                    Payment
                  </h2>
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-amber-800 dark:text-amber-200">
                          Pay When You Receive
                        </p>
                        <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                          Payment will be collected upon delivery or pickup. The vendor will contact you to arrange payment details.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}

                {/* Submit Button - Mobile */}
                <div className="lg:hidden">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Placing Order...
                      </>
                    ) : (
                      `Place Order - $${(total / 100).toFixed(2)}`
                    )}
                  </button>
                </div>
              </div>

              {/* Right Column - Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-card rounded-xl shadow-md p-6 sticky top-4">
                  <h2 className="text-xl font-bold text-foreground mb-4">Order Summary</h2>

                  {/* Cart Items */}
                  <div className="space-y-4 mb-4 max-h-80 overflow-y-auto">
                    {items.map((item, index) => (
                      <div
                        key={`${item.productId}-${item.variantId || "default"}-${index}`}
                        className="flex gap-3 pb-4 border-b border-border"
                      >
                        {item.productImage ? (
                          <div className="relative w-16 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                            <Image
                              src={item.productImage}
                              alt={item.productName}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                            <Package className="w-6 h-6 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-foreground text-sm line-clamp-2">
                            {item.productName}
                          </h3>
                          {item.variantName && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {item.variantName}
                            </p>
                          )}
                          <div className="flex justify-between items-center mt-2">
                            <p className="text-sm text-muted-foreground">
                              Qty: {item.quantity}
                            </p>
                            <p className="text-sm font-semibold text-foreground">
                              ${((item.productPrice * item.quantity) / 100).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Totals */}
                  <div className="space-y-2 pt-4 border-t border-border">
                    <div className="flex justify-between text-muted-foreground text-sm">
                      <span>Subtotal</span>
                      <span>${(subtotal / 100).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground text-sm">
                      <span>Shipping</span>
                      <span>
                        {shippingMethod === "PICKUP" ? (
                          <span className="text-green-600">Free</span>
                        ) : (
                          `$${(estimatedShipping / 100).toFixed(2)}`
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between text-muted-foreground text-sm">
                      <span>Tax (8.75%)</span>
                      <span>${(tax / 100).toFixed(2)}</span>
                    </div>
                    <div className="border-t border-border pt-2 mt-2 flex justify-between text-lg font-bold text-foreground">
                      <span>Total</span>
                      <span className="text-primary">
                        ${(total / 100).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Submit Button - Desktop */}
                  <div className="hidden lg:block mt-6">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Placing Order...
                        </>
                      ) : (
                        "Place Order"
                      )}
                    </button>
                  </div>

                  <p className="text-xs text-muted-foreground mt-4 text-center">
                    By placing your order, you agree to our Terms of Service
                  </p>
                </div>
              </div>
            </div>
          </form>
        </main>
      </div>
      <PublicFooter />
    </>
  );
}
