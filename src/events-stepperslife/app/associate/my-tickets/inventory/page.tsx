"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Ticket, TrendingUp, Package, Calendar } from "lucide-react";
import Link from "next/link";

export default function InventoryPage() {
  const currentUser = useQuery(api.users.queries.getCurrentUser);
  const inventory = [];

  return (
    <div className="p-6 space-y-6">
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Link href="/associate/my-tickets" className="hover:text-foreground">My Tickets</Link>
          <span>/</span>
          <span>Inventory Overview</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Inventory Overview</h1>
        <p className="text-muted-foreground mt-2">Complete view of all your tickets</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Allocated</p>
                <p className="text-2xl font-bold mt-1">0</p>
              </div>
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Available</p>
                <p className="text-2xl font-bold mt-1">0</p>
              </div>
              <Ticket className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Sold</p>
                <p className="text-2xl font-bold mt-1 text-green-600">0</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {inventory.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
            <p className="text-muted-foreground">No inventory data</p>
            <p className="text-sm text-muted-foreground mt-1">Your ticket inventory will appear here</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {inventory.map((item: any) => (
            <Card key={item.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">{item.eventName}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(item.eventDate).toLocaleDateString()}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Allocated</p>
                        <p className="text-xl font-bold">{item.allocated || 0}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Available</p>
                        <p className="text-xl font-bold text-blue-600">{item.available || 0}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Sold</p>
                        <p className="text-xl font-bold text-green-600">{item.sold || 0}</p>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Sell Rate</p>
                    <p className="text-2xl font-bold">
                      {item.allocated > 0 ? Math.round((item.sold / item.allocated) * 100) : 0}%
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
