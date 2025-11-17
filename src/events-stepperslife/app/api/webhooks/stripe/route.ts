import { type NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

// Validate environment variables
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL!;

if (!STRIPE_SECRET_KEY) {
  console.error("[Stripe Webhook] CRITICAL: STRIPE_SECRET_KEY is not set!");
}

if (!STRIPE_WEBHOOK_SECRET) {
  console.error("[Stripe Webhook] WARNING: STRIPE_WEBHOOK_SECRET is not set!");
}

// Initialize Stripe client
const stripe = STRIPE_SECRET_KEY
  ? new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: "2024-12-18.acacia",
    })
  : null;

// Initialize Convex client
const convex = new ConvexHttpClient(CONVEX_URL);

/**
 * Stripe Webhook Handler
 * POST /api/webhooks/stripe
 *
 * Handles the following events:
 * - checkout.session.completed: Payment succeeded
 * - payment_intent.succeeded: Payment intent succeeded
 * - payment_intent.payment_failed: Payment failed
 * - account.updated: Connect account status changed
 * - charge.refunded: Payment was refunded
 */
export async function POST(request: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json(
        { error: "Stripe is not configured" },
        { status: 500 }
      );
    }

    // Get raw body for signature verification
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      console.error("[Stripe Webhook] No signature found in request");
      return NextResponse.json({ error: "No signature" }, { status: 400 });
    }

    // Verify webhook signature
    let event: Stripe.Event;

    if (STRIPE_WEBHOOK_SECRET) {
      try {
        event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET);
      } catch (err: any) {
        console.error("[Stripe Webhook] Signature verification failed:", err.message);
        return NextResponse.json(
          { error: `Webhook signature verification failed: ${err.message}` },
          { status: 400 }
        );
      }
    } else {
      // Parse event without verification (development only)
      console.warn("[Stripe Webhook] Processing webhook without signature verification");
      event = JSON.parse(body) as Stripe.Event;
    }

    console.log(`[Stripe Webhook] Received event: ${event.type} (${event.id})`);

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case "payment_intent.succeeded":
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case "payment_intent.payment_failed":
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      case "account.updated":
        await handleAccountUpdated(event.data.object as Stripe.Account);
        break;

      case "charge.refunded":
        await handleChargeRefunded(event.data.object as Stripe.Charge);
        break;

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("[Stripe Webhook] Processing error:", error);
    return NextResponse.json(
      { error: error.message || "Webhook processing failed" },
      { status: 500 }
    );
  }
}

/**
 * Handle successful checkout session
 */
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log(`[Stripe Webhook] Checkout session completed: ${session.id}`);

  const orderId = session.metadata?.orderId;
  if (!orderId) {
    console.warn("[Stripe Webhook] No orderId in session metadata");
    return;
  }

  try {
    // Update order status in Convex
    await convex.mutation(api.orders.mutations.markOrderPaid, {
      orderId: orderId as any,
      paymentIntentId: session.payment_intent as string,
    });

    console.log(`[Stripe Webhook] Order ${orderId} marked as paid`);
  } catch (error: any) {
    console.error(`[Stripe Webhook] Failed to update order ${orderId}:`, error);
  }
}

/**
 * Handle successful payment intent
 */
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log(`[Stripe Webhook] Payment intent succeeded: ${paymentIntent.id}`);

  const orderId = paymentIntent.metadata?.orderId;
  if (!orderId) {
    console.warn("[Stripe Webhook] No orderId in payment intent metadata");
    return;
  }

  try {
    // Update order status in Convex
    await convex.mutation(api.orders.mutations.markOrderPaid, {
      orderId: orderId as any,
      paymentIntentId: paymentIntent.id,
    });

    console.log(`[Stripe Webhook] Order ${orderId} marked as paid via payment intent`);
  } catch (error: any) {
    console.error(`[Stripe Webhook] Failed to update order ${orderId}:`, error);
  }
}

/**
 * Handle failed payment intent
 */
async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log(`[Stripe Webhook] Payment intent failed: ${paymentIntent.id}`);

  const orderId = paymentIntent.metadata?.orderId;
  if (!orderId) {
    console.warn("[Stripe Webhook] No orderId in payment intent metadata");
    return;
  }

  try {
    // Update order status to failed in Convex
    await convex.mutation(api.orders.mutations.markOrderFailed, {
      orderId: orderId as any,
      reason: paymentIntent.last_payment_error?.message || "Payment failed",
    });

    console.log(`[Stripe Webhook] Order ${orderId} marked as failed`);
  } catch (error: any) {
    console.error(`[Stripe Webhook] Failed to update order ${orderId}:`, error);
  }
}

/**
 * Handle Connect account updates
 */
async function handleAccountUpdated(account: Stripe.Account) {
  console.log(`[Stripe Webhook] Account updated: ${account.id}`);

  // Check if account setup is complete
  const isComplete =
    account.details_submitted &&
    account.charges_enabled &&
    account.payouts_enabled &&
    (!account.requirements?.currently_due || account.requirements.currently_due.length === 0);

  try {
    // Update user's Stripe account status in Convex
    await convex.mutation(api.users.mutations.updateStripeAccountStatus, {
      stripeConnectedAccountId: account.id,
      setupComplete: isComplete,
      chargesEnabled: account.charges_enabled || false,
      payoutsEnabled: account.payouts_enabled || false,
      requirementsCurrentlyDue: account.requirements?.currently_due || [],
    });

    console.log(
      `[Stripe Webhook] Account ${account.id} status updated - Complete: ${isComplete}`
    );
  } catch (error: any) {
    console.error(`[Stripe Webhook] Failed to update account ${account.id}:`, error);
  }
}

/**
 * Handle charge refunds
 */
async function handleChargeRefunded(charge: Stripe.Charge) {
  console.log(`[Stripe Webhook] Charge refunded: ${charge.id}`);

  const paymentIntentId = charge.payment_intent as string;
  if (!paymentIntentId) {
    console.warn("[Stripe Webhook] No payment intent ID in charge");
    return;
  }

  try {
    // Find and update order with refund status
    await convex.mutation(api.orders.mutations.markOrderRefunded, {
      paymentIntentId: paymentIntentId,
      refundAmount: charge.amount_refunded,
      refundReason: charge.refunds?.data[0]?.reason || "requested_by_customer",
    });

    console.log(`[Stripe Webhook] Order with payment ${paymentIntentId} marked as refunded`);
  } catch (error: any) {
    console.error(`[Stripe Webhook] Failed to process refund for ${paymentIntentId}:`, error);
  }
}
