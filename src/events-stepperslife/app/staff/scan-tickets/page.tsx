"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrCode, Camera, CheckCircle, XCircle, AlertCircle, Scan } from "lucide-react";
import { useState } from "react";

export default function ScanTicketsPage() {
  const currentUser = useQuery(api.users.queries.getCurrentUser);
  const [scanResult, setScanResult] = useState<{
    status: "success" | "error" | "warning" | null;
    message: string;
    ticket?: any;
  }>({ status: null, message: "" });

  const [isScanning, setIsScanning] = useState(false);

  const handleScan = () => {
    setIsScanning(true);
    // TODO: Implement actual QR code scanning
    setTimeout(() => {
      // Mock scan result
      setScanResult({
        status: "success",
        message: "Ticket valid! Entry granted.",
        ticket: {
          ticketNumber: "TKT-12345",
          eventName: "Summer Festival 2024",
          holderName: "John Doe",
          ticketType: "General Admission",
        },
      });
      setIsScanning(false);
    }, 1500);
  };

  const getScanResultIcon = () => {
    switch (scanResult.status) {
      case "success":
        return <CheckCircle className="h-16 w-16 text-green-600" />;
      case "error":
        return <XCircle className="h-16 w-16 text-red-600" />;
      case "warning":
        return <AlertCircle className="h-16 w-16 text-yellow-600" />;
      default:
        return <QrCode className="h-16 w-16 text-muted-foreground" />;
    }
  };

  const getScanResultColor = () => {
    switch (scanResult.status) {
      case "success":
        return "bg-green-50 border-green-200";
      case "error":
        return "bg-red-50 border-red-200";
      case "warning":
        return "bg-yellow-50 border-yellow-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Scan Tickets</h1>
        <p className="text-muted-foreground mt-2">
          Scan QR codes to validate and check-in attendees
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Today's Scans</p>
                <p className="text-2xl font-bold mt-1">0</p>
              </div>
              <Scan className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Valid Tickets</p>
                <p className="text-2xl font-bold mt-1 text-green-600">0</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Invalid Tickets</p>
                <p className="text-2xl font-bold mt-1 text-red-600">0</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Scan Rate</p>
                <p className="text-2xl font-bold mt-1">0/min</p>
              </div>
              <AlertCircle className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scanner Interface */}
      <Card>
        <CardHeader>
          <CardTitle>QR Code Scanner</CardTitle>
          <CardDescription>
            Point your camera at the ticket QR code to scan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center space-y-6">
            {/* Scanner View */}
            <div className={`w-full max-w-md aspect-square border-4 rounded-lg flex items-center justify-center ${getScanResultColor()}`}>
              {isScanning ? (
                <div className="text-center">
                  <div className="animate-pulse">
                    <Camera className="h-24 w-24 mx-auto text-primary mb-4" />
                  </div>
                  <p className="text-lg font-semibold">Scanning...</p>
                </div>
              ) : scanResult.status ? (
                <div className="text-center p-8">
                  <div className="mb-4">{getScanResultIcon()}</div>
                  <p className="text-xl font-bold mb-2">{scanResult.message}</p>
                  {scanResult.ticket && (
                    <div className="mt-4 space-y-2 text-sm text-left bg-white p-4 rounded-lg">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Ticket:</span>
                        <span className="font-medium">{scanResult.ticket.ticketNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Event:</span>
                        <span className="font-medium">{scanResult.ticket.eventName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Holder:</span>
                        <span className="font-medium">{scanResult.ticket.holderName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Type:</span>
                        <span className="font-medium">{scanResult.ticket.ticketType}</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center">
                  <QrCode className="h-24 w-24 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg text-muted-foreground">
                    Ready to scan
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                size="lg"
                onClick={handleScan}
                disabled={isScanning}
              >
                <Camera className="h-5 w-5 mr-2" />
                {isScanning ? "Scanning..." : scanResult.status ? "Scan Next" : "Start Scanning"}
              </Button>
              {scanResult.status && (
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => setScanResult({ status: null, message: "" })}
                >
                  Clear Result
                </Button>
              )}
            </div>

            {/* Manual Entry Option */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Camera not working?
              </p>
              <Button variant="link">Enter Ticket Number Manually</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Scans */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Scans</CardTitle>
          <CardDescription>Last 5 ticket scans</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>No scans yet</p>
            <p className="text-sm mt-2">Scanned tickets will appear here</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
