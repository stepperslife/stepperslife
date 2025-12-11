"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ArrowLeft, Calendar, MapPin, FileText, BookOpen, Save, DollarSign } from "lucide-react";
import Link from "next/link";
import { ImageUpload } from "@/components/upload/ImageUpload";
import { getTimezoneFromLocation, getTimezoneName } from "@/lib/timezone";
import { Id } from "@/convex/_generated/dataModel";
import { format as formatDate } from "date-fns";

const CLASS_CATEGORIES = [
  "Beginner",
  "Intermediate",
  "Advanced",
  "Workshop",
  "Private Lesson",
  "Group Class",
  "Chicago Stepping",
  "Detroit Ballroom",
  "Line Dance",
  "Hand Dance",
];

const DAYS_OF_WEEK = [
  { id: "monday", label: "Monday", short: "Mon" },
  { id: "tuesday", label: "Tuesday", short: "Tue" },
  { id: "wednesday", label: "Wednesday", short: "Wed" },
  { id: "thursday", label: "Thursday", short: "Thu" },
  { id: "friday", label: "Friday", short: "Fri" },
  { id: "saturday", label: "Saturday", short: "Sat" },
  { id: "sunday", label: "Sunday", short: "Sun" },
];

interface ClassFormProps {
  mode: "create" | "edit";
  classId?: Id<"events">;
}

