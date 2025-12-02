"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Loader2, ArrowLeft, AlertCircle, CheckCircle } from "lucide-react";

// Declare Square global type
declare global {
  interface Window {
    Square?: {
      payments: (appId: string, locationId: string) => Promise<any>;
    };
  }
}

interface SquareCardPaymentProps {
  applicationId: string;
  locationId: string;
  total: number; // Amount in dollars
  environment: "sandbox" | "production";
  onPaymentSuccess: (result: { paymentId: string; status: string }) => void;
  onPaymentError: (error: string) => void;
  onBack: () => void;
  // Optional metadata
  userId?: string;
  eventId?: string;
  description?: string;
}

export function SquareCardPayment({
  applicationId,
  locationId,
  total,
  environment,
  onPaymentSuccess,
  onPaymentError,
  onBack,
  userId,
  eventId,
  description,
}: SquareCardPaymentProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [card, setCard] = useState<any>(null);
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const cardContainerRef = useRef<HTMLDivElement>(null);
  const initializationRef = useRef(false);

  const amountCents = Math.round(total * 100);

  // Load Square Web SDK
  useEffect(() => {
    // Check if script already exists
    const existingScript = document.querySelector('script[src*="square.js"]');
    if (existingScript) {
      if (window.Square) {
        setSdkLoaded(true);
      } else {
        existingScript.addEventListener("load", () => setSdkLoaded(true));
      }
      return;
    }

    const script = document.createElement("script");
    script.src = "https://web.squarecdn.com/v1/square.js";
    script.async = true;
    script.onload = () => {
      setSdkLoaded(true);
    };
    script.onerror = () => {
      setError("Failed to load Square payment SDK. Please refresh and try again.");
      setIsLoading(false);
    };
    document.body.appendChild(script);

    return () => {
      // Don't remove the script as it may be used by other components
    };
  }, []);

  // Initialize Square Card form when SDK is loaded
  useEffect(() => {
    if (!sdkLoaded || !window.Square || initializationRef.current) return;
    if (!applicationId || !locationId) {
      setError("Square payment configuration is missing. Please contact support.");
      setIsLoading(false);
      return;
    }

    initializationRef.current = true;
    initializeSquare();
  }, [sdkLoaded, applicationId, locationId]);

  async function initializeSquare() {
    try {
      const payments = await window.Square!.payments(applicationId, locationId);
      const cardElement = await payments.card();

      // Wait for container to be in DOM
      await new Promise((resolve) => setTimeout(resolve, 100));

      if (cardContainerRef.current) {
        await cardElement.attach(cardContainerRef.current);
        setCard(cardElement);
        setIsLoading(false);
        setError(null);
      } else {
        throw new Error("Card container not found");
      }
    } catch (err: any) {
      console.error("[SquareCardPayment] Initialization error:", err);
      setError(err.message || "Failed to initialize payment form. Please refresh and try again.");
      setIsLoading(false);
    }
  }

  async function handlePayment() {
    if (!card) {
      setError("Payment form not ready. Please wait or refresh the page.");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Tokenize the card
      const result = await card.tokenize();

      if (result.status === "OK") {
        const sourceId = result.token;

        // Process payment via API
        const response = await fetch("/api/credits/purchase-with-square", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            credits: Math.floor(amountCents / 30), // Convert to credits at $0.30 each
            sourceId,
            verificationToken: result.details?.verificationToken,
            // Additional metadata
            eventId,
            description: description || `Platform fee payment - $${total.toFixed(2)}`,
            amountCents,
          }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          onPaymentSuccess({
            paymentId: data.paymentId || sourceId,
            status: "COMPLETED",
          });
        } else {
          throw new Error(data.error || "Payment processing failed");
        }
      } else {
        // Tokenization failed
        const errors = result.errors || [];
        const errorMessage = errors[0]?.message || "Card validation failed. Please check your card details.";
        setError(errorMessage);
      }
    } catch (err: any) {
      console.error("[SquareCardPayment] Payment error:", err);
      const errorMessage = err.message || "Payment failed. Please try again.";
      setError(errorMessage);
      onPaymentError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            disabled={isProcessing}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Square Payment</CardTitle>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Amount Display */}
        <div className="bg-accent rounded-lg p-4 text-center">
          <p className="text-sm text-muted-foreground mb-1">Amount to Pay</p>
          <p className="text-3xl font-bold text-foreground">${total.toFixed(2)}</p>
        </div>

        {/* Card Input Container */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">Card Details</label>
          <div
            ref={cardContainerRef}
            id="square-card-container"
            className="border border-input rounded-lg p-4 min-h-[60px] bg-background"
          >
            {isLoading && (
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Loading payment form...</span>
              </div>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Security Note */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <CheckCircle className="h-3 w-3" />
          <span>Payments secured by Square</span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onBack}
            disabled={isProcessing}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handlePayment}
            disabled={isLoading || isProcessing || !card}
            className="flex-1"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              `Pay $${total.toFixed(2)}`
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Also export with the old interface for backward compatibility
export function SquareCardPaymentLegacy({
  amountCents,
  onSuccess,
  onError,
  onCancel,
}: {
  amountCents: number;
  onSuccess: (result: Record<string, unknown>) => void;
  onError: (error: string) => void;
  onCancel: () => void;
}) {
  return (
    <SquareCardPayment
      applicationId={process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID || ""}
      locationId={process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID || ""}
      total={amountCents / 100}
      environment={(process.env.NEXT_PUBLIC_SQUARE_ENVIRONMENT as "sandbox" | "production") || "sandbox"}
      onPaymentSuccess={(result) => onSuccess(result)}
      onPaymentError={onError}
      onBack={onCancel}
    />
  );
}
