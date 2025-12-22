"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { TrendingUp, ArrowLeft, Calendar, Search } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

interface Transaction {
  id: string;
  eventTitle: string;
  date: number;
  amount: number;
  type: string;
}

export default function TransactionsPage() {
  const currentUser = useQuery(api.users.queries.getCurrentUser);
  const events = useQuery(api.events.queries.getOrganizerEvents, {
    userId: currentUser?._id,
  });

  const [searchQuery, setSearchQuery] = useState("");

  const isLoading = currentUser === undefined || events === undefined;

  if (isLoading || currentUser === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading transactions...</p>
        </div>
      </div>
    );
  }

  // TODO: Fetch actual transactions from database
  const mockTransactions: Transaction[] = events?.flatMap((event) =>
    Array.from({ length: Math.min(5, event.ticketsSold || 0) }).map((_, i) => ({
      id: `${event._id}-${i}`,
      eventTitle: event.name,
      date: Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
      amount: Math.random() * 100 + 20,
      type: "Ticket Sale",
    }))
  ) || [];

  const filteredTransactions = mockTransactions.filter(
    (t) => t.eventTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              <h1 className="text-3xl font-bold text-foreground">Transaction History</h1>
              <p className="text-muted-foreground mt-1">Detailed view of all your transactions</p>
            </div>
          </div>
        </div>
      </motion.header>

      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-lg shadow-md overflow-hidden"
        >
          {filteredTransactions.length > 0 ? (
            <>
              {/* Mobile Card View */}
              <div className="md:hidden divide-y divide-border">
                {filteredTransactions.slice(0, 50).map((transaction) => (
                  <div key={transaction.id} className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2 text-sm text-foreground">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          {transaction.eventTitle}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(transaction.date).toLocaleDateString()} • {transaction.type}
                        </p>
                      </div>
                      <span className="text-sm font-medium text-success">
                        +${transaction.amount.toFixed(2)}
                      </span>
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
                        Event
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-border">
                    {filteredTransactions.slice(0, 50).map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-card">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                          {new Date(transaction.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            {transaction.eventTitle}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          {transaction.type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-success">
                          +${transaction.amount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="p-12 text-center">
              <TrendingUp className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-medium text-foreground mb-2">No transactions found</h3>
              <p className="text-muted-foreground">
                {searchQuery ? "Try adjusting your search" : "Transactions will appear here when you make sales"}
              </p>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
