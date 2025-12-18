"use client";

import { useState, useEffect } from "react";
import { useAction, useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  Play,
  RefreshCw,
  ChefHat,
  Users,
  ShoppingBag,
  UtensilsCrossed,
  AlertTriangle,
  Terminal,
} from "lucide-react";

// Configuration
const RESTAURANT_DATA = {
  name: "Steppers Soul Kitchen",
  description: "Authentic soul food with a modern twist. Family recipes passed down for generations.",
  address: "123 Main Street",
  city: "Chicago",
  state: "IL",
  zipCode: "60601",
  phone: "(312) 555-0100",
  cuisine: ["Soul Food", "Southern", "Comfort Food"],
  contactName: "Test Owner",
  contactEmail: "owner@stepperslife.com",
  estimatedPickupTime: 25,
};

const OPERATING_HOURS = {
  monday: { open: "11:00 AM", close: "9:00 PM", closed: false },
  tuesday: { open: "11:00 AM", close: "9:00 PM", closed: false },
  wednesday: { open: "11:00 AM", close: "9:00 PM", closed: false },
  thursday: { open: "11:00 AM", close: "10:00 PM", closed: false },
  friday: { open: "11:00 AM", close: "11:00 PM", closed: false },
  saturday: { open: "10:00 AM", close: "11:00 PM", closed: false },
  sunday: { open: "10:00 AM", close: "8:00 PM", closed: false },
};

const MENU_CATEGORIES = [
  { name: "Appetizers", description: "Start your meal right", sortOrder: 1 },
  { name: "Main Dishes", description: "Hearty soul food favorites", sortOrder: 2 },
  { name: "Sides", description: "Classic southern sides", sortOrder: 3 },
  { name: "Desserts", description: "Sweet endings", sortOrder: 4 },
  { name: "Beverages", description: "Refreshing drinks", sortOrder: 5 },
];

const MENU_ITEMS = [
  { category: "Main Dishes", name: "Fried Chicken", description: "Crispy fried chicken, 2 pieces with your choice of side", price: 1499, sortOrder: 1 },
  { category: "Main Dishes", name: "Smothered Pork Chops", description: "Tender pork chops in rich onion gravy", price: 1699, sortOrder: 2 },
  { category: "Sides", name: "Mac & Cheese", description: "Creamy three-cheese macaroni", price: 599, sortOrder: 1 },
  { category: "Sides", name: "Collard Greens", description: "Slow-cooked with smoked turkey", price: 499, sortOrder: 2 },
  { category: "Sides", name: "Cornbread", description: "Sweet buttermilk cornbread", price: 299, sortOrder: 3 },
  { category: "Desserts", name: "Sweet Potato Pie", description: "Homemade with love", price: 699, sortOrder: 1 },
  { category: "Beverages", name: "Sweet Tea", description: "Southern-style sweet tea", price: 299, sortOrder: 1 },
  { category: "Beverages", name: "Lemonade", description: "Fresh-squeezed lemonade", price: 349, sortOrder: 2 },
];

