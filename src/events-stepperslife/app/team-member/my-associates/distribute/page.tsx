"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Ticket, Users, Send } from "lucide-react";
import Link from "next/link";

export default function DistributeTicketsPage() {
  const currentUser = useQuery(api.users.queries.getCurrentUser);

  return (
    <div className="p-6 space-y-6">
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Link href="/team-member/my-associates" className="hover:text-foreground">My Associates</Link>
          <span>/</span>
          <span>Distribute Tickets</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Distribute Tickets</h1>
        <p className="text-muted-foreground mt-2">Assign tickets to your associates</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>How to Distribute Tickets</CardTitle>
          <CardDescription>Steps to assign tickets to your associates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 border rounded-lg">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Ticket className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">1. Check Available Tickets</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Go to <Link href="/team-member/my-tickets/available" className="text-primary hover:underline">Available Tickets</Link> to see your inventory
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 border rounded-lg">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">2. Select Associates</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Choose which associates should receive tickets
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 border rounded-lg">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Send className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">3. Assign Quantity</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Specify how many tickets each associate should receive
                </p>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button asChild>
                <Link href="/team-member/my-tickets/available">View Available Tickets</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/team-member/my-associates/manage">View Associates</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
