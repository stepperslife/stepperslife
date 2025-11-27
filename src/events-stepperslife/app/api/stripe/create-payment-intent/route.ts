import { type NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

// Validate environment variables
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL!;

if (!STRIPE_SECRET_KEY) {
  console.error("[Stripe] CRITICAL: STRIPE_SECRET_KEY is not set!");
}

if (!CONVEX_URL) {
  console.error("[Convex] CRITICAL: CONVEX_URL is not set!");
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
 * Create a Payment Intent with Stripe Connect split payments
 * POST /api/stripe/create-payment-intent
 *
 * Supports both charge patterns:
 * - DIRECT CHARGE: Payment goes to organizer's account, platform takes application_fee
 * - DESTINATION CHARGE: Payment goes to platform, then transfers to organizer (with application_fee)
 *
 * The charge pattern is determined by the useDirectCharge parameter.
 */
export async function POST(request: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json(
        { error: "Stripe is not configured. Please contact support." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const {
      eventId, // Event ID to fetch payment config
      amount, // Total amount in cents
      currency = "usd",
      connectedAccountId, // Optional: can override from payment config
      platformFee, // Platform fee in cents
      orderId,
      orderNumber,
      metadata = {},
      useDirectCharge = false, // Default to DESTINATION CHARGE for platform control
    } = body;

    if (!amount) {
      return NextResponse.json({ error: "Amount is required" }, { status: 400 });
    }

    // Determine which connected account to use
    let stripeAccountId = connectedAccountId;

    // If eventId provided, fetch payment config from Convex
    if (eventId && !connectedAccountId) {
      try {
        const paymentConfig = await convex.query(api.paymentConfig.queries.getEventPaymentConfig, {
          eventId,
        });

        if (!paymentConfig?.stripeConnectAccountId) {
          return NextResponse.json(
            { error: "Event does not have Stripe Connect configured" },
            { status: 400 }
          );
        }

        if (paymentConfig.paymentModel !== "CREDIT_CARD") {
          return NextResponse.json(
            { error: "Event is not configured for credit card payments" },
            { status: 400 }
          );
        }

        stripeAccountId = paymentConfig.stripeConnectAccountId;
      } catch (convexError: any) {
        console.error("[Stripe Connect] Failed to fetch payment config:", convexError);
        return NextResponse.json(
          { error: "Failed to retrieve payment configuration" },
          { status: 500 }
        );
      }
    }

    if (!stripeAccountId) {
      return NextResponse.json(
        { error: "No Stripe Connect account available for this event" },
        { status: 400 }
      );
    }

    // Create Payment Intent based on charge pattern
    let paymentIntent;

    if (useDirectCharge) {
      // DIRECT CHARGE Pattern
      // Payment goes directly to organizer's connected account
      // Platform takes application_fee_amount

      paymentIntent = await stripe.paymentIntents.create(
        {
          amount: amount,
          currency: currency,
          application_fee_amount: platformFee, // Platform's cut
          metadata: {
            orderId: orderId || "",
            orderNumber: orderNumber || "",
            chargePattern: "DIRECT",
            ...metadata,
          },
          automatic_payment_methods: {
            enabled: true, // Supports cards, Apple Pay, Google Pay
          },
        },
        {
          stripeAccount: stripeAccountId, // Charge on organizer's account
        }
      );
    } else {
      // DESTINATION CHARGE Pattern (Default)
      // Payment goes to platform first, then automatically transfers to organizer
      // Platform keeps application_fee_amount

      paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: currency,
        application_fee_amount: platformFee, // Platform's cut
        transfer_data: {
          destination: stripeAccountId, // Organizer's account
        },
        metadata: {
          orderId: orderId || "",
          orderNumber: orderNumber || "",
          chargePattern: "DESTINATION",
          ...metadata,
        },
        automatic_payment_methods: {
          enabled: true, // Supports cards, Apple Pay, Google Pay
        },
      });
    }

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      chargePattern: useDirectCharge ? "DIRECT" : "DESTINATION",
    });
  } catch (error: any) {
    console.error("[Stripe Payment Intent] Creation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create payment intent" },
      { status: 500 }
    );
  }
}

/**
 * Confirm payment status
 * GET /api/stripe/create-payment-intent?paymentIntentId=xxx
 */
export async function GET(request: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json(
        { error: "Stripe is not configured. Please contact support." },
        { status: 500 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const paymentIntentId = searchParams.get("paymentIntentId");

    if (!paymentIntentId) {
      return NextResponse.json({ error: "Payment Intent ID is required" }, { status: 400 });
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    return NextResponse.json({
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      metadata: paymentIntent.metadata,
    });
  } catch (error: any) {
    console.error("[Stripe Payment Intent] Retrieval error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to retrieve payment intent" },
      { status: 500 }
    );
  }
}
