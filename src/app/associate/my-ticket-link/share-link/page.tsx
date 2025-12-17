"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, MessageCircle, Share2, Facebook, Twitter, Instagram } from "lucide-react";
import Link from "next/link";

export default function ShareLinkPage() {
  const currentUser = useQuery(api.users.queries.getCurrentUser);
  const mockLink = `https://events.stepperslife.com/a/${currentUser?._id || "abc123"}`;

  const handleShare = (platform: string) => {
    let shareUrl = "";
    const text = "Check out these amazing events! Get your tickets here:";

    switch (platform) {
      case "email":
        shareUrl = `mailto:?subject=Event Tickets&body=${text} ${mockLink}`;
        break;
      case "sms":
        shareUrl = `sms:?&body=${text} ${mockLink}`;
        break;
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(mockLink)}`;
        break;
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(mockLink)}`;
        break;
      case "whatsapp":
        shareUrl = `https://wa.me/?text=${encodeURIComponent(text + " " + mockLink)}`;
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, "_blank");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Link href="/associate/my-ticket-link" className="hover:text-foreground">My Ticket Link</Link>
          <span>/</span>
          <span>Share Link</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Share Your Link</h1>
        <p className="text-muted-foreground mt-2">Share via your favorite platform</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Share</CardTitle>
          <CardDescription>Choose a platform to share your ticket link</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            <Button
              variant="outline"
              className="justify-start h-auto py-4"
              onClick={() => handleShare("email")}
            >
              <Mail className="h-5 w-5 mr-3" />
              <div className="text-left">
                <p className="font-semibold">Email</p>
                <p className="text-xs text-muted-foreground">Share via email</p>
              </div>
            </Button>

            <Button
              variant="outline"
              className="justify-start h-auto py-4"
              onClick={() => handleShare("sms")}
            >
              <MessageCircle className="h-5 w-5 mr-3" />
              <div className="text-left">
                <p className="font-semibold">Text Message</p>
                <p className="text-xs text-muted-foreground">Share via SMS</p>
              </div>
            </Button>

            <Button
              variant="outline"
              className="justify-start h-auto py-4"
              onClick={() => handleShare("whatsapp")}
            >
              <MessageCircle className="h-5 w-5 mr-3 text-success" />
              <div className="text-left">
                <p className="font-semibold">WhatsApp</p>
                <p className="text-xs text-muted-foreground">Share via WhatsApp</p>
              </div>
            </Button>

            <Button
              variant="outline"
              className="justify-start h-auto py-4"
              onClick={() => handleShare("facebook")}
            >
              <Facebook className="h-5 w-5 mr-3 text-primary" />
              <div className="text-left">
                <p className="font-semibold">Facebook</p>
                <p className="text-xs text-muted-foreground">Share on Facebook</p>
              </div>
            </Button>

            <Button
              variant="outline"
              className="justify-start h-auto py-4"
              onClick={() => handleShare("twitter")}
            >
              <Twitter className="h-5 w-5 mr-3 text-primary" />
              <div className="text-left">
                <p className="font-semibold">Twitter / X</p>
                <p className="text-xs text-muted-foreground">Tweet your link</p>
              </div>
            </Button>

            <Button
              variant="outline"
              className="justify-start h-auto py-4"
              onClick={() => navigator.share?.({ url: mockLink, text: "Check out these events!" })}
            >
              <Share2 className="h-5 w-5 mr-3" />
              <div className="text-left">
                <p className="font-semibold">More Options</p>
                <p className="text-xs text-muted-foreground">Share via system</p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sharing Tips</CardTitle>
          <CardDescription>Maximize your sales with these strategies</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
              <Instagram className="h-5 w-5 text-accent-foreground mt-0.5" />
              <div>
                <p className="font-semibold">Social Media Stories</p>
                <p className="text-sm text-muted-foreground">
                  Add your link to Instagram, Facebook, or Snapchat stories with event photos
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
              <MessageCircle className="h-5 w-5 text-success mt-0.5" />
              <div>
                <p className="font-semibold">Direct Messages</p>
                <p className="text-sm text-muted-foreground">
                  Send personalized messages to friends and contacts who might be interested
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
              <Mail className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-semibold">Email Lists</p>
                <p className="text-sm text-muted-foreground">
                  Share with your email contacts or include in your email signature
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
