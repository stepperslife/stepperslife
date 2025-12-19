"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/useAuth";
import { useState, useMemo } from "react";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { RestaurantsSubNav } from "@/components/layout/RestaurantsSubNav";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { ArrowLeft, Clock, MapPin, CreditCard, Loader2, Calendar, LogIn } from "lucide-react";
import Link from "next/link";
import { Id } from "@/convex/_generated/dataModel";
import { useFoodCart } from "@/contexts/FoodCartContext";

type PickupTimeOption = {
  label: string;
  value: number | "asap";
};

// Validation patterns
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?[\d\s\-()]{10,}$/;

export default function RestaurantCheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const restaurant = useQuery(api.restaurants.getBySlug, { slug });
  const createOrder = useAction(api.foodOrders.createWithNotification);
  const { user } = useAuth();
  const { cart, clearCart } = useFoodCart();

  // Use cart from context - verify it's for this restaurant
  const isValidCart = cart.restaurantSlug === slug && cart.items.length > 0;
  const cartItems = isValidCart ? cart.items : [];

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [pickupTimeOption, setPickupTimeOption] = useState<"asap" | number>("asap");

  // Generate pickup time slots
  const pickupTimeOptions = useMemo<PickupTimeOption[]>(() => {
    if (!restaurant) return [];

    const options: PickupTimeOption[] = [
      { label: `ASAP (~${restaurant.estimatedPickupTime} min)`, value: "asap" },
    ];

    const now = new Date();
    const startTime = new Date(now.getTime() + (restaurant.estimatedPickupTime + 15) * 60000);

    // Round to nearest 15 minutes
    startTime.setMinutes(Math.ceil(startTime.getMinutes() / 15) * 15);
    startTime.setSeconds(0);

    // Generate time slots for the next 4 hours in 15-minute increments
    for (let i = 0; i < 16; i++) {
      const slotTime = new Date(startTime.getTime() + i * 15 * 60000);
      const hours = slotTime.getHours();
      const minutes = slotTime.getMinutes();
      const ampm = hours >= 12 ? "PM" : "AM";
      const displayHours = hours % 12 || 12;
      const displayMinutes = minutes.toString().padStart(2, "0");

      options.push({
        label: `${displayHours}:${displayMinutes} ${ampm}`,
        value: slotTime.getTime(),
      });
    }

    return options;
  }, [restaurant]);

  if (restaurant === undefined) {
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

  // Require login to checkout
  if (!user) {
    const redirectUrl = encodeURIComponent(`/restaurants/${slug}/checkout`);
    return (
      <>
        <PublicHeader />
        <RestaurantsSubNav />
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-md mx-auto bg-card rounded-2xl shadow-lg p-8 text-center border border-border">
              <div className="w-16 h-16 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <LogIn className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-4">Sign In to Continue</h1>
              <p className="text-muted-foreground mb-8">
                Please sign in to complete your food order.
              </p>
              <Link
                href={`/login?redirect=${redirectUrl}`}
                className="block w-full px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors"
              >
                Sign In
              </Link>
              <p className="text-sm text-muted-foreground mt-4">
                Don't have an account?{" "}
                <Link href={`/register?redirect=${redirectUrl}`} className="text-primary hover:underline">
                  Create one
                </Link>
              </p>
            </div>
          </div>
        </div>
        <PublicFooter />
      </>
    );
  }

  if (restaurant === null || !isValidCart) {
    return (
      <>
        <PublicHeader />
        <RestaurantsSubNav />
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-8 text-center">
            <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
            <Link
              href={`/restaurants/${slug}`}
              className="text-primary hover:underline"
            >
              Return to restaurant menu
            </Link>
          </div>
        </div>
        <PublicFooter />
      </>
    );
  }

  // Use restaurant-specific tax rate if available, fallback to 8.75%
  const TAX_RATE = (restaurant as any).taxRate ?? 0.0875;
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = Math.round(subtotal * TAX_RATE);
  const total = subtotal + tax;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!customerName.trim()) {
        throw new Error("Please enter your name");
      }

      // Validate email format
      const email = customerEmail.trim();
      if (!email) {
        throw new Error("Please enter your email address");
      }
      if (!EMAIL_REGEX.test(email)) {
        throw new Error("Please enter a valid email address");
      }

      // Validate phone format
      const phone = customerPhone.trim();
      if (!phone) {
        throw new Error("Please enter your phone number");
      }
      if (!PHONE_REGEX.test(phone)) {
        throw new Error("Please enter a valid phone number (at least 10 digits)");
      }

      // Create order items with proper IDs
      const orderItems = cartItems.map((item) => ({
        menuItemId: item.menuItemId as Id<"menuItems">,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      }));

      // Calculate pickup time
      const pickupTime = pickupTimeOption === "asap"
        ? Date.now() + (restaurant.estimatedPickupTime * 60 * 1000)
        : pickupTimeOption;

      // Submit order (with notification) - link to authenticated user if logged in
      const result = await createOrder({
        restaurantId: restaurant._id,
        customerId: user?._id as Id<"users"> | undefined,
        customerName: customerName.trim(),
        customerEmail: email,
        customerPhone: phone,
        items: orderItems,
        subtotal,
        tax,
        total,
        pickupTime,
        specialInstructions: specialInstructions.trim() || undefined,
        paymentMethod: "pay_at_pickup",
      });

      // Clear the cart after successful order
      clearCart();

      // Save order number to localStorage for guest order tracking
      if (typeof window !== 'undefined') {
        const recentOrders = JSON.parse(localStorage.getItem('recentFoodOrders') || '[]');
        recentOrders.unshift({
          orderNumber: result.orderNumber,
          restaurantName: restaurant.name,
          orderId: result.orderId,
          placedAt: Date.now(),
        });
        // Keep only last 10 orders
        localStorage.setItem('recentFoodOrders', JSON.stringify(recentOrders.slice(0, 10)));
      }

      // Redirect to confirmation page with order ID
      router.push(`/restaurants/${slug}/order-confirmation?orderId=${result.orderId}`);
    } catch (err: any) {
      setError(err.message || "Failed to place order. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <PublicHeader />
      <RestaurantsSubNav />
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Back Button */}
          <Link
            href={`/restaurants/${slug}`}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to menu
          </Link>

          <h1 className="text-3xl font-bold mb-2">Checkout</h1>
          <p className="text-muted-foreground mb-8">
            Complete your order from {restaurant.name}
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Order Form */}
            <div>
              <form onSubmit={handleSubmitOrder} className="space-y-6">
                <div className="bg-card rounded-lg border p-6">
                  <h2 className="text-xl font-semibold mb-4">Contact Information</h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Full Name <span className="text-destructive">*</span>
                      </label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="John Doe"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Email <span className="text-destructive">*</span>
                      </label>
                      <input
                        type="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="john@example.com"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Phone <span className="text-destructive">*</span>
                      </label>
                      <input
                        type="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="(555) 123-4567"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-card rounded-lg border p-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Pickup Time
                  </h2>
                  <p className="text-sm text-muted-foreground mb-3">
                    When would you like to pick up your order?
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {pickupTimeOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setPickupTimeOption(option.value)}
                        className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                          pickupTimeOption === option.value
                            ? "border-primary bg-primary/5 dark:bg-primary/20 text-primary dark:text-primary font-medium"
                            : "border-input hover:border-primary/30 hover:bg-primary/5 dark:hover:bg-primary/10"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-card rounded-lg border p-6">
                  <h2 className="text-xl font-semibold mb-4">Special Instructions</h2>
                  <textarea
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Any allergies, special requests, or notes for the restaurant..."
                    rows={3}
                  />
                </div>

                <div className="bg-card rounded-lg border p-6">
                  <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
                  <div className="flex items-center gap-3 p-4 bg-primary/5 dark:bg-primary/20 border border-primary/30 dark:border-primary/40 rounded-lg">
                    <CreditCard className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Pay at Pickup</p>
                      <p className="text-sm text-muted-foreground">
                        Pay when you pick up your order
                      </p>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="bg-destructive/10 dark:bg-destructive/15 border border-destructive/30 dark:border-destructive/30 text-destructive dark:text-destructive px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Placing Order...
                    </>
                  ) : (
                    `Place Order - $${(total / 100).toFixed(2)}`
                  )}
                </button>
              </form>
            </div>

            {/* Order Summary */}
            <div>
              <div className="bg-card rounded-lg border p-6 sticky top-6">
                <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

                {/* Restaurant Info */}
                <div className="flex items-start gap-3 pb-4 border-b mb-4">
                  <div className="flex-1">
                    <p className="font-semibold">{restaurant.name}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3" />
                      {restaurant.address}
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <Clock className="h-3 w-3" />
                      {pickupTimeOption === "asap" ? (
                        `Est. pickup in ${restaurant.estimatedPickupTime} min`
                      ) : (
                        `Pickup at ${new Date(pickupTimeOption).toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                        })}`
                      )}
                    </p>
                  </div>
                </div>

                {/* Cart Items */}
                <div className="space-y-3 pb-4 border-b mb-4">
                  {cartItems.map((item) => (
                    <div key={item.menuItemId} className="flex justify-between">
                      <div>
                        <span className="font-medium">{item.quantity}x</span>{" "}
                        <span>{item.name}</span>
                      </div>
                      <span>${((item.price * item.quantity) / 100).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${(subtotal / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax (8.75%)</span>
                    <span>${(tax / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Total</span>
                    <span>${(total / 100).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <PublicFooter />
    </>
  );
}
