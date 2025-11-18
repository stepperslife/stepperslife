"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Mail, Phone, MessageCircle, Calendar, Ticket } from "lucide-react";

export default function MyTeamMemberPage() {
  const currentUser = useQuery(api.users.queries.getCurrentUser);
  const teamMember = null; // Will be fetched from Convex

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Team Member</h1>
        <p className="text-muted-foreground mt-2">Your assigned team member and contact information</p>
      </div>

      {!teamMember ? (
        <Card>
          <CardContent className="text-center py-12">
            <User className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
            <p className="text-muted-foreground">No team member assigned</p>
            <p className="text-sm text-muted-foreground mt-1">Contact support to get connected with a team member</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Team Member Information</CardTitle>
              <CardDescription>Your primary contact for ticket sales</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{teamMember.name}</h3>
                  <p className="text-sm text-muted-foreground">Team Member</p>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">{teamMember.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Phone</p>
                    <p className="text-sm text-muted-foreground">{teamMember.phone || "Not provided"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Member Since</p>
                    <p className="text-sm text-muted-foreground">
                      {teamMember._creationTime ? new Date(teamMember._creationTime).toLocaleDateString() : "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2 pt-4">
                <Button className="w-full">
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email
                </Button>
                <Button variant="outline" className="w-full">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Working Together</CardTitle>
              <CardDescription>Your collaboration stats</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Ticket className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Events Assigned</span>
                  </div>
                  <span className="font-semibold">0</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Ticket className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Tickets Allocated</span>
                  </div>
                  <span className="font-semibold">0</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Ticket className="h-5 w-5 text-green-600" />
                    <span className="text-sm text-muted-foreground">Tickets Sold</span>
                  </div>
                  <span className="font-semibold text-green-600">0</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <User className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900">About Team Members</h3>
              <p className="text-sm text-blue-800 mt-1">
                Your team member is responsible for assigning events, distributing tickets, and helping you succeed.
                Reach out to them for support, questions, or to request more ticket inventory.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