export default function TestSetupPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [convexReady, setConvexReady] = useState<boolean | null>(null);
  const [result, setResult] = useState<{
    success: boolean;
    restaurantId?: string;
    orderId?: string;
    orderNumber?: string;
    errors: string[];
    steps: string[];
  } | null>(null);

  // Try to use the testSetup action if it's deployed
  let setupTestRestaurant: any = null;
  let stats: any = null;

  try {
    // @ts-ignore - This may not exist if Convex functions aren't deployed
    setupTestRestaurant = useAction(api.testSetup?.setupTestRestaurant);
    // @ts-ignore
    stats = useQuery(api.testSetup?.getTestOrderStats);
  } catch (e) {
    // Functions not deployed yet
  }

  // Fallback mutations for manual setup
  const createRestaurant = useMutation(api.restaurants.apply);
  const approveRestaurant = useMutation(api.restaurants.approve);
  const updateHours = useMutation(api.restaurantHours.updateHours);
  const createCategory = useMutation(api.menuItems.createCategory);
  const createMenuItem = useMutation(api.menuItems.create);
  const toggleOrders = useMutation(api.restaurants.toggleAcceptingOrders);
  const createOrder = useAction(api.foodOrders.createWithNotification);
  const updateOrderStatus = useAction(api.foodOrders.updateStatusWithNotification);
  const updatePayment = useMutation(api.foodOrders.updatePaymentStatus);
  const getRestaurantBySlug = useQuery(api.restaurants.getBySlug, { slug: "steppers-soul-kitchen" });

  // Check if the testSetup module is available
  useEffect(() => {
    // @ts-ignore
    setConvexReady(api.testSetup !== undefined);
  }, []);

  const addStep = (steps: string[], step: string) => {
    steps.push(step);
    setResult(prev => prev ? { ...prev, steps: [...steps] } : null);
  };

  // Manual setup that uses existing deployed functions
  const handleManualSetup = async () => {
    setIsRunning(true);
    const errors: string[] = [];
    const steps: string[] = [];
    setResult({ success: false, errors, steps });

    try {
      // Check if restaurant exists
      if (getRestaurantBySlug) {
        addStep(steps, `Restaurant already exists: ${getRestaurantBySlug._id}`);
        setResult({
          success: true,
          restaurantId: getRestaurantBySlug._id,
          errors,
          steps,
        });
        setIsRunning(false);
        return;
      }

      // Step 1: Create Restaurant
      addStep(steps, "Creating restaurant...");
      let restaurantId: Id<"restaurants">;
      try {
        restaurantId = await createRestaurant(RESTAURANT_DATA);
        addStep(steps, `✓ Restaurant created: ${restaurantId}`);
      } catch (error: any) {
        errors.push(`Failed to create restaurant: ${error.message}`);
        setResult({ success: false, errors, steps });
        setIsRunning(false);
        return;
      }

      // Step 2: Approve Restaurant
      addStep(steps, "Approving restaurant...");
      try {
        await approveRestaurant({ restaurantId });
        addStep(steps, "✓ Restaurant approved");
      } catch (error: any) {
        addStep(steps, `⚠ Could not approve: ${error.message}`);
      }

      // Step 3: Configure Operating Hours
      addStep(steps, "Setting operating hours...");
      try {
        await updateHours({ restaurantId, operatingHours: OPERATING_HOURS });
        addStep(steps, "✓ Operating hours set");
      } catch (error: any) {
        errors.push(`Failed to set hours: ${error.message}`);
      }

      // Step 4: Create Menu Categories
      addStep(steps, "Creating menu categories...");
      const categoryIds: Record<string, Id<"menuCategories">> = {};
      for (const cat of MENU_CATEGORIES) {
        try {
          categoryIds[cat.name] = await createCategory({
            restaurantId,
            name: cat.name,
            description: cat.description,
            sortOrder: cat.sortOrder,
          });
          addStep(steps, `✓ Created category: ${cat.name}`);
        } catch (error: any) {
          errors.push(`Failed to create category ${cat.name}: ${error.message}`);
        }
      }

      // Step 5: Create Menu Items
      addStep(steps, "Creating menu items...");
      const menuItemIds: Record<string, Id<"menuItems">> = {};
      for (const item of MENU_ITEMS) {
        try {
          const categoryId = categoryIds[item.category];
          if (!categoryId) {
            addStep(steps, `⚠ Skipping ${item.name} - no category`);
            continue;
          }
          menuItemIds[item.name] = await createMenuItem({
            restaurantId,
            categoryId,
            name: item.name,
            description: item.description,
            price: item.price,
            sortOrder: item.sortOrder,
          });
          addStep(steps, `✓ Created item: ${item.name} ($${(item.price / 100).toFixed(2)})`);
        } catch (error: any) {
          errors.push(`Failed to create item ${item.name}: ${error.message}`);
        }
      }

      // Step 6: Enable Order Acceptance
      addStep(steps, "Enabling order acceptance...");
      try {
        await toggleOrders({ id: restaurantId });
        addStep(steps, "✓ Order acceptance enabled");
      } catch (error: any) {
        errors.push(`Failed to enable orders: ${error.message}`);
      }

      // Step 7: Place Test Order
      addStep(steps, "Placing test order for ira@irawatkins.com...");
      const orderItems = [
        { name: "Fried Chicken", quantity: 2, price: 1499 },
        { name: "Mac & Cheese", quantity: 1, price: 599 },
        { name: "Collard Greens", quantity: 1, price: 499 },
        { name: "Cornbread", quantity: 2, price: 299 },
        { name: "Sweet Tea", quantity: 2, price: 299 },
      ].map((item) => ({
        menuItemId: menuItemIds[item.name] || ("unknown" as any),
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      }));

      const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const tax = Math.round(subtotal * 0.0875);
      const total = subtotal + tax;

      try {
        const orderResult = await createOrder({
          restaurantId,
          customerName: "Ira Watkins",
          customerEmail: "ira@irawatkins.com",
          customerPhone: "(555) 123-4567",
          items: orderItems,
          subtotal,
          tax,
          total,
          paymentMethod: "pay_at_pickup",
          specialInstructions: "Extra napkins please. Test order for validation.",
        });

        addStep(steps, `✓ Order placed: ${orderResult.orderNumber} ($${(total / 100).toFixed(2)})`);

        // Process through statuses
        addStep(steps, "Processing order through statuses...");
        for (const status of ["CONFIRMED", "PREPARING", "READY_FOR_PICKUP"]) {
          try {
            await updateOrderStatus({ id: orderResult.orderId, status });
            addStep(steps, `✓ Status updated to: ${status}`);
          } catch (error: any) {
            errors.push(`Failed to update status to ${status}: ${error.message}`);
          }
        }

        // Mark as paid
        try {
          await updatePayment({
            id: orderResult.orderId,
            paymentStatus: "paid",
            paymentMethod: "cash",
          });
          addStep(steps, "✓ Payment marked as received");
        } catch (error: any) {
          errors.push(`Failed to mark payment: ${error.message}`);
        }

        // Complete order
        try {
          await updateOrderStatus({ id: orderResult.orderId, status: "COMPLETED" });
          addStep(steps, "✓ Order completed");
        } catch (error: any) {
          errors.push(`Failed to complete order: ${error.message}`);
        }

        setResult({
          success: errors.length === 0,
          restaurantId,
          orderId: orderResult.orderId,
          orderNumber: orderResult.orderNumber,
          errors,
          steps,
        });
      } catch (error: any) {
        errors.push(`Failed to place order: ${error.message}`);
        setResult({ success: false, restaurantId, errors, steps });
      }
    } catch (error: any) {
      errors.push(`Unexpected error: ${error.message}`);
      setResult({ success: false, errors, steps });
    } finally {
      setIsRunning(false);
    }
  };

  const handleSetup = async () => {
    // Use the server-side action if available, otherwise use manual setup
    if (setupTestRestaurant) {
      setIsRunning(true);
      setResult(null);
      try {
        const setupResult = await setupTestRestaurant({ skipIfExists: false });
        setResult(setupResult);
      } catch (error: any) {
        setResult({
          success: false,
          errors: [error.message || "Setup failed"],
          steps: [],
        });
      } finally {
        setIsRunning(false);
      }
    } else {
      await handleManualSetup();
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            End-to-End Restaurant Test Setup
          </h1>
          <p className="text-muted-foreground">
            Create "Steppers Soul Kitchen" with staff, menu, and a test order from ira@irawatkins.com
          </p>
        </div>

        {/* Current Status */}
        <div className="bg-card rounded-xl border border-border p-6 mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">Current Status</h2>

          {stats?.restaurantExists || getRestaurantBySlug ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-medium">{stats?.restaurantName || getRestaurantBySlug?.name}</span>
                <span className="text-sm text-muted-foreground">({stats?.restaurantId || getRestaurantBySlug?._id})</span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <ChefHat className="w-4 h-4" />
                    <span className="text-sm">Restaurant</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${(stats?.isActive || getRestaurantBySlug?.isActive) ? "bg-green-500" : "bg-yellow-500"}`} />
                    <span className="font-medium">{(stats?.isActive || getRestaurantBySlug?.isActive) ? "Active" : "Pending"}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`w-2 h-2 rounded-full ${(stats?.acceptingOrders || getRestaurantBySlug?.acceptingOrders) ? "bg-green-500" : "bg-red-500"}`} />
                    <span className="text-sm text-muted-foreground">
                      {(stats?.acceptingOrders || getRestaurantBySlug?.acceptingOrders) ? "Accepting Orders" : "Not Accepting"}
                    </span>
                  </div>
                </div>

                {stats?.stats && (
                  <>
                    <div className="bg-muted/50 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <ShoppingBag className="w-4 h-4" />
                        <span className="text-sm">Orders</span>
                      </div>
                      <p className="text-2xl font-bold">{stats.stats.orders}</p>
                      <p className="text-xs text-muted-foreground">
                        {stats.stats.pendingOrders} pending, {stats.stats.completedOrders} completed
                      </p>
                    </div>

                    <div className="bg-muted/50 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Users className="w-4 h-4" />
                        <span className="text-sm">Staff</span>
                      </div>
                      <p className="text-2xl font-bold">{stats.stats.staff}</p>
                      <p className="text-xs text-muted-foreground">
                        {stats.stats.activeStaff} active, {stats.stats.pendingInvites} pending
                      </p>
                    </div>

                    <div className="bg-muted/50 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <UtensilsCrossed className="w-4 h-4" />
                        <span className="text-sm">Menu</span>
                      </div>
                      <p className="text-2xl font-bold">{stats.stats.menuItems}</p>
                      <p className="text-xs text-muted-foreground">
                        {stats.stats.categories} categories, {stats.stats.availableItems} available
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : getRestaurantBySlug === undefined ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Loading...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-muted-foreground">
              <XCircle className="w-5 h-5" />
              <span>Test restaurant not set up yet</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={handleSetup}
            disabled={isRunning}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isRunning ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Running Setup...
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                Run Full Setup
              </>
            )}
          </button>

          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-4 py-3 border border-border rounded-lg font-medium hover:bg-muted transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh Status
          </button>
        </div>

        {/* Results */}
        {result && (
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div
              className={`p-4 ${
                result.success
                  ? "bg-green-50 dark:bg-green-900/20 border-b border-green-200 dark:border-green-800"
                  : "bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800"
              }`}
            >
              <div className="flex items-center gap-2">
                {result.success ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-800 dark:text-green-200">Setup Completed</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-red-600" />
                    <span className="font-medium text-red-800 dark:text-red-200">Setup Failed</span>
                  </>
                )}
              </div>
              {result.restaurantId && (
                <p className="text-sm text-muted-foreground mt-1">
                  Restaurant ID: {result.restaurantId}
                </p>
              )}
              {result.orderNumber && (
                <p className="text-sm text-muted-foreground">
                  Order: {result.orderNumber}
                </p>
              )}
            </div>

            {/* Steps Log */}
            <div className="p-4">
              <h3 className="font-medium text-foreground mb-3">Execution Log</h3>
              <div className="bg-muted/50 rounded-lg p-4 font-mono text-sm max-h-96 overflow-y-auto">
                {result.steps.map((step, i) => (
                  <div
                    key={i}
                    className={`py-1 ${
                      step.startsWith("✓") ? "text-green-600" :
                      step.startsWith("⚠") ? "text-yellow-600" :
                      "text-foreground"
                    }`}
                  >
                    {step}
                  </div>
                ))}
              </div>
            </div>

            {/* Errors */}
            {result.errors.length > 0 && (
              <div className="p-4 border-t border-border">
                <h3 className="font-medium text-red-600 mb-3">Errors ({result.errors.length})</h3>
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                  {result.errors.map((error, i) => (
                    <div key={i} className="text-red-800 dark:text-red-200 text-sm py-1">
                      {error}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
          <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-3">What This Test Does</h3>
          <ul className="space-y-2 text-blue-700 dark:text-blue-300 text-sm">
            <li>1. Creates restaurant "Steppers Soul Kitchen" in Chicago</li>
            <li>2. Approves the restaurant (requires admin permission)</li>
            <li>3. Configures operating hours (Mon-Sun)</li>
            <li>4. Invites 2 staff members (manager + staff)</li>
            <li>5. Creates 5 menu categories and 8 menu items</li>
            <li>6. Enables order acceptance</li>
            <li>7. Places a test order as ira@irawatkins.com ($51.04)</li>
            <li>8. Processes order: PENDING → CONFIRMED → PREPARING → READY → COMPLETED</li>
            <li>9. Marks payment as received</li>
          </ul>

          <h3 className="font-semibold text-blue-800 dark:text-blue-200 mt-6 mb-3">Verify After Running</h3>
          <ul className="space-y-2 text-blue-700 dark:text-blue-300 text-sm">
            <li>• Check <a href="/restaurateur/dashboard" className="underline">Restaurateur Dashboard</a> for activity feed</li>
            <li>• Check <a href="/restaurateur/dashboard/orders" className="underline">Orders Dashboard</a> for the test order</li>
            <li>• Check <a href="/restaurateur/dashboard/staff" className="underline">Staff Dashboard</a> for invited members</li>
            <li>• Check <a href="/restaurants/steppers-soul-kitchen" className="underline">Restaurant Page</a> for menu</li>
            <li>• Check <a href="/admin/restaurants" className="underline">Admin Restaurants</a> for status</li>
            <li>• Check notification log in Convex dashboard for emails</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
