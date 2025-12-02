"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import Link from "next/link";
import {
  Calendar,
  MapPin,
  Share2,
  ArrowLeft,
  AlertCircle,
  ExternalLink,
  BookOpen,
  Tag,
} from "lucide-react";
import { motion } from "framer-motion";
import { formatEventDate, formatEventTime } from "@/lib/date-format";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";

interface ClassDetailClientProps {
  classId: Id<"events">;
}

export default function ClassDetailClient({ classId }: ClassDetailClientProps) {
  const classDetails = useQuery(api.public.queries.getPublicClassDetails, {
    classId,
  });

  if (classDetails === undefined) {
    return (
      <>
        <PublicHeader />
        <div className="min-h-screen bg-muted">
          <div className="container mx-auto px-4 py-16">
            <div className="text-center">
              <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-muted-foreground">Loading class...</p>
            </div>
          </div>
        </div>
        <PublicFooter />
      </>
    );
  }

  if (classDetails === null) {
    return (
      <>
        <PublicHeader />
        <div className="min-h-screen bg-muted">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-2xl mx-auto text-center">
              <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-foreground mb-2">Class Not Found</h1>
              <p className="text-muted-foreground mb-6">
                This class doesn't exist or is no longer available.
              </p>
              <Link
                href="/classes"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Classes
              </Link>
            </div>
          </div>
        </div>
        <PublicFooter />
      </>
    );
  }

  const handleShare = async () => {
    const shareData = {
      title: classDetails.name,
      text: `Check out this class: ${classDetails.name}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // User cancelled share
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  const isPast = classDetails.endDate ? classDetails.endDate < Date.now() : false;

  return (
    <>
      <PublicHeader />
      <div data-testid="class-detail-page" className="min-h-screen bg-muted">
        {/* Header */}
        <header className="bg-card shadow-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link
                href="/classes"
                className="inline-flex items-center gap-2 text-foreground hover:text-primary transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Back to Classes</span>
              </Link>

              <button
                onClick={handleShare}
                className="inline-flex items-center gap-2 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">Share</span>
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-5xl mx-auto">
            {/* Top Section: Image + Info */}
            <div className="grid md:grid-cols-5 gap-8 mb-8">
              {/* Class Image - Left (2/5 width) */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="md:col-span-2"
              >
                <div className="relative w-full bg-muted rounded-xl overflow-hidden shadow-lg sticky top-24">
                  {classDetails.imageUrl ? (
                    <img
                      src={classDetails.imageUrl}
                      alt={classDetails.name}
                      className="w-full h-auto object-cover"
                    />
                  ) : (
                    <div className="w-full aspect-[3/4] flex items-center justify-center bg-primary">
                      <BookOpen className="w-24 h-24 text-white opacity-50" />
                    </div>
                  )}

                  {/* Class Badge */}
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold shadow-lg bg-primary text-white">
                      Class
                    </span>
                  </div>

                  {/* Past Class Badge */}
                  {isPast && (
                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1 bg-muted text-foreground rounded-full text-xs font-semibold shadow-lg">
                        Past Class
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Class Info - Right (3/5 width) */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="md:col-span-3"
              >
                {/* Class Title */}
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  {classDetails.name}
                </h1>

                {/* Categories */}
                {classDetails.categories && classDetails.categories.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {classDetails.categories.map((category) => (
                      <span
                        key={category}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-accent text-accent-foreground rounded-full text-sm"
                      >
                        <Tag className="w-3 h-3" />
                        {category}
                      </span>
                    ))}
                  </div>
                )}

                {/* Class Details Card */}
                <div className="bg-card rounded-lg border border-border p-6 mb-6">
                  {/* Date & Time */}
                  {classDetails.startDate && (
                    <div className="flex items-start gap-3 mb-4 pb-4 border-b border-border">
                      <Calendar className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-foreground">
                          {formatEventDate(classDetails.startDate, classDetails.timezone)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatEventTime(classDetails.startDate, classDetails.timezone)}
                          {classDetails.endDate &&
                            ` - ${formatEventTime(classDetails.endDate, classDetails.timezone)}`}
                        </p>
                        {classDetails.eventTimeLiteral && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {classDetails.eventTimeLiteral}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Location */}
                  {classDetails.location && typeof classDetails.location === "object" && (
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div>
                        {classDetails.location.venueName && (
                          <p className="font-semibold text-foreground">
                            {classDetails.location.venueName}
                          </p>
                        )}
                        {classDetails.location.address && (
                          <p className="text-sm text-muted-foreground">
                            {classDetails.location.address}
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground">
                          {classDetails.location.city}, {classDetails.location.state}{" "}
                          {classDetails.location.zipCode}
                        </p>
                        {classDetails.location.address && (
                          <a
                            href={`https://maps.google.com/?q=${encodeURIComponent(
                              `${classDetails.location.address}, ${classDetails.location.city}, ${classDetails.location.state}`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline text-sm mt-1 inline-flex items-center gap-1"
                          >
                            View Map
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Organizer / Instructor */}
                {(classDetails.organizer || classDetails.organizerName) && (
                  <div className="bg-card rounded-lg border border-border p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-3">Instructor</h3>
                    <p className="text-foreground font-medium text-xl">
                      {classDetails.organizer?.name ||
                        classDetails.organizerName ||
                        "Class Instructor"}
                    </p>
                    {classDetails.organizer?.email && (
                      <a
                        href={`mailto:${classDetails.organizer.email}`}
                        className="text-primary hover:underline text-sm mt-2 inline-block"
                      >
                        Contact Instructor
                      </a>
                    )}
                  </div>
                )}
              </motion.div>
            </div>

            {/* Description Section - Full Width Below */}
            {classDetails.description && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="mt-8"
              >
                <div className="bg-card rounded-lg border border-border p-6 md:p-8">
                  <h2 className="text-2xl font-bold text-foreground mb-4">About This Class</h2>
                  <div className="prose max-w-none text-foreground">
                    <p className="whitespace-pre-wrap">{classDetails.description}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
      <PublicFooter />
    </>
  );
}
