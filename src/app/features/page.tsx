"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import {
  Calendar,
  BookOpen,
  Utensils,
  ShoppingBag,
  Ticket,
  Users,
  DollarSign,
  QrCode,
  CreditCard,
  BarChart3,
  Bell,
  Globe,
  Smartphone,
  Shield,
  Zap,
  CheckCircle2,
  ArrowRight,
  Star,
  TrendingUp,
  Clock,
  MapPin,
  Heart,
} from "lucide-react";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function FeaturesPage() {
  return (
    <>
      <PublicHeader />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Everything You Need to
              <span className="block text-warning">Grow Your Community</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8">
              SteppersLife is the all-in-one platform for event organizers, dance instructors,
              restaurant owners, and vendors in the stepping community.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/register"
                className="px-8 py-4 bg-warning text-white font-bold rounded-lg hover:bg-warning/90 transition-all transform hover:scale-105 shadow-lg"
              >
                Get Started Free
              </Link>
              <Link
                href="#products"
                className="px-8 py-4 bg-white/10 backdrop-blur text-white font-bold rounded-lg hover:bg-white/20 transition-all border border-white/30"
              >
                Explore Features
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-12 bg-muted border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { number: "1000+", label: "Events Hosted" },
              { number: "50K+", label: "Tickets Sold" },
              { number: "500+", label: "Active Instructors" },
              { number: "99.9%", label: "Uptime" },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <p className="text-3xl md:text-4xl font-bold text-primary">{stat.number}</p>
                <p className="text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Four Powerful Products, One Platform
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose the tools that fit your needs, or use them all together for the ultimate community experience.
            </p>
          </motion.div>

          {/* Events Product */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-24"
          >
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-foreground">Events & Ticketing</h3>
                </div>
                <p className="text-lg text-muted-foreground mb-6">
                  Sell tickets, manage attendees, and grow your events with professional tools designed for the stepping community.
                </p>

                <div className="space-y-4 mb-8">
                  {[
                    { icon: Ticket, text: "Sell tickets online with instant delivery" },
                    { icon: QrCode, text: "QR code scanning for fast check-in" },
                    { icon: Users, text: "Manage staff and ticket sellers with commissions" },
                    { icon: CreditCard, text: "Accept payments via Stripe & PayPal" },
                    { icon: BarChart3, text: "Real-time sales analytics and reports" },
                    { icon: Bell, text: "Automated email confirmations" },
                  ].map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-3"
                    >
                      <div className="w-8 h-8 bg-success/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <feature.icon className="w-4 h-4 text-success" />
                      </div>
                      <span className="text-foreground">{feature.text}</span>
                    </motion.div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-4">
                  <Link
                    href="/organizer/events/create"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-semibold"
                  >
                    Create Your Event
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/events/pricing"
                    className="inline-flex items-center gap-2 px-6 py-3 border border-border rounded-lg hover:bg-muted transition-colors font-semibold"
                  >
                    View Pricing
                  </Link>
                </div>
              </div>

              <div className="relative">
                <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-8">
                  <div className="bg-card rounded-xl shadow-xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Total Sales</span>
                      <TrendingUp className="w-4 h-4 text-success" />
                    </div>
                    <p className="text-3xl font-bold text-foreground">$12,450</p>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full w-3/4 bg-primary rounded-full"></div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                      <div>
                        <p className="text-2xl font-bold text-foreground">342</p>
                        <p className="text-xs text-muted-foreground">Tickets Sold</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-foreground">12</p>
                        <p className="text-xs text-muted-foreground">Staff</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-foreground">89%</p>
                        <p className="text-xs text-muted-foreground">Check-in Rate</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Classes Product */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-24"
          >
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">
                <div className="bg-gradient-to-br from-warning/5 to-warning/10 rounded-2xl p-8">
                  <div className="bg-card rounded-xl shadow-xl p-6">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center">
                        <BookOpen className="w-8 h-8 text-warning" />
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground">Beginner Steppin</h4>
                        <p className="text-sm text-muted-foreground">Every Tuesday 7PM</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Enrolled</span>
                        <span className="font-semibold text-foreground">24/30</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Revenue</span>
                        <span className="font-semibold text-success">$1,200/month</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Rating</span>
                        <span className="font-semibold text-warning flex items-center gap-1">
                          <Star className="w-4 h-4 fill-current" /> 4.9
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="order-1 lg:order-2">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-warning/10 rounded-xl flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-warning" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-foreground">Dance Classes</h3>
                </div>
                <p className="text-lg text-muted-foreground mb-6">
                  Teach stepping, line dancing, or walking classes. Manage enrollments, track attendance, and build your student community.
                </p>

                <div className="space-y-4 mb-8">
                  {[
                    { icon: Calendar, text: "Schedule recurring classes by day of week" },
                    { icon: Users, text: "Manage student enrollments and payments" },
                    { icon: DollarSign, text: "Set your own pricing and enrollment limits" },
                    { icon: Bell, text: "Send class reminders automatically" },
                    { icon: MapPin, text: "List your venue location with maps" },
                    { icon: Star, text: "Build your reputation with student reviews" },
                  ].map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-3"
                    >
                      <div className="w-8 h-8 bg-warning/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <feature.icon className="w-4 h-4 text-warning" />
                      </div>
                      <span className="text-foreground">{feature.text}</span>
                    </motion.div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-4">
                  <Link
                    href="/organizer/classes/create"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-warning text-white rounded-lg hover:bg-warning/90 transition-colors font-semibold"
                  >
                    Start Teaching
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/classes"
                    className="inline-flex items-center gap-2 px-6 py-3 border border-border rounded-lg hover:bg-muted transition-colors font-semibold"
                  >
                    Browse Classes
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Restaurant Product */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-24"
          >
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center">
                    <Utensils className="w-6 h-6 text-success" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-foreground">Soul Food & Catering</h3>
                </div>
                <p className="text-lg text-muted-foreground mb-6">
                  Run your restaurant or catering business with online ordering, menu management, and seamless payment processing.
                </p>

                <div className="space-y-4 mb-8">
                  {[
                    { icon: Smartphone, text: "Mobile-friendly online ordering" },
                    { icon: Clock, text: "Real-time order management dashboard" },
                    { icon: DollarSign, text: "Keep 100% of your sales (minus processing)" },
                    { icon: Bell, text: "Instant order notifications" },
                    { icon: BarChart3, text: "Sales reports and popular item tracking" },
                    { icon: Users, text: "Customer order history and repeat orders" },
                  ].map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-3"
                    >
                      <div className="w-8 h-8 bg-success/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <feature.icon className="w-4 h-4 text-success" />
                      </div>
                      <span className="text-foreground">{feature.text}</span>
                    </motion.div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-4">
                  <Link
                    href="/restaurants/apply"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-success text-white rounded-lg hover:bg-success/90 transition-colors font-semibold"
                  >
                    List Your Restaurant
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/restaurants/pricing"
                    className="inline-flex items-center gap-2 px-6 py-3 border border-border rounded-lg hover:bg-muted transition-colors font-semibold"
                  >
                    View Pricing
                  </Link>
                </div>
              </div>

              <div className="relative">
                <div className="bg-gradient-to-br from-success/5 to-success/10 rounded-2xl p-8">
                  <div className="bg-card rounded-xl shadow-xl overflow-hidden">
                    <div className="bg-success/10 p-4">
                      <h4 className="font-bold text-foreground">Today&apos;s Orders</h4>
                    </div>
                    <div className="p-4 space-y-3">
                      {[
                        { item: "Fried Chicken Dinner", qty: 3, status: "Ready" },
                        { item: "Mac & Cheese (Large)", qty: 2, status: "Preparing" },
                        { item: "Sweet Tea (Gallon)", qty: 1, status: "Ready" },
                      ].map((order, index) => (
                        <div key={index} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                          <div>
                            <p className="font-medium text-foreground">{order.item}</p>
                            <p className="text-xs text-muted-foreground">Qty: {order.qty}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            order.status === "Ready" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                          }`}>
                            {order.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Marketplace Product */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">
                <div className="bg-gradient-to-br from-purple-500/5 to-purple-500/10 rounded-2xl p-8">
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { name: "Steppin Hoodie", price: "$59.99", sold: "124 sold" },
                      { name: "Dance Shoes", price: "$89.99", sold: "87 sold" },
                      { name: "Custom T-Shirt", price: "$29.99", sold: "256 sold" },
                      { name: "Accessories Kit", price: "$45.99", sold: "63 sold" },
                    ].map((product, index) => (
                      <div key={index} className="bg-card rounded-lg p-4 shadow-md">
                        <div className="w-full h-20 bg-muted rounded mb-3 flex items-center justify-center">
                          <ShoppingBag className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h5 className="font-medium text-foreground text-sm">{product.name}</h5>
                        <p className="text-primary font-bold">{product.price}</p>
                        <p className="text-xs text-muted-foreground">{product.sold}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="order-1 lg:order-2">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center">
                    <ShoppingBag className="w-6 h-6 text-purple-500" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-foreground">Marketplace</h3>
                </div>
                <p className="text-lg text-muted-foreground mb-6">
                  Sell merchandise, apparel, dance supplies, and more. Reach the entire stepping community with your products.
                </p>

                <div className="space-y-4 mb-8">
                  {[
                    { icon: Globe, text: "Reach customers across the stepping community" },
                    { icon: CreditCard, text: "Secure payments with buyer protection" },
                    { icon: DollarSign, text: "Low 5% platform fee on sales" },
                    { icon: BarChart3, text: "Track inventory and sales analytics" },
                    { icon: Bell, text: "Order notifications and fulfillment tracking" },
                    { icon: Shield, text: "Vendor verification for trust" },
                  ].map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-3"
                    >
                      <div className="w-8 h-8 bg-purple-500/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <feature.icon className="w-4 h-4 text-purple-500" />
                      </div>
                      <span className="text-foreground">{feature.text}</span>
                    </motion.div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-4">
                  <Link
                    href="/vendor/apply"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-semibold"
                  >
                    Open Your Store
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/marketplace"
                    className="inline-flex items-center gap-2 px-6 py-3 border border-border rounded-lg hover:bg-muted transition-colors font-semibold"
                  >
                    Browse Products
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Why SteppersLife Section */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose SteppersLife?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Built by steppers, for steppers. We understand your community because we&apos;re part of it.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Heart,
                title: "Community Focused",
                description: "We're not a generic platform. Every feature is designed specifically for the stepping community's needs.",
              },
              {
                icon: DollarSign,
                title: "Fair Pricing",
                description: "No hidden fees. Transparent pricing that lets you keep more of what you earn.",
              },
              {
                icon: Zap,
                title: "Easy to Use",
                description: "Get started in minutes. No technical skills required. We handle the hard stuff.",
              },
              {
                icon: Shield,
                title: "Secure & Reliable",
                description: "Bank-level security for payments. 99.9% uptime so you never miss a sale.",
              },
              {
                icon: Smartphone,
                title: "Mobile First",
                description: "Everything works beautifully on phones. Your customers can buy tickets while at the set.",
              },
              {
                icon: Users,
                title: "Growing Together",
                description: "When you succeed, we succeed. We're invested in helping you grow your business.",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-card rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Loved by the Community
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: "SteppersLife changed my business. I went from paper tickets to selling out events online. The QR scanning at the door is a game changer!",
                author: "Marcus T.",
                role: "Event Promoter, Chicago",
              },
              {
                quote: "Managing my dance classes used to be a headache. Now students register online, pay automatically, and I just focus on teaching.",
                author: "Lisa M.",
                role: "Stepping Instructor, Atlanta",
              },
              {
                quote: "The marketplace let me turn my custom steppin apparel from a hobby into a real business. Orders come in from all over!",
                author: "Darnell W.",
                role: "Vendor, Detroit",
              },
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-card rounded-xl p-6 shadow-sm border"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-warning fill-current" />
                  ))}
                </div>
                <p className="text-foreground mb-6 italic">&ldquo;{testimonial.quote}&rdquo;</p>
                <div>
                  <p className="font-bold text-foreground">{testimonial.author}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Grow Your Business?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join hundreds of organizers, instructors, and vendors who are building their businesses on SteppersLife.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/register"
                className="px-8 py-4 bg-warning text-white font-bold rounded-lg hover:bg-warning/90 transition-all transform hover:scale-105 shadow-lg"
              >
                Get Started Free
              </Link>
              <Link
                href="/contact"
                className="px-8 py-4 bg-white/10 backdrop-blur text-white font-bold rounded-lg hover:bg-white/20 transition-all border border-white/30"
              >
                Contact Sales
              </Link>
            </div>
            <p className="mt-6 text-white/70 text-sm">
              No credit card required. Free to start.
            </p>
          </motion.div>
        </div>
      </section>

      <PublicFooter />
    </>
  );
}
