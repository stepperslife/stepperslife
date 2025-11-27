"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, CheckCircle, Calendar } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function CopyLinkPage() {
  const currentUser = useQuery(api.users.queries.getCurrentUser);
  const [copied, setCopied] = useState(false);
  const mockLink = `https://events.stepperslife.com/a/${currentUser?._id || "abc123"}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(mockLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Link href="/associate/my-ticket-link" className="hover:text-foreground">My Ticket Link</Link>
          <span>/</span>
          <span>Copy Link</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Copy Your Link</h1>
        <p className="text-muted-foreground mt-2">Get your unique ticket selling link</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Unique Ticket Link</CardTitle>
          <CardDescription>Share this link to sell tickets and earn commission</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Input
              value={mockLink}
              readOnly
              className="font-mono text-sm"
            />
            <Button onClick={handleCopy} className="flex items-center gap-2 min-w-[100px]">
              {copied ? (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy
                </>
              )}
            </Button>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-2">How to use your link:</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
              <li>Copy your unique link above</li>
              <li>Share it with potential ticket buyers</li>
              <li>When they purchase, you automatically earn commission</li>
              <li>Track your sales in the Link Stats section</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Events</CardTitle>
          <CardDescription>Events available through your link</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No active events</p>
            <p className="text-sm mt-1">Contact your team member to get assigned to events</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-green-900">Pro Tip</h3>
              <p className="text-sm text-green-800 mt-1">
                Add a personal message when sharing your link! Tell people why they should attend and how to get tickets through you.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
