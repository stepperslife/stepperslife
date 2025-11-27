"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function ScansByEventPage() {
  const currentUser = useQuery(api.users.queries.getCurrentUser);

  // Mock data
  const events = [];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Link href="/staff/scanned-tickets" className="hover:text-foreground">
            Scanned Tickets
          </Link>
          <span>/</span>
          <span>By Event</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Scans By Event</h1>
        <p className="text-muted-foreground mt-2">
          View scan statistics organized by event
        </p>
      </div>

      {/* Events List */}
      {events.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
            <p className="text-muted-foreground">No events assigned</p>
            <p className="text-sm text-muted-foreground mt-2">
              Events you're assigned to will appear here
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {events.map((event: any) => (
            <Card key={event.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{event.name}</CardTitle>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{event.scansCount}</p>
                    <p className="text-sm text-muted-foreground">scans</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Total Capacity</p>
                    <p className="font-semibold">{event.capacity}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Tickets Sold</p>
                    <p className="font-semibold">{event.soldCount}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Checked In</p>
                    <p className="font-semibold text-green-600">{event.scansCount}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Attendance Rate</p>
                    <p className="font-semibold">
                      {((event.scansCount / event.soldCount) * 100).toFixed(1)}%
                    </p>
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
