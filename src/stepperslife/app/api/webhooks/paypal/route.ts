import { type NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const PAYPAL_WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID;
const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL!;

const convex = new ConvexHttpClient(CONVEX_URL);

/**
 * PayPal Webhook Handler
 * POST /api/webhooks/paypal
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const event = JSON.parse(body);

    // Log webhook event for debugging
    console.log("[PayPal Webhook] Received event:", event.event_type);

    // Handle different event types
    switch (event.event_type) {
      case "PAYMENT.CAPTURE.COMPLETED":
        await handlePaymentCaptureCompleted(event);
        break;

      case "PAYMENT.CAPTURE.DENIED":
        await handlePaymentCaptureDenied(event);
        break;

      case "PAYMENT.CAPTURE.REFUNDED":
        await handlePaymentRefunded(event);
        break;

      case "CHECKOUT.ORDER.APPROVED":
        console.log("[PayPal Webhook] Order approved:", event.resource?.id);
        break;

      default:
        console.log("[PayPal Webhook] Unhandled event type:", event.event_type);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("[PayPal Webhook] Error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

/**
 * Handle successful payment capture
 */
async function handlePaymentCaptureCompleted(event: any) {
  const resource = event.resource;
  const customId = resource?.custom_id;

  if (!customId) {
    console.log("[PayPal Webhook] No custom_id in payment capture");
    return;
  }

  try {
    const metadata = JSON.parse(customId);
    const orderId = metadata.orderId;

    if (orderId) {
      await convex.mutation(api.orders.mutations.markOrderPaid, {
        orderId: orderId as any,
        paymentIntentId: resource.id,
      });
      console.log(`[PayPal Webhook] Order ${orderId} marked as paid`);
    }
  } catch (error: any) {
    console.error("[PayPal Webhook] Failed to process payment capture:", error);
  }
}

/**
 * Handle denied payment capture
 */
async function handlePaymentCaptureDenied(event: any) {
  const resource = event.resource;
  console.log("[PayPal Webhook] Payment capture denied:", resource?.id);
  // Could update order status to failed here
}

/**
 * Handle refunded payment
 */
async function handlePaymentRefunded(event: any) {
  const resource = event.resource;
  console.log("[PayPal Webhook] Payment refunded:", resource?.id);
  // Could update order status to refunded here
}
