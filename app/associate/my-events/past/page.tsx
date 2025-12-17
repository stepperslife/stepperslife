"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock, MapPin, Ticket, DollarSign } from "lucide-react";
import Link from "next/link";

export default function PastEventsPage() {
  const currentUser = useQuery(api.users.queries.getCurrentUser);
  const pastEvents: any[] = [];

  return (
    <div className="p-6 space-y-6">
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Link href="/associate/my-events" className="hover:text-foreground">My Events</Link>
          <span>/</span>
          <span>Past Events</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Past Events</h1>
        <p className="text-muted-foreground mt-2">Your completed events and sales history</p>
      </div>

      {pastEvents.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
            <p className="text-muted-foreground">No past events</p>
            <p className="text-sm text-muted-foreground mt-1">Your completed events will appear here</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {pastEvents.map((event: any) => (
            <Card key={event.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold">{event.name}</h3>
                      <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
                        Completed
                      </span>
                    </div>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(event.startDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{new Date(event.startDate).toLocaleTimeString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{event.venue}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right space-y-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Tickets Sold</p>
                      <p className="text-xl font-bold text-green-600">{event.ticketsSold || 0}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Earnings</p>
                      <p className="text-lg font-semibold text-green-600">${event.earnings || "0.00"}</p>
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
