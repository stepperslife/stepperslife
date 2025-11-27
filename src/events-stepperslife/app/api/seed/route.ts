import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: Request) {
  try {
    // Check for a secret key to prevent unauthorized access
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get("secret");

    if (secret !== "stepperslife-seed-2025") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Run the seed mutation
    const result = await convex.mutation(api.seedTestOrganizers.createTestOrganizers, {});

    return NextResponse.json({
      success: true,
      message: "Test data seeded successfully!",
      result,
    });
  } catch (error: any) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to seed data" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get("secret");

    if (secret !== "stepperslife-seed-2025") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Run the delete mutation
    const result = await convex.mutation(api.seedTestOrganizers.deleteTestOrganizers, {});

    return NextResponse.json({
      success: true,
      message: "Test data deleted successfully!",
      result,
    });
  } catch (error: any) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete data" },
      { status: 500 }
    );
  }
}
