/**
 * API Route to run Phase 8 Advanced Ticket Distribution Tests
 *
 * GET /api/testing/phase8?test=1  - Run specific test (1-6)
 * GET /api/testing/phase8?test=all - Run all tests info
 * DELETE /api/testing/phase8 - Cleanup all test data
 */

import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const testNumber = searchParams.get("test");
    const organizerEmail = searchParams.get("email") || undefined;

    if (!testNumber) {
      return NextResponse.json({
        message: "Specify a test number (1-6) or 'all'",
        tests: [
          { number: 1, name: "Save-the-Date Event", endpoint: "/api/testing/phase8?test=1" },
          { number: 2, name: "Single-Day Ticketed Event (4 tiers)", endpoint: "/api/testing/phase8?test=2" },
          { number: 3, name: "Multi-Day Festival (3-day bundles)", endpoint: "/api/testing/phase8?test=3" },
          { number: 4, name: "Gala with Table Packages", endpoint: "/api/testing/phase8?test=4" },
          { number: 5, name: "Ultimate Multi-Day Bundle Mix", endpoint: "/api/testing/phase8?test=5" },
          { number: 6, name: "Staff Distribution (1,000 tickets)", endpoint: "/api/testing/phase8?test=6" },
          { name: "Run All (info only)", endpoint: "/api/testing/phase8?test=all" },
          { name: "Cleanup Test Data", endpoint: "DELETE /api/testing/phase8" },
        ]
      });
    }

    let result;

    switch (testNumber) {
      case "1":
        result = await convex.mutation(api.testing.phase8AdvancedTests.test1SaveTheDate, {
          organizerEmail
        });
        break;
      case "2":
        result = await convex.mutation(api.testing.phase8AdvancedTests.test2SingleDayEvent, {
          organizerEmail
        });
        break;
      case "3":
        result = await convex.mutation(api.testing.phase8AdvancedTests.test3MultiDayFestival, {
          organizerEmail
        });
        break;
      case "4":
        result = await convex.mutation(api.testing.phase8AdvancedTests.test4GalaWithTables, {
          organizerEmail
        });
        break;
      case "5":
        result = await convex.mutation(api.testing.phase8AdvancedTests.test5UltimateMultiDay, {
          organizerEmail
        });
        break;
      case "6":
        result = await convex.mutation(api.testing.phase8AdvancedTests.test6StaffDistribution, {
          organizerEmail
        });
        break;
      case "all":
        result = await convex.mutation(api.testing.phase8AdvancedTests.runAllPhase8Tests, {
          organizerEmail
        });
        break;
      default:
        return NextResponse.json(
          { error: `Invalid test number: ${testNumber}. Use 1-6 or 'all'` },
          { status: 400 }
        );
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Phase 8 test error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to run test" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const result = await convex.mutation(
      api.testing.phase8AdvancedTests.cleanupPhase8Tests,
      {}
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Phase 8 cleanup error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to cleanup test data" },
      { status: 500 }
    );
  }
}
