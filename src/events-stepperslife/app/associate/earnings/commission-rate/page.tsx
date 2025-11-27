"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Percent, TrendingUp, Calendar } from "lucide-react";
import Link from "next/link";

export default function CommissionRatePage() {
  const currentUser = useQuery(api.users.queries.getCurrentUser);
  const commissionRates = [];

  return (
    <div className="p-6 space-y-6">
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Link href="/associate/earnings" className="hover:text-foreground">Earnings</Link>
          <span>/</span>
          <span>Commission Rate</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Commission Rates</h1>
        <p className="text-muted-foreground mt-2">Your commission rates by event</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Average Commission Rate</CardTitle>
          <CardDescription>Your overall commission percentage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Percent className="h-12 w-12 text-primary" />
            <div>
              <p className="text-4xl font-bold">0%</p>
              <p className="text-sm text-muted-foreground mt-1">Across all events</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Commission by Event</CardTitle>
          <CardDescription>Your commission rate for each event</CardDescription>
        </CardHeader>
        <CardContent>
          {commissionRates.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Percent className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No commission rates</p>
              <p className="text-sm mt-1">Get assigned to events to see your rates</p>
            </div>
          ) : (
            <div className="space-y-3">
              {commissionRates.map((rate: any) => (
                <div key={rate.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-semibold">{rate.eventName}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(rate.eventDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">{rate.rate}%</p>
                    <p className="text-xs text-muted-foreground">Commission</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900">About Commission Rates</h3>
              <p className="text-sm text-blue-800 mt-1">
                Your commission rate is set by your team member and may vary by event. Higher sales performance may lead to better commission rates in the future.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
