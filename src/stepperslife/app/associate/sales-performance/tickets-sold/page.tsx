"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Ticket, Calendar, DollarSign } from "lucide-react";
import Link from "next/link";

export default function TicketsSoldPage() {
  const currentUser = useQuery(api.users.queries.getCurrentUser);
  const ticketsSold = [];

  return (
    <div className="p-6 space-y-6">
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Link href="/associate/sales-performance" className="hover:text-foreground">Sales Performance</Link>
          <span>/</span>
          <span>Tickets Sold</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Tickets Sold</h1>
        <p className="text-muted-foreground mt-2">Detailed breakdown of your ticket sales</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Sold</p>
                <p className="text-2xl font-bold mt-1 text-success">0</p>
              </div>
              <Ticket className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold mt-1">0</p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Revenue</p>
                <p className="text-2xl font-bold mt-1 text-success">$0</p>
              </div>
              <DollarSign className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
      </div>

      {ticketsSold.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Ticket className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
            <p className="text-muted-foreground">No tickets sold</p>
            <p className="text-sm text-muted-foreground mt-1">Your sales will appear here</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {ticketsSold.map((sale: any) => (
            <Card key={sale.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">{sale.eventName}</h3>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>Sold on {new Date(sale.saleDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Ticket className="h-4 w-4" />
                        <span>{sale.quantity} ticket{sale.quantity !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right space-y-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Total Sale</p>
                      <p className="text-xl font-bold">${sale.totalAmount || "0.00"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Commission</p>
                      <p className="text-lg font-semibold text-success">${sale.commission || "0.00"}</p>
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
