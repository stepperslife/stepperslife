import { NextRequest, NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { convexClient as convex } from "@/lib/auth/convex-client";
import {
  hashPassword,
  validatePasswordStrength,
  validateEmailFormat,
} from "@/lib/auth/password-utils";

export async function POST(request: NextRequest) {
  console.log("[Register] === START REGISTRATION ===");
  try {
    // Debug: Check Convex URL is available
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    console.log("[Register] Step 1 - Convex URL:", convexUrl ? "configured" : "MISSING");

    console.log("[Register] Step 2 - Parsing body...");
    const body = await request.json();
    const { name, email, password } = body;
    console.log("[Register] Step 3 - Received for:", email);

    console.log("[Register] Step 4 - Validating fields...");
    if (!name || !email || !password) {
      console.log("[Register] FAIL - Missing fields");
      return NextResponse.json({ error: "Please provide all required fields" }, { status: 400 });
    }
    console.log("[Register] Step 4 - Fields OK");

    console.log("[Register] Step 5 - Validating email format...");
    if (!validateEmailFormat(email)) {
      console.log("[Register] FAIL - Invalid email");
      return NextResponse.json({ error: "Please provide a valid email address" }, { status: 400 });
    }
    console.log("[Register] Step 5 - Email format OK");

    console.log("[Register] Step 6 - Validating password...");
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.valid) {
      console.log("[Register] FAIL - Weak password:", passwordValidation.error);
      return NextResponse.json({ error: passwordValidation.error }, { status: 400 });
    }
    console.log("[Register] Step 6 - Password OK");

    // Check if user already exists
    console.log("[Register] Step 7 - Checking if user exists...");
    try {
      const existingUser = await convex.query(api.users.queries.getUserByEmail, {
        email: email.toLowerCase(),
      });
      console.log("[Register] Step 7 - User lookup result:", existingUser ? "EXISTS" : "not found");

      if (existingUser) {
        return NextResponse.json(
          { error: "An account with this email already exists" },
          { status: 409 }
        );
      }
    } catch (error) {
      // If getUserByEmail throws an error (user not found), that's expected
      // Continue with registration
      console.log("[Register] Step 7 - User lookup error (OK for new users):", error);
    }
    console.log("[Register] Step 7 - User check complete");

    // Hash the password using centralized utility
    console.log("[Register] Step 8 - Hashing password...");
    let hashedPassword: string;
    try {
      hashedPassword = await hashPassword(password);
      console.log("[Register] Step 8 - Password hashed OK");
    } catch (hashError) {
      console.error("[Register] Step 8 - FAIL - Password hashing:", hashError);
      return NextResponse.json(
        { error: "Failed to process registration. Please try again." },
        { status: 500 }
      );
    }

    // Create the user in Convex
    console.log("[Register] Step 9 - Creating user in Convex...");
    let userId;
    try {
      userId = await convex.mutation(api.users.mutations.createUser, {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        passwordHash: hashedPassword,
        role: "user",
      });
      console.log("[Register] Step 9 - User created:", userId);
    } catch (createError) {
      console.error("[Register] Step 9 - FAIL - Convex createUser:", createError);
      return NextResponse.json(
        { error: "Failed to create user account. Please try again." },
        { status: 500 }
      );
    }

    if (!userId) {
      console.log("[Register] Step 9 - FAIL - No userId returned");
      return NextResponse.json({ error: "Failed to create user account" }, { status: 500 });
    }

    // Initialize credits for the new user (300 welcome bonus)
    console.log("[Register] Step 10 - Initializing credits...");
    try {
      await convex.mutation(api.credits.mutations.initializeCredits, {
        organizerId: userId,
      });
      console.log("[Register] Step 10 - Credits initialized");
    } catch (creditError) {
      console.error("[Register] Step 10 - Credits failed (non-fatal):", creditError);
    }

    console.log("[Register] === SUCCESS - Registration complete ===");
    return NextResponse.json(
      {
        success: true,
        message: "Account created successfully! Please log in.",
        userId,
      },
      { status: 201 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error("[Register] Unexpected registration error:", errorMessage);
    console.error("[Register] Stack trace:", errorStack);
    // Temporarily include debug info in production to diagnose issue
    return NextResponse.json(
      {
        error: "An error occurred during registration. Please try again.",
        debug: errorMessage,
        stack: errorStack?.split("\n").slice(0, 5).join(" | ")
      },
      { status: 500 }
    );
  }
}
