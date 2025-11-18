"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, Calendar, Clock } from "lucide-react";
import Link from "next/link";

export default function DuplicateScansPage() {
  const currentUser = useQuery(api.users.queries.getCurrentUser);

  // Mock data
  const duplicates = [];

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Link href="/staff/issues" className="hover:text-foreground">
            Issues
          </Link>
          <span>/</span>
          <span>Duplicate Scans</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Duplicate Scans</h1>
        <p className="text-muted-foreground mt-2">
          Tickets that were scanned multiple times
        </p>
      </div>

      {/* Duplicates List */}
      {duplicates.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Copy className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
            <p className="text-muted-foreground">No duplicate scans</p>
            <p className="text-sm text-muted-foreground mt-2">
              Duplicate scan attempts will appear here
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {duplicates.map((duplicate: any) => (
            <Card key={duplicate.id} className="border-yellow-200 bg-yellow-50/50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Copy className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold">{duplicate.ticketNumber}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Event: {duplicate.eventName}
                        </p>
                        <div className="text-sm mt-2 space-y-1">
                          <p className="text-yellow-700">
                            First scanned: {formatTime(duplicate.firstScan)}
                          </p>
                          <p className="text-yellow-700">
                            Duplicate attempt: {formatTime(duplicate.duplicateScan)}
                          </p>
                        </div>
                      </div>
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
