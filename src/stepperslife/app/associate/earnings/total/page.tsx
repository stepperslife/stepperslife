"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, TrendingUp, Calendar, Ticket } from "lucide-react";
import Link from "next/link";

export default function TotalEarningsPage() {
  const currentUser = useQuery(api.users.queries.getCurrentUser);

  return (
    <div className="p-6 space-y-6">
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Link href="/associate/earnings" className="hover:text-foreground">Earnings</Link>
          <span>/</span>
          <span>Total Earnings</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Total Earnings</h1>
        <p className="text-muted-foreground mt-2">Your lifetime earnings summary</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Earned</p>
                <p className="text-2xl font-bold mt-1 text-success">$0.00</p>
              </div>
              <DollarSign className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tickets Sold</p>
                <p className="text-2xl font-bold mt-1">0</p>
              </div>
              <Ticket className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg per Ticket</p>
                <p className="text-2xl font-bold mt-1">$0.00</p>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Events Worked</p>
                <p className="text-2xl font-bold mt-1">0</p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Earnings Breakdown</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b">
              <span className="text-sm text-muted-foreground">This Month</span>
              <span className="font-semibold">$0.00</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b">
              <span className="text-sm text-muted-foreground">Last Month</span>
              <span className="font-semibold">$0.00</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b">
              <span className="text-sm text-muted-foreground">Last 3 Months</span>
              <span className="font-semibold">$0.00</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b">
              <span className="text-sm text-muted-foreground">Last 6 Months</span>
              <span className="font-semibold">$0.00</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-sm text-muted-foreground">All Time</span>
              <span className="font-semibold text-success">$0.00</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Monthly Trends</h3>
          <div className="text-center py-12 text-muted-foreground">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No earnings data</p>
            <p className="text-sm mt-1">Start selling to see your monthly trends</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
