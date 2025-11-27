"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CreditCard, Loader2 } from "lucide-react";

interface SquareCardPaymentProps {
  amountCents: number;
  onSuccess: (result: Record<string, unknown>) => void;
  onError: (error: string) => void;
  onCancel: () => void;
}

export function SquareCardPayment({
  amountCents,
  onSuccess,
  onError,
  onCancel,
}: SquareCardPaymentProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      // TODO: Integrate with Square Web Payments SDK
      // For now, show placeholder
      onError("Square payments not yet configured. Please contact support.");
    } catch (error) {
      onError(error instanceof Error ? error.message : "Payment failed");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="text-center space-y-4">
          <CreditCard className="h-12 w-12 mx-auto text-muted-foreground" />
          <h3 className="font-semibold">Square Card Payment</h3>
          <p className="text-sm text-muted-foreground">
            Amount: ${(amountCents / 100).toFixed(2)}
          </p>
          <div className="flex gap-2 justify-center">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={handlePayment} disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Pay with Square"
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
