"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Eye, ShoppingCart, DollarSign } from "lucide-react";
import Link from "next/link";

export default function LinkPerformancePage() {
  const currentUser = useQuery(api.users.queries.getCurrentUser);
  const links = [];

  return (
    <div className="p-6 space-y-6">
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Link href="/team-member/my-ticket-links" className="hover:text-foreground">My Ticket Links</Link>
          <span>/</span>
          <span>Link Performance</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Link Performance</h1>
        <p className="text-muted-foreground mt-2">Track your ticket link analytics</p>
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
                <p className="text-2xl font-bold mt-1">0</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Revenue</p>
                <p className="text-2xl font-bold mt-1">$0</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
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

      {links.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
            <p className="text-muted-foreground">No link performance data</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {links.map((link: any) => (
            <Card key={link.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{link.eventName}</p>
                    <p className="text-sm text-muted-foreground font-mono">{link.url}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold">{link.clicks}</p>
                    <p className="text-sm text-muted-foreground">{link.conversions} sales</p>
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
