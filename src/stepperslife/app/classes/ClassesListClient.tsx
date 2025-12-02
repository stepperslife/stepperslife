"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { Calendar, MapPin, Tag, Search, Filter, AlertCircle, BookOpen } from "lucide-react";
import { useState, useEffect } from "react";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";

export default function ClassesListClient() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [showPastClasses, setShowPastClasses] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  const classes = useQuery(api.public.queries.getPublishedClasses, {
    searchTerm: searchTerm || undefined,
    category: selectedCategory,
    includePast: showPastClasses,
  });

  const categories = useQuery(api.public.queries.getClassCategories, {});

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
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-12">
            <div className="text-center">
              <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Connection Issue
              </h3>
              <p className="text-muted-foreground mb-4">
                Unable to load classes. Please check your connection and try again.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Retry
              </button>
            </div>
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
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              <p className="mt-4 text-muted-foreground">Loading classes...</p>
            </div>
          </div>
        </div>
        <PublicFooter />
      </>
    );
  }

  return (
    <>
      <PublicHeader />
      <div data-testid="classes-page" className="min-h-screen bg-background">
        {/* Page Title */}
        <div className="bg-card shadow-sm border-b border-border">
          <div className="container mx-auto px-4 py-8">
            <h1 data-testid="classes-page-title" className="text-4xl font-bold text-foreground mb-2">Classes</h1>
            <p className="text-lg text-muted-foreground">
              Discover stepping classes, workshops, and lessons near you
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card border-b border-border sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search classes by name, description, or location..."
                  data-testid="classes-search-input"
                  className="w-full pl-10 pr-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground placeholder-muted-foreground"
                />
              </div>

              {/* Category Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <select
                  value={selectedCategory || ""}
                  onChange={(e) => setSelectedCategory(e.target.value || undefined)}
                  data-testid="classes-category-filter"
                  className="pl-10 pr-10 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent appearance-none bg-background text-foreground"
                >
                  <option value="">All Categories</option>
                  {categories?.map((cat) => (
                    <option key={cat.name} value={cat.name}>
                      {cat.name} ({cat.count})
                    </option>
                  ))}
                </select>
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
                  Show past classes
                </span>
              </label>
            </div>

            {/* Active Filters Display */}
            {(searchTerm || selectedCategory) && (
              <div className="mt-3 flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Active filters:</span>
                {searchTerm && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-accent text-accent-foreground">
                    Search: {searchTerm}
                    <button
                      onClick={() => setSearchTerm("")}
                      className="ml-2 text-primary hover:text-primary/80"
                    >
                      ×
                    </button>
                  </span>
                )}
                {selectedCategory && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-accent text-accent-foreground">
                    Category: {selectedCategory}
                    <button
                      onClick={() => setSelectedCategory(undefined)}
                      className="ml-2 text-primary hover:text-primary/80"
                    >
                      ×
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Classes Grid */}
        <div className="container mx-auto px-4 py-8">
          {classes.length === 0 ? (
            <div data-testid="classes-empty-state" className="text-center py-12">
              <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No classes found
              </h3>
              <p className="text-muted-foreground">
                {searchTerm || selectedCategory
                  ? "Try adjusting your filters to find more classes"
                  : "Check back soon for upcoming classes!"}
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <p data-testid="classes-count" className="text-muted-foreground">
                  Showing {classes.length} {classes.length === 1 ? "class" : "classes"}
                </p>
              </div>

              <div data-testid="classes-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {classes.map((classItem) => {
                  const isPast = classItem.endDate && classItem.endDate < Date.now();

                  return (
                    <Link
                      key={classItem._id}
                      href={`/classes/${classItem._id}`}
                      data-testid={`class-card-${classItem._id}`}
                      className="group bg-card rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
                    >
                      {/* Class Image */}
                      <div className="relative h-48 bg-gradient-to-br from-primary to-primary/80 overflow-hidden">
                        {classItem.imageUrl ? (
                          <img
                            src={classItem.imageUrl}
                            alt={classItem.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <BookOpen className="w-16 h-16 text-white opacity-50" />
                          </div>
                        )}
                        {isPast && (
                          <div className="absolute top-2 right-2 bg-foreground/75 text-background px-3 py-1 rounded-full text-sm font-medium">
                            Past Class
                          </div>
                        )}
                      </div>

                      {/* Class Details */}
                      <div className="p-5">
                        <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                          {classItem.name}
                        </h3>

                        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                          {classItem.description}
                        </p>

                        {/* Date & Time */}
                        {classItem.startDate && (
                          <div className="flex items-start gap-2 mb-2 text-sm text-foreground">
                            <Calendar className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
                            <div>
                              <div className="font-medium">
                                {formatClassDate(classItem.startDate, classItem.timezone)}
                              </div>
                              {classItem.eventTimeLiteral && (
                                <div className="text-muted-foreground">
                                  {classItem.eventTimeLiteral}
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Location */}
                        {classItem.location && typeof classItem.location === "object" && (
                          <div className="flex items-center gap-2 mb-3 text-sm text-foreground">
                            <MapPin className="w-4 h-4 shrink-0 text-primary" />
                            <span>
                              {classItem.location.venueName && `${classItem.location.venueName}, `}
                              {classItem.location.city}, {classItem.location.state}
                            </span>
                          </div>
                        )}

                        {/* Categories */}
                        {classItem.categories && classItem.categories.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {classItem.categories.slice(0, 3).map((category, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-accent text-accent-foreground"
                              >
                                <Tag className="w-3 h-3" />
                                {category}
                              </span>
                            ))}
                            {classItem.categories.length > 3 && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                                +{classItem.categories.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="px-5 py-3 bg-muted/50 border-t border-border">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            by {classItem.organizerName || "SteppersLife"}
                          </span>
                          <span className="text-primary font-medium group-hover:underline">
                            View Details →
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
      <PublicFooter />
    </>
  );
}
