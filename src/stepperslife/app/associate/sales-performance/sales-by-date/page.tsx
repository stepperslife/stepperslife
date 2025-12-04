"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, TrendingUp, Ticket } from "lucide-react";
import Link from "next/link";

export default function SalesByDatePage() {
  const currentUser = useQuery(api.users.queries.getCurrentUser);
  const salesByDate: any[] = [];

  return (
    <div className="p-6 space-y-6">
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Link href="/associate/sales-performance" className="hover:text-foreground">Sales Performance</Link>
          <span>/</span>
          <span>Sales by Date</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Sales by Date</h1>
        <p className="text-muted-foreground mt-2">Track your daily sales performance</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Best Day</p>
                <p className="text-2xl font-bold mt-1 text-green-600">0</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Peak sales day</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Daily Avg</p>
                <p className="text-2xl font-bold mt-1">0</p>
              </div>
              <Ticket className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Average per day</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Days</p>
                <p className="text-2xl font-bold mt-1">0</p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Days with sales</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sales Timeline</CardTitle>
          <CardDescription>Your sales activity by date</CardDescription>
        </CardHeader>
        <CardContent>
          {salesByDate.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No sales data</p>
              <p className="text-sm mt-1">Your daily sales will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {salesByDate.map((day: any) => (
                <div key={day.date} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-semibold">
                      {new Date(day.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {day.eventCount} event{day.eventCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">{day.ticketsSold || 0}</p>
                    <p className="text-xs text-muted-foreground">tickets</p>
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
              <h3 className="font-semibold text-blue-900">Sales Insights</h3>
              <p className="text-sm text-blue-800 mt-1">
                Consistent daily sales activity helps build momentum. Try to maintain regular sales throughout each week for best results.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
