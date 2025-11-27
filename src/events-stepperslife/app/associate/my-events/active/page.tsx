"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock, MapPin, Ticket, Users } from "lucide-react";
import Link from "next/link";

export default function ActiveEventsPage() {
  const currentUser = useQuery(api.users.queries.getCurrentUser);
  const activeEvents = [];

  return (
    <div className="p-6 space-y-6">
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Link href="/associate/my-events" className="hover:text-foreground">My Events</Link>
          <span>/</span>
          <span>Active Events</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Active Events</h1>
        <p className="text-muted-foreground mt-2">Events you're currently selling tickets for</p>
      </div>

      {activeEvents.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
            <p className="text-muted-foreground">No active events</p>
            <p className="text-sm text-muted-foreground mt-1">Check back later for new assignments</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {activeEvents.map((event: any) => (
            <Card key={event.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold">{event.name}</h3>
                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
                        Active
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

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <p className="text-xs text-muted-foreground">Available</p>
                      <p className="text-xl font-bold">{event.ticketsAvailable || 0}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Sold by You</p>
                      <p className="text-xl font-bold text-green-600">{event.ticketsSold || 0}</p>
                    </div>
                  </div>

                  <Link
                    href={`/associate/my-events/details?id=${event.id}`}
                    className="block w-full text-center py-2 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
