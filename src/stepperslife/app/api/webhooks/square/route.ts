/**
 * Square Webhook Handler
 *
 * POST /api/webhooks/square
 * Handles payment events from Square
 */

import { NextRequest, NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import crypto from "crypto";
import { convexClient as convex } from "@/lib/auth/convex-client";

// Square webhook signature verification
function verifySquareSignature(
  body: string,
  signatureHeader: string | null,
  signatureKey: string
): boolean {
  if (!signatureHeader) return false;

  try {
    const hmac = crypto.createHmac("sha256", signatureKey);
    hmac.update(body);
    const hash = hmac.digest("base64");

    return hash === signatureHeader;
  } catch (error) {
    console.error("[Square Webhook] Signature verification error:", error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-square-hmacsha256-signature");

    // Verify webhook signature (production only)
    if (process.env.SQUARE_ENVIRONMENT === "production") {
      const signatureKey = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY;
      if (!signatureKey) {
        console.error("[Square Webhook] Missing SQUARE_WEBHOOK_SIGNATURE_KEY");
        return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
      }

      const isValid = verifySquareSignature(rawBody, signature, signatureKey);
      if (!isValid) {
        console.error("[Square Webhook] Invalid signature");
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    }

    const event = JSON.parse(rawBody);

    // Handle different event types
    switch (event.type) {
      case "payment.created":
        await handlePaymentCreated(event.data);
        break;

      case "payment.updated":
        await handlePaymentUpdated(event.data);
        break;

      case "refund.created":
        await handleRefundCreated(event.data);
        break;

      case "refund.updated":
        await handleRefundUpdated(event.data);
        break;

      default:
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error("[Square Webhook] Error processing webhook:", error);
    return NextResponse.json(
      { error: "Webhook processing failed", details: error.message },
      { status: 500 }
    );
  }
}

async function handlePaymentCreated(data: any) {

  const payment = data.object?.payment;
  if (!payment) {
    console.error("[Square Webhook] No payment object in data");
    return;
  }

  // Extract order reference from payment metadata
  const orderId = payment.note || payment.reference_id;
  if (!orderId) {
    return;
  }

  try {
    // Payment is created - typically moves to APPROVED/COMPLETED quickly
    // We'll handle the actual order update in handlePaymentUpdated
  } catch (error) {
    console.error("[Square Webhook] Error handling payment created:", error);
  }
}

async function handlePaymentUpdated(data: any) {

  const payment = data.object?.payment;
  if (!payment) {
    console.error("[Square Webhook] No payment object in data");
    return;
  }

  // Extract order ID from payment metadata
  const orderId = payment.reference_id;
  if (!orderId) {
    console.warn("[Square Webhook] No reference_id in payment object");
    return;
  }

  try {
    // Check payment status
    if (payment.status === "COMPLETED") {

      // Complete the order
      await convex.mutation(api.tickets.mutations.completeOrder, {
        orderId: orderId as Id<"orders">,
        paymentId: payment.id,
        paymentMethod: "SQUARE",
      });

    } else if (payment.status === "FAILED" || payment.status === "CANCELED") {

      // Mark the order as failed
      await convex.mutation(api.orders.mutations.markOrderFailed, {
        orderId: orderId as Id<"orders">,
        reason: `Payment ${payment.status.toLowerCase()}`,
      });
    }
  } catch (error) {
    console.error("[Square Webhook] Error handling payment updated:", error);
  }
}

async function handleRefundCreated(data: any) {

  const refund = data.object?.refund;
  if (!refund) {
    console.error("[Square Webhook] No refund object in data");
    return;
  }

  try {
    // Use Square payment ID to track refund
    const paymentId = refund.payment_id;
    if (!paymentId) {
      console.warn("[Square Webhook] No payment_id in refund object");
      return;
    }

    // Note: Square customer payments are deprecated. This handler remains for legacy support.
    // The markOrderRefunded mutation searches by stripePaymentIntentId, which won't find
    // Square payments. For proper Square refund handling, the orders schema would need
    // a squarePaymentId field and markOrderRefunded would need to support multiple payment types.
    console.warn("[Square Webhook] Square customer payments are deprecated. Refund handling may not work correctly.");

    // Attempt to mark order as refunded (will likely not find the order)
    await convex.mutation(api.orders.mutations.markOrderRefunded, {
      paymentIntentId: paymentId,
      refundAmount: refund.amount_money?.amount || 0,
      refundReason: refund.reason || "requested_by_customer",
    });

  } catch (error) {
    console.error("[Square Webhook] Error handling refund created:", error);
  }
}

async function handleRefundUpdated(data: any) {
  // Similar to refund created, handle status changes
}