export default function ClassForm({ mode, classId }: ClassFormProps) {
  const router = useRouter();

  // Fetch existing class data for edit mode
  const existingClass = useQuery(
    api.events.queries.getEventById,
    classId ? { eventId: classId } : "skip"
  );

  // Basic Information
  const [className, setClassName] = useState("");
  const [description, setDescription] = useState("");
  const [categories, setCategories] = useState<string[]>([]);

  // Class Schedule (Weekly recurring)
  const [classDays, setClassDays] = useState<string[]>([]);
  const [classTime, setClassTime] = useState("");
  const [classStartDate, setClassStartDate] = useState("");
  const [classEndDate, setClassEndDate] = useState("");
  const [timezone, setTimezone] = useState("America/New_York");
  const [detectedTimezone, setDetectedTimezone] = useState("");

  // Pricing
  const [pricePerClass, setPricePerClass] = useState("");

  // Location
  const [venueName, setVenueName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [country, setCountry] = useState("USA");

  // Image
  const [uploadedImageId, setUploadedImageId] = useState<Id<"_storage"> | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const createEvent = useMutation(api.events.mutations.createEvent);
  const updateEvent = useMutation(api.events.mutations.updateEvent);

  // Populate form with existing data in edit mode
  useEffect(() => {
    if (mode === "edit" && existingClass) {
      setClassName(existingClass.name || "");
      setDescription(existingClass.description || "");
      setCategories(existingClass.categories || []);

      // Class schedule fields
      if (existingClass.classDays) {
        setClassDays(existingClass.classDays);
      }
      if (existingClass.classTime) {
        setClassTime(existingClass.classTime);
      }
      if (existingClass.classStartDate) {
        const startDateObj = new Date(existingClass.classStartDate);
        setClassStartDate(formatDate(startDateObj, "yyyy-MM-dd"));
      }
      if (existingClass.classEndDate) {
        const endDateObj = new Date(existingClass.classEndDate);
        setClassEndDate(formatDate(endDateObj, "yyyy-MM-dd"));
      }

      // Price
      if (existingClass.pricePerClass !== undefined && existingClass.pricePerClass !== null) {
        setPricePerClass((existingClass.pricePerClass / 100).toString());
      }

      if (existingClass.timezone) {
        setTimezone(existingClass.timezone);
      }

      // Location
      if (existingClass.location && typeof existingClass.location === "object") {
        setVenueName(existingClass.location.venueName || "");
        setAddress(existingClass.location.address || "");
        setCity(existingClass.location.city || "");
        setState(existingClass.location.state || "");
        setZipCode(existingClass.location.zipCode || "");
        setCountry(existingClass.location.country || "USA");
      }

      // Image
      if (existingClass.images && existingClass.images.length > 0) {
        setUploadedImageId(existingClass.images[0]);
      }
    }
  }, [mode, existingClass]);

  // Auto-detect timezone when city or state changes
  useEffect(() => {
    if (city && state) {
      const tz = getTimezoneFromLocation(city, state);
      setTimezone(tz);
      setDetectedTimezone(getTimezoneName(tz));
    }
  }, [city, state]);

  const handleCategoryToggle = (category: string) => {
    if (categories.includes(category)) {
      setCategories(categories.filter((c) => c !== category));
    } else {
      setCategories([...categories, category]);
    }
  };

  const handleDayToggle = (dayId: string) => {
    if (classDays.includes(dayId)) {
      setClassDays(classDays.filter((d) => d !== dayId));
    } else {
      setClassDays([...classDays, dayId]);
    }
  };

  const handleSubmit = async () => {
    // Validation
    const missingFields: string[] = [];

    if (!className) missingFields.push("Class Name");
    if (!description) missingFields.push("Description");
    if (classDays.length === 0) missingFields.push("Class Days (select at least one)");
    if (!classTime) missingFields.push("Class Time");
    if (!city) missingFields.push("City");
    if (!state) missingFields.push("State");

    if (missingFields.length > 0) {
      alert(
        `Please fill in the following required fields:\n\n${missingFields.map((f) => `• ${f}`).join("\n")}`
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // Convert class start/end dates to timestamps
      const classStartDateUTC = classStartDate ? new Date(classStartDate).getTime() : Date.now();
      const classEndDateUTC = classEndDate ? new Date(classEndDate).getTime() : undefined;

      // Convert price from dollars to cents
      const priceInCents = pricePerClass ? Math.round(parseFloat(pricePerClass) * 100) : 0;

      // Format the class time for display
      const formattedClassTime = classTime;

      // Create a display-friendly schedule string
      const selectedDayLabels = DAYS_OF_WEEK
        .filter((d) => classDays.includes(d.id))
        .map((d) => d.label);
      const daysDisplay = selectedDayLabels.join(", ");

      if (mode === "create") {
        const classData = {
          name: className,
          eventType: "CLASS" as const,
          description,
          categories,
          // New class schedule fields
          classDays,
          classTime: formattedClassTime,
          classStartDate: classStartDateUTC,
          classEndDate: classEndDateUTC,
          pricePerClass: priceInCents,
          // Keep timezone and location
          timezone,
          eventTimezone: timezone,
          eventTimeLiteral: formattedClassTime,
          eventDateLiteral: `Every ${daysDisplay}`,
          location: {
            venueName: venueName || undefined,
            address: address || undefined,
            city,
            state,
            zipCode: zipCode || undefined,
            country,
          },
          capacity: 0, // Classes don't need capacity tracking
          images: uploadedImageId ? [uploadedImageId] : undefined,
        };

        await createEvent(classData);
        router.push("/organizer/classes");
      } else if (mode === "edit" && classId) {
        const updateData = {
          eventId: classId,
          name: className,
          description,
          categories,
          // New class schedule fields
          classDays,
          classTime: formattedClassTime,
          classStartDate: classStartDateUTC,
          classEndDate: classEndDateUTC,
          pricePerClass: priceInCents,
          // Keep timezone and location
          timezone,
          eventTimezone: timezone,
          eventTimeLiteral: formattedClassTime,
          eventDateLiteral: `Every ${daysDisplay}`,
          location: {
            venueName: venueName || undefined,
            address: address || undefined,
            city,
            state,
            zipCode: zipCode || undefined,
            country,
          },
          images: uploadedImageId ? [uploadedImageId] : undefined,
        };

        await updateEvent(updateData);
        router.push("/organizer/classes");
      }
    } catch (error: any) {
      console.error("[ClassForm] Error saving class:", error);
      alert(error.message || "Failed to save class. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state for edit mode
  if (mode === "edit" && existingClass === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading class...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted">
      {/* Header */}
      <header className="bg-card shadow-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/organizer/classes"
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  {mode === "create" ? "Create Class" : "Edit Class"}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {mode === "create" ? "List a new class for steppers" : "Update your class details"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Form Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Basic Information */}
          <div className="bg-card rounded-lg shadow-sm border p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Basic Information</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Class Name *
                </label>
                <input
                  type="text"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  placeholder="e.g., Beginner Stepping Workshop"
                  className="w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Description *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your class, what students will learn, what to bring..."
                  rows={4}
                  className="w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Categories
                </label>
                <div className="flex flex-wrap gap-2">
                  {CLASS_CATEGORIES.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => handleCategoryToggle(category)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        categories.includes(category)
                          ? "bg-primary text-white"
                          : "bg-muted text-foreground hover:bg-accent"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Class Schedule */}
          <div className="bg-card rounded-lg shadow-sm border p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Class Schedule</h2>
            </div>

            <div className="space-y-4">
              {/* Days of Week */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Class Days *
                </label>
                <p className="text-sm text-muted-foreground mb-3">
                  Select the days when this class runs every week
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                  {DAYS_OF_WEEK.map((day) => (
                    <button
                      key={day.id}
                      type="button"
                      onClick={() => handleDayToggle(day.id)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors border ${
                        classDays.includes(day.id)
                          ? "bg-primary text-white border-primary"
                          : "bg-background text-foreground border-input hover:bg-accent"
                      }`}
                    >
                      <span className="hidden sm:inline">{day.label}</span>
                      <span className="sm:hidden">{day.short}</span>
                    </button>
                  ))}
                </div>
                {classDays.length > 0 && (
                  <p className="mt-2 text-sm text-primary">
                    Every {DAYS_OF_WEEK.filter((d) => classDays.includes(d.id)).map((d) => d.label).join(", ")}
                  </p>
                )}
              </div>

              {/* Class Time */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Class Time *
                </label>
                <input
                  type="time"
                  value={classTime}
                  onChange={(e) => setClassTime(e.target.value)}
                  className="w-full sm:w-48 px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
                />
              </div>

              {/* Start and End Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Class Start Date
                  </label>
                  <p className="text-xs text-muted-foreground mb-2">
                    When does this recurring class begin?
                  </p>
                  <input
                    type="date"
                    value={classStartDate}
                    onChange={(e) => setClassStartDate(e.target.value)}
                    className="w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Class End Date
                  </label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Leave blank for ongoing classes
                  </p>
                  <input
                    type="date"
                    value={classEndDate}
                    onChange={(e) => setClassEndDate(e.target.value)}
                    className="w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
                  />
                </div>
              </div>

              {detectedTimezone && (
                <p className="text-sm text-muted-foreground">
                  Timezone: {detectedTimezone}
                </p>
              )}
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-card rounded-lg shadow-sm border p-6">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Pricing</h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Price Per Class
              </label>
              <p className="text-xs text-muted-foreground mb-2">
                Enter 0 or leave blank for free classes
              </p>
              <div className="relative w-full sm:w-48">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={pricePerClass}
                  onChange={(e) => setPricePerClass(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-7 pr-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-card rounded-lg shadow-sm border p-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Location</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Venue Name
                </label>
                <input
                  type="text"
                  value={venueName}
                  onChange={(e) => setVenueName(e.target.value)}
                  placeholder="e.g., Community Dance Studio"
                  className="w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="123 Main St"
                  className="w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-foreground mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Chicago"
                    className="w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="IL"
                    className="w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Zip Code
                  </label>
                  <input
                    type="text"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    placeholder="60601"
                    className="w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Image Upload */}
          <div className="bg-card rounded-lg shadow-sm border p-6">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Class Image</h2>
            </div>

            <ImageUpload
              currentImageId={uploadedImageId ?? undefined}
              onImageUploaded={(id) => setUploadedImageId(id)}
              onImageRemoved={() => setUploadedImageId(null)}
            />
            <p className="mt-2 text-sm text-muted-foreground">
              Upload a flyer or image for your class (optional)
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4 pt-4">
            <Link
              href="/organizer/classes"
              className="px-6 py-3 border border-border text-foreground rounded-lg hover:bg-muted transition-colors"
            >
              Cancel
            </Link>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                  {mode === "create" ? "Creating..." : "Saving..."}
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  {mode === "create" ? "Create Class" : "Save Changes"}
                </>
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
