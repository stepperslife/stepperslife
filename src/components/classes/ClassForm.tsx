"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ArrowLeft, Calendar, MapPin, FileText, BookOpen, Save } from "lucide-react";
import Link from "next/link";
import { ImageUpload } from "@/components/upload/ImageUpload";
import { getTimezoneFromLocation, getTimezoneName } from "@/lib/timezone";
import { Id } from "@/convex/_generated/dataModel";
import { format as formatDate } from "date-fns";

// Class types (dance styles) - only 3 options
const CLASS_TYPES = [
  "Steppin",
  "Line Dancing",
  "Walkin",
];

// Skill levels
const SKILL_LEVELS = [
  "Beginner",
  "Intermediate",
  "Advanced",
];

// Days of the week
const DAY_OPTIONS = [
  { value: 0, label: "Sunday", short: "Sun" },
  { value: 1, label: "Monday", short: "Mon" },
  { value: 2, label: "Tuesday", short: "Tue" },
  { value: 3, label: "Wednesday", short: "Wed" },
  { value: 4, label: "Thursday", short: "Thu" },
  { value: 5, label: "Friday", short: "Fri" },
  { value: 6, label: "Saturday", short: "Sat" },
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
  const [categories, setCategories] = useState<string[]>([]); // Class types: Steppin, Line Dancing, Walking
  const [classLevel, setClassLevel] = useState<string>(""); // Skill level: Beginner, Intermediate, Advanced
  const [classDays, setClassDays] = useState<number[]>([]); // Days the class occurs (0=Sun, 6=Sat)

  // Date & Time
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [timezone, setTimezone] = useState("America/New_York");
  const [detectedTimezone, setDetectedTimezone] = useState("");

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
  const [dateError, setDateError] = useState<string | null>(null);

  const createEvent = useMutation(api.events.mutations.createEvent);
  const updateEvent = useMutation(api.events.mutations.updateEvent);

  // Populate form with existing data in edit mode
  useEffect(() => {
    if (mode === "edit" && existingClass) {
      setClassName(existingClass.name || "");
      setDescription(existingClass.description || "");
      setCategories(existingClass.categories || []);
      setClassLevel(existingClass.classLevel || "");

      // Format dates for datetime-local input
      if (existingClass.startDate) {
        const startDateObj = new Date(existingClass.startDate);
        setStartDate(formatDate(startDateObj, "yyyy-MM-dd'T'HH:mm"));
      }
      if (existingClass.endDate) {
        const endDateObj = new Date(existingClass.endDate);
        setEndDate(formatDate(endDateObj, "yyyy-MM-dd'T'HH:mm"));
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

      // Class days
      if (existingClass.classDays) {
        setClassDays(existingClass.classDays);
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

  const handleDayToggle = (day: number) => {
    if (classDays.includes(day)) {
      setClassDays(classDays.filter((d) => d !== day));
    } else {
      setClassDays([...classDays, day].sort((a, b) => a - b));
    }
  };

  // Inline validation for end date
  const handleEndDateChange = (value: string) => {
    setEndDate(value);
    if (value && startDate) {
      const startDateObj = new Date(startDate);
      const endDateObj = new Date(value);
      if (endDateObj < startDateObj) {
        setDateError("End date must be after start date");
      } else {
        setDateError(null);
      }
    } else {
      setDateError(null);
    }
  };

  const handleSubmit = async () => {
    // Validation
    const missingFields: string[] = [];

    if (!className) missingFields.push("Class Name");
    if (!description) missingFields.push("Description");
    if (!startDate) missingFields.push("Start Date & Time");
    if (!city) missingFields.push("City");
    if (!state) missingFields.push("State");

    if (missingFields.length > 0) {
      alert(
        `Please fill in the following required fields:\n\n${missingFields.map((f) => `• ${f}`).join("\n")}`
      );
      return;
    }

    // Validate end date is after start date
    if (endDate && startDate) {
      const startDateObj = new Date(startDate);
      const endDateObj = new Date(endDate);
      if (endDateObj < startDateObj) {
        setDateError("End date must be after start date");
        return;
      }
    }
    setDateError(null);

    setIsSubmitting(true);

    try {
      const startDateObj = new Date(startDate);
      const endDateObj = endDate ? new Date(endDate) : startDateObj;

      const startDateUTC = startDateObj.getTime();
      const endDateUTC = endDateObj.getTime();

      // Extract literal date and time for display purposes
      const eventDateLiteral = formatDate(startDateObj, "MMMM d, yyyy");
      const eventTimeLiteral = formatDate(startDateObj, "h:mm a");

      if (mode === "create") {
        const classData = {
          name: className,
          eventType: "CLASS" as const,
          description,
          categories,
          classLevel: classLevel || undefined,
          classDays: classDays.length > 0 ? classDays : undefined,
          startDate: startDateUTC,
          endDate: endDateUTC,
          timezone,
          eventDateLiteral,
          eventTimeLiteral,
          eventTimezone: timezone,
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
          classLevel: classLevel || undefined,
          classDays: classDays.length > 0 ? classDays : undefined,
          startDate: startDateUTC,
          endDate: endDateUTC,
          timezone,
          eventDateLiteral,
          eventTimeLiteral,
          eventTimezone: timezone,
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
    <div className="min-h-screen bg-muted" data-testid="class-form">
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
                  data-testid="class-name-input"
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
                  data-testid="class-description-input"
                />
              </div>

              {/* Class Type (Dance Style) */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Class Type *
                </label>
                <p className="text-xs text-muted-foreground mb-2">Select the dance style(s) for this class</p>
                <div className="flex flex-wrap gap-2">
                  {CLASS_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleCategoryToggle(type)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        categories.includes(type)
                          ? "bg-primary text-white"
                          : "bg-muted text-foreground hover:bg-accent"
                      }`}
                      data-testid={`class-type-${type.toLowerCase().replace(/\s+/g, "-")}`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Skill Level (Single Select) */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Skill Level
                </label>
                <p className="text-xs text-muted-foreground mb-2">Select the difficulty level for this class</p>
                <div className="flex flex-wrap gap-2">
                  {SKILL_LEVELS.map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setClassLevel(classLevel === level ? "" : level)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        classLevel === level
                          ? "bg-warning text-white"
                          : "bg-muted text-foreground hover:bg-accent"
                      }`}
                      data-testid={`class-level-${level.toLowerCase()}`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
                {classLevel && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Selected: {classLevel}
                  </p>
                )}
              </div>

              {/* Day(s) of the Week */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Day(s) of the Week *
                </label>
                <p className="text-xs text-muted-foreground mb-2">Select all days this class occurs</p>
                <div className="flex flex-wrap gap-2">
                  {DAY_OPTIONS.map((day) => (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => handleDayToggle(day.value)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        classDays.includes(day.value)
                          ? "bg-primary text-white"
                          : "bg-muted text-foreground hover:bg-accent"
                      }`}
                      data-testid={`class-day-${day.short.toLowerCase()}`}
                    >
                      {day.short}
                    </button>
                  ))}
                </div>
                {classDays.length > 0 && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Selected: {classDays.map(d => DAY_OPTIONS.find(o => o.value === d)?.label).join(", ")}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Date & Time */}
          <div className="bg-card rounded-lg shadow-sm border p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Date & Time</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Start Date & Time *
                </label>
                <input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
                  data-testid="class-start-date"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  End Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => handleEndDateChange(e.target.value)}
                  min={startDate}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground ${
                    dateError ? "border-destructive" : "border-input"
                  }`}
                  data-testid="class-end-date"
                />
                {dateError && (
                  <p className="mt-1 text-sm text-destructive" data-testid="date-error">
                    {dateError}
                  </p>
                )}
              </div>
            </div>

            {detectedTimezone && (
              <p className="mt-2 text-sm text-muted-foreground">
                Timezone: {detectedTimezone}
              </p>
            )}
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
                  data-testid="class-venue-input"
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
                  data-testid="class-address-input"
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
                    data-testid="class-city-input"
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
                    data-testid="class-state-input"
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
                    data-testid="class-zip-input"
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

            <div data-testid="class-image-upload">
              <ImageUpload
                currentImageId={uploadedImageId ?? undefined}
                onImageUploaded={(id) => setUploadedImageId(id)}
                onImageRemoved={() => setUploadedImageId(null)}
              />
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Upload a flyer or image for your class (optional)
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4 pt-4">
            <Link
              href="/organizer/classes"
              className="px-6 py-3 border border-border text-foreground rounded-lg hover:bg-muted transition-colors"
              data-testid="class-cancel-btn"
            >
              Cancel
            </Link>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="class-submit-btn"
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
