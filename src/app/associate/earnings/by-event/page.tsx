"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, DollarSign, Ticket } from "lucide-react";
import Link from "next/link";

export default function EarningsByEventPage() {
  const currentUser = useQuery(api.users.queries.getCurrentUser);
  const eventEarnings: any[] = [];

  return (
    <div className="p-6 space-y-6">
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Link href="/associate/earnings" className="hover:text-foreground">Earnings</Link>
          <span>/</span>
          <span>By Event</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Earnings by Event</h1>
        <p className="text-muted-foreground mt-2">Commission breakdown per event</p>
      </div>

      {eventEarnings.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
            <p className="text-muted-foreground">No earnings data</p>
            <p className="text-sm text-muted-foreground mt-1">Your event earnings will appear here</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {eventEarnings.map((event: any) => (
            <Card key={event.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">{event.eventName}</h3>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(event.eventDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Ticket className="h-4 w-4" />
                        <span>{event.ticketsSold || 0} tickets sold</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right space-y-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Commission</p>
                      <p className="text-2xl font-bold text-success">
                        ${event.commission || "0.00"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Rate</p>
                      <p className="text-sm font-semibold">{event.commissionRate || 0}%</p>
                    </div>
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
