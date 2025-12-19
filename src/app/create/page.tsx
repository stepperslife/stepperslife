"use client";

import Link from "next/link";
import Image from "next/image";
import { Calendar, ChefHat, ShoppingBag, ArrowRight, Sparkles } from "lucide-react";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";

const creatorOptions = [
  {
    title: "Create an Event",
    description: "Host stepping events, dance classes, or workshops. Get 1,000 free ticket credits to start.",
    icon: Calendar,
    href: "/organizer/events/create",
    color: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    buttonColor: "bg-purple-600 hover:bg-purple-700",
    image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80",
    features: [
      "1,000 free ticket credits",
      "Sell tickets online",
      "Manage attendees & check-ins",
      "Track earnings & analytics",
    ],
  },
  {
    title: "Add Your Restaurant",
    description: "Partner with SteppersLife to reach stepping event attendees with your food.",
    icon: ChefHat,
    href: "/restaurateur/apply",
    color: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
    buttonColor: "bg-orange-600 hover:bg-orange-700",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80",
    features: [
      "Reach event attendees",
      "Online ordering system",
      "Real-time order management",
      "Analytics dashboard",
    ],
  },
  {
    title: "Sell on Marketplace",
    description: "Sell stepping-related products, apparel, and accessories to our community.",
    icon: ShoppingBag,
    href: "/vendor/apply",
    color: "bg-green-500/10 text-green-600 dark:text-green-400",
    buttonColor: "bg-green-600 hover:bg-green-700",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80",
    features: [
      "Your own storefront",
      "Product management tools",
      "Secure payments",
      "85% commission to you",
    ],
  },
];

export default function CreatePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicHeader showCreateButton={false} />

      <main className="flex-1">
        {/* Hero Section */}
        <div className="bg-gradient-to-b from-primary/5 to-background py-16 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">For Creators</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Share Your Passion with the Stepping Community
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Whether you're hosting events, serving food, or selling products, SteppersLife gives you the tools to connect with the stepping community.
            </p>
          </div>
        </div>

        {/* Creator Options */}
        <div className="container mx-auto max-w-6xl px-4 py-16">
          <div className="grid md:grid-cols-3 gap-8">
            {creatorOptions.map((option) => (
              <div
                key={option.title}
                className="bg-card border border-border rounded-2xl overflow-hidden flex flex-col hover:shadow-lg transition-shadow"
              >
                {/* Image */}
                <div className="relative h-48 w-full">
                  <Image
                    src={option.image}
                    alt={option.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className={`absolute bottom-4 left-4 w-12 h-12 rounded-xl flex items-center justify-center ${option.color} backdrop-blur-sm`}>
                    <option.icon className="w-6 h-6" />
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col flex-1">
                  <h2 className="text-xl font-bold text-foreground mb-2">{option.title}</h2>
                  <p className="text-muted-foreground mb-6">{option.description}</p>

                  <ul className="space-y-2 mb-6 flex-1">
                    {option.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-foreground">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={option.href}
                    className={`flex items-center justify-center gap-2 w-full py-3 rounded-lg text-white font-medium transition-colors ${option.buttonColor}`}
                  >
                    Get Started
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-muted/50 py-16 px-4">
          <div className="container mx-auto max-w-3xl">
            <h2 className="text-2xl font-bold text-foreground text-center mb-8">
              Frequently Asked Questions
            </h2>

            <div className="space-y-4">
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="font-semibold text-foreground mb-2">How much does it cost to get started?</h3>
                <p className="text-muted-foreground text-sm">
                  Creating events is free to start - you get 1,000 ticket credits. Restaurant and marketplace applications are free to submit. We only charge fees when you make sales.
                </p>
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="font-semibold text-foreground mb-2">How do I get paid?</h3>
                <p className="text-muted-foreground text-sm">
                  Payments are processed securely through Stripe. Funds are deposited directly to your bank account, typically within 2-7 business days after an event or sale.
                </p>
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="font-semibold text-foreground mb-2">Can I be both an event organizer and sell on the marketplace?</h3>
                <p className="text-muted-foreground text-sm">
                  Yes! You can have multiple roles on SteppersLife. Many organizers also sell merchandise related to their events.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
