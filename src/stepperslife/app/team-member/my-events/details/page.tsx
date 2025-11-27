"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin, Ticket, Users, DollarSign } from "lucide-react";
import Link from "next/link";

export default function EventDetailsPage() {
  const currentUser = useQuery(api.users.queries.getCurrentUser);

  return (
    <div className="p-6 space-y-6">
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Link href="/team-member/my-events" className="hover:text-foreground">My Events</Link>
          <span>/</span>
          <span>Event Details</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Event Details</h1>
        <p className="text-muted-foreground mt-2">Complete information about your assigned events</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>How to View Event Details</CardTitle>
          <CardDescription>Select an event to view its complete information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Event details include:
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Event date, time, and location
              </li>
              <li className="flex items-center gap-2">
                <Ticket className="h-4 w-4 text-primary" />
                Ticket allocation and availability
              </li>
              <li className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Associate distribution status
              </li>
              <li className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-primary" />
                Sales performance and earnings
              </li>
            </ul>
            <p className="text-sm text-muted-foreground mt-4">
              Go to <Link href="/team-member/my-events/active" className="text-primary hover:underline">Active Events</Link> to select an event and view its details.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
