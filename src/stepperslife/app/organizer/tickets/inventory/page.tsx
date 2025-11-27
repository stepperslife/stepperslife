"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import {
  Package,
  ArrowLeft,
  Calendar,
  Ticket,
  TrendingUp,
  Search,
} from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

export default function TicketInventoryPage() {
  const currentUser = useQuery(api.users.queries.getCurrentUser);
  const events = useQuery(api.events.queries.getOrganizerEvents, {
    userId: currentUser?._id,
  });

  const [searchQuery, setSearchQuery] = useState("");

  const isLoading = currentUser === undefined || events === undefined;

  // Show loading while Convex queries are loading
  if (isLoading || currentUser === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading inventory...</p>
        </div>
      </div>
    );
  }

  // Filter events by search query
  const filteredEvents =
    events?.filter((event) =>
      event.title.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  // Calculate totals
  const totalTickets =
    filteredEvents.reduce((sum, event) => sum + (event.totalTickets || 0), 0) || 0;
  const totalSold =
    filteredEvents.reduce((sum, event) => sum + (event.ticketsSold || 0), 0) || 0;
  const totalAvailable = totalTickets - totalSold;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white shadow-sm border-b"
      >
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link
              href="/organizer/tickets"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Ticket Inventory</h1>
              <p className="text-gray-600 mt-1">View and manage all your event tickets</p>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Summary Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-500 p-3 rounded-lg text-white">
                <Package className="w-6 h-6" />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Total Tickets</h3>
            <p className="text-3xl font-bold text-gray-900">{totalTickets.toLocaleString()}</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-500 p-3 rounded-lg text-white">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Tickets Sold</h3>
            <p className="text-3xl font-bold text-gray-900">{totalSold.toLocaleString()}</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-500 p-3 rounded-lg text-white">
                <Ticket className="w-6 h-6" />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Available</h3>
            <p className="text-3xl font-bold text-gray-900">{totalAvailable.toLocaleString()}</p>
          </div>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </motion.div>

        {/* Inventory Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-lg shadow-md overflow-hidden"
        >
          {filteredEvents && filteredEvents.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Event
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Tickets
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sold
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Available
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredEvents.map((event) => {
                    const totalTickets = event.totalTickets || 0;
                    const ticketsSold = event.ticketsSold || 0;
                    const available = totalTickets - ticketsSold;
                    const percentSold = totalTickets > 0 ? (ticketsSold / totalTickets) * 100 : 0;

                    return (
                      <tr key={event._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <Calendar className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                            <div>
                              <Link
                                href={`/organizer/events/${event._id}`}
                                className="text-sm font-medium text-primary hover:underline"
                              >
                                {event.title}
                              </Link>
                              <div className="text-sm text-gray-500">
                                {event.startDate
                                  ? new Date(event.startDate).toLocaleDateString()
                                  : "Date TBD"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                            {event.eventType || "Event"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                          {totalTickets.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {ticketsSold.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {available.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                              <div
                                className={`h-2 rounded-full ${
                                  percentSold >= 90
                                    ? "bg-red-500"
                                    : percentSold >= 70
                                    ? "bg-yellow-500"
                                    : "bg-green-500"
                                }`}
                                style={{ width: `${Math.min(percentSold, 100)}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600 whitespace-nowrap">
                              {Math.round(percentSold)}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                {searchQuery ? "No events found" : "No tickets yet"}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchQuery
                  ? "Try adjusting your search query"
                  : "Purchase tickets to see them in your inventory"}
              </p>
              {!searchQuery && (
                <Link
                  href="/organizer/tickets/purchase"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Purchase Tickets
                </Link>
              )}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
