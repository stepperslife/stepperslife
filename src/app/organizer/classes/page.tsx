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
  GraduationCap,
  Copy,
  BarChart3,
} from "lucide-react";
import { motion } from "framer-motion";
import { formatEventDate } from "@/lib/date-format";
import { useState } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function OrganizerClassesPage() {
  const router = useRouter();
  const currentUser = useQuery(api.users.queries.getCurrentUser);
  const classes = useQuery(api.events.queries.getOrganizerClasses, {
    userId: currentUser?._id,
  });

  const publishEvent = useMutation(api.events.mutations.publishEvent);
  const unpublishEvent = useMutation(api.events.mutations.updateEvent);
  const deleteEvent = useMutation(api.events.mutations.deleteEvent);
  const duplicateEvent = useMutation(api.events.mutations.duplicateEvent);

  const [deletingId, setDeletingId] = useState<Id<"events"> | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<Id<"events"> | null>(null);

  // Duplicate class state
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [duplicatingClassId, setDuplicatingClassId] = useState<Id<"events"> | null>(null);
  const [duplicateOptions, setDuplicateOptions] = useState({
    newName: "",
    copyTickets: true,
    copyStaff: true,
  });
  const [isDuplicating, setIsDuplicating] = useState(false);

  // Show loading while queries are loading
  if (currentUser === undefined || classes === undefined) {
    return <LoadingSpinner fullPage text="Loading your classes..." />;
  }

  // Handle publish/unpublish
  const handleTogglePublish = async (classId: Id<"events">, currentStatus: string) => {
    try {
      if (currentStatus === "PUBLISHED") {
        await unpublishEvent({
          eventId: classId,
          status: "DRAFT",
        });
        toast.success("Class unpublished");
      } else {
        await publishEvent({ eventId: classId });
        toast.success("Class published!");
      }
    } catch (error) {
      console.error("Failed to toggle publish status:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update class status");
    }
  };

  // Handle delete
  const handleDelete = async (classId: Id<"events">) => {
    setDeletingId(classId);
    try {
      await deleteEvent({ eventId: classId });
      setShowDeleteConfirm(null);
      toast.success("Class deleted");
    } catch (error) {
      console.error("Failed to delete class:", error);
      toast.error(error instanceof Error ? error.message : "Failed to delete class");
    } finally {
      setDeletingId(null);
    }
  };

  // Handle opening duplicate dialog
  const handleOpenDuplicate = (classId: Id<"events">, className: string) => {
    setDuplicatingClassId(classId);
    setDuplicateOptions({
      newName: `${className} (Copy)`,
      copyTickets: true,
      copyStaff: true,
    });
    setShowDuplicateDialog(true);
  };

  // Handle duplicate class
  const handleDuplicateClass = async () => {
    if (!duplicatingClassId) return;

    setIsDuplicating(true);
    try {
      const result = await duplicateEvent({
        eventId: duplicatingClassId,
        options: {
          newName: duplicateOptions.newName || undefined,
          copyTickets: duplicateOptions.copyTickets,
          copySeating: false, // Classes don't have seating
          copyStaff: duplicateOptions.copyStaff,
        },
      });

      setShowDuplicateDialog(false);
      setDuplicatingClassId(null);

      // Navigate to the new class edit page
      router.push(`/organizer/classes/${result.newEventId}/edit`);
    } catch (error) {
      console.error("Error duplicating class:", error);
      toast.error(`Error duplicating class: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsDuplicating(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted" data-testid="organizer-classes-page">
      {/* Instructor Role Indicator */}
      <div className="bg-warning/10 border-b border-warning/30">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center gap-2">
            <div className="bg-warning/20 p-1.5 rounded-full">
              <GraduationCap className="w-4 h-4 text-warning" />
            </div>
            <div>
              <span className="font-medium text-foreground text-sm">Instructor View</span>
              <span className="text-warning text-xs ml-2">Classes you teach and manage</span>
            </div>
          </div>
        </div>
      </div>

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
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">My Teaching Classes</h1>
              <p className="text-sm md:text-base text-muted-foreground mt-1">
                Classes you created and manage as an instructor
              </p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Link
                href="/organizer/classes/analytics"
                className="flex items-center justify-center gap-2 px-4 py-2.5 md:px-6 md:py-3 border border-primary/30 text-primary rounded-lg hover:bg-primary/10 transition-colors w-full sm:w-auto"
                data-testid="analytics-btn"
              >
                <BarChart3 className="w-5 h-5" />
                Analytics
              </Link>
              <Link
                href="/organizer/classes/create"
                className="flex items-center justify-center gap-2 px-4 py-2.5 md:px-6 md:py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors shadow-md hover:shadow-lg w-full sm:w-auto"
                data-testid="create-class-btn"
              >
                <Plus className="w-5 h-5" />
                Create Class
              </Link>
            </div>
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
          <div className="bg-white rounded-lg shadow-sm border p-4" data-testid="class-stats-total">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground">Total Classes</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{classes?.length || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-4" data-testid="class-stats-published">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="w-5 h-5 text-success" />
              <span className="text-sm text-muted-foreground">Published</span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {classes?.filter((c) => c.status === "PUBLISHED").length || 0}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-4" data-testid="class-stats-drafts">
            <div className="flex items-center gap-2 mb-2">
              <EyeOff className="w-5 h-5 text-warning" />
              <span className="text-sm text-muted-foreground">Drafts</span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {classes?.filter((c) => c.status === "DRAFT").length || 0}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-4" data-testid="class-stats-upcoming">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-primary" />
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
            data-testid="empty-state"
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
                  data-testid={`class-row-${classItem._id}`}
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
                            <span className="px-2 py-1 text-xs font-semibold bg-info/20 text-info rounded-full">
                              Upcoming
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-2 md:gap-3">
                        {/* Edit - Primary Action */}
                        <Link
                          href={`/organizer/classes/${classItem._id}/edit`}
                          className="flex items-center justify-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                          data-testid={`class-edit-btn-${classItem._id}`}
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </Link>

                        {/* Duplicate - Secondary Action */}
                        <button
                          type="button"
                          onClick={() => handleOpenDuplicate(classItem._id, classItem.name)}
                          className="flex items-center justify-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm border border-primary/30 bg-primary/5 text-primary rounded-lg hover:bg-primary/10 transition-colors"
                          data-testid={`class-duplicate-btn-${classItem._id}`}
                        >
                          <Copy className="w-4 h-4" />
                          Duplicate
                        </button>

                        {/* View - Navigate to public page */}
                        <Link
                          href={`/classes/${classItem._id}`}
                          className="flex items-center justify-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm border border-border rounded-lg hover:bg-muted transition-colors"
                          data-testid={`class-view-btn-${classItem._id}`}
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </Link>

                        {/* Publish/Unpublish - Status control */}
                        <button
                          type="button"
                          onClick={() => handleTogglePublish(classItem._id, classItem.status || "DRAFT")}
                          className={`flex items-center justify-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm rounded-lg transition-all font-semibold ${
                            classItem.status === "PUBLISHED"
                              ? "bg-success hover:bg-success/90 text-white"
                              : "bg-warning hover:bg-warning/90 text-white"
                          }`}
                          data-testid={`class-publish-btn-${classItem._id}`}
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

                        {/* Delete - Destructive action (always last) */}
                        <button
                          type="button"
                          onClick={() => setShowDeleteConfirm(classItem._id)}
                          className="flex items-center justify-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm border border-destructive text-destructive rounded-lg hover:bg-destructive/10 transition-colors"
                          data-testid={`class-delete-btn-${classItem._id}`}
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
                  data-testid="cancel-delete-btn"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(showDeleteConfirm)}
                  disabled={deletingId !== null}
                  className="px-4 py-2 bg-destructive text-white rounded-lg hover:bg-destructive/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                  data-testid="confirm-delete-btn"
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

        {/* Duplicate Class Dialog */}
        {showDuplicateDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Copy className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-foreground mb-2">Duplicate Class</h3>
                  <p className="text-muted-foreground text-sm">
                    Create a copy of this class with all its configurations.
                  </p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    New Class Name
                  </label>
                  <input
                    type="text"
                    value={duplicateOptions.newName}
                    onChange={(e) =>
                      setDuplicateOptions({ ...duplicateOptions, newName: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="Class name"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    What to Copy
                  </label>
                  <label className="flex items-center gap-3 p-3 bg-muted rounded-lg cursor-pointer hover:bg-muted/80">
                    <input
                      type="checkbox"
                      checked={duplicateOptions.copyTickets}
                      onChange={(e) =>
                        setDuplicateOptions({ ...duplicateOptions, copyTickets: e.target.checked })
                      }
                      className="w-4 h-4 text-primary rounded focus:ring-primary"
                    />
                    <div>
                      <span className="font-medium text-foreground">Enrollment Tiers</span>
                      <p className="text-xs text-muted-foreground">Copy all enrollment types and pricing</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-3 bg-muted rounded-lg cursor-pointer hover:bg-muted/80">
                    <input
                      type="checkbox"
                      checked={duplicateOptions.copyStaff}
                      onChange={(e) =>
                        setDuplicateOptions({ ...duplicateOptions, copyStaff: e.target.checked })
                      }
                      className="w-4 h-4 text-primary rounded focus:ring-primary"
                    />
                    <div>
                      <span className="font-medium text-foreground">Staff Members</span>
                      <p className="text-xs text-muted-foreground">Copy instructor and assistant assignments</p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowDuplicateDialog(false);
                    setDuplicatingClassId(null);
                  }}
                  disabled={isDuplicating}
                  className="px-4 py-2 border border-border text-foreground rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDuplicateClass}
                  disabled={isDuplicating}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isDuplicating ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Duplicating...
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Duplicate Class
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
