"use client";

import Image from "next/image";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { mockRestaurants } from "@/lib/mock-data/restaurants";
import { Button } from "@/components/ui/button";
import { Clock, Star, UtensilsCrossed } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export function RestaurantsShowcase() {
  const convexRestaurants = useQuery(api.restaurants.getFeatured);
  // Use Convex data if available, otherwise fall back to mock data
  const restaurants = convexRestaurants && convexRestaurants.length > 0
    ? convexRestaurants.map((r) => ({
        id: r._id,
        slug: r.slug,
        name: r.name,
        description: r.description || "",
        cuisine: r.cuisine,
        logoUrl: r.logoUrl || "",
        coverImageUrl: r.coverImageUrl || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80",
        acceptingOrders: r.acceptingOrders,
        estimatedPickupTime: r.estimatedPickupTime,
        averageRating: 4.5, // Default rating since we don't have reviews yet
        totalReviews: 0,
      }))
    : mockRestaurants.slice(0, 5);
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <section ref={sectionRef} className="bg-muted/30 py-16 overflow-hidden">
      <div className="container px-4 mx-auto">
        <motion.div
          className="mb-10 flex flex-wrap items-start justify-between gap-4"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex-1 min-w-[250px]">
            <motion.h2
              className="text-3xl font-bold tracking-tight sm:text-4xl text-foreground"
              initial={{ opacity: 0, x: -30 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
              transition={{ duration: 0.6 }}
            >
              Order from Local Restaurants
            </motion.h2>
            <motion.p
              className="mt-2 text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Support Chicago&apos;s best restaurants - pickup available now
            </motion.p>
          </div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button asChild variant="outline" className="flex-shrink-0">
              <Link href="/restaurants">View All Restaurants</Link>
            </Button>
          </motion.div>
        </motion.div>

        <motion.div
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {restaurants.map((restaurant, index) => (
            <motion.div
              key={restaurant.id}
              variants={cardVariants}
              custom={index}
            >
              <Link
                href={`/restaurants/${restaurant.slug}`}
                className="group block h-full"
              >
                <motion.article
                  className="overflow-hidden rounded-lg border bg-card h-full"
                  whileHover={{
                    y: -8,
                    boxShadow: "0 20px 40px -10px rgba(0,0,0,0.15)",
                    rotateY: 2,
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={restaurant.coverImageUrl}
                      alt={restaurant.name}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                    {!restaurant.acceptingOrders && (
                      <motion.div
                        className="absolute inset-0 flex items-center justify-center bg-foreground/60"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        <span className="rounded-full bg-background px-3 py-1 text-sm font-semibold">
                          Currently Closed
                        </span>
                      </motion.div>
                    )}
                    {/* Gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

                  <div className="p-4">
                    <h3 className="mb-2 text-lg font-bold text-card-foreground group-hover:text-primary transition-colors">
                      {restaurant.name}
                    </h3>

                    <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
                      {restaurant.description}
                    </p>

                    <motion.div
                      className="mb-3 flex flex-wrap gap-1"
                      initial={{ opacity: 0 }}
                      animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                      transition={{ delay: 0.4 + index * 0.05 }}
                    >
                      {restaurant.cuisine.slice(0, 2).map((cuisine) => (
                        <motion.span
                          key={cuisine}
                          className="rounded-full bg-muted px-2 py-1 text-xs"
                          whileHover={{ scale: 1.05, backgroundColor: "var(--primary)", color: "white" }}
                        >
                          {cuisine}
                        </motion.span>
                      ))}
                    </motion.div>

                    <div className="space-y-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <motion.div
                          whileHover={{ scale: 1.2, rotate: 5 }}
                        >
                          <Star className="h-3 w-3 fill-warning text-warning" />
                        </motion.div>
                        <span className="font-medium">
                          {restaurant.averageRating}
                        </span>
                        <span>({restaurant.totalReviews} reviews)</span>
                      </div>
                      {restaurant.acceptingOrders && (
                        <motion.div
                          className="flex items-center gap-2"
                          initial={{ opacity: 0, x: -10 }}
                          animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                          transition={{ delay: 0.5 + index * 0.05 }}
                        >
                          <Clock className="h-3 w-3" />
                          <span>{restaurant.estimatedPickupTime} min pickup</span>
                        </motion.div>
                      )}
                    </div>

                    {restaurant.acceptingOrders && (
                      <motion.div
                        className="mt-4"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button className="w-full" size="sm">
                          <UtensilsCrossed className="mr-2 h-4 w-4" />
                          Order Now
                        </Button>
                      </motion.div>
                    )}
                  </div>
                </motion.article>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
