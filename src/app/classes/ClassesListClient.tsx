"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { Calendar, MapPin, Tag, Search, Filter, AlertCircle, BookOpen, GraduationCap, Music, Users, Award, Sparkles, X } from "lucide-react";
import { useState, useEffect } from "react";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { ClassesSubNav } from "@/components/layout/ClassesSubNav";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { ViewToggle, ViewMode, getViewClasses } from "@/components/ui/ViewToggle";
import { PortfolioGrid } from "@/components/shadcn-studio/blocks/portfolio-01/portfolio-01";

// Class type options for filtering (3 types + 3 skill levels)
// Includes legacy names for backwards compatibility with existing classes
const CLASS_TYPES = [
  "Stepping",
  "Chicago Stepping", // Legacy name
  "Line Dancing",
  "Line Dance", // Legacy name
  "Walkin",
  "Walking", // Legacy name
  "Beginner",
  "Intermediate",
  "Advanced",
];

export default function ClassesListClient() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [showPastClasses, setShowPastClasses] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  const classes = useQuery(api.public.queries.getPublishedClasses, {
    searchTerm: searchTerm || undefined,
    categories: selectedTypes.length > 0 ? selectedTypes : undefined,
    includePast: showPastClasses,
    daysOfWeek: selectedDays.length > 0 ? selectedDays : undefined,
  });

  const categories = useQuery(api.public.queries.getClassCategories, {});

  // Toggle a class type in the multi-select
  const toggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  // Toggle a day in the multi-select
  const toggleDay = (day: number) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  // Timeout fallback - after 10 seconds, show error state
  useEffect(() => {
    if (classes === undefined) {
      const timer = setTimeout(() => {
        setLoadingTimeout(true);
      }, 10000);
      return () => clearTimeout(timer);
    } else {
      setLoadingTimeout(false);
    }
  }, [classes]);

  // Format date
  function formatClassDate(timestamp: number, timezone?: string): string {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: timezone || "America/New_York",
    });
  }

  // Show timeout error state
  if (loadingTimeout && classes === undefined) {
    return (
      <>
        <PublicHeader />
        <ClassesSubNav />
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-12">
            <motion.div
              className="text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, repeat: 2 }}
              >
                <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
              </motion.div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Connection Issue
              </h3>
              <p className="text-muted-foreground mb-4">
                Unable to load classes. Please check your connection and try again.
              </p>
              <motion.button
                type="button"
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Retry
              </motion.button>
            </motion.div>
          </div>
        </div>
        <PublicFooter />
      </>
    );
  }

  if (classes === undefined) {
    return (
      <>
        <PublicHeader />
        <ClassesSubNav />
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <motion.div
              className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <motion.p
              className="mt-4 text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Loading classes...
            </motion.p>
          </div>
        </div>
        <PublicFooter />
      </>
    );
  }

  return (
    <>
      <PublicHeader />
      <ClassesSubNav />
      <div data-testid="classes-page" className="min-h-screen bg-background">
        {/* EPIC Hero Section */}
        <section className="relative min-h-[500px] md:min-h-[600px] w-full overflow-hidden">
          {/* Animated Gradient Background */}
          <motion.div
            className="absolute inset-0"
            animate={{
              background: [
                "linear-gradient(135deg, #6d28d9 0%, #7c3aed 50%, #8b5cf6 100%)",
                "linear-gradient(135deg, #7c3aed 0%, #8b5cf6 50%, #6d28d9 100%)",
                "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 50%, #7c3aed 100%)",
                "linear-gradient(135deg, #6d28d9 0%, #7c3aed 50%, #8b5cf6 100%)",
              ],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          />

          {/* Background Dancing Image */}
          <motion.div
            className="absolute inset-0 opacity-25"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1545959570-a94084071b5d?w=1920&q=80')",
              backgroundSize: "cover",
              backgroundPosition: "center top",
            }}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.5 }}
          />

          {/* Gradient Overlay for depth */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/50" />

          {/* Floating Class Icons */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* GraduationCap Icon */}
            <motion.div
              className="absolute top-[15%] left-[10%] text-white/20"
              animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              <GraduationCap className="h-16 w-16 md:h-24 md:w-24" />
            </motion.div>

            {/* Music Icon */}
            <motion.div
              className="absolute top-[25%] right-[15%] text-white/15"
              animate={{ y: [0, 15, 0], rotate: [0, -8, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            >
              <Music className="h-14 w-14 md:h-20 md:w-20" />
            </motion.div>

            {/* BookOpen Icon */}
            <motion.div
              className="absolute bottom-[30%] left-[8%] text-white/15"
              animate={{ y: [0, -15, 0], scale: [1, 1.05, 1] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            >
              <BookOpen className="h-12 w-12 md:h-16 md:h-16" />
            </motion.div>

            {/* Users Icon */}
            <motion.div
              className="absolute top-[40%] right-[8%] text-white/20"
              animate={{ y: [0, -25, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
            >
              <Users className="h-10 w-10 md:h-14 md:w-14" />
            </motion.div>

            {/* Sparkles */}
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                style={{
                  left: `${5 + Math.random() * 90}%`,
                  top: `${5 + Math.random() * 90}%`,
                }}
                animate={{
                  opacity: [0.2, 0.6, 0.2],
                  scale: [1, 1.3, 1],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              >
                <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-warning/40" />
              </motion.div>
            ))}
          </div>

          {/* Main Content */}
          <div className="relative z-10 container mx-auto px-4 py-16 md:py-20 flex flex-col items-center justify-center min-h-[500px] md:min-h-[600px]">
            {/* Class Count Badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6"
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium">
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <GraduationCap className="h-4 w-4" />
                </motion.span>
                {classes.length} {classes.length === 1 ? "Class" : "Classes"} Available
              </span>
            </motion.div>

            {/* Main Title with Gradient Animation */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-6"
            >
              <span className="text-white drop-shadow-lg">Master Your</span>
              <br />
              <motion.span
                className="bg-gradient-to-r from-cyan-200 via-white to-sky-300 bg-clip-text text-transparent bg-[length:200%_auto]"
                animate={{ backgroundPosition: ["0% center", "200% center"] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              >
                Stepping Skills
              </motion.span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-white/90 text-center max-w-2xl mb-8"
            >
              Discover stepping classes, workshops, and lessons from expert instructors.
              Learn at your own pace and join a vibrant community.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 mb-12"
            >
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Button
                  size="lg"
                  onClick={() => document.getElementById("classes-list")?.scrollIntoView({ behavior: "smooth" })}
                  className="bg-white !text-violet-700 hover:bg-violet-50 font-semibold px-8 py-6 text-lg rounded-full shadow-lg"
                >
                  <BookOpen className="mr-2 h-5 w-5 text-violet-700" />
                  Browse Classes
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="border-2 border-white/50 !text-white bg-white/10 backdrop-blur-sm hover:bg-white/20 font-semibold px-8 py-6 text-lg rounded-full"
                >
                  <Link href="/organizer/classes/create">
                    <GraduationCap className="mr-2 h-5 w-5 text-white" />
                    Create a Class
                  </Link>
                </Button>
              </motion.div>
            </motion.div>

            {/* Stats/Features Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="grid grid-cols-3 gap-4 md:gap-8"
            >
              <div className="text-center">
                <motion.div
                  className="flex items-center justify-center mb-2"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <GraduationCap className="h-6 w-6 md:h-8 md:w-8 text-warning" />
                </motion.div>
                <p className="text-white font-bold text-lg md:text-2xl">50+</p>
                <p className="text-white/70 text-xs md:text-sm">Instructors</p>
              </div>
              <div className="text-center">
                <motion.div
                  className="flex items-center justify-center mb-2"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                >
                  <Award className="h-6 w-6 md:h-8 md:w-8 text-warning" />
                </motion.div>
                <p className="text-white font-bold text-lg md:text-2xl">All Levels</p>
                <p className="text-white/70 text-xs md:text-sm">Beginner to Pro</p>
              </div>
              <div className="text-center">
                <motion.div
                  className="flex items-center justify-center mb-2"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                >
                  <MapPin className="h-6 w-6 md:h-8 md:w-8 text-warning" />
                </motion.div>
                <p className="text-white font-bold text-lg md:text-2xl">15+</p>
                <p className="text-white/70 text-xs md:text-sm">Cities</p>
              </div>
            </motion.div>
          </div>

          {/* Bottom Gradient Fade */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
        </section>

        {/* Filters */}
        <div className="bg-card border-b border-border sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4 space-y-4">
            {/* Top Row: Search and View Toggle */}
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <label htmlFor="classes-search" className="sr-only">Search classes by name, description, or location</label>
                <input
                  id="classes-search"
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search classes by name, description, or location..."
                  data-testid="classes-search-input"
                  className="w-full pl-10 pr-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground placeholder-muted-foreground"
                />
              </div>

              {/* Past Classes Toggle */}
              <label className="flex items-center gap-2 cursor-pointer px-4 py-2 bg-muted rounded-lg hover:bg-accent transition-colors">
                <input
                  type="checkbox"
                  checked={showPastClasses}
                  onChange={(e) => setShowPastClasses(e.target.checked)}
                  data-testid="classes-past-toggle"
                  className="w-4 h-4 text-primary border-input rounded focus:ring-ring"
                />
                <span className="text-sm font-medium text-foreground">
                  Show past
                </span>
              </label>

              {/* View Toggle */}
              <ViewToggle view={viewMode} onViewChange={setViewMode} />
            </div>

            {/* Class Type Filter (Multi-select) */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Tag className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Class Type:</span>
                {selectedTypes.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedTypes([])}
                    className="text-xs text-primary hover:text-primary/80"
                  >
                    Clear all
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {CLASS_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => toggleType(type)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      selectedTypes.includes(type)
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Day of Week Filter (Multi-select) */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Day:</span>
                {selectedDays.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedDays([])}
                    className="text-xs text-primary hover:text-primary/80"
                  >
                    Clear all
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {DAY_NAMES.map((day, index) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(index)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      selectedDays.includes(index)
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    }`}
                  >
                    {day.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            {/* Active Filters Display */}
            {(searchTerm || selectedTypes.length > 0 || selectedDays.length > 0) && (
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border">
                <span className="text-sm text-muted-foreground">Active:</span>
                {searchTerm && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-accent text-accent-foreground">
                    &quot;{searchTerm}&quot;
                    <button
                      type="button"
                      onClick={() => setSearchTerm("")}
                      className="ml-2 text-primary hover:text-primary/80"
                      aria-label="Clear search term"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {selectedTypes.map((type) => (
                  <span key={type} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary/10 text-primary">
                    {type}
                    <button
                      type="button"
                      onClick={() => toggleType(type)}
                      className="ml-2 hover:text-primary/80"
                      aria-label={`Remove ${type} filter`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {selectedDays.map((day) => (
                  <span key={day} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary/10 text-primary">
                    {DAY_NAMES[day]}
                    <button
                      type="button"
                      onClick={() => toggleDay(day)}
                      className="ml-2 hover:text-primary/80"
                      aria-label={`Remove ${DAY_NAMES[day]} filter`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Classes Grid */}
        <div id="classes-list" className="container mx-auto px-4 py-8">
          {classes.length === 0 ? (
            <motion.div
              data-testid="classes-empty-state"
              className="text-center py-12"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              </motion.div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No classes found
              </h3>
              <p className="text-muted-foreground">
                {searchTerm || selectedCategory
                  ? "Try adjusting your filters to find more classes"
                  : "Check back soon for upcoming classes!"}
              </p>
            </motion.div>
          ) : (
            <>
              {viewMode === "masonry" ? (
                /* Masonry View - 4 columns stacked with details */
                <div data-testid="classes-grid" className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[0, 1, 2, 3].map((columnIndex) => (
                    <div key={columnIndex} className="grid gap-4">
                      {classes
                        .filter((_, index) => index % 4 === columnIndex)
                        .map((classItem) => (
                          <div key={classItem._id}>
                            <Link
                              href={`/classes/${classItem._id}`}
                              data-testid={`class-card-${classItem._id}`}
                              className="group block bg-card rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
                            >
                              {classItem.imageUrl ? (
                                <img
                                  src={classItem.imageUrl}
                                  alt={classItem.name}
                                  className="h-auto max-w-full w-full group-hover:scale-[1.02] transition-transform duration-300"
                                />
                              ) : (
                                <div className="w-full aspect-[4/5] flex items-center justify-center bg-gradient-to-br from-primary to-primary/80">
                                  <BookOpen className="w-16 h-16 text-white opacity-50" />
                                </div>
                              )}
                              <div className="p-3 space-y-2">
                                <h3 className="font-semibold text-foreground line-clamp-2 text-sm">{classItem.name}</h3>
                                {classItem.categories && classItem.categories.length > 0 && (
                                  <div className="flex flex-wrap gap-1">
                                    {classItem.categories.slice(0, 2).map((cat: string) => (
                                      <span key={cat} className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs">
                                        {cat}
                                      </span>
                                    ))}
                                  </div>
                                )}
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Calendar className="w-3 h-3" />
                                  <span>{classItem.eventDateLiteral || (classItem.startDate && formatClassDate(classItem.startDate, classItem.timezone))}</span>
                                </div>
                                {classItem.eventTimeLiteral && (
                                  <div className="text-xs text-muted-foreground">
                                    {classItem.eventTimeLiteral}
                                  </div>
                                )}
                              </div>
                            </Link>
                          </div>
                        ))}
                    </div>
                  ))}
                </div>
              ) : viewMode === "list" ? (
                /* List View - Single column with full details */
                <div data-testid="classes-grid" className="grid grid-cols-1 gap-6 max-w-2xl mx-auto">
                  {classes.map((classItem) => (
                    <Link
                      key={classItem._id}
                      href={`/classes/${classItem._id}`}
                      data-testid={`class-card-${classItem._id}`}
                      className="group block bg-card rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
                    >
                      {classItem.imageUrl ? (
                        <img
                          src={classItem.imageUrl}
                          alt={classItem.name}
                          className="h-auto max-w-full w-full group-hover:scale-[1.02] transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full aspect-[4/5] flex items-center justify-center bg-gradient-to-br from-primary to-primary/80">
                          <BookOpen className="w-16 h-16 text-white opacity-50" />
                        </div>
                      )}
                      <div className="p-4 space-y-3">
                        <h3 className="font-semibold text-lg text-foreground">{classItem.name}</h3>
                        {classItem.categories && classItem.categories.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {classItem.categories.map((cat: string) => (
                              <span key={cat} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                                {cat}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{classItem.eventDateLiteral || (classItem.startDate && formatClassDate(classItem.startDate, classItem.timezone))}</span>
                          </div>
                          {classItem.eventTimeLiteral && (
                            <span>{classItem.eventTimeLiteral}</span>
                          )}
                        </div>
                        {classItem.location && typeof classItem.location === "object" && classItem.location.city && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="w-4 h-4" />
                            <span>{classItem.location.city}, {classItem.location.state}</span>
                          </div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                /* Default Grid View - 2x3 columns with details */
                <div data-testid="classes-grid" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {classes.map((classItem) => (
                    <Link
                      key={classItem._id}
                      href={`/classes/${classItem._id}`}
                      data-testid={`class-card-${classItem._id}`}
                      className="group block bg-card rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
                    >
                      {classItem.imageUrl ? (
                        <div className="aspect-[4/3] overflow-hidden">
                          <img
                            src={classItem.imageUrl}
                            alt={classItem.name}
                            className="h-full w-full object-cover group-hover:scale-[1.05] transition-transform duration-300"
                          />
                        </div>
                      ) : (
                        <div className="aspect-[4/3] flex items-center justify-center bg-gradient-to-br from-primary to-primary/80">
                          <BookOpen className="w-12 h-12 text-white opacity-50" />
                        </div>
                      )}
                      <div className="p-4 space-y-2">
                        <h3 className="font-semibold text-foreground line-clamp-2">{classItem.name}</h3>
                        {classItem.categories && classItem.categories.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {classItem.categories.slice(0, 3).map((cat: string) => (
                              <span key={cat} className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs">
                                {cat}
                              </span>
                            ))}
                            {classItem.categories.length > 3 && (
                              <span className="px-2 py-0.5 bg-muted text-muted-foreground rounded-full text-xs">
                                +{classItem.categories.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{classItem.eventDateLiteral || (classItem.startDate && formatClassDate(classItem.startDate, classItem.timezone))}</span>
                        </div>
                        {classItem.eventTimeLiteral && (
                          <div className="text-sm text-muted-foreground">
                            {classItem.eventTimeLiteral}
                          </div>
                        )}
                        {classItem.location && typeof classItem.location === "object" && classItem.location.city && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{classItem.location.city}, {classItem.location.state}</span>
                          </div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <PublicFooter />
    </>
  );
}
