import { NextRequest, NextResponse } from "next/server";
import { emailService } from "@/lib/email/email-service";

/**
 * Test Email Endpoint
 *
 * POST /api/email/test
 * Body: { email: "test@example.com" }
 *
 * Sends a test order receipt email to verify email configuration.
 */
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email address required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address format" },
        { status: 400 }
      );
    }

    // Check if email service is configured
    if (!emailService.isConfigured()) {
      return NextResponse.json(
        {
          error: "Email service not configured",
          details: "POSTAL_API_KEY environment variable is missing",
          status: emailService.getStatus(),
        },
        { status: 500 }
      );
    }

    console.log(`[TestEmail] Sending test email to ${email}`);

    // Send test email
    const result = await emailService.sendTestEmail(email);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Test email sent successfully to ${email}`,
        messageId: result.messageId,
        attempts: result.attempts,
        serviceStatus: emailService.getStatus(),
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          attempts: result.attempts,
          message: `Failed to send test email to ${email} after ${result.attempts} attempt(s)`,
          serviceStatus: emailService.getStatus(),
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("[TestEmail] Error:", error);

    return NextResponse.json(
      {
        error: "Failed to send test email",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/email/test
 *
 * Returns email service configuration status.
 */
export async function GET() {
  return NextResponse.json({
    configured: emailService.isConfigured(),
    status: emailService.getStatus(),
    message: emailService.isConfigured()
      ? "Email service is configured and ready (Postal)"
      : "Email service is not configured - POSTAL_API_KEY is missing",
  });
}
