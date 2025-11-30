"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Play,
  Trash2,
  RefreshCw,
  CheckCircle,
  XCircle,
  Ticket,
  Package,
  Tag,
  Calendar,
  DollarSign,
  Users,
  ExternalLink,
  UserPlus,
  ShoppingCart,
  QrCode,
  Zap,
  ClipboardList,
  ScanLine,
} from "lucide-react";
import Link from "next/link";

export default function TestingDashboard() {
  const [isLoading, setIsLoading] = useState(false);
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Get current test status
  const testStatus = useQuery(api.testing.realWorldTicketTest.getTestStatus);
  const fullStatus = useQuery(api.testing.realWorldTicketTest.getFullTestStatus);

  const runAction = async (action: string, method: string = "GET") => {
    setIsLoading(true);
    setActiveAction(action);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`/api/testing/${action}`, { method });
      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || `Failed to run ${action}`);
      }
    } catch (err: any) {
      setError(err.message || "Network error");
    } finally {
      setIsLoading(false);
      setActiveAction(null);
    }
  };

  const runCompleteE2ETest = () => runAction("e2e-test");
  const runTestSetup = () => runAction("setup-events");
  const cleanupTestData = async () => {
    if (!confirm("Are you sure you want to delete all test events, staff, orders, and tickets?")) return;
    runAction("setup-events", "DELETE");
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Complete E2E Ticket Testing</h1>
          <p className="text-muted-foreground mt-2">
            Full end-to-end testing: Events, Staff, Customers, Purchases, QR Codes, and Scanning
          </p>
        </div>

        {/* Main Action - Complete E2E Test */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-xl p-6 mb-8 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                <Zap className="w-6 h-6" />
                Run Complete E2E Test
              </h2>
              <p className="text-purple-100 text-sm">
                Creates 3 events, staff/associates, simulates purchases, generates tickets with QR codes, and tests scanning
              </p>
            </div>
            <button
              onClick={runCompleteE2ETest}
              disabled={isLoading}
              className="flex items-center gap-2 px-8 py-4 bg-white text-purple-600 rounded-lg font-bold hover:bg-purple-50 transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              {isLoading && activeAction === "e2e-test" ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <Play className="w-5 h-5" />
              )}
              Run Full E2E Test
            </button>
          </div>
        </div>

        {/* Individual Actions */}
        <div className="bg-card rounded-xl border border-border p-6 mb-8">
          <h2 className="text-lg font-bold text-foreground mb-4">Individual Test Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={runTestSetup}
              disabled={isLoading}
              className="flex flex-col items-center gap-2 p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors disabled:opacity-50"
            >
              <Calendar className="w-6 h-6" />
              <span className="text-sm font-medium">Create Events</span>
            </button>
            <button
              onClick={() => runAction("add-staff")}
              disabled={isLoading}
              className="flex flex-col items-center gap-2 p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors disabled:opacity-50"
            >
              <UserPlus className="w-6 h-6" />
              <span className="text-sm font-medium">Add Staff</span>
            </button>
            <button
              onClick={() => runAction("simulate-purchases")}
              disabled={isLoading}
              className="flex flex-col items-center gap-2 p-4 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors disabled:opacity-50"
            >
              <ShoppingCart className="w-6 h-6" />
              <span className="text-sm font-medium">Simulate Purchases</span>
            </button>
            <button
              onClick={() => runAction("simulate-scanning")}
              disabled={isLoading}
              className="flex flex-col items-center gap-2 p-4 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors disabled:opacity-50"
            >
              <ScanLine className="w-6 h-6" />
              <span className="text-sm font-medium">Simulate Scanning</span>
            </button>
          </div>
          <div className="mt-4 flex gap-4">
            <button
              onClick={cleanupTestData}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20 transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              Clean Up All Test Data
            </button>
          </div>
        </div>

        {/* Result/Error Display */}
        {error && (
          <div className="bg-destructive/10 border border-destructive rounded-xl p-6 mb-8">
            <div className="flex items-center gap-3">
              <XCircle className="w-6 h-6 text-destructive" />
              <div>
                <h3 className="font-bold text-destructive">Error</h3>
                <p className="text-destructive/80">{error}</p>
              </div>
            </div>
          </div>
        )}

        {result && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-500 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="font-bold text-green-700 dark:text-green-400 mb-2">{result.message}</h3>

                {result.summary && (
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                    {result.summary.eventsCreated !== undefined && (
                      <div className="bg-white dark:bg-background rounded-lg p-3">
                        <p className="text-2xl font-bold text-foreground">{result.summary.eventsCreated}</p>
                        <p className="text-xs text-muted-foreground">Events</p>
                      </div>
                    )}
                    {result.summary.staffCreated !== undefined && (
                      <div className="bg-white dark:bg-background rounded-lg p-3">
                        <p className="text-2xl font-bold text-foreground">{result.summary.staffCreated}</p>
                        <p className="text-xs text-muted-foreground">Staff Added</p>
                      </div>
                    )}
                    {result.summary.ordersCreated !== undefined && (
                      <div className="bg-white dark:bg-background rounded-lg p-3">
                        <p className="text-2xl font-bold text-foreground">{result.summary.ordersCreated}</p>
                        <p className="text-xs text-muted-foreground">Orders</p>
                      </div>
                    )}
                    {result.summary.ticketsGenerated !== undefined && (
                      <div className="bg-white dark:bg-background rounded-lg p-3">
                        <p className="text-2xl font-bold text-foreground">{result.summary.ticketsGenerated}</p>
                        <p className="text-xs text-muted-foreground">Tickets</p>
                      </div>
                    )}
                    {result.summary.ticketsScanned !== undefined && (
                      <div className="bg-white dark:bg-background rounded-lg p-3">
                        <p className="text-2xl font-bold text-foreground">{result.summary.ticketsScanned}</p>
                        <p className="text-xs text-muted-foreground">Scanned</p>
                      </div>
                    )}
                    {result.summary.totalTicketTiers !== undefined && (
                      <div className="bg-white dark:bg-background rounded-lg p-3">
                        <p className="text-2xl font-bold text-foreground">{result.summary.totalTicketTiers}</p>
                        <p className="text-xs text-muted-foreground">Ticket Tiers</p>
                      </div>
                    )}
                    {result.summary.bundlesCreated !== undefined && (
                      <div className="bg-white dark:bg-background rounded-lg p-3">
                        <p className="text-2xl font-bold text-foreground">{result.summary.bundlesCreated}</p>
                        <p className="text-xs text-muted-foreground">Bundles</p>
                      </div>
                    )}
                  </div>
                )}

                {result.testingGuide && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-white dark:bg-background rounded-lg p-4">
                      <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                        <ShoppingCart className="w-4 h-4" />
                        Customer Flow
                      </h4>
                      <ol className="list-decimal list-inside space-y-1 text-xs text-muted-foreground">
                        {result.testingGuide.customerFlow?.map((step: string, i: number) => (
                          <li key={i}>{step}</li>
                        ))}
                      </ol>
                    </div>
                    <div className="bg-white dark:bg-background rounded-lg p-4">
                      <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Organizer Flow
                      </h4>
                      <ol className="list-decimal list-inside space-y-1 text-xs text-muted-foreground">
                        {result.testingGuide.organizerFlow?.map((step: string, i: number) => (
                          <li key={i}>{step}</li>
                        ))}
                      </ol>
                    </div>
                    <div className="bg-white dark:bg-background rounded-lg p-4">
                      <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                        <ScanLine className="w-4 h-4" />
                        Staff/Scanner Flow
                      </h4>
                      <ol className="list-decimal list-inside space-y-1 text-xs text-muted-foreground">
                        {result.testingGuide.staffFlow?.map((step: string, i: number) => (
                          <li key={i}>{step}</li>
                        ))}
                      </ol>
                    </div>
                    <div className="bg-white dark:bg-background rounded-lg p-4">
                      <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        Associate/Seller Flow
                      </h4>
                      <ol className="list-decimal list-inside space-y-1 text-xs text-muted-foreground">
                        {result.testingGuide.associateFlow?.map((step: string, i: number) => (
                          <li key={i}>{step}</li>
                        ))}
                      </ol>
                    </div>
                  </div>
                )}

                {result.testingInstructions && !result.testingGuide && (
                  <div className="bg-white dark:bg-background rounded-lg p-4">
                    <h4 className="font-semibold text-foreground mb-2">Testing Instructions:</h4>
                    <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                      {Object.values(result.testingInstructions).map((step: any, i: number) => (
                        <li key={i}>{step}</li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Full Test Status Dashboard */}
        {fullStatus?.setupComplete && (
          <div className="bg-card rounded-xl border border-border p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-foreground">Full Test Environment Status</h2>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Ticket className="w-4 h-4" />
                  {fullStatus.totals.tickets} tickets
                </span>
                <span className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  {fullStatus.totals.revenue}
                </span>
              </div>
            </div>

            {/* Totals Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-foreground">{fullStatus.totals.events}</p>
                <p className="text-xs text-muted-foreground">Events</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-foreground">{fullStatus.totals.ticketTiers}</p>
                <p className="text-xs text-muted-foreground">Tiers</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-foreground">{fullStatus.totals.bundles}</p>
                <p className="text-xs text-muted-foreground">Bundles</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-foreground">{fullStatus.totals.discountCodes}</p>
                <p className="text-xs text-muted-foreground">Codes</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-foreground">{fullStatus.totals.staff}</p>
                <p className="text-xs text-muted-foreground">Staff</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-foreground">{fullStatus.totals.orders}</p>
                <p className="text-xs text-muted-foreground">Orders</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-foreground">{fullStatus.totals.tickets}</p>
                <p className="text-xs text-muted-foreground">Tickets</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-foreground">{fullStatus.totals.scannedTickets}</p>
                <p className="text-xs text-muted-foreground">Scanned</p>
              </div>
            </div>

            {/* Events Detail */}
            <div className="space-y-6">
              {fullStatus.events.map((event: any) => (
                <div key={event.id} className="border border-border rounded-lg overflow-hidden">
                  {/* Event Header with Image */}
                  <div className="relative h-32 bg-gradient-to-r from-purple-600 to-purple-800">
                    {event.imageUrl && (
                      <img
                        src={event.imageUrl}
                        alt={event.name}
                        className="absolute inset-0 w-full h-full object-cover opacity-50"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="font-bold text-white text-lg">{event.name}</h3>
                      <p className="text-white/80 text-sm">{event.date} • {event.location}</p>
                    </div>
                    <div className="absolute top-4 right-4 flex gap-2">
                      <Link
                        href={`/events/${event.id}`}
                        className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-sm rounded-lg hover:bg-white/30"
                      >
                        View Event
                      </Link>
                      <Link
                        href={`/events/${event.id}/checkout`}
                        className="px-3 py-1 bg-white text-purple-600 text-sm rounded-lg hover:bg-purple-50"
                      >
                        Test Checkout
                      </Link>
                    </div>
                  </div>

                  <div className="p-4">
                    {/* Stats Row */}
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-4">
                      <div className="text-center">
                        <p className="text-lg font-bold text-foreground">{event.stats.totalOrders}</p>
                        <p className="text-xs text-muted-foreground">Orders</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-foreground">{event.stats.totalTickets}</p>
                        <p className="text-xs text-muted-foreground">Tickets</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-green-600">{event.stats.validTickets}</p>
                        <p className="text-xs text-muted-foreground">Valid</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-blue-600">{event.stats.scannedTickets}</p>
                        <p className="text-xs text-muted-foreground">Scanned</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-purple-600">{event.stats.checkInRate}</p>
                        <p className="text-xs text-muted-foreground">Check-in</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-foreground">{event.stats.revenue}</p>
                        <p className="text-xs text-muted-foreground">Revenue</p>
                      </div>
                    </div>

                    {/* Ticket Tiers */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                        <Ticket className="w-4 h-4" />
                        Ticket Tiers
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        {event.ticketTiers.map((tier: any, i: number) => (
                          <div key={i} className="bg-muted/50 rounded-lg p-3 flex items-center justify-between">
                            <div>
                              <p className="font-medium text-foreground text-sm">{tier.name}</p>
                              <p className="text-xs text-muted-foreground">{tier.price}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-foreground">{tier.sold} sold</p>
                              <p className="text-xs text-muted-foreground">{tier.available} left</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Staff Members */}
                    {event.staff.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          Staff & Associates ({event.staff.length})
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {event.staff.map((s: any, i: number) => (
                            <div key={i} className="bg-blue-50 dark:bg-blue-900/20 rounded-lg px-3 py-2">
                              <p className="font-medium text-blue-700 dark:text-blue-300 text-sm">{s.name}</p>
                              <p className="text-xs text-blue-600 dark:text-blue-400">
                                {s.role} • Code: {s.referralCode} {s.canScan && "• Can Scan"}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Discount Codes */}
                    {event.discountCodes.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                          <Tag className="w-4 h-4" />
                          Discount Codes
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {event.discountCodes.map((code: any, i: number) => (
                            <span
                              key={i}
                              className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-3 py-1 rounded-full text-sm font-mono"
                            >
                              {code.code} ({code.value})
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Quick Test Links */}
                    <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
                      <Link
                        href={`/scan/${event.id}`}
                        className="flex items-center gap-1 px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg text-sm hover:bg-purple-200 dark:hover:bg-purple-900/50"
                      >
                        <QrCode className="w-4 h-4" />
                        Test Scanner
                      </Link>
                      <Link
                        href={`/organizer/events/${event.id}`}
                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-sm hover:bg-blue-200 dark:hover:bg-blue-900/50"
                      >
                        <ClipboardList className="w-4 h-4" />
                        Organizer View
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {(!fullStatus?.setupComplete && testStatus?.events?.length === 0) && (
          <div className="bg-card rounded-xl border border-border p-12 text-center">
            <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-bold text-foreground mb-2">No Test Data</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Click "Run Full E2E Test" to create test events, staff, customers, purchases, and tickets
            </p>
            <button
              onClick={runCompleteE2ETest}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <Zap className="w-5 h-5" />
              )}
              Run Full E2E Test
            </button>
          </div>
        )}

        {/* Test Accounts Reference */}
        <div className="bg-card rounded-xl border border-border p-6 mb-8">
          <h2 className="text-lg font-bold text-foreground mb-4">Test Account Credentials</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">Organizer</h3>
              <p className="text-sm text-muted-foreground font-mono">test-organizer@stepperslife.com</p>
              <p className="text-xs text-muted-foreground mt-1">Can create events, view dashboard</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">Scanner (Staff)</h3>
              <p className="text-sm text-muted-foreground font-mono">scanner1@stepperslife.com</p>
              <p className="text-xs text-muted-foreground mt-1">Can scan tickets at door</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">Top Seller (Associate)</h3>
              <p className="text-sm text-muted-foreground font-mono">topseller@stepperslife.com</p>
              <p className="text-xs text-muted-foreground mt-1">Referral code: DARNELL10 (10%)</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">Customer</h3>
              <p className="text-sm text-muted-foreground font-mono">michael.r@example.com</p>
              <p className="text-xs text-muted-foreground mt-1">Has purchased tickets</p>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Link
            href="/events"
            className="bg-card border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors"
          >
            <Calendar className="w-6 h-6 text-primary mb-2" />
            <p className="font-medium text-foreground text-sm">Events Page</p>
            <p className="text-xs text-muted-foreground">Browse events</p>
          </Link>
          <Link
            href="/my-tickets"
            className="bg-card border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors"
          >
            <Ticket className="w-6 h-6 text-primary mb-2" />
            <p className="font-medium text-foreground text-sm">My Tickets</p>
            <p className="text-xs text-muted-foreground">View tickets</p>
          </Link>
          <Link
            href="/organizer/events"
            className="bg-card border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors"
          >
            <Users className="w-6 h-6 text-primary mb-2" />
            <p className="font-medium text-foreground text-sm">Organizer</p>
            <p className="text-xs text-muted-foreground">Manage events</p>
          </Link>
          <Link
            href="/staff/scan-tickets"
            className="bg-card border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors"
          >
            <QrCode className="w-6 h-6 text-primary mb-2" />
            <p className="font-medium text-foreground text-sm">Scanner</p>
            <p className="text-xs text-muted-foreground">Scan tickets</p>
          </Link>
          <Link
            href="/staff/dashboard"
            className="bg-card border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors"
          >
            <DollarSign className="w-6 h-6 text-primary mb-2" />
            <p className="font-medium text-foreground text-sm">Staff Portal</p>
            <p className="text-xs text-muted-foreground">Commissions</p>
          </Link>
          <Link
            href="/admin"
            className="bg-card border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors"
          >
            <ClipboardList className="w-6 h-6 text-primary mb-2" />
            <p className="font-medium text-foreground text-sm">Admin</p>
            <p className="text-xs text-muted-foreground">Platform overview</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
