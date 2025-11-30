"use client";

import { useCart } from "@/contexts/CartContext";
import { ArrowLeft, Construction, Package, Mail, Phone, ShoppingBag, Info } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { MarketplaceSubNav } from "@/components/layout/MarketplaceSubNav";

export default function CheckoutPage() {
  const { items, getSubtotal } = useCart();

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
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Coming Soon Message */}
            <div className="lg:col-span-3">
              <div className="bg-card rounded-xl shadow-md p-8 text-center">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Construction className="w-10 h-10 text-primary" />
                </div>

                <h1 className="text-3xl font-bold text-foreground mb-4">
                  Online Checkout Coming Soon!
                </h1>

                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  We're working hard to bring you a seamless online shopping experience.
                  In the meantime, you can contact our vendors directly to place your order.
                </p>

                {/* Contact Information */}
                <div className="bg-accent/50 border border-border rounded-lg p-6 mb-6">
                  <h2 className="font-semibold text-foreground mb-4 flex items-center justify-center gap-2">
                    <Info className="w-5 h-5 text-primary" />
                    How to Order
                  </h2>
                  <div className="space-y-3 text-left max-w-sm mx-auto">
                    <p className="text-sm text-muted-foreground">
                      1. Note down the products you want from your cart
                    </p>
                    <p className="text-sm text-muted-foreground">
                      2. Contact the vendor directly using their contact information on the product page
                    </p>
                    <p className="text-sm text-muted-foreground">
                      3. Arrange payment and delivery/pickup with the vendor
                    </p>
                  </div>
                </div>

                {/* Contact Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <a
                    href="mailto:support@stepperslife.com?subject=Marketplace%20Order%20Inquiry"
                    className="flex items-center justify-center gap-2 px-4 py-3 border border-input rounded-lg hover:bg-accent transition-colors"
                  >
                    <Mail className="w-5 h-5 text-primary" />
                    <span>Email Support</span>
                  </a>
                  <a
                    href="tel:+1234567890"
                    className="flex items-center justify-center gap-2 px-4 py-3 border border-input rounded-lg hover:bg-accent transition-colors"
                  >
                    <Phone className="w-5 h-5 text-primary" />
                    <span>Call Us</span>
                  </a>
                </div>

                <Link
                  href="/marketplace"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <ShoppingBag className="w-5 h-5" />
                  Continue Shopping
                </Link>
              </div>
            </div>

            {/* Cart Summary */}
            <div className="lg:col-span-2">
              <div className="bg-card rounded-xl shadow-md p-6 sticky top-4">
                <h2 className="text-xl font-bold text-foreground mb-4">Your Cart</h2>

                {/* Cart Items */}
                <div className="space-y-4 mb-4 max-h-80 overflow-y-auto">
                  {items.map((item) => (
                    <div
                      key={`${item.productId}-${item.variantId || "default"}`}
                      className="flex gap-3 pb-4 border-b border-border"
                    >
                      {item.productImage ? (
                        <div className="relative w-14 h-14 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={item.productImage}
                            alt={item.productName}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-14 h-14 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                          <Package className="w-5 h-5 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-foreground text-sm line-clamp-1">
                          {item.productName}
                        </h3>
                        {item.variantName && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {item.variantName}
                          </p>
                        )}
                        <div className="flex justify-between items-center mt-1">
                          <p className="text-xs text-muted-foreground">
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
                    <span>Subtotal ({items.length} {items.length === 1 ? 'item' : 'items'})</span>
                    <span>${(getSubtotal() / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground text-sm">
                    <span>Shipping</span>
                    <span>TBD</span>
                  </div>
                  <div className="border-t border-border pt-2 flex justify-between text-base font-bold text-foreground">
                    <span>Estimated Total</span>
                    <span className="text-primary">
                      ${(getSubtotal() / 100).toFixed(2)}+
                    </span>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground mt-4 text-center">
                  Final price will be confirmed by the vendor
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
      <PublicFooter />
    </>
  );
}
