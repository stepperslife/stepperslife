"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { Download, ArrowLeft, CheckCircle, Clock, XCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function PayoutsPage() {
  const currentUser = useQuery(api.users.queries.getCurrentUser);

  const isLoading = currentUser === undefined;

  if (isLoading || currentUser === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading payouts...</p>
        </div>
      </div>
    );
  }

  // TODO: Fetch actual payouts from database
  const mockPayouts = [
    {
      id: "1",
      date: "2024-01-15",
      amount: 1250.0,
      status: "completed",
      method: "Bank Transfer",
    },
    {
      id: "2",
      date: "2024-01-08",
      amount: 890.5,
      status: "completed",
      method: "Bank Transfer",
    },
    {
      id: "3",
      date: "2024-01-01",
      amount: 2100.75,
      status: "pending",
      method: "Bank Transfer",
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-success/20 text-success flex items-center gap-1 w-fit">
            <CheckCircle className="w-3 h-3" />
            Completed
          </span>
        );
      case "pending":
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-warning/20 text-warning-foreground flex items-center gap-1 w-fit">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
      case "failed":
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-destructive/20 text-destructive flex items-center gap-1 w-fit">
            <XCircle className="w-3 h-3" />
            Failed
          </span>
        );
      default:
        return null;
    }
  };

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
              href="/organizer/earnings"
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Payout History</h1>
              <p className="text-muted-foreground mt-1">View all your past and upcoming payouts</p>
            </div>
          </div>
        </div>
      </motion.header>

      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-lg shadow-md overflow-hidden"
        >
          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-border">
            {mockPayouts.map((payout) => (
              <div key={payout.id} className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium text-foreground">
                      ${payout.amount.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(payout.date).toLocaleDateString()} • {payout.method}
                    </p>
                  </div>
                  {getStatusBadge(payout.status)}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-card">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                    Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-border">
                {mockPayouts.map((payout) => (
                  <tr key={payout.id} className="hover:bg-card">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      {new Date(payout.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                      ${payout.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {payout.method}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(payout.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
