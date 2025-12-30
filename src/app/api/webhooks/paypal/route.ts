import { type NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

/** PayPal webhook event structure */
interface PayPalWebhookEvent {
  event_type: string;
  resource: {
    id?: string;
    custom_id?: string;
  };
}

/** Type-safe error message extraction */
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

const PAYPAL_WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID;
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_API_BASE = process.env.NODE_ENV === "production"
  ? "https://api-m.paypal.com"
  : "https://api-m.sandbox.paypal.com";
const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL!;

const convex = new ConvexHttpClient(CONVEX_URL);

/**
 * Verify PayPal webhook signature
 * https://developer.paypal.com/docs/api-basics/notifications/webhooks/notification-messages/
 */
async function verifyWebhookSignature(
  request: NextRequest,
  body: string
): Promise<boolean> {
  // If no webhook ID configured, reject in production
  if (!PAYPAL_WEBHOOK_ID) {
    console.error("[PayPal Webhook] PAYPAL_WEBHOOK_ID not configured");
    if (process.env.NODE_ENV === "production") {
      return false;
    }
    // Allow unverified in development with warning
    console.warn("[PayPal Webhook] WARNING: Processing unverified webhook in development mode");
    return true;
  }

  if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    console.error("[PayPal Webhook] PayPal credentials not configured");
    return false;
  }

  try {
    // Get headers required for verification
    const transmissionId = request.headers.get("paypal-transmission-id");
    const transmissionTime = request.headers.get("paypal-transmission-time");
    const certUrl = request.headers.get("paypal-cert-url");
    const authAlgo = request.headers.get("paypal-auth-algo");
    const transmissionSig = request.headers.get("paypal-transmission-sig");

    if (!transmissionId || !transmissionTime || !certUrl || !authAlgo || !transmissionSig) {
      console.error("[PayPal Webhook] Missing required headers for verification");
      return false;
    }

    // Get access token
    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString("base64");
    const tokenResponse = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    if (!tokenResponse.ok) {
      console.error("[PayPal Webhook] Failed to get access token");
      return false;
    }

    const { access_token } = await tokenResponse.json();

    // Verify the webhook signature
    const verifyResponse = await fetch(`${PAYPAL_API_BASE}/v1/notifications/verify-webhook-signature`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        auth_algo: authAlgo,
        cert_url: certUrl,
        transmission_id: transmissionId,
        transmission_sig: transmissionSig,
        transmission_time: transmissionTime,
        webhook_id: PAYPAL_WEBHOOK_ID,
        webhook_event: JSON.parse(body),
      }),
    });

    if (!verifyResponse.ok) {
      console.error("[PayPal Webhook] Verification request failed");
      return false;
    }

    const verification = await verifyResponse.json();
    return verification.verification_status === "SUCCESS";
  } catch (error) {
    console.error("[PayPal Webhook] Verification error:", error);
    return false;
  }
}

/**
 * PayPal Webhook Handler
 * POST /api/webhooks/paypal
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();

    // Verify webhook signature before processing
    const isValid = await verifyWebhookSignature(request, body);
    if (!isValid) {
      console.error("[PayPal Webhook] Invalid webhook signature - rejecting request");
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 401 }
      );
    }

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
  } catch (error: unknown) {
    console.error("[PayPal Webhook] Error:", getErrorMessage(error));
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

/**
 * Handle successful payment capture
 */
async function handlePaymentCaptureCompleted(event: PayPalWebhookEvent) {
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
        orderId: orderId as Id<"orders">,
        paymentIntentId: resource.id ?? "",
      });
      console.log(`[PayPal Webhook] Order ${orderId} marked as paid`);
    }
  } catch (error: unknown) {
    console.error("[PayPal Webhook] Failed to process payment capture:", getErrorMessage(error));
  }
}

/**
 * Handle denied payment capture
 */
async function handlePaymentCaptureDenied(event: PayPalWebhookEvent) {
  const resource = event.resource;
  console.log("[PayPal Webhook] Payment capture denied:", resource?.id);
  // TODO: DEFERRED - Update order status to failed here
}

/**
 * Handle refunded payment
 */
async function handlePaymentRefunded(event: PayPalWebhookEvent) {
  const resource = event.resource;
  console.log("[PayPal Webhook] Payment refunded:", resource?.id);
  // TODO: DEFERRED - Update order status to refunded here
}
