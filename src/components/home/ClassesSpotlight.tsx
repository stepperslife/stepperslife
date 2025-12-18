"use client";

import Image from "next/image";
import Link from "next/link";
import { mockCourses } from "@/lib/mock-data/classes";
import { Button } from "@/components/ui/button";
import { BookOpen, Star, Users } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export function ClassesSpotlight() {
  const courses = mockCourses.filter((c) => c.isFeatured);
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <section ref={sectionRef} className="bg-background py-16 overflow-hidden">
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
              Classes
            </motion.h2>
            <motion.p
              className="mt-2 text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Master Chicago Steppin with expert-led online classes
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
              <Link href="/classes">Browse All Classes</Link>
            </Button>
          </motion.div>
        </motion.div>

        <motion.div
          className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {courses.map((course, index) => (
            <motion.div
              key={course.id}
              variants={cardVariants}
              custom={index}
            >
              <Link
                href={`/classes/${course.slug}`}
                className="group block h-full"
              >
                <motion.article
                  className="overflow-hidden rounded-lg border bg-card h-full"
                  whileHover={{
                    y: -8,
                    boxShadow: "0 20px 40px -10px rgba(0,0,0,0.15)",
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <div className="relative aspect-video overflow-hidden">
                    <Image
                      src={course.thumbnailUrl}
                      alt={course.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                    {/* Level Badge */}
                    <motion.div
                      className="absolute left-3 top-3"
                      initial={{ scale: 0, rotate: -10 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", delay: 0.2 + index * 0.1 }}
                    >
                      <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                        {course.level}
                      </span>
                    </motion.div>
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                      <span className="text-white font-medium text-sm">Click to view course</span>
                    </div>
                  </div>

                  <div className="p-5">
                    {/* Instructor */}
                    <motion.div
                      className="mb-3 flex items-center gap-2"
                      initial={{ opacity: 0, x: -10 }}
                      animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                    >
                      <div className="relative h-8 w-8 overflow-hidden rounded-full ring-2 ring-primary/20">
                        <Image
                          src={course.instructorPhoto}
                          alt={course.instructorName}
                          fill
                          sizes="32px"
                          className="object-cover"
                          loading="lazy"
                        />
                      </div>
                      <span className="text-sm font-medium text-card-foreground">
                        {course.instructorName}
                      </span>
                    </motion.div>

                    <h3 className="mb-2 text-xl font-bold text-card-foreground group-hover:text-primary transition-colors">
                      {course.title}
                    </h3>
                    <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
                      {course.shortDescription}
                    </p>

                    <div className="mb-4 space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <BookOpen className="h-4 w-4" />
                          <span>{course.totalLessons} lessons</span>
                        </div>
                        <motion.div
                          className="flex items-center gap-1"
                          whileHover={{ scale: 1.1 }}
                        >
                          <Star className="h-4 w-4 fill-warning text-warning" />
                          <span className="font-medium">
                            {course.averageRating}
                          </span>
                        </motion.div>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{course.enrollmentCount} students enrolled</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <motion.span
                        className="text-2xl font-bold text-card-foreground"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                      >
                        ${course.price.toFixed(2)}
                      </motion.span>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button size="sm">Enroll Now</Button>
                      </motion.div>
                    </div>
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
