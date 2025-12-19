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
      apiVersion: "2025-10-29.clover",
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

  } catch (error: any) {
    console.error(`[Stripe Webhook] Failed to update order ${orderId}:`, error);
  }
}

/**
 * Handle successful payment intent
 * Handles both ticket orders (split payments) and platform products (100% to platform)
 */
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const { metadata } = paymentIntent;
  const chargeType = metadata?.chargeType;
  const productType = metadata?.productType;

  // Check if this is a platform product payment (100% to platform)
  if (chargeType === "PLATFORM" && productType) {
    await handlePlatformProductPayment(paymentIntent);
    return;
  }

  // Otherwise, handle as a ticket order payment (split payment)
  const orderId = metadata?.orderId;
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

    // Record debt settlement if this payment included a settlement amount
    const settlementAmount = parseInt(metadata?.settlementAmount || "0", 10);
    const organizerId = metadata?.organizerId;
    const eventId = metadata?.eventId;

    if (settlementAmount > 0 && organizerId) {
      try {
        await convex.mutation(api.platformDebt.mutations.recordSettlement, {
          organizerId,
          orderId,
          eventId,
          settlementAmountCents: settlementAmount,
        });
        console.log(
          `[Stripe Webhook] Recorded debt settlement for organizer ${organizerId}: $${(settlementAmount / 100).toFixed(2)}`
        );
      } catch (settlementError: any) {
        console.error(
          `[Stripe Webhook] Failed to record debt settlement for order ${orderId}:`,
          settlementError
        );
        // Don't fail the order - the debt will be collected on the next payment
      }
    }

  } catch (error: any) {
    console.error(`[Stripe Webhook] Failed to update order ${orderId}:`, error);
  }
}

/**
 * Handle platform product payments (100% to platform)
 * - Credit purchases
 * - Subscriptions
 * - Promotions
 * - Premium features
 */
async function handlePlatformProductPayment(paymentIntent: Stripe.PaymentIntent) {
  const { metadata } = paymentIntent;
  const productType = metadata?.productType;
  const userId = metadata?.userId;

  if (!productType || !userId) {
    console.warn("[Stripe Webhook] Missing productType or userId in platform payment metadata");
    return;
  }

  try {
    switch (productType) {
      case "CREDITS":
        // Confirm credit purchase - this updates the organizer's credit balance
        const ticketQuantity = parseInt(metadata?.ticketQuantity || "0", 10);
        const pricePerTicket = parseInt(metadata?.pricePerTicket || "0", 10);

        await convex.mutation(api.credits.mutations.confirmCreditPurchase, {
          organizerId: userId as any,
          stripePaymentIntentId: paymentIntent.id,
          ticketsPurchased: ticketQuantity,
          amountPaid: paymentIntent.amount,
          pricePerTicket: pricePerTicket,
        });
        console.log(`[Stripe Webhook] Credit purchase confirmed for user ${userId}: ${ticketQuantity} tickets`);
        break;

      case "SUBSCRIPTION":
        // Handle subscription activation
        const subscriptionPlan = metadata?.subscriptionPlan;
        console.log(`[Stripe Webhook] Subscription payment received for user ${userId}: ${subscriptionPlan}`);
        // TODO: Implement subscription activation mutation when subscription system is built
        // await convex.mutation(api.subscriptions.mutations.activateSubscription, {...});
        break;

      case "PROMOTION":
        // Handle event promotion purchase
        const eventId = metadata?.eventId;
        const promotionType = metadata?.promotionType;
        console.log(`[Stripe Webhook] Promotion purchase for event ${eventId}: ${promotionType}`);
        // TODO: Implement promotion activation mutation when promotion system is built
        // await convex.mutation(api.promotions.mutations.activatePromotion, {...});
        break;

      case "PREMIUM_FEATURE":
        // Handle premium feature purchase
        console.log(`[Stripe Webhook] Premium feature purchase for user ${userId}`);
        // TODO: Implement premium feature activation when system is built
        break;

      default:
        console.warn(`[Stripe Webhook] Unknown platform product type: ${productType}`);
    }
  } catch (error: any) {
    console.error(`[Stripe Webhook] Failed to process platform payment for ${productType}:`, error);
  }
}

/**
 * Handle failed payment intent
 */
async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {

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

  } catch (error: any) {
    console.error(`[Stripe Webhook] Failed to update order ${orderId}:`, error);
  }
}

/**
 * Handle Connect account updates
 */
async function handleAccountUpdated(account: Stripe.Account) {

  // Check if account setup is complete
  const isComplete =
    account.details_submitted &&
    account.charges_enabled &&
    account.payouts_enabled &&
    (!account.requirements?.currently_due || account.requirements.currently_due.length === 0);

  try {
    // Update user's Stripe account status in Convex
    await convex.mutation(api.users.mutations.updateStripeAccountStatus, {
      accountId: account.id,
      chargesEnabled: account.charges_enabled || false,
      payoutsEnabled: account.payouts_enabled || false,
      detailsSubmitted: account.details_submitted || false,
    });

  } catch (error: any) {
    console.error(`[Stripe Webhook] Failed to update account ${account.id}:`, error);
  }
}

/**
 * Handle charge refunds
 */
async function handleChargeRefunded(charge: Stripe.Charge) {

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

  } catch (error: any) {
    console.error(`[Stripe Webhook] Failed to process refund for ${paymentIntentId}:`, error);
  }
}
