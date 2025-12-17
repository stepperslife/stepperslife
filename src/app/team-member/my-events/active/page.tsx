"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Ticket, DollarSign, Users } from "lucide-react";
import Link from "next/link";

export default function ActiveEventsPage() {
  const currentUser = useQuery(api.users.queries.getCurrentUser);
  const events: any[] = [];

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Link href="/team-member/my-events" className="hover:text-foreground">My Events</Link>
          <span>/</span>
          <span>Active Events</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Active Events</h1>
        <p className="text-muted-foreground mt-2">Events you're currently selling tickets for</p>
      </div>

      {events.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
            <p className="text-muted-foreground">No active events</p>
            <p className="text-sm text-muted-foreground mt-2">Your active event assignments will appear here</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {events.map((event: any) => (
            <Card key={event.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold">{event.name}</h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(event.date)}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {event.location}
                      </div>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">Active</span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center p-3 border rounded-lg">
                    <Ticket className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-2xl font-bold">{event.totalTickets}</p>
                    <p className="text-xs text-muted-foreground">Total Tickets</p>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <Users className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-2xl font-bold">{event.soldTickets}</p>
                    <p className="text-xs text-muted-foreground">Sold</p>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <Ticket className="h-5 w-5 mx-auto mb-1 text-primary" />
                    <p className="text-2xl font-bold">{event.availableTickets}</p>
                    <p className="text-xs text-muted-foreground">Available</p>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <DollarSign className="h-5 w-5 mx-auto mb-1 text-green-600" />
                    <p className="text-2xl font-bold">${event.earnings}</p>
                    <p className="text-xs text-muted-foreground">Earnings</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button asChild>
                    <Link href={`/team-member/my-ticket-links`}>Get Ticket Link</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href={`/team-member/my-associates`}>Manage Associates</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
