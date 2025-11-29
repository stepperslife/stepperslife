"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Eye, ShoppingCart, DollarSign } from "lucide-react";
import Link from "next/link";

export default function LinkStatsPage() {
  const currentUser = useQuery(api.users.queries.getCurrentUser);

  return (
    <div className="p-6 space-y-6">
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Link href="/associate/my-ticket-link" className="hover:text-foreground">My Ticket Link</Link>
          <span>/</span>
          <span>Link Stats</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Link Statistics</h1>
        <p className="text-muted-foreground mt-2">Track your link performance</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Clicks</p>
                <p className="text-2xl font-bold mt-1">0</p>
              </div>
              <Eye className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Conversions</p>
                <p className="text-2xl font-bold mt-1 text-success">0</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Revenue</p>
                <p className="text-2xl font-bold mt-1 text-success">$0</p>
              </div>
              <DollarSign className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Conv. Rate</p>
                <p className="text-2xl font-bold mt-1">0%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Performance Over Time</CardTitle>
          <CardDescription>Your link activity trends</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No link activity yet</p>
            <p className="text-sm mt-1">Share your link to start tracking performance</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Link Performance by Event</CardTitle>
          <CardDescription>See which events drive the most traffic</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No event data</p>
            <p className="text-sm mt-1">Performance breakdown by event will appear here</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-muted">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <TrendingUp className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h3 className="font-semibold text-foreground">Understanding Your Stats</h3>
              <ul className="text-sm text-foreground mt-2 space-y-1 list-disc list-inside">
                <li><strong>Clicks:</strong> Number of times your link was visited</li>
                <li><strong>Conversions:</strong> Tickets purchased through your link</li>
                <li><strong>Conversion Rate:</strong> Percentage of clicks that became sales</li>
                <li><strong>Revenue:</strong> Total ticket sales value from your link</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
