"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, CreditCard, Smartphone, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { SquareCardPayment } from "@/components/checkout/SquareCardPayment";
import { CashAppQRPayment } from "@/components/checkout/CashAppPayment";
import toast from "react-hot-toast";

interface OrganizerPrepaymentProps {
  eventId: string;
  eventName: string;
  estimatedTickets: number;
  pricePerTicket: number; // in dollars (e.g., 0.30)
  onPaymentSuccess: () => void;
  onCancel: () => void;
}

export function OrganizerPrepayment({
  eventId,
  eventName,
  estimatedTickets,
  pricePerTicket,
  onPaymentSuccess,
  onCancel,
}: OrganizerPrepaymentProps) {
  const [selectedMethod, setSelectedMethod] = useState<"square" | "cashapp" | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [isConfiguring, setIsConfiguring] = useState(false);

  // Get current user for userId
  const currentUser = useQuery(api.users.queries.getCurrentUser);

  // Convex mutations
  const configurePayment = useMutation(api.events.mutations.configurePayment);
  const purchaseCredits = useMutation(api.credits.mutations.purchaseCredits);

  const totalAmount = estimatedTickets * pricePerTicket;
  const totalAmountCents = Math.round(totalAmount * 100);

  const handlePaymentMethodSelect = (method: "square" | "cashapp") => {
    setSelectedMethod(method);
    setShowPayment(true);
  };

  const handleSquarePaymentSuccess = async (result: { paymentId: string; status: string }) => {
    setIsConfiguring(true);
    const loadingToast = toast.loading("Configuring your event...");

    try {
      // Step 1: Record the credit purchase transaction
      if (!currentUser?._id) {
        throw new Error("User not found");
      }

      await purchaseCredits({
        userId: currentUser._id,
        credits: estimatedTickets,
        squarePaymentId: result.paymentId,
        amountPaid: totalAmountCents,
      });

      // Step 2: Configure the event with PREPAY model
      await configurePayment({
        eventId: eventId as Id<"events">,
        model: "PREPAY",
        ticketPrice: pricePerTicket,
      });

      toast.dismiss(loadingToast);
      toast.success("Payment successful! Your event is now active.");
      onPaymentSuccess();
    } catch (error: any) {
      console.error("[OrganizerPrepayment] Configuration error:", error);
      toast.dismiss(loadingToast);
      toast.error(error.message || "Failed to configure event. Please contact support.");
      // Don't call onPaymentSuccess since configuration failed
    } finally {
      setIsConfiguring(false);
    }
  };

  const handleSquarePaymentError = (error: string) => {
    console.error("[Prepayment] Payment error:", error);
    toast.error(`Payment failed: ${error}`);
  };

  const handleCashAppPaymentSuccess = async (result: { paymentId: string; status: string }) => {
    setIsConfiguring(true);
    const loadingToast = toast.loading("Configuring your event...");

    try {
      // Step 1: Record the credit purchase transaction
      if (!currentUser?._id) {
        throw new Error("User not found");
      }

      await purchaseCredits({
        userId: currentUser._id,
        credits: estimatedTickets,
        squarePaymentId: result.paymentId,
        amountPaid: totalAmountCents,
      });

      // Step 2: Configure the event with PREPAY model
      await configurePayment({
        eventId: eventId as Id<"events">,
        model: "PREPAY",
        ticketPrice: pricePerTicket,
      });

      toast.dismiss(loadingToast);
      toast.success("Payment successful! Your event is now active.");
      onPaymentSuccess();
    } catch (error: any) {
      console.error("[OrganizerPrepayment] CashApp configuration error:", error);
      toast.dismiss(loadingToast);
      toast.error(error.message || "Failed to configure event. Please contact support.");
    } finally {
      setIsConfiguring(false);
    }
  };

  const handleCashAppPaymentError = (error: string) => {
    console.error("[Prepayment] CashApp payment error:", error);
    toast.error(`Payment failed: ${error}`);
  };

  // Show loading while configuring
  if (isConfiguring) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <h3 className="text-xl font-semibold">Activating Your Event...</h3>
              <p className="text-muted-foreground text-center">
                Please wait while we configure your event settings.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showPayment && selectedMethod === "square") {
    return (
      <div className="max-w-2xl mx-auto">
        <SquareCardPayment
          applicationId={process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID || ""}
          locationId={process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID || ""}
          total={totalAmount}
          environment={
            (process.env.NEXT_PUBLIC_SQUARE_ENVIRONMENT as "sandbox" | "production") || "sandbox"
          }
          onPaymentSuccess={handleSquarePaymentSuccess}
          onPaymentError={handleSquarePaymentError}
          onBack={() => {
            setShowPayment(false);
            setSelectedMethod(null);
          }}
          userId={currentUser?._id}
          eventId={eventId}
          description={`PREPAY: ${estimatedTickets} tickets for "${eventName}"`}
        />
      </div>
    );
  }

  if (showPayment && selectedMethod === "cashapp") {
    return (
      <div className="max-w-2xl mx-auto">
        <CashAppQRPayment
          total={totalAmount}
          onPaymentSuccess={handleCashAppPaymentSuccess}
          onPaymentError={handleCashAppPaymentError}
          onBack={() => {
            setShowPayment(false);
            setSelectedMethod(null);
          }}
          userId={currentUser?._id}
          eventId={eventId}
          description={`PREPAY: ${estimatedTickets} tickets for "${eventName}"`}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">Complete Platform Fee Payment</h2>
        <p className="text-muted-foreground">
          Pay upfront for "{eventName}" and collect 100% of ticket sales
        </p>
      </div>

      {/* Payment Summary */}
      <Card className="bg-accent border-2 border-border">
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">Total Platform Fee</p>
            <p className="text-4xl font-bold text-foreground mb-2">${totalAmount.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground">
              {estimatedTickets} tickets × ${pricePerTicket.toFixed(2)} each
            </p>
          </div>

          <div className="mt-6 bg-white rounded-lg p-4 border border-border">
            <div className="flex items-start gap-3">
              <DollarSign className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-foreground mb-1">What happens after payment:</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>✓ Your event is activated immediately</li>
                  <li>✓ Customers can purchase tickets</li>
                  <li>✓ You receive 100% of ticket sales revenue</li>
                  <li>✓ No additional fees per transaction</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Method Selection */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Square Payment */}
        <button
          type="button"
          onClick={() => handlePaymentMethodSelect("square")}
          className="bg-white rounded-lg border-2 border-border p-6 text-left hover:border-primary hover:shadow-lg transition-all"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Square</h3>
              <p className="text-sm text-primary">Credit/Debit Card</p>
            </div>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-foreground">
              <CheckCircle className="w-4 h-4 text-success" />
              Instant activation
            </div>
            <div className="flex items-center gap-2 text-sm text-foreground">
              <CheckCircle className="w-4 h-4 text-success" />
              Secure payment processing
            </div>
            <div className="flex items-center gap-2 text-sm text-foreground">
              <CheckCircle className="w-4 h-4 text-success" />
              All major cards accepted
            </div>
          </div>

          <div className="bg-accent rounded-lg p-3 text-center">
            <p className="text-sm font-semibold text-foreground">Recommended</p>
          </div>
        </button>

        {/* CashApp Payment */}
        <button
          type="button"
          onClick={() => handlePaymentMethodSelect("cashapp")}
          className="bg-white rounded-lg border-2 border-border p-6 text-left hover:border-success hover:shadow-lg transition-all"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-success" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">CashApp</h3>
              <p className="text-sm text-success">Mobile Payment</p>
            </div>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-foreground">
              <CheckCircle className="w-4 h-4 text-success" />
              Pay from your phone
            </div>
            <div className="flex items-center gap-2 text-sm text-foreground">
              <CheckCircle className="w-4 h-4 text-success" />
              No card needed
            </div>
            <div className="flex items-center gap-2 text-sm text-foreground">
              <CheckCircle className="w-4 h-4 text-success" />
              Instant confirmation
            </div>
          </div>

          <div className="bg-success/10 rounded-lg p-3 text-center">
            <p className="text-sm font-semibold text-success">Alternative Option</p>
          </div>
        </button>
      </div>

      <div className="text-center">
        <Button variant="ghost" onClick={onCancel} className="text-muted-foreground hover:text-foreground">
          Cancel and Go Back
        </Button>
      </div>
    </div>
  );
}
