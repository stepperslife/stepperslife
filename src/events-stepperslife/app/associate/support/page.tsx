"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Mail, Phone, HelpCircle, Send, User } from "lucide-react";

export default function AssociateSupportPage() {
  const currentUser = useQuery(api.users.queries.getCurrentUser);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Support</h1>
        <p className="text-muted-foreground mt-2">Get help with your account or contact support</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <MessageCircle className="h-12 w-12 mx-auto mb-3 text-primary" />
            <h3 className="font-semibold mb-1">Live Chat</h3>
            <p className="text-sm text-muted-foreground mb-3">Chat with support team</p>
            <Button className="w-full">Start Chat</Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <Mail className="h-12 w-12 mx-auto mb-3 text-primary" />
            <h3 className="font-semibold mb-1">Email Support</h3>
            <p className="text-sm text-muted-foreground mb-3">support@stepperslife.com</p>
            <Button variant="outline" className="w-full">Send Email</Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <Phone className="h-12 w-12 mx-auto mb-3 text-primary" />
            <h3 className="font-semibold mb-1">Phone Support</h3>
            <p className="text-sm text-muted-foreground mb-3">(555) 123-4567</p>
            <Button variant="outline" className="w-full">Call Now</Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Submit a Support Request</CardTitle>
          <CardDescription>Describe your issue and we'll get back to you soon</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Your Name</Label>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <Input
                id="name"
                placeholder="Your name"
                defaultValue={currentUser?.name || ""}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                defaultValue={currentUser?.email || ""}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Issue Category</Label>
            <select id="category" className="w-full p-2 border rounded-md">
              <option value="">Select a category...</option>
              <option value="tickets">Ticket Issues</option>
              <option value="sales">Sales Questions</option>
              <option value="earnings">Earnings & Payouts</option>
              <option value="link">My Ticket Link</option>
              <option value="team">Team Member Contact</option>
              <option value="account">Account Settings</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              placeholder="Brief description of your issue"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Provide detailed information about your issue..."
              rows={5}
            />
          </div>

          <Button className="w-full">
            <Send className="h-4 w-4 mr-2" />
            Submit Request
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>Quick answers to common questions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-l-4 border-primary pl-4">
            <div className="flex items-start gap-2">
              <HelpCircle className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-semibold">How do I get tickets to sell?</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Your team member assigns tickets to you. Contact them to request ticket inventory for specific events.
                </p>
              </div>
            </div>
          </div>

          <div className="border-l-4 border-primary pl-4">
            <div className="flex items-start gap-2">
              <HelpCircle className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-semibold">How do I share my ticket link?</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Go to My Ticket Link → Share Link to share via email, text, social media, or copy the link directly.
                </p>
              </div>
            </div>
          </div>

          <div className="border-l-4 border-primary pl-4">
            <div className="flex items-start gap-2">
              <HelpCircle className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-semibold">When do I get paid?</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Commission is paid according to the schedule set by your team member. Check Earnings → Payout History for details.
                </p>
              </div>
            </div>
          </div>

          <div className="border-l-4 border-primary pl-4">
            <div className="flex items-start gap-2">
              <HelpCircle className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-semibold">How can I track my sales?</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Visit Sales Performance to see detailed analytics, or My Ticket Link → Link Stats to track link performance.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
