import { type NextRequest, NextResponse } from "next/server";

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_SECRET_KEY = process.env.PAYPAL_SECRET_KEY;
const PAYPAL_API_BASE = process.env.PAYPAL_ENVIRONMENT === "sandbox"
  ? "https://api-m.sandbox.paypal.com"
  : "https://api-m.paypal.com";

// Platform PayPal account for receiving fees
const PLATFORM_PAYPAL_MERCHANT_ID = process.env.PAYPAL_MERCHANT_ID;

// Timeout for PayPal API calls (30 seconds)
const PAYPAL_TIMEOUT_MS = 30000;

// Max retry attempts
const MAX_RETRIES = 3;

if (!PAYPAL_CLIENT_ID || !PAYPAL_SECRET_KEY) {
  console.error("[PayPal] CRITICAL: PayPal credentials not configured!");
}

/**
 * Fetch with timeout and retry logic
 */
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries = MAX_RETRIES,
  baseDelay = 1000
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), PAYPAL_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    // Retry on 5xx errors or rate limiting
    if ((response.status >= 500 || response.status === 429) && retries > 0) {
      const delay = baseDelay * Math.pow(2, MAX_RETRIES - retries);
      console.log(`[PayPal] Retrying request after ${delay}ms (${retries} retries left)`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return fetchWithRetry(url, options, retries - 1, baseDelay);
    }

    return response;
  } catch (error: any) {
    clearTimeout(timeoutId);

    if (error.name === "AbortError") {
      if (retries > 0) {
        const delay = baseDelay * Math.pow(2, MAX_RETRIES - retries);
        console.log(`[PayPal] Request timeout, retrying after ${delay}ms (${retries} retries left)`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return fetchWithRetry(url, options, retries - 1, baseDelay);
      }
      throw new Error("PayPal API request timed out after multiple attempts");
    }

    if (retries > 0) {
      const delay = baseDelay * Math.pow(2, MAX_RETRIES - retries);
      console.log(`[PayPal] Request failed, retrying after ${delay}ms (${retries} retries left): ${error.message}`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return fetchWithRetry(url, options, retries - 1, baseDelay);
    }

    throw error;
  }
}

/**
 * Get PayPal access token with retry logic
 */
async function getPayPalAccessToken(): Promise<string> {
  if (!PAYPAL_CLIENT_ID || !PAYPAL_SECRET_KEY) {
    throw new Error("PayPal credentials not configured");
  }

  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET_KEY}`).toString("base64");

  const response = await fetchWithRetry(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("[PayPal] Failed to get access token:", response.status, errorText);
    throw new Error(`Failed to get PayPal access token: ${response.status}`);
  }

  const data = await response.json();
  return data.access_token;
}

/**
 * Create PayPal Order with Split Payment Support
 * POST /api/paypal/create-order
 *
 * Split Payment Flow (for event tickets):
 * - Customer pays total amount
 * - Platform fee (3.7% + $1.79) goes to SteppersLife
 * - Remainder goes to organizer's PayPal account
 *
 * Direct Payment Flow (for platform products):
 * - 100% goes to SteppersLife platform
 */
export async function POST(request: NextRequest) {
  try {
    if (!PAYPAL_CLIENT_ID || !PAYPAL_SECRET_KEY) {
      return NextResponse.json(
        { error: "PayPal is not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const {
      amount, // Total amount in cents
      platformFee = 0, // Platform fee in cents (for split payments)
      orderId, // SteppersLife order ID
      description,
      organizerPaypalEmail, // Organizer's PayPal email (for split payments)
      organizerPaypalMerchantId, // Organizer's PayPal Merchant ID (for split payments)
      metadata = {},
    } = body;

    if (!amount || amount < 100) {
      return NextResponse.json(
        { error: "Amount must be at least $1.00" },
        { status: 400 }
      );
    }

    const accessToken = await getPayPalAccessToken();

    // Convert cents to dollars for PayPal
    const amountInDollars = (amount / 100).toFixed(2);
    const platformFeeInDollars = (platformFee / 100).toFixed(2);

    // Build purchase unit
    const purchaseUnit: any = {
      reference_id: orderId || `order_${Date.now()}`,
      description: description || "SteppersLife Purchase",
      amount: {
        currency_code: "USD",
        value: amountInDollars,
      },
      custom_id: JSON.stringify({
        orderId,
        platformFee,
        ...metadata,
      }),
    };

    // If organizer PayPal is provided, set up split payment
    // Payment goes to organizer, platform fee goes to SteppersLife
    if (organizerPaypalEmail || organizerPaypalMerchantId) {
      // Set payee to organizer
      purchaseUnit.payee = organizerPaypalMerchantId
        ? { merchant_id: organizerPaypalMerchantId }
        : { email_address: organizerPaypalEmail };

      // Add platform fee instruction if we have a platform fee
      if (platformFee > 0 && PLATFORM_PAYPAL_MERCHANT_ID) {
        purchaseUnit.payment_instruction = {
          disbursement_mode: "INSTANT",
          platform_fees: [
            {
              amount: {
                currency_code: "USD",
                value: platformFeeInDollars,
              },
              payee: {
                merchant_id: PLATFORM_PAYPAL_MERCHANT_ID,
              },
            },
          ],
        };
      }
    }

    // Create PayPal order with retry logic
    const orderResponse = await fetchWithRetry(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "PayPal-Partner-Attribution-Id": "SteppersLife_SP", // Partner attribution
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [purchaseUnit],
        application_context: {
          brand_name: "SteppersLife",
          landing_page: "NO_PREFERENCE",
          user_action: "PAY_NOW",
          return_url: `${process.env.NEXTAUTH_URL}/checkout/success`,
          cancel_url: `${process.env.NEXTAUTH_URL}/checkout/cancel`,
        },
      }),
    });

    if (!orderResponse.ok) {
      const errorData = await orderResponse.json();
      console.error("[PayPal] Create order failed:", errorData);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to create PayPal order",
          details: errorData,
          code: "PAYPAL_ORDER_CREATION_FAILED"
        },
        { status: 500 }
      );
    }

    const orderData = await orderResponse.json();

    console.log("[PayPal] Order created:", {
      orderId: orderData.id,
      status: orderData.status,
      splitPayment: !!(organizerPaypalEmail || organizerPaypalMerchantId),
      platformFee: platformFeeInDollars,
    });

    return NextResponse.json({
      success: true,
      orderId: orderData.id,
      status: orderData.status,
    });
  } catch (error: any) {
    console.error("[PayPal] Create order error:", error);

    // Generate unique request ID for debugging
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Determine error type and message
    let errorCode = "INTERNAL_ERROR";
    let errorMessage = "Failed to create PayPal order";

    if (error.message?.includes("credentials")) {
      errorCode = "PAYPAL_NOT_CONFIGURED";
      errorMessage = "PayPal payment is temporarily unavailable";
    } else if (error.message?.includes("timeout")) {
      errorCode = "PAYPAL_TIMEOUT";
      errorMessage = "PayPal service timed out. Please try again.";
    } else if (error.message?.includes("access token")) {
      errorCode = "PAYPAL_AUTH_FAILED";
      errorMessage = "Unable to authenticate with PayPal";
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details: {
          code: errorCode,
          requestId,
        }
      },
      { status: 500 }
    );
  }
}
