/**
 * Production Payment Verification Script
 * Verifies recent Stripe payments have correct split payment configuration
 *
 * Usage: npx ts-node scripts/verify-production-payments.ts
 */

import Stripe from "stripe";

// Types
interface PaymentVerification {
  paymentIntentId: string;
  amount: number;
  applicationFee: number | null;
  transferDestination: string | null;
  status: "PASS" | "FAIL" | "SKIP";
  issues: string[];
  metadata: Record<string, string>;
}

interface VerificationReport {
  timestamp: string;
  environment: string;
  totalPayments: number;
  splitPayments: number;
  platformPayments: number;
  passed: number;
  failed: number;
  skipped: number;
  verifications: PaymentVerification[];
}

// Fee calculation constants (must match lib/constants/payment.ts)
const FEE_CONSTANTS = {
  platformFeePercent: 0.037, // 3.7%
  platformFeeFixed: 179, // $1.79 in cents
  processingFeePercent: 0.029, // 2.9%
};

/**
 * Calculate expected platform fee
 */
function calculateExpectedPlatformFee(amount: number): number {
  return Math.round(amount * FEE_CONSTANTS.platformFeePercent) + FEE_CONSTANTS.platformFeeFixed;
}

/**
 * Verify a single payment intent
 */
function verifyPaymentIntent(pi: Stripe.PaymentIntent): PaymentVerification {
  const verification: PaymentVerification = {
    paymentIntentId: pi.id,
    amount: pi.amount,
    applicationFee: pi.application_fee_amount,
    transferDestination: (pi.transfer_data as any)?.destination || null,
    status: "PASS",
    issues: [],
    metadata: pi.metadata || {},
  };

  const chargeType = pi.metadata?.chargeType;

  // Skip non-split payments
  if (chargeType !== "SPLIT") {
    verification.status = "SKIP";
    verification.issues.push(`Not a split payment (chargeType: ${chargeType || "undefined"})`);
    return verification;
  }

  // Verify application fee exists
  if (!pi.application_fee_amount) {
    verification.status = "FAIL";
    verification.issues.push("Missing application_fee_amount for split payment");
  }

  // Verify transfer destination exists
  if (!(pi.transfer_data as any)?.destination) {
    verification.status = "FAIL";
    verification.issues.push("Missing transfer_data.destination for split payment");
  }

  // Verify fee amount is correct
  if (pi.application_fee_amount) {
    // Get the ticket subtotal from metadata or calculate from amount
    const ticketSubtotal = pi.metadata?.ticketSubtotal
      ? parseInt(pi.metadata.ticketSubtotal)
      : pi.amount - pi.application_fee_amount;

    const expectedFee = calculateExpectedPlatformFee(ticketSubtotal);
    const feeVariance = Math.abs(pi.application_fee_amount - expectedFee);

    // Allow 5% variance for rounding differences
    const maxVariance = Math.max(10, expectedFee * 0.05);

    if (feeVariance > maxVariance) {
      verification.status = "FAIL";
      verification.issues.push(
        `Fee mismatch: expected ~${expectedFee} cents, got ${pi.application_fee_amount} cents (variance: ${feeVariance})`
      );
    }
  }

  return verification;
}

/**
 * Main verification function
 */
async function verifyRecentPayments(): Promise<VerificationReport> {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

  if (!stripeSecretKey) {
    console.error("STRIPE_SECRET_KEY environment variable is required");
    process.exit(1);
  }

  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: "2025-12-15.clover",
  });

  // Determine environment
  const isTestMode = stripeSecretKey.startsWith("sk_test_");
  const environment = isTestMode ? "TEST" : "LIVE";

  console.log(`\n🔍 Verifying payments in ${environment} mode...\n`);

  // Fetch recent successful payments (last 24 hours)
  const twentyFourHoursAgo = Math.floor(Date.now() / 1000) - 86400;

  const paymentIntents = await stripe.paymentIntents.list({
    limit: 100,
    created: { gte: twentyFourHoursAgo },
  });

  console.log(`Found ${paymentIntents.data.length} payment intents in last 24 hours\n`);

  // Verify each payment
  const verifications: PaymentVerification[] = [];
  let passed = 0;
  let failed = 0;
  let skipped = 0;
  let splitPayments = 0;
  let platformPayments = 0;

  for (const pi of paymentIntents.data) {
    // Only verify succeeded payments
    if (pi.status !== "succeeded") {
      continue;
    }

    const verification = verifyPaymentIntent(pi);
    verifications.push(verification);

    // Track payment types
    if (pi.metadata?.chargeType === "SPLIT") {
      splitPayments++;
    } else if (pi.metadata?.chargeType === "PLATFORM") {
      platformPayments++;
    }

    // Track results
    switch (verification.status) {
      case "PASS":
        passed++;
        console.log(`✅ ${pi.id}: PASSED (amount: $${(pi.amount / 100).toFixed(2)})`);
        break;
      case "FAIL":
        failed++;
        console.log(`❌ ${pi.id}: FAILED`);
        verification.issues.forEach((issue) => console.log(`   - ${issue}`));
        break;
      case "SKIP":
        skipped++;
        console.log(`⏭️  ${pi.id}: SKIPPED (${verification.issues[0]})`);
        break;
    }
  }

  // Generate report
  const report: VerificationReport = {
    timestamp: new Date().toISOString(),
    environment,
    totalPayments: verifications.length,
    splitPayments,
    platformPayments,
    passed,
    failed,
    skipped,
    verifications,
  };

  return report;
}

/**
 * Print summary report
 */
function printSummary(report: VerificationReport): void {
  console.log("\n" + "=".repeat(50));
  console.log("           VERIFICATION SUMMARY");
  console.log("=".repeat(50));
  console.log(`Environment: ${report.environment}`);
  console.log(`Timestamp: ${report.timestamp}`);
  console.log("");
  console.log(`Total Payments Analyzed: ${report.totalPayments}`);
  console.log(`  - Split Payments: ${report.splitPayments}`);
  console.log(`  - Platform Payments: ${report.platformPayments}`);
  console.log("");
  console.log(`Results:`);
  console.log(`  ✅ Passed: ${report.passed}`);
  console.log(`  ❌ Failed: ${report.failed}`);
  console.log(`  ⏭️  Skipped: ${report.skipped}`);
  console.log("");

  if (report.failed > 0) {
    console.log("⚠️  VERIFICATION FAILED - Review issues above");
  } else if (report.passed > 0) {
    console.log("✅ VERIFICATION PASSED - All split payments configured correctly");
  } else {
    console.log("ℹ️  No split payments found to verify");
  }

  console.log("=".repeat(50) + "\n");
}

// Run verification
verifyRecentPayments()
  .then((report) => {
    printSummary(report);

    // Exit with error code if any failures
    if (report.failed > 0) {
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error("Verification failed:", error);
    process.exit(1);
  });
