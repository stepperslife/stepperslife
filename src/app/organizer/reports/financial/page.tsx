"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { DollarSign, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function FinancialReportsPage() {
  const currentUser = useQuery(api.users.queries.getCurrentUser);
  const events = useQuery(
    api.events.queries.getOrganizerEvents,
    currentUser?._id ? { userId: currentUser._id } : "skip"
  );

  const isLoading = currentUser === undefined || events === undefined;

  if (isLoading || currentUser === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading financial reports...</p>
        </div>
      </div>
    );
  }

  const totalRevenue = 0; // TODO: Calculate from orders/tickets
  const totalEvents = events?.length || 0;
  const avgRevenuePerEvent = totalEvents > 0 ? totalRevenue / totalEvents : 0;

  return (
    <div className="min-h-screen bg-card">
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white shadow-sm border-b"
      >
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link
              href="/organizer/reports"
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Financial Reports</h1>
              <p className="text-muted-foreground mt-1">Detailed financial breakdowns and summaries</p>
            </div>
          </div>
        </div>
      </motion.header>

      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-lg shadow-md p-8 text-center"
        >
          <DollarSign className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-medium text-foreground mb-2">Financial Reports Coming Soon</h3>
          <p className="text-muted-foreground mb-6">
            Comprehensive financial analytics and export options will be available here
          </p>
          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
            <div className="bg-success/10 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold text-foreground">${totalRevenue.toLocaleString()}</p>
            </div>
            <div className="bg-info/10 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Events</p>
              <p className="text-2xl font-bold text-foreground">{totalEvents}</p>
            </div>
            <div className="bg-sky-50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Avg/Event</p>
              <p className="text-2xl font-bold text-foreground">
                ${Math.round(avgRevenuePerEvent).toLocaleString()}
              </p>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
