"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Package, Calendar, Download, Search, CheckCircle, Clock, XCircle, Ticket } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function MyOrdersPage() {
  const currentUser = useQuery(api.users.queries.getCurrentUser);
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data - will be replaced with actual Convex query
  const orders = [];

  const filteredOrders = orders.filter((order: any) =>
    order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.events.some((e: any) =>
      e.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <span className="flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full bg-success/10 text-success">
            <CheckCircle className="h-3 w-3" />
            Completed
          </span>
        );
      case "pending":
        return (
          <span className="flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full bg-warning/10 text-warning">
            <Clock className="h-3 w-3" />
            Pending
          </span>
        );
      case "cancelled":
        return (
          <span className="flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full bg-destructive/10 text-destructive">
            <XCircle className="h-3 w-3" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 text-xs font-medium rounded-full bg-muted text-foreground">
            {status}
          </span>
        );
    }
  };

  const totalOrders = orders.length;
  const totalSpent = orders.reduce((sum: number, o: any) => sum + o.total, 0);
  const totalTickets = orders.reduce(
    (sum: number, o: any) => sum + o.events.reduce((s: number, e: any) => s + e.quantity, 0),
    0
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Orders</h1>
        <p className="text-muted-foreground mt-2">
          Complete history of your ticket purchases
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold mt-1">{totalOrders}</p>
              </div>
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Spent</p>
                <p className="text-2xl font-bold mt-1">${totalSpent.toFixed(2)}</p>
              </div>
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Tickets</p>
                <p className="text-2xl font-bold mt-1">{totalTickets}</p>
              </div>
              <Ticket className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by order number or event name..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
            <p className="text-muted-foreground mb-2">
              {searchTerm ? "No orders found" : "No orders yet"}
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              {searchTerm
                ? "Try adjusting your search"
                : "Your order history will appear here after purchasing tickets"}
            </p>
            {!searchTerm && (
              <Button asChild>
                <Link href="/user/browse-events">Browse Events</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order: any) => (
            <Card key={order.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                {/* Order Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 pb-4 border-b">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold">
                        Order #{order.orderNumber}
                      </h3>
                      {getStatusBadge(order.status)}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Placed on {formatDate(order.orderDate)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-2xl font-bold">${order.total.toFixed(2)}</p>
                  </div>
                </div>

                {/* Order Items */}
                <div className="space-y-3 mb-4">
                  {order.events.map((event: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2"
                    >
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{event.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {event.quantity} {event.quantity === 1 ? "ticket" : "tickets"} ×
                            ${event.price.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <p className="font-medium">
                        ${(event.quantity * event.price).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 pt-4 border-t">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download Receipt
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/user/my-tickets">View Tickets</Link>
                  </Button>
                  {order.status === "completed" && (
                    <Button variant="outline" size="sm">
                      Request Support
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
