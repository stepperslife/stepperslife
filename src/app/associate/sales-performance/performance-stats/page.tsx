"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Target, Zap, Award } from "lucide-react";
import Link from "next/link";

export default function PerformanceStatsPage() {
  const currentUser = useQuery(api.users.queries.getCurrentUser);

  return (
    <div className="p-6 space-y-6">
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Link href="/associate/sales-performance" className="hover:text-foreground">Sales Performance</Link>
          <span>/</span>
          <span>Performance Stats</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Performance Statistics</h1>
        <p className="text-muted-foreground mt-2">Detailed metrics and analytics</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Conversion Rate
            </CardTitle>
            <CardDescription>Link clicks to ticket sales</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">0%</p>
            <p className="text-sm text-muted-foreground mt-2">
              No data available yet
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Sales Velocity
            </CardTitle>
            <CardDescription>Average sales per active day</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">0</p>
            <p className="text-sm text-muted-foreground mt-2">
              tickets/day
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Performance Breakdown</CardTitle>
          <CardDescription>Detailed performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <p className="font-medium">Total Tickets Sold</p>
                <p className="text-sm text-muted-foreground">All time sales</p>
              </div>
              <p className="text-2xl font-bold">0</p>
            </div>

            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <p className="font-medium">Average Ticket Value</p>
                <p className="text-sm text-muted-foreground">Per ticket average</p>
              </div>
              <p className="text-2xl font-bold">$0.00</p>
            </div>

            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <p className="font-medium">Events Participated</p>
                <p className="text-sm text-muted-foreground">Total events</p>
              </div>
              <p className="text-2xl font-bold">0</p>
            </div>

            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <p className="font-medium">Link Clicks</p>
                <p className="text-sm text-muted-foreground">Total clicks on your link</p>
              </div>
              <p className="text-2xl font-bold">0</p>
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium">Active Selling Days</p>
                <p className="text-sm text-muted-foreground">Days with sales activity</p>
              </div>
              <p className="text-2xl font-bold">0</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-600" />
            Performance Milestones
          </CardTitle>
          <CardDescription>Your achievements and progress</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 border rounded-lg opacity-50">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                <Award className="h-5 w-5 text-gray-400" />
              </div>
              <div className="flex-1">
                <p className="font-semibold">First Sale</p>
                <p className="text-sm text-muted-foreground">Make your first ticket sale</p>
              </div>
              <span className="text-sm text-muted-foreground">0/1</span>
            </div>

            <div className="flex items-center gap-3 p-3 border rounded-lg opacity-50">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                <Award className="h-5 w-5 text-gray-400" />
              </div>
              <div className="flex-1">
                <p className="font-semibold">10 Ticket Milestone</p>
                <p className="text-sm text-muted-foreground">Sell 10 tickets</p>
              </div>
              <span className="text-sm text-muted-foreground">0/10</span>
            </div>

            <div className="flex items-center gap-3 p-3 border rounded-lg opacity-50">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                <Award className="h-5 w-5 text-gray-400" />
              </div>
              <div className="flex-1">
                <p className="font-semibold">50 Ticket Achiever</p>
                <p className="text-sm text-muted-foreground">Sell 50 tickets</p>
              </div>
              <span className="text-sm text-muted-foreground">0/50</span>
            </div>

            <div className="flex items-center gap-3 p-3 border rounded-lg opacity-50">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                <Award className="h-5 w-5 text-gray-400" />
              </div>
              <div className="flex-1">
                <p className="font-semibold">100 Ticket Champion</p>
                <p className="text-sm text-muted-foreground">Sell 100 tickets</p>
              </div>
              <span className="text-sm text-muted-foreground">0/100</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
