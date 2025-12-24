import { type NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL || "");

/**
 * Get vendor payment information for checkout
 * GET /api/vendors/[vendorId]/payment-info
 *
 * Returns Stripe Connect account info and commission rate for split payments
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ vendorId: string }> }
) {
  try {
    const { vendorId } = await params;

    if (!vendorId) {
      return NextResponse.json(
        { error: "Vendor ID is required" },
        { status: 400 }
      );
    }

    // Fetch vendor from Convex
    const vendor = await convex.query(api.vendors.getById, {
      vendorId: vendorId as Id<"vendors">,
    });

    if (!vendor) {
      return NextResponse.json(
        { error: "Vendor not found" },
        { status: 404 }
      );
    }

    // Return payment-relevant info
    return NextResponse.json({
      vendorId: vendor._id,
      vendorName: vendor.name,
      stripeConnectedAccountId: vendor.stripeConnectedAccountId || null,
      stripeAccountSetupComplete: vendor.stripeAccountSetupComplete || false,
      stripeCashAppEnabled: vendor.stripeCashAppEnabled || false,
      stripePayoutsEnabled: vendor.stripePayoutsEnabled || false,
      commissionPercent: vendor.commissionPercent || 15, // Default 15%
    });
  } catch (error: any) {
    console.error("[Vendor Payment Info] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch vendor payment info" },
      { status: 500 }
    );
  }
}
