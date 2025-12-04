"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, MapPin, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function PastEventsPage() {
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
          <span>Past Events</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Past Events</h1>
        <p className="text-muted-foreground mt-2">Completed events you sold tickets for</p>
      </div>

      {events.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
            <p className="text-muted-foreground">No past events</p>
            <p className="text-sm text-muted-foreground mt-2">Your completed events will appear here</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {events.map((event: any) => (
            <Card key={event.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg flex flex-col items-center justify-center">
                    <div className="text-xl font-bold">{new Date(event.date).getDate()}</div>
                    <div className="text-xs text-muted-foreground uppercase">
                      {new Date(event.date).toLocaleString("en-US", { month: "short" })}
                    </div>
                  </div>

                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{event.name}</h3>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {event.location}
                      </div>
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="h-3 w-3" />
                        {event.soldTickets} tickets sold
                      </div>
                      <div>Earned: ${event.earnings}</div>
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
