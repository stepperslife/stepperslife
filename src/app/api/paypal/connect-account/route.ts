import { type NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL!;
const convex = new ConvexHttpClient(CONVEX_URL);

/**
 * Connect/Save PayPal Account for Organizer
 * POST /api/paypal/connect-account
 *
 * For personal accounts: Simply stores the PayPal email
 * For business accounts: Could use PayPal Partner Referrals (future enhancement)
 *
 * This is a simple flow that accepts PayPal email/merchant ID directly
 * and stores it for split payment purposes.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, paypalEmail, paypalMerchantId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Require either email or merchant ID
    if (!paypalEmail && !paypalMerchantId) {
      return NextResponse.json(
        { error: "PayPal email or merchant ID is required" },
        { status: 400 }
      );
    }

    // Validate email format if provided
    if (paypalEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(paypalEmail)) {
        return NextResponse.json(
          { error: "Invalid PayPal email format" },
          { status: 400 }
        );
      }
    }

    // Store the PayPal account in Convex
    // Use email as the merchant ID if no explicit merchant ID provided
    const merchantIdToStore = paypalMerchantId || paypalEmail;

    await convex.mutation(api.payments.mutations.savePayPalAccount, {
      userId: userId as any,
      paypalMerchantId: merchantIdToStore,
      paypalEmail: paypalEmail || undefined,
    });

    console.log("[PayPal Connect] Account saved:", {
      userId,
      merchantId: merchantIdToStore,
      hasEmail: !!paypalEmail,
    });

    return NextResponse.json({
      success: true,
      message: "PayPal account connected successfully",
      merchantId: merchantIdToStore,
    });
  } catch (error: any) {
    console.error("[PayPal Connect] Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to connect PayPal account",
      },
      { status: 500 }
    );
  }
}

/**
 * Get PayPal Account Status
 * GET /api/paypal/connect-account?userId=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Get user's PayPal status from Convex
    const user = await convex.query(api.users.queries.getUserById, {
      userId: userId as any,
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      connected: !!user.paypalMerchantId,
      merchantId: user.paypalMerchantId || null,
      setupComplete: user.paypalAccountSetupComplete || false,
    });
  } catch (error: any) {
    console.error("[PayPal Connect] Get status error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to get PayPal account status",
      },
      { status: 500 }
    );
  }
}

/**
 * Disconnect PayPal Account
 * DELETE /api/paypal/connect-account
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Remove PayPal account from Convex
    await convex.mutation(api.payments.mutations.disconnectPayPalAccount, {
      userId: userId as any,
    });

    console.log("[PayPal Connect] Account disconnected:", { userId });

    return NextResponse.json({
      success: true,
      message: "PayPal account disconnected successfully",
    });
  } catch (error: any) {
    console.error("[PayPal Connect] Disconnect error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to disconnect PayPal account",
      },
      { status: 500 }
    );
  }
}
