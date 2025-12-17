"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Ticket, Calendar, MapPin, DollarSign, Copy } from "lucide-react";
import Link from "next/link";

export default function AvailableTicketsPage() {
  const currentUser = useQuery(api.users.queries.getCurrentUser);
  const availableTickets: any[] = [];

  return (
    <div className="p-6 space-y-6">
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Link href="/associate/my-tickets" className="hover:text-foreground">My Tickets</Link>
          <span>/</span>
          <span>Available Tickets</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Available Tickets</h1>
        <p className="text-muted-foreground mt-2">Tickets ready to sell</p>
      </div>

      {availableTickets.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Ticket className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
            <p className="text-muted-foreground">No available tickets</p>
            <p className="text-sm text-muted-foreground mt-1">Check back later for new assignments</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {availableTickets.map((ticket: any) => (
            <Card key={ticket.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">{ticket.eventName}</h3>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(ticket.eventDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{ticket.venue}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        <span>${ticket.price} per ticket</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Quantity</p>
                      <p className="text-2xl font-bold">{ticket.quantity || 0}</p>
                    </div>
                    <Button size="sm" className="w-full">
                      <Copy className="h-4 w-4 mr-2" />
                      Get Link
                    </Button>
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
