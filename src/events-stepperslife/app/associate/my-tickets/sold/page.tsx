"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Ticket, Calendar, DollarSign, User, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function SoldTicketsPage() {
  const currentUser = useQuery(api.users.queries.getCurrentUser);
  const soldTickets = [];
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTickets = soldTickets.filter((ticket: any) =>
    ticket.eventName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.buyerName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Link href="/associate/my-tickets" className="hover:text-foreground">My Tickets</Link>
          <span>/</span>
          <span>Sold Tickets</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Sold Tickets</h1>
        <p className="text-muted-foreground mt-2">Your complete sales history</p>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by event or buyer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {filteredTickets.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Ticket className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
            <p className="text-muted-foreground">
              {searchTerm ? "No tickets found" : "No sold tickets"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {searchTerm ? "Try a different search term" : "Your sold tickets will appear here"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredTickets.map((ticket: any) => (
            <Card key={ticket.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{ticket.eventName}</h3>
                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
                        Sold
                      </span>
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{ticket.buyerName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>Sold on {new Date(ticket.soldDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Quantity</p>
                    <p className="text-xl font-bold">{ticket.quantity || 1}</p>
                    <p className="text-sm font-semibold text-green-600 mt-1">
                      ${ticket.commission || "0.00"}
                    </p>
                    <p className="text-xs text-muted-foreground">Commission</p>
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
