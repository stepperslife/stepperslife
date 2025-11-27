"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Users, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function AssociatesSalesPage() {
  const currentUser = useQuery(api.users.queries.getCurrentUser);
  const associates = [];

  return (
    <div className="p-6 space-y-6">
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Link href="/team-member/sales-performance" className="hover:text-foreground">Sales Performance</Link>
          <span>/</span>
          <span>Associates Sales</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Associates Sales</h1>
        <p className="text-muted-foreground mt-2">Your team's sales performance</p>
      </div>

      {associates.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
            <p className="text-muted-foreground">No associates sales data</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {associates.map((associate: any, index: number) => (
            <Card key={associate.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold">{associate.name}</p>
                      <p className="text-sm text-muted-foreground">{associate.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold">{associate.sales}</p>
                    <p className="text-sm text-muted-foreground">tickets sold</p>
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
