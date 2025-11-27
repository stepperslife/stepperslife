"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, CheckCircle, XCircle, Ticket } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function SearchTicketPage() {
  const currentUser = useQuery(api.users.queries.getCurrentUser);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResult, setSearchResult] = useState<any>(null);

  const handleSearch = () => {
    // Mock search
    if (searchTerm) {
      setSearchResult({
        ticketNumber: searchTerm,
        status: "valid",
        eventName: "Summer Festival 2024",
        holderName: "John Doe",
        scanTime: Date.now(),
        scanned: true,
      });
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Link href="/staff/scanned-tickets" className="hover:text-foreground">
            Scanned Tickets
          </Link>
          <span>/</span>
          <span>Search Ticket</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Search Ticket</h1>
        <p className="text-muted-foreground mt-2">
          Look up specific ticket by number or QR code
        </p>
      </div>

      {/* Search Form */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="search">Ticket Number or QR Code</Label>
              <div className="flex gap-2">
                <Input
                  id="search"
                  placeholder="Enter ticket number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                />
                <Button onClick={handleSearch}>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search Result */}
      {searchResult && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                {searchResult.status === "valid" ? (
                  <CheckCircle className="h-12 w-12 text-green-600" />
                ) : (
                  <XCircle className="h-12 w-12 text-red-600" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-4">
                  {searchResult.status === "valid" ? "Valid Ticket" : "Invalid Ticket"}
                </h3>
                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground mb-1">Ticket Number</p>
                    <p className="font-semibold">{searchResult.ticketNumber}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Event</p>
                    <p className="font-semibold">{searchResult.eventName}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Ticket Holder</p>
                    <p className="font-semibold">{searchResult.holderName}</p>
                  </div>
                  {searchResult.scanned && (
                    <div>
                      <p className="text-muted-foreground mb-1">Scanned At</p>
                      <p className="font-semibold">{formatTime(searchResult.scanTime)}</p>
                    </div>
                  )}
                </div>
                {searchResult.scanned && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      ⚠️ This ticket has already been scanned
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {searchResult === null && searchTerm === "" && (
        <Card>
          <CardContent className="text-center py-12">
            <Ticket className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
            <p className="text-muted-foreground">Enter a ticket number to search</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
