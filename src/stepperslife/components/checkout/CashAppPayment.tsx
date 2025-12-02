"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Smartphone, Loader2, ArrowLeft, AlertCircle, CheckCircle, QrCode } from "lucide-react";

// Declare Square global type
declare global {
  interface Window {
    Square?: {
      payments: (appId: string, locationId: string) => Promise<any>;
    };
  }
}

interface CashAppPaymentProps {
  total: number; // Amount in dollars
  onPaymentSuccess: (result: { paymentId: string; status: string }) => void;
  onPaymentError: (error: string) => void;
  onBack: () => void;
  // Optional metadata
  userId?: string;
  eventId?: string;
  description?: string;
}

export function CashAppQRPayment({
  total,
  onPaymentSuccess,
  onPaymentError,
  onBack,
  userId,
  eventId,
  description,
}: CashAppPaymentProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cashAppPay, setCashAppPay] = useState<any>(null);
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const cashAppContainerRef = useRef<HTMLDivElement>(null);
  const initializationRef = useRef(false);

  const applicationId = process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID || "";
  const locationId = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID || "";
  const amountCents = Math.round(total * 100);

  // Load Square Web SDK
  useEffect(() => {
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
    script.onload = () => setSdkLoaded(true);
    script.onerror = () => {
      setError("Failed to load payment SDK. Please refresh and try again.");
      setIsLoading(false);
    };
    document.body.appendChild(script);
  }, []);

  // Initialize Cash App Pay when SDK is loaded
  useEffect(() => {
    if (!sdkLoaded || !window.Square || initializationRef.current) return;
    if (!applicationId || !locationId) {
      setError("Cash App payment configuration is missing. Please contact support.");
      setIsLoading(false);
      return;
    }

    initializationRef.current = true;
    initializeCashApp();
  }, [sdkLoaded, applicationId, locationId]);

  async function initializeCashApp() {
    try {
      const payments = await window.Square!.payments(applicationId, locationId);

      // Create payment request for Cash App
      const paymentRequest = payments.paymentRequest({
        countryCode: "US",
        currencyCode: "USD",
        total: {
          amount: total.toFixed(2),
          label: description || "SteppersLife Payment",
        },
      });

      // Initialize Cash App Pay
      const cashApp = await payments.cashAppPay(paymentRequest, {
        redirectURL: window.location.href,
        referenceId: `${eventId || "payment"}-${Date.now()}`,
      });

      // Wait for container to be ready
      await new Promise((resolve) => setTimeout(resolve, 100));

      if (cashAppContainerRef.current) {
        await cashApp.attach(cashAppContainerRef.current);
        setCashAppPay(cashApp);
        setIsLoading(false);
        setError(null);

        // Handle tokenization events
        cashApp.addEventListener("ontokenization", async (event: any) => {
          const { tokenResult } = event.detail;

          if (tokenResult.status === "OK") {
            await processPayment(tokenResult.token);
          } else {
            const errors = tokenResult.errors || [];
            setError(errors[0]?.message || "Cash App payment failed");
          }
        });
      } else {
        throw new Error("Cash App container not found");
      }
    } catch (err: any) {
      console.error("[CashAppPayment] Initialization error:", err);

      // Cash App Pay may not be available in all regions/configurations
      if (err.message?.includes("not supported") || err.message?.includes("not available")) {
        setError("Cash App Pay is not available in your region. Please use card payment instead.");
      } else {
        setError(err.message || "Failed to initialize Cash App Pay. Please try card payment.");
      }
      setIsLoading(false);
    }
  }

  async function processPayment(token: string) {
    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch("/api/credits/purchase-with-square", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          credits: Math.floor(amountCents / 30),
          sourceId: token,
          eventId,
          description: description || `Cash App payment - $${total.toFixed(2)}`,
          amountCents,
          paymentMethod: "cashapp",
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        onPaymentSuccess({
          paymentId: data.paymentId || token,
          status: "COMPLETED",
        });
      } else {
        throw new Error(data.error || "Payment processing failed");
      }
    } catch (err: any) {
      console.error("[CashAppPayment] Payment error:", err);
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
            <Smartphone className="h-5 w-5 text-green-500" />
            <CardTitle className="text-lg">Cash App Pay</CardTitle>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Amount Display */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <p className="text-sm text-green-700 mb-1">Amount to Pay</p>
          <p className="text-3xl font-bold text-green-800">${total.toFixed(2)}</p>
        </div>

        {/* Cash App Button Container */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-8">
              <Loader2 className="h-8 w-8 animate-spin text-green-500" />
              <p className="text-sm text-muted-foreground">Loading Cash App Pay...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-4 py-6">
              <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg w-full">
                <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
              <Button variant="outline" onClick={onBack} className="w-full">
                Go Back and Try Card Payment
              </Button>
            </div>
          ) : (
            <>
              {/* Cash App Pay Button will be rendered here */}
              <div
                ref={cashAppContainerRef}
                id="cash-app-container"
                className="min-h-[50px] flex items-center justify-center"
              />

              {/* Instructions */}
              <div className="bg-accent rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <QrCode className="h-4 w-4" />
                  <span>How it works:</span>
                </div>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Click the Cash App button above</li>
                  <li>Scan the QR code with your phone</li>
                  <li>Approve the payment in Cash App</li>
                </ol>
              </div>
            </>
          )}
        </div>

        {/* Processing Overlay */}
        {isProcessing && (
          <div className="flex items-center justify-center gap-2 py-4">
            <Loader2 className="h-5 w-5 animate-spin text-green-500" />
            <span className="text-sm">Processing payment...</span>
          </div>
        )}

        {/* Security Note */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <CheckCircle className="h-3 w-3 text-green-500" />
          <span>Secured by Cash App and Square</span>
        </div>

        {/* Cancel Button */}
        {!error && (
          <Button
            variant="outline"
            onClick={onBack}
            disabled={isProcessing}
            className="w-full"
          >
            Cancel
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// Legacy export for backward compatibility
export { CashAppQRPayment as CashAppPayment };
