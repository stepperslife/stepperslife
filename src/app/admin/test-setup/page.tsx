"use client";

import { useState } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  Play,
  Trash2,
  RefreshCw,
  ChefHat,
  Users,
  ShoppingBag,
  UtensilsCrossed,
} from "lucide-react";

export default function TestSetupPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    restaurantId?: string;
    orderId?: string;
    orderNumber?: string;
    errors: string[];
    steps: string[];
  } | null>(null);

  const setupTestRestaurant = useAction(api.testSetup.setupTestRestaurant);
  const stats = useQuery(api.testSetup.getTestOrderStats);

  const handleSetup = async () => {
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
        {stats && (
          <div className="bg-card rounded-xl border border-border p-6 mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4">Current Status</h2>

            {stats.restaurantExists ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-medium">{stats.restaurantName}</span>
                  <span className="text-sm text-muted-foreground">({stats.restaurantId})</span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <ChefHat className="w-4 h-4" />
                      <span className="text-sm">Restaurant</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${stats.isActive ? "bg-green-500" : "bg-yellow-500"}`} />
                      <span className="font-medium">{stats.isActive ? "Active" : "Pending"}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`w-2 h-2 rounded-full ${stats.acceptingOrders ? "bg-green-500" : "bg-red-500"}`} />
                      <span className="text-sm text-muted-foreground">
                        {stats.acceptingOrders ? "Accepting Orders" : "Not Accepting"}
                      </span>
                    </div>
                  </div>

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
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-muted-foreground">
                <XCircle className="w-5 h-5" />
                <span>Test restaurant not set up yet</span>
              </div>
            )}
          </div>
        )}

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
