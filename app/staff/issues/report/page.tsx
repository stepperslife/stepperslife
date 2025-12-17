"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, Send } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function ReportIssuePage() {
  const currentUser = useQuery(api.users.queries.getCurrentUser);

  const [formData, setFormData] = useState({
    issueType: "",
    ticketNumber: "",
    eventId: "",
    description: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement issue submission with Convex
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Link href="/staff/issues" className="hover:text-foreground">
            Issues
          </Link>
          <span>/</span>
          <span>Report Issue</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Report an Issue</h1>
        <p className="text-muted-foreground mt-2">
          Submit a problem or concern encountered during scanning
        </p>
      </div>

      {/* Report Form */}
      <Card>
        <CardHeader>
          <CardTitle>Issue Details</CardTitle>
          <CardDescription>
            Provide as much information as possible about the issue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="issueType">Issue Type</Label>
              <select
                id="issueType"
                className="w-full p-2 border rounded-md"
                value={formData.issueType}
                onChange={(e) => setFormData({ ...formData, issueType: e.target.value })}
                required
              >
                <option value="">Select issue type...</option>
                <option value="invalid-ticket">Invalid Ticket</option>
                <option value="duplicate-scan">Duplicate Scan</option>
                <option value="scanner-issue">Scanner Malfunction</option>
                <option value="counterfeit">Suspected Counterfeit</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ticketNumber">Ticket Number (if applicable)</Label>
              <Input
                id="ticketNumber"
                placeholder="Enter ticket number..."
                value={formData.ticketNumber}
                onChange={(e) => setFormData({ ...formData, ticketNumber: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="eventId">Event</Label>
              <select
                id="eventId"
                className="w-full p-2 border rounded-md"
                value={formData.eventId}
                onChange={(e) => setFormData({ ...formData, eventId: e.target.value })}
                required
              >
                <option value="">Select event...</option>
                {/* Events will be populated from Convex */}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the issue in detail..."
                className="min-h-[120px]"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit">
                <Send className="h-4 w-4 mr-2" />
                Submit Report
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setFormData({
                    issueType: "",
                    ticketNumber: "",
                    eventId: "",
                    description: "",
                  })
                }
              >
                Clear
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Emergency Contact */}
      <Card className="border-destructive bg-destructive/10">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
            <div>
              <h3 className="font-semibold text-foreground">Emergency or Urgent Issue?</h3>
              <p className="text-sm text-foreground mt-1">
                For immediate assistance, contact your event supervisor directly.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
