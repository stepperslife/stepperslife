"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Edit, Trash2, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function ManageAssociatesPage() {
  const currentUser = useQuery(api.users.queries.getCurrentUser);
  const associates = [];

  return (
    <div className="p-6 space-y-6">
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Link href="/team-member/my-associates" className="hover:text-foreground">My Associates</Link>
          <span>/</span>
          <span>Manage Associates</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Manage Associates</h1>
        <p className="text-muted-foreground mt-2">Edit and manage your sales team members</p>
      </div>

      {associates.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
            <p className="text-muted-foreground">No associates to manage</p>
            <p className="text-sm text-muted-foreground mt-2 mb-4">Add associates to start managing them</p>
            <Button asChild>
              <Link href="/team-member/my-associates/add">Add Associate</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {associates.map((associate: any) => (
            <Card key={associate.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{associate.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{associate.email}</p>
                    <p className="text-sm text-muted-foreground">{associate.phone}</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Tickets Assigned</p>
                        <p className="text-xl font-bold">{associate.ticketsAssigned}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Tickets Sold</p>
                        <p className="text-xl font-bold text-green-600">{associate.ticketsSold}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Sales</p>
                        <p className="text-xl font-bold">${associate.totalSales}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Success Rate</p>
                        <p className="text-xl font-bold">{associate.successRate}%</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button size="icon" variant="outline">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="outline" className="text-red-500 hover:text-red-600">
                      <Trash2 className="h-4 w-4" />
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
