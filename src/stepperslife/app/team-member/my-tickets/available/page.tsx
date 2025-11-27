"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Ticket, Calendar, Users } from "lucide-react";
import Link from "next/link";

export default function AvailableTicketsPage() {
  const currentUser = useQuery(api.users.queries.getCurrentUser);
  const tickets = [];

  return (
    <div className="p-6 space-y-6">
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Link href="/team-member/my-tickets" className="hover:text-foreground">My Tickets</Link>
          <span>/</span>
          <span>Available Tickets</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Available Tickets</h1>
        <p className="text-muted-foreground mt-2">Tickets ready to distribute to associates</p>
      </div>

      {tickets.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Ticket className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
            <p className="text-muted-foreground">No available tickets</p>
            <p className="text-sm text-muted-foreground mt-2">Available tickets will appear here</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {tickets.map((ticket: any) => (
            <Card key={ticket.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-semibold">{ticket.eventName}</h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {ticket.eventDate}
                      </div>
                      <div className="flex items-center gap-1">
                        <Ticket className="h-4 w-4" />
                        {ticket.available} available
                      </div>
                    </div>
                  </div>
                  <Button asChild>
                    <Link href="/team-member/my-associates">
                      <Users className="h-4 w-4 mr-2" />
                      Distribute
                    </Link>
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
