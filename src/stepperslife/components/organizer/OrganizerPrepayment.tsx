"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, CreditCard, Smartphone, CheckCircle, Loader2 } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import toast from "react-hot-toast";

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface OrganizerPrepaymentProps {
  eventId: string;
  eventName: string;
  estimatedTickets: number;
  pricePerTicket: number; // in dollars (e.g., 0.30)
  onPaymentSuccess: () => void;
  onCancel: () => void;
}

// Inner component that uses Stripe hooks
function PrepaymentForm({
  eventId,
  eventName,
  estimatedTickets,
  pricePerTicket,
  totalAmount,
  userId,
  onPaymentSuccess,
  onBack,
}: {
  eventId: string;
  eventName: string;
  estimatedTickets: number;
  pricePerTicket: number;
  totalAmount: number;
  userId: string;
  onPaymentSuccess: () => void;
  onBack: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const configurePayment = useMutation(api.events.mutations.configurePayment);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setError(submitError.message || "Payment validation failed");
        setIsProcessing(false);
        return;
      }

      // Confirm the payment
      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/organizer/events/${eventId}?prepay=success`,
        },
        redirect: "if_required",
      });

      if (confirmError) {
        setError(confirmError.message || "Payment failed");
        setIsProcessing(false);
        return;
      }

      if (paymentIntent && paymentIntent.status === "succeeded") {
        // Payment succeeded - now configure the event
        const configToast = toast.loading("Activating your event...");

        try {
          await configurePayment({
            eventId: eventId as Id<"events">,
            model: "PREPAY",
            ticketPrice: pricePerTicket,
          });

          toast.dismiss(configToast);
          toast.success("Payment successful! Your event is now active.");
          onPaymentSuccess();
        } catch (configError: any) {
          toast.dismiss(configToast);
          toast.error(configError.message || "Failed to configure event. Please contact support.");
          setError("Payment succeeded but event configuration failed. Please contact support.");
        }
      }
    } catch (err: any) {
      console.error("Payment error:", err);
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardContent className="pt-6">
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-foreground mb-2">Complete Payment</h3>
            <p className="text-muted-foreground">
              Prepay ${totalAmount.toFixed(2)} for {estimatedTickets} ticket credits
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Payment Element - supports Card + Cash App Pay */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <CreditCard className="w-5 h-5 text-muted-foreground" />
                <h4 className="font-semibold text-foreground">Payment Details</h4>
              </div>
              <div className="border border-border rounded-lg p-4">
                <PaymentElement
                  options={{
                    layout: "tabs",
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                <Smartphone className="w-3 h-3" />
                Cash App Pay available for US customers
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                {error}
              </div>
            )}

            {/* Payment Summary */}
            <div className="bg-accent rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-muted-foreground">Ticket Credits:</span>
                <span className="font-semibold text-foreground">{estimatedTickets} tickets</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-muted-foreground">Price per ticket:</span>
                <span className="font-semibold text-foreground">${pricePerTicket.toFixed(2)}</span>
              </div>
              <div className="border-t border-border pt-2 mt-2">
                <div className="flex items-center justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-primary">${totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={onBack}
                disabled={isProcessing}
              >
                Back
              </Button>
              <Button
                type="submit"
                disabled={isProcessing || !stripe || !elements}
                className="min-w-[150px]"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  <>Pay ${totalAmount.toFixed(2)}</>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export function OrganizerPrepayment({
  eventId,
  eventName,
  estimatedTickets,
  pricePerTicket,
  onPaymentSuccess,
  onCancel,
}: OrganizerPrepaymentProps) {
  const [showPayment, setShowPayment] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get current user for userId
  const currentUser = useQuery(api.users.queries.getCurrentUser);

  const totalAmount = estimatedTickets * pricePerTicket;
  const totalAmountCents = Math.round(totalAmount * 100);

  // Create payment intent when proceeding to payment
  const handleProceedToPayment = async () => {
    if (!currentUser?._id) {
      toast.error("Please log in to continue");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/stripe/create-platform-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: totalAmountCents,
          productType: "CREDITS",
          userId: currentUser._id,
          ticketQuantity: estimatedTickets,
          pricePerTicket: Math.round(pricePerTicket * 100), // Convert to cents
          metadata: {
            eventId,
            eventName,
            purchaseType: "PREPAY",
          },
        }),
      });

      const data = await response.json();

      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
        setShowPayment(true);
      } else {
        setError(data.error || "Failed to initialize payment");
        toast.error(data.error || "Failed to initialize payment");
      }
    } catch (err: any) {
      console.error("Failed to create payment intent:", err);
      setError("Failed to initialize payment. Please try again.");
      toast.error("Failed to initialize payment. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Show payment form with Stripe Elements
  if (showPayment && clientSecret && currentUser?._id) {
    return (
      <Elements
        stripe={stripePromise}
        options={{
          clientSecret,
          appearance: {
            theme: "stripe",
            variables: {
              colorPrimary: "#0066cc",
            },
          },
        }}
      >
        <PrepaymentForm
          eventId={eventId}
          eventName={eventName}
          estimatedTickets={estimatedTickets}
          pricePerTicket={pricePerTicket}
          totalAmount={totalAmount}
          userId={currentUser._id}
          onPaymentSuccess={onPaymentSuccess}
          onBack={() => {
            setShowPayment(false);
            setClientSecret(null);
          }}
        />
      </Elements>
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
              {estimatedTickets} tickets x ${pricePerTicket.toFixed(2)} each
            </p>
          </div>

          <div className="mt-6 bg-background rounded-lg p-4 border border-border">
            <div className="flex items-start gap-3">
              <DollarSign className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-foreground mb-1">What happens after payment:</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    Your event is activated immediately
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    Customers can purchase tickets
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    You receive 100% of ticket sales revenue
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    No additional fees per transaction
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Method Selection */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold text-foreground mb-2">Pay with Card or Cash App</h3>
            <p className="text-sm text-muted-foreground">
              Secure payment processing by Stripe
            </p>
          </div>

          <div className="flex items-center justify-center gap-6 mb-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CreditCard className="w-5 h-5" />
              Credit/Debit Card
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Smartphone className="w-5 h-5" />
              Cash App Pay
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm text-center">
              {error}
            </div>
          )}

          <Button
            onClick={handleProceedToPayment}
            disabled={isLoading || !currentUser}
            className="w-full py-6 text-lg"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Initializing...
              </>
            ) : (
              <>Proceed to Payment - ${totalAmount.toFixed(2)}</>
            )}
          </Button>
        </CardContent>
      </Card>

      <div className="text-center">
        <Button variant="ghost" onClick={onCancel} className="text-muted-foreground hover:text-foreground">
          Cancel and Go Back
        </Button>
      </div>
    </div>
  );
}
