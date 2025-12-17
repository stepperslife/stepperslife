"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Clock, DollarSign } from "lucide-react";
import Link from "next/link";

export default function PayoutHistoryPage() {
  const currentUser = useQuery(api.users.queries.getCurrentUser);
  const payouts: any[] = [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 flex items-center gap-1"><CheckCircle className="h-3 w-3" />Completed</span>;
      case "pending":
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 flex items-center gap-1"><Clock className="h-3 w-3" />Pending</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Link href="/team-member/earnings" className="hover:text-foreground">Earnings</Link>
          <span>/</span>
          <span>Payout History</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Payout History</h1>
        <p className="text-muted-foreground mt-2">Track your commission payments</p>
      </div>

      {payouts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
            <p className="text-muted-foreground">No payouts yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {payouts.map((payout: any) => (
            <Card key={payout.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">${payout.amount}</p>
                    <p className="text-sm text-muted-foreground">{payout.date}</p>
                  </div>
                  {getStatusBadge(payout.status)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
