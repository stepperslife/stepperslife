"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { BarChart3, ArrowLeft, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

export default function SalesReportsPage() {
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
          <p className="mt-4 text-muted-foreground">Loading sales reports...</p>
        </div>
      </div>
    );
  }

  const totalRevenue = 0; // TODO: Calculate from orders/tickets
  const totalTicketsSold = events?.reduce((sum, e) => sum + (e.ticketsSold || 0), 0) || 0;

  return (
    <div className="min-h-screen bg-gray-50">
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
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Sales Reports</h1>
              <p className="text-gray-600 mt-1">Analyze your ticket sales performance</p>
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
          <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">Sales Reports Coming Soon</h3>
          <p className="text-gray-600 mb-6">
            Detailed sales analytics and charts will be available here
          </p>
          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${totalRevenue.toLocaleString()}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Tickets Sold</p>
              <p className="text-2xl font-bold text-gray-900">{totalTicketsSold.toLocaleString()}</p>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
