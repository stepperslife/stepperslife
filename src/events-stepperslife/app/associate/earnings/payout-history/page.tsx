"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, Calendar, CheckCircle, Clock } from "lucide-react";
import Link from "next/link";

export default function PayoutHistoryPage() {
  const currentUser = useQuery(api.users.queries.getCurrentUser);
  const payouts = [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Completed
          </span>
        );
      case "pending":
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-700 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Pending
          </span>
        );
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">{status}</span>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Link href="/associate/earnings" className="hover:text-foreground">Earnings</Link>
          <span>/</span>
          <span>Payout History</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Payout History</h1>
        <p className="text-muted-foreground mt-2">Your payment history and status</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Paid Out</p>
                <p className="text-2xl font-bold mt-1 text-green-600">$0.00</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Payout</p>
                <p className="text-2xl font-bold mt-1 text-orange-600">$0.00</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Payouts</p>
                <p className="text-2xl font-bold mt-1">0</p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {payouts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
            <p className="text-muted-foreground">No payout history</p>
            <p className="text-sm text-muted-foreground mt-1">Your payouts will appear here once processed</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {payouts.map((payout: any) => (
            <Card key={payout.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">Payout #{payout.id}</h3>
                      {getStatusBadge(payout.status)}
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {payout.status === "completed"
                            ? `Paid on ${new Date(payout.paidDate).toLocaleDateString()}`
                            : `Expected ${new Date(payout.expectedDate).toLocaleDateString()}`}
                        </span>
                      </div>
                      {payout.method && (
                        <p className="text-xs">Payment Method: {payout.method}</p>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">${payout.amount || "0.00"}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {payout.ticketsSold || 0} tickets
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
