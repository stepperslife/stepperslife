"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { RestaurantsSubNav } from "@/components/layout/RestaurantsSubNav";
import { PublicFooter } from "@/components/layout/PublicFooter";
import {
  ChefHat,
  MapPin,
  Phone,
  Clock,
  Utensils,
  Building2,
  Mail,
  User,
  FileText,
  CheckCircle,
  Loader2,
  LogIn
} from "lucide-react";
import toast from "react-hot-toast";

interface FormData {
  // Contact Info
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  // Restaurant Info
  restaurantName: string;
  description: string;
  cuisineTypes: string[];
  // Location
  address: string;
  city: string;
  state: string;
  zipCode: string;
  // Operations
  hoursOfOperation: string;
  estimatedPickupTime: string;
  // Additional
  website: string;
  additionalNotes: string;
}

const CUISINE_OPTIONS = [
  "Soul Food",
  "Southern",
  "BBQ",
  "Seafood",
  "Caribbean",
  "African",
  "American",
  "Mexican",
  "Chinese",
  "Italian",
  "Pizza",
  "Burgers",
  "Sandwiches",
  "Vegetarian",
  "Vegan",
  "Desserts",
  "Catering",
  "Other",
];

export default function RestaurateurApplyClient() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    restaurantName: "",
    description: "",
    cuisineTypes: [],
    address: "",
    city: "",
    state: "IL",
    zipCode: "",
    hoursOfOperation: "",
    estimatedPickupTime: "15-20 minutes",
    website: "",
    additionalNotes: "",
  });

  // Pre-fill user info when authenticated
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        contactName: user.name || prev.contactName,
        contactEmail: user.email || prev.contactEmail,
      }));
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCuisineToggle = (cuisine: string) => {
    setFormData(prev => ({
      ...prev,
      cuisineTypes: prev.cuisineTypes.includes(cuisine)
        ? prev.cuisineTypes.filter(c => c !== cuisine)
        : [...prev.cuisineTypes, cuisine],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    const required = ["contactName", "contactEmail", "contactPhone", "restaurantName", "address", "city", "state", "zipCode"];
    const missing = required.filter(field => !formData[field as keyof FormData]);

    if (missing.length > 0) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.cuisineTypes.length === 0) {
      toast.error("Please select at least one cuisine type");
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: Call Convex mutation to save restaurant application
      // For now, simulate submission
      await new Promise(resolve => setTimeout(resolve, 1500));

      setSubmitted(true);
      toast.success("Application submitted successfully!");
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <>
        <PublicHeader />
        <RestaurantsSubNav />
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </>
    );
  }

  // Not signed in - show sign in prompt
  if (!isAuthenticated) {
    return (
      <>
        <PublicHeader />
        <RestaurantsSubNav />
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-md mx-auto bg-card rounded-2xl shadow-lg p-8 text-center border border-border">
              <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <LogIn className="w-8 h-8 text-orange-600" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-4">
                Sign In to Register Your Restaurant
              </h1>
              <p className="text-muted-foreground mb-8">
                Create an account or sign in to submit your restaurant application and join the SteppersLife network.
              </p>
              <Link
                href={`/login?redirect=${encodeURIComponent("/restaurateur/apply")}`}
                className="block w-full px-6 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-colors"
              >
                Sign In to Continue
              </Link>
              <p className="text-sm text-muted-foreground mt-4">
                Don't have an account? You can create one when you sign in.
              </p>
            </div>
          </div>
        </div>
        <PublicFooter />
      </>
    );
  }

  // Application submitted successfully
  if (submitted) {
    return (
      <>
        <PublicHeader />
        <RestaurantsSubNav />
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-md mx-auto bg-card rounded-2xl shadow-lg p-8 text-center border border-border">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-4">
                Application Submitted!
              </h1>
              <p className="text-muted-foreground mb-6">
                Thank you for applying to join the SteppersLife restaurant network.
                We'll review your application and get back to you within 48 hours.
              </p>
              <div className="bg-muted/50 rounded-lg p-4 mb-6">
                <p className="text-sm text-foreground">
                  <strong>What's Next?</strong>
                </p>
                <ul className="text-sm text-muted-foreground mt-2 space-y-1 text-left">
                  <li>• We'll review your application</li>
                  <li>• A team member may reach out for more info</li>
                  <li>• Once approved, you can set up your menu</li>
                  <li>• Start receiving orders!</li>
                </ul>
              </div>
              <button
                onClick={() => router.push("/restaurants")}
                className="w-full px-6 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-colors"
              >
                Browse Restaurants
              </button>
            </div>
          </div>
        </div>
        <PublicFooter />
      </>
    );
  }

  // Application form
  return (
    <>
      <PublicHeader />
      <RestaurantsSubNav />
      <div className="min-h-screen bg-background">
        {/* Hero */}
        <div className="bg-gradient-to-br from-orange-600 to-red-600 py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-4">
                <ChefHat className="h-4 w-4" />
                Restaurant Application
              </span>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Add Your Restaurant
              </h1>
              <p className="text-white/90">
                Join our network and reach thousands of customers in the stepping community.
              </p>
            </div>
          </div>
        </div>

        {/* Application Form */}
        <div className="container mx-auto px-4 py-12">
          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-8">

            {/* Contact Information */}
            <div className="bg-card rounded-2xl shadow-md border border-border p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-orange-600" />
                </div>
                <h2 className="text-xl font-bold text-foreground">Contact Information</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    name="contactName"
                    value={formData.contactName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-background"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="contactEmail"
                    value={formData.contactEmail}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-background"
                    placeholder="john@restaurant.com"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-background"
                    placeholder="(312) 555-0123"
                  />
                </div>
              </div>
            </div>

            {/* Restaurant Information */}
            <div className="bg-card rounded-2xl shadow-md border border-border p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-orange-600" />
                </div>
                <h2 className="text-xl font-bold text-foreground">Restaurant Information</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Restaurant Name *
                  </label>
                  <input
                    type="text"
                    name="restaurantName"
                    value={formData.restaurantName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-background"
                    placeholder="Soul Kitchen"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-background resize-none"
                    placeholder="Tell us about your restaurant, your specialties, and what makes you unique..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Cuisine Types * (select all that apply)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {CUISINE_OPTIONS.map(cuisine => (
                      <button
                        key={cuisine}
                        type="button"
                        onClick={() => handleCuisineToggle(cuisine)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                          formData.cuisineTypes.includes(cuisine)
                            ? "bg-orange-600 text-white"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        {cuisine}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Website (optional)
                  </label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-background"
                    placeholder="https://www.yourrestaurant.com"
                  />
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="bg-card rounded-2xl shadow-md border border-border p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-orange-600" />
                </div>
                <h2 className="text-xl font-bold text-foreground">Location</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-background"
                    placeholder="123 Main Street"
                  />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-foreground mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-background"
                      placeholder="Chicago"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      State *
                    </label>
                    <select
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-background"
                    >
                      <option value="IL">IL</option>
                      <option value="IN">IN</option>
                      <option value="WI">WI</option>
                      <option value="MI">MI</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      ZIP Code *
                    </label>
                    <input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-background"
                      placeholder="60601"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Operations */}
            <div className="bg-card rounded-2xl shadow-md border border-border p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                  <Clock className="w-5 h-5 text-orange-600" />
                </div>
                <h2 className="text-xl font-bold text-foreground">Operations</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Hours of Operation
                  </label>
                  <textarea
                    name="hoursOfOperation"
                    value={formData.hoursOfOperation}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-background resize-none"
                    placeholder="Mon-Fri: 11am-9pm&#10;Sat-Sun: 12pm-10pm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Estimated Pickup Time
                  </label>
                  <select
                    name="estimatedPickupTime"
                    value={formData.estimatedPickupTime}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-background"
                  >
                    <option value="10-15 minutes">10-15 minutes</option>
                    <option value="15-20 minutes">15-20 minutes</option>
                    <option value="20-30 minutes">20-30 minutes</option>
                    <option value="30-45 minutes">30-45 minutes</option>
                    <option value="45-60 minutes">45-60 minutes</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Additional Notes */}
            <div className="bg-card rounded-2xl shadow-md border border-border p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                  <FileText className="w-5 h-5 text-orange-600" />
                </div>
                <h2 className="text-xl font-bold text-foreground">Additional Notes</h2>
              </div>

              <textarea
                name="additionalNotes"
                value={formData.additionalNotes}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-background resize-none"
                placeholder="Anything else you'd like us to know about your restaurant..."
              />
            </div>

            {/* Submit */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-4 bg-orange-600 text-white rounded-lg font-semibold text-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <ChefHat className="w-5 h-5" />
                    Submit Application
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      <PublicFooter />
    </>
  );
}
