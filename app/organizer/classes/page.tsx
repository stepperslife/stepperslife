"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import {
  BookOpen,
  Plus,
  Calendar,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  MapPin,
} from "lucide-react";
import { motion } from "framer-motion";
import { formatEventDate } from "@/lib/date-format";
import { useState } from "react";
import { Id } from "@/convex/_generated/dataModel";

export default function OrganizerClassesPage() {
  const currentUser = useQuery(api.users.queries.getCurrentUser);
  const classes = useQuery(api.events.queries.getOrganizerClasses, {
    userId: currentUser?._id,
  });

  const publishEvent = useMutation(api.events.mutations.publishEvent);
  const unpublishEvent = useMutation(api.events.mutations.updateEvent);
  const deleteEvent = useMutation(api.events.mutations.deleteEvent);

  const [deletingId, setDeletingId] = useState<Id<"events"> | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<Id<"events"> | null>(null);

  // Show loading while queries are loading
  if (currentUser === undefined || classes === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading your classes...</p>
        </div>
      </div>
    );
  }

  // Handle publish/unpublish
  const handleTogglePublish = async (classId: Id<"events">, currentStatus: string) => {
    try {
      if (currentStatus === "PUBLISHED") {
        await unpublishEvent({
          eventId: classId,
          status: "DRAFT",
        });
      } else {
        await publishEvent({ eventId: classId });
      }
    } catch (error) {
      console.error("Failed to toggle publish status:", error);
      alert(error instanceof Error ? error.message : "Failed to update class status");
    }
  };

  // Handle delete
  const handleDelete = async (classId: Id<"events">) => {
    setDeletingId(classId);
    try {
      await deleteEvent({ eventId: classId });
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error("Failed to delete class:", error);
      alert(error instanceof Error ? error.message : "Failed to delete class");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-muted">
      {/* Header */}
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white shadow-sm border-b"
      >
        <div className="container mx-auto px-4 py-4 md:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">My Classes</h1>
              <p className="text-sm md:text-base text-muted-foreground mt-1">
                Manage your class listings
              </p>
            </div>
            <Link
              href="/organizer/classes/create"
              className="flex items-center justify-center gap-2 px-4 py-2.5 md:px-6 md:py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors shadow-md hover:shadow-lg w-full sm:w-auto"
            >
              <Plus className="w-5 h-5" />
              Create Class
            </Link>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-4 md:py-8">
        {/* Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6"
        >
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground">Total Classes</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{classes?.length || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="w-5 h-5 text-success" />
              <span className="text-sm text-muted-foreground">Published</span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {classes?.filter((c) => c.status === "PUBLISHED").length || 0}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center gap-2 mb-2">
              <EyeOff className="w-5 h-5 text-warning" />
              <span className="text-sm text-muted-foreground">Drafts</span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {classes?.filter((c) => c.status === "DRAFT").length || 0}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              <span className="text-sm text-muted-foreground">Upcoming</span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {classes?.filter((c) => c.startDate && c.startDate > Date.now()).length || 0}
            </p>
          </div>
        </motion.div>

        {/* Classes List */}
        {classes.length === 0 ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-lg shadow-md p-12 text-center"
          >
            <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">No classes yet</h3>
            <p className="text-muted-foreground mb-6">Create your first class to get started</p>
            <Link
              href="/organizer/classes/create"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create Your First Class
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {classes.map((classItem, index) => {
              const isUpcoming = classItem.startDate && classItem.startDate > Date.now();
              const isPast = classItem.endDate && classItem.endDate < Date.now();

              return (
                <motion.div
                  key={classItem._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 * index }}
                  className="bg-white rounded-lg shadow-md border border-border overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row">
                    {/* Class Image */}
                    <div className="sm:w-48 h-28 sm:h-auto bg-muted flex-shrink-0">
                      {classItem.imageUrl ? (
                        <img
                          src={classItem.imageUrl}
                          alt={classItem.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary">
                          <BookOpen className="w-10 h-10 md:w-12 md:h-12 text-white opacity-50" />
                        </div>
                      )}
                    </div>

                    {/* Class Details */}
                    <div className="flex-1 p-4 md:p-6">
                      <div className="mb-3">
                        <h3 className="text-lg md:text-xl font-bold text-foreground mb-2">
                          {classItem.name}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm text-muted-foreground">
                          {classItem.startDate && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {formatEventDate(classItem.startDate, classItem.timezone)}
                            </span>
                          )}
                          {classItem.location && typeof classItem.location === "object" && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {classItem.location.city}, {classItem.location.state}
                            </span>
                          )}
                          {/* Status Badge */}
                          {classItem.status === "PUBLISHED" ? (
                            <span className="px-2 py-1 text-xs font-semibold bg-success/10 text-success rounded-full flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              Published
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-semibold bg-warning/10 text-warning rounded-full flex items-center gap-1">
                              <EyeOff className="w-3 h-3" />
                              Draft
                            </span>
                          )}
                          {isPast && (
                            <span className="px-2 py-1 text-xs font-semibold bg-muted text-muted-foreground rounded-full">
                              Ended
                            </span>
                          )}
                          {isUpcoming && (
                            <span className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full">
                              Upcoming
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-2 md:gap-3">
                        <Link
                          href={`/organizer/classes/${classItem._id}/edit`}
                          className="flex items-center justify-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleTogglePublish(classItem._id, classItem.status || "DRAFT")}
                          className={`flex items-center justify-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm rounded-lg transition-all font-semibold ${
                            classItem.status === "PUBLISHED"
                              ? "bg-success hover:bg-success/90 text-white"
                              : "bg-warning hover:bg-warning/90 text-white"
                          }`}
                        >
                          {classItem.status === "PUBLISHED" ? (
                            <>
                              <Eye className="w-4 h-4" />
                              Published
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-4 h-4" />
                              Publish
                            </>
                          )}
                        </button>

                        <Link
                          href={`/classes/${classItem._id}`}
                          className="flex items-center justify-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm border border-border rounded-lg hover:bg-muted transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </Link>

                        <button
                          type="button"
                          onClick={() => setShowDeleteConfirm(classItem._id)}
                          className="flex items-center justify-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm border border-destructive text-destructive rounded-lg hover:bg-destructive/10 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Trash2 className="w-6 h-6 text-destructive" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-foreground mb-2">Delete Class?</h3>
                  <p className="text-muted-foreground text-sm">
                    This will permanently delete this class. This action cannot be undone.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(null)}
                  disabled={deletingId !== null}
                  className="px-4 py-2 border border-border text-foreground rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(showDeleteConfirm)}
                  disabled={deletingId !== null}
                  className="px-4 py-2 bg-destructive text-white rounded-lg hover:bg-destructive/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {deletingId === showDeleteConfirm ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
}
