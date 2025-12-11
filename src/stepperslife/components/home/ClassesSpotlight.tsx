"use client";

import Image from "next/image";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { BookOpen, Calendar, MapPin, DollarSign } from "lucide-react";

// Format class days for recurring classes
function formatClassDays(classDays: string[] | undefined): string {
  if (!classDays || classDays.length === 0) return "";

  const dayLabels: Record<string, string> = {
    monday: "Mon",
    tuesday: "Tue",
    wednesday: "Wed",
    thursday: "Thu",
    friday: "Fri",
    saturday: "Sat",
    sunday: "Sun",
  };

  const formattedDays = classDays.map((day) => dayLabels[day] || day).join(", ");
  return `Every ${formattedDays}`;
}

// Format time from 24-hour to 12-hour format
function formatClassTime(time: string | undefined): string {
  if (!time) return "";
  const [hours, minutes] = time.split(":").map(Number);
  const ampm = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;
  return `${hour12}:${minutes.toString().padStart(2, "0")} ${ampm}`;
}

// Format price
function formatPrice(priceInCents: number | undefined): string {
  if (priceInCents === undefined || priceInCents === 0) return "Free";
  return `$${(priceInCents / 100).toFixed(2)}`;
}

export function ClassesSpotlight() {
  const classes = useQuery(api.public.queries.getPublishedClasses, { limit: 6 });

  // Show nothing if no classes
  if (classes === undefined) {
    return (
      <section className="bg-background py-16">
        <div className="container px-4 mx-auto">
          <div className="mb-10 flex flex-wrap items-start justify-between gap-4">
            <div className="flex-1 min-w-[250px]">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Learn to Step
              </h2>
              <p className="mt-2 text-muted-foreground">
                Master Chicago Steppin with expert-led classes
              </p>
            </div>
          </div>
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-muted rounded-lg animate-pulse"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Show nothing if no classes available
  if (classes.length === 0) {
    return null;
  }

  return (
    <section className="bg-background py-16">
      <div className="container px-4 mx-auto">
        <div className="mb-10 flex flex-wrap items-start justify-between gap-4">
          <div className="flex-1 min-w-[250px]">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Learn to Step
            </h2>
            <p className="mt-2 text-muted-foreground">
              Master Chicago Steppin with expert-led classes
            </p>
          </div>
          <Button asChild variant="outline" className="flex-shrink-0">
            <Link href="/classes">Browse All Classes</Link>
          </Button>
        </div>

        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {classes.slice(0, 6).map((classItem) => {
            const isRecurringClass = classItem.classDays && classItem.classDays.length > 0;

            return (
              <Link
                key={classItem._id}
                href={`/classes/${classItem._id}`}
                className="group"
              >
                <article className="overflow-hidden rounded-lg border bg-card transition-all hover:shadow-xl h-full flex flex-col">
                  <div className="relative aspect-video overflow-hidden bg-primary">
                    {classItem.imageUrl ? (
                      <Image
                        src={classItem.imageUrl}
                        alt={classItem.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="h-16 w-16 text-white/50" />
                      </div>
                    )}
                    {/* Categories badge */}
                    {classItem.categories && classItem.categories.length > 0 && (
                      <div className="absolute left-3 top-3">
                        <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                          {classItem.categories[0]}
                        </span>
                      </div>
                    )}
                    {/* Price badge */}
                    {classItem.pricePerClass !== undefined && (
                      <div className="absolute right-3 top-3">
                        <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-foreground">
                          {formatPrice(classItem.pricePerClass)}/class
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-5 flex-1 flex flex-col">
                    {/* Instructor */}
                    <div className="mb-3 flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">
                          {(classItem.organizerName || "I")[0].toUpperCase()}
                        </span>
                      </div>
                      <span className="text-sm font-medium">
                        {classItem.organizerName || "Instructor"}
                      </span>
                    </div>

                    <h3 className="mb-2 text-xl font-bold group-hover:text-primary line-clamp-2">
                      {classItem.name}
                    </h3>
                    <p className="mb-4 line-clamp-2 text-sm text-muted-foreground flex-1">
                      {classItem.description}
                    </p>

                    <div className="space-y-2 text-sm">
                      {/* Schedule */}
                      {isRecurringClass && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4 flex-shrink-0" />
                          <span>
                            {formatClassDays(classItem.classDays)}
                            {classItem.classTime && ` at ${formatClassTime(classItem.classTime)}`}
                          </span>
                        </div>
                      )}

                      {/* Location */}
                      {classItem.location && typeof classItem.location === "object" && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4 flex-shrink-0" />
                          <span>
                            {classItem.location.city}, {classItem.location.state}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t flex items-center justify-between">
                      <span className="text-lg font-bold text-primary">
                        {classItem.pricePerClass !== undefined && classItem.pricePerClass > 0
                          ? formatPrice(classItem.pricePerClass)
                          : "Free"}
                        {classItem.pricePerClass !== undefined && classItem.pricePerClass > 0 && (
                          <span className="text-sm font-normal text-muted-foreground">/class</span>
                        )}
                      </span>
                      <Button size="sm">View Details</Button>
                    </div>
                  </div>
                </article>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
