"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import {
  DollarSign,
  TrendingUp,
  Clock,
  ArrowRight,
  Wallet,
  Download,
} from "lucide-react";
import { motion } from "framer-motion";

export default function EarningsPage() {
  const currentUser = useQuery(api.users.queries.getCurrentUser);
  const events = useQuery(api.events.queries.getOrganizerEvents, {
    userId: currentUser?._id,
  });

  const isLoading = currentUser === undefined || events === undefined;

  // Show loading while Convex queries are loading
  if (isLoading || currentUser === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading earnings...</p>
        </div>
      </div>
    );
  }

  // Calculate earnings
  const totalRevenue =
    events?.reduce((sum, event) => sum + (event.totalRevenue || 0), 0) || 0;
  const pendingPayout = totalRevenue; // TODO: Calculate actual pending amount
  const totalPaidOut = 0; // TODO: Get from payouts table
  const nextPayoutDate = "Next Monday"; // TODO: Calculate actual payout date

  const stats = [
    {
      title: "Total Revenue",
      value: `$${totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "bg-success",
      description: "All-time ticket sales",
    },
    {
      title: "Pending Payout",
      value: `$${pendingPayout.toLocaleString()}`,
      icon: Clock,
      color: "bg-warning",
      description: "Ready for payout",
    },
    {
      title: "Total Paid Out",
      value: `$${totalPaidOut.toLocaleString()}`,
      icon: Wallet,
      color: "bg-primary",
      description: "Successfully transferred",
    },
  ];

  const quickActions = [
    {
      title: "Payout History",
      description: "View all your past payouts",
      icon: Download,
      href: "/organizer/earnings/payouts",
      color: "bg-blue-500",
    },
    {
      title: "Transactions",
      description: "See detailed transaction history",
      icon: TrendingUp,
      href: "/organizer/earnings/transactions",
      color: "bg-green-500",
    },
    {
      title: "Payment Setup",
      description: "Configure your payout methods",
      icon: Wallet,
      href: "/organizer/payment-methods",
      color: "bg-purple-500",
    },
  ];

  return (
    <div className="min-h-screen bg-muted">
      {/* Header */}
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white shadow-sm border-b"
      >
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Earnings</h1>
              <p className="text-muted-foreground mt-1">Track your revenue and payouts</p>
            </div>
            <Link
              href="/organizer/earnings/payouts"
              className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors shadow-md hover:shadow-lg"
            >
              <Download className="w-5 h-5" />
              View Payouts
            </Link>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Statistics Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} p-3 rounded-lg text-white`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
              <h3 className="text-muted-foreground text-sm font-medium mb-1">{stat.title}</h3>
              <p className="text-3xl font-bold text-foreground mb-1">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.description}</p>
            </div>
          ))}
        </motion.div>

        {/* Next Payout Info */}
        {pendingPayout > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg shadow-lg p-8 text-white mb-8"
          >
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-6 h-6" />
                  <h2 className="text-2xl font-bold">Next Payout</h2>
                </div>
                <p className="text-white/90 mb-4">Scheduled for {nextPayoutDate}</p>
                <div className="text-4xl font-bold mb-2">${pendingPayout.toLocaleString()}</div>
                <p className="text-white/90">Will be transferred to your account</p>
              </div>
              <div className="flex flex-col gap-3">
                <Link
                  href="/organizer/earnings/payouts"
                  className="px-6 py-3 bg-white text-green-600 rounded-lg hover:bg-gray-100 transition-colors font-medium text-center"
                >
                  View Payout Details
                </Link>
                <Link
                  href="/organizer/payment-methods"
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors font-medium text-center"
                >
                  Manage Payment Methods
                </Link>
              </div>
            </div>
          </motion.div>
        )}

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-foreground mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                href={action.href}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all hover:-translate-y-1"
              >
                <div className={`${action.color} p-3 rounded-lg text-white w-fit mb-4`}>
                  <action.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">{action.title}</h3>
                <p className="text-muted-foreground mb-4">{action.description}</p>
                <div className="flex items-center text-primary font-medium">
                  View {action.title.toLowerCase()}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Revenue Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white rounded-lg shadow-md overflow-hidden"
        >
          <div className="px-6 py-4 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">Revenue by Event</h2>
              <Link
                href="/organizer/earnings/transactions"
                className="text-primary hover:underline flex items-center gap-1 text-sm"
              >
                View all transactions
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {events && events.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Event
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Tickets Sold
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Revenue
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {events.slice(0, 10).map((event) => {
                    const revenue = event.totalRevenue || 0;
                    const ticketsSold = event.ticketsSold || 0;

                    return (
                      <tr key={event._id} className="hover:bg-muted">
                        <td className="px-6 py-4">
                          <Link
                            href={`/organizer/events/${event._id}`}
                            className="text-sm font-medium text-primary hover:underline"
                          >
                            {event.title}
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                          {ticketsSold.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                          ${revenue.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-warning/10 text-warning">
                            Pending
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <DollarSign className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-medium text-foreground mb-2">No earnings yet</h3>
              <p className="text-muted-foreground mb-6">
                Start selling tickets to track your earnings
              </p>
              <Link
                href="/organizer/events/create"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                Create Event
              </Link>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
