"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, DollarSign, Calendar } from "lucide-react";
import Link from "next/link";

export default function PendingPayoutsPage() {
  const currentUser = useQuery(api.users.queries.getCurrentUser);
  const pendingPayouts = [];
  const totalPending = 0;

  return (
    <div className="p-6 space-y-6">
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Link href="/team-member/earnings" className="hover:text-foreground">Earnings</Link>
          <span>/</span>
          <span>Pending Payouts</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Pending Payouts</h1>
        <p className="text-muted-foreground mt-2">Earnings awaiting payment</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Pending</p>
              <p className="text-3xl font-bold mt-1 text-yellow-600">${totalPending}</p>
            </div>
            <Clock className="h-12 w-12 text-yellow-600" />
          </div>
        </CardContent>
      </Card>

      {pendingPayouts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
            <p className="text-muted-foreground">No pending payouts</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {pendingPayouts.map((payout: any) => (
            <Card key={payout.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">${payout.amount}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Expected: {payout.expectedDate}
                    </p>
                  </div>
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                    Pending
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
