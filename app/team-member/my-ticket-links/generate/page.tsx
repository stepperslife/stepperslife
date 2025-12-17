"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Link as LinkIcon, Copy } from "lucide-react";
import Link from "next/link";

export default function GenerateLinkPage() {
  const currentUser = useQuery(api.users.queries.getCurrentUser);

  return (
    <div className="p-6 space-y-6">
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Link href="/team-member/my-ticket-links" className="hover:text-foreground">My Ticket Links</Link>
          <span>/</span>
          <span>Generate Link</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Generate Ticket Link</h1>
        <p className="text-muted-foreground mt-2">Create a unique link to sell tickets</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Event</CardTitle>
          <CardDescription>Choose an event to generate a ticket link for</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="event">Event</Label>
              <select id="event" className="w-full p-2 border rounded-md">
                <option value="">Select an event...</option>
              </select>
            </div>

            <Button className="w-full">
              <LinkIcon className="h-4 w-4 mr-2" />
              Generate Link
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <LinkIcon className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900">How it works</h3>
              <p className="text-sm text-blue-800 mt-1">
                Share your unique link with potential buyers. When they purchase tickets through your link, you'll earn 100% commission on those sales.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
