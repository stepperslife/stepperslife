"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, XCircle, Clock, Ticket } from "lucide-react";
import Link from "next/link";

export default function TodayScansPage() {
  const currentUser = useQuery(api.users.queries.getCurrentUser);

  // Mock data
  const scans = [];

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Link href="/staff/scanned-tickets" className="hover:text-foreground">
            Scanned Tickets
          </Link>
          <span>/</span>
          <span>Today's Scans</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Today's Scans</h1>
        <p className="text-muted-foreground mt-2">
          All tickets scanned today
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Scans</p>
                <p className="text-2xl font-bold mt-1">{scans.length}</p>
              </div>
              <Ticket className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Valid</p>
                <p className="text-2xl font-bold mt-1 text-success">0</p>
              </div>
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Invalid</p>
                <p className="text-2xl font-bold mt-1 text-destructive">0</p>
              </div>
              <XCircle className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scans List */}
      <Card>
        <CardContent className="p-6">
          {scans.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No scans today</p>
              <p className="text-sm mt-2">Scanned tickets will appear here</p>
            </div>
          ) : (
            <div className="space-y-2">
              {scans.map((scan: any) => (
                <div
                  key={scan.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    {scan.valid ? (
                      <CheckCircle className="h-5 w-5 text-success" />
                    ) : (
                      <XCircle className="h-5 w-5 text-destructive" />
                    )}
                    <div>
                      <p className="font-medium">{scan.ticketNumber}</p>
                      <p className="text-sm text-muted-foreground">{scan.eventName}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{formatTime(scan.timestamp)}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
