"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, DollarSign } from "lucide-react";
import Link from "next/link";

export default function EarningsByEventPage() {
  const currentUser = useQuery(api.users.queries.getCurrentUser);
  const events = [];

  return (
    <div className="p-6 space-y-6">
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Link href="/team-member/earnings" className="hover:text-foreground">Earnings</Link>
          <span>/</span>
          <span>By Event</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Earnings by Event</h1>
        <p className="text-muted-foreground mt-2">Breakdown of earnings per event</p>
      </div>

      {events.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
            <p className="text-muted-foreground">No earnings yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {events.map((event: any) => (
            <Card key={event.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{event.name}</p>
                    <p className="text-sm text-muted-foreground">{event.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-green-600">${event.earnings}</p>
                    <p className="text-sm text-muted-foreground">{event.ticketsSold} tickets</p>
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
