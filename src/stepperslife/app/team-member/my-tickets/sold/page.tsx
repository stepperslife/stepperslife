"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Calendar, DollarSign, Users } from "lucide-react";
import Link from "next/link";

export default function SoldTicketsPage() {
  const currentUser = useQuery(api.users.queries.getCurrentUser);
  const sales = [];

  return (
    <div className="p-6 space-y-6">
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Link href="/team-member/my-tickets" className="hover:text-foreground">My Tickets</Link>
          <span>/</span>
          <span>Sold Tickets</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Sold Tickets</h1>
        <p className="text-muted-foreground mt-2">Complete sales history across all events</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Sold</p>
                <p className="text-2xl font-bold mt-1">0</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Revenue</p>
                <p className="text-2xl font-bold mt-1">$0</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg per Event</p>
                <p className="text-2xl font-bold mt-1">0</p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {sales.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
            <p className="text-muted-foreground">No sales yet</p>
            <p className="text-sm text-muted-foreground mt-2">Sold tickets will appear here</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {sales.map((sale: any) => (
            <Card key={sale.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{sale.eventName}</p>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {sale.soldBy}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {sale.date}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">{sale.quantity} tickets</p>
                    <p className="text-sm text-muted-foreground">${sale.amount}</p>
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
