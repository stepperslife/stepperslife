"use client";

import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useEffect, useMemo } from "react";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { RestaurantsSubNav } from "@/components/layout/RestaurantsSubNav";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { ArrowLeft, Clock, MapPin, CreditCard, Loader2, Calendar } from "lucide-react";
import Link from "next/link";
import { Id } from "@/convex/_generated/dataModel";

interface CartItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
}

type PickupTimeOption = {
  label: string;
  value: number | "asap";
};

export default function RestaurantCheckoutPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const slug = params.slug as string;

  const restaurant = useQuery(api.restaurants.getBySlug, { slug });
  const createOrder = useAction(api.foodOrders.createWithNotification);

  // Parse cart from URL params
  const [cart, setCart] = useState<CartItem[]>([]);
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

  useEffect(() => {
    const cartParam = searchParams.get("cart");
    if (cartParam) {
      try {
        const parsed = JSON.parse(decodeURIComponent(cartParam));
        setCart(parsed);
      } catch {
        console.error("Failed to parse cart");
      }
    }
  }, [searchParams]);

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

  if (restaurant === null || cart.length === 0) {
    return (
      <>
        <PublicHeader />
        <RestaurantsSubNav />
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-8 text-center">
            <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
            <Link
              href={`/restaurants/${slug}`}
              className="text-orange-600 hover:underline"
            >
              Return to restaurant menu
            </Link>
          </div>
        </div>
        <PublicFooter />
      </>
    );
  }

  const TAX_RATE = 0.0875; // 8.75% tax rate
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = Math.round(subtotal * TAX_RATE);
  const total = subtotal + tax;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      // Validate form
      if (!customerName.trim() || !customerEmail.trim() || !customerPhone.trim()) {
        throw new Error("Please fill in all required fields");
      }

      // Create order items with proper IDs
      const orderItems = cart.map((item) => ({
        menuItemId: item.menuItemId as Id<"menuItems">,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      }));

      // Calculate pickup time
      const pickupTime = pickupTimeOption === "asap"
        ? Date.now() + (restaurant.estimatedPickupTime * 60 * 1000)
        : pickupTimeOption;

      // Submit order (with notification)
      const result = await createOrder({
        restaurantId: restaurant._id,
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        customerPhone: customerPhone.trim(),
        items: orderItems,
        subtotal,
        tax,
        total,
        pickupTime,
        specialInstructions: specialInstructions.trim() || undefined,
        paymentMethod: "pay_at_pickup",
      });

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
                        Full Name <span className="text-red-500">*</span>
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
                        Email <span className="text-red-500">*</span>
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
                        Phone <span className="text-red-500">*</span>
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
                            ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 font-medium"
                            : "border-input hover:border-orange-300 hover:bg-orange-50/50 dark:hover:bg-orange-900/10"
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
                  <div className="flex items-center gap-3 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                    <CreditCard className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="font-medium">Pay at Pickup</p>
                      <p className="text-sm text-muted-foreground">
                        Pay when you pick up your order
                      </p>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                  {cart.map((item) => (
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
