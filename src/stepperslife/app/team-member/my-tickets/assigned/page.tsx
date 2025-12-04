"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Ticket, Calendar } from "lucide-react";
import Link from "next/link";

export default function AssignedTicketsPage() {
  const currentUser = useQuery(api.users.queries.getCurrentUser);
  const assignments: any[] = [];

  return (
    <div className="p-6 space-y-6">
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Link href="/team-member/my-tickets" className="hover:text-foreground">My Tickets</Link>
          <span>/</span>
          <span>Assigned to Associates</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Assigned to Associates</h1>
        <p className="text-muted-foreground mt-2">Tickets distributed to your associates</p>
      </div>

      {assignments.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
            <p className="text-muted-foreground">No tickets assigned yet</p>
            <p className="text-sm text-muted-foreground mt-2">Distributed tickets will appear here</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {assignments.map((assignment: any) => (
            <Card key={assignment.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold">{assignment.eventName}</h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {assignment.eventDate}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  {assignment.associates.map((assoc: any) => (
                    <div key={assoc.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Users className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{assoc.name}</p>
                          <p className="text-sm text-muted-foreground">{assoc.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{assoc.ticketsAssigned} tickets</p>
                        <p className="text-sm text-muted-foreground">{assoc.ticketsSold} sold</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
