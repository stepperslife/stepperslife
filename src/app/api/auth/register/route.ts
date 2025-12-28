import { NextRequest, NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { convexClient as convex } from "@/lib/auth/convex-client";
import {
  hashPassword,
  validatePasswordStrength,
  validateEmailFormat,
} from "@/lib/auth/password-utils";

export async function POST(request: NextRequest) {
  try {
    // Debug: Check Convex URL is available
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    console.log("[Register] Convex URL configured:", convexUrl ? "yes" : "NO - MISSING!");

    const body = await request.json();
    const { name, email, password } = body;
    console.log("[Register] Received registration request for:", email);

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Please provide all required fields" }, { status: 400 });
    }

    // Validate email format using centralized utility
    if (!validateEmailFormat(email)) {
      return NextResponse.json({ error: "Please provide a valid email address" }, { status: 400 });
    }

    // Validate password strength using centralized utility
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: passwordValidation.error },
        { status: 400 }
      );
    }

    // Check if user already exists
    try {
      const existingUser = await convex.query(api.users.queries.getUserByEmail, {
        email: email.toLowerCase(),
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "An account with this email already exists" },
          { status: 409 }
        );
      }
    } catch (error) {
      // If getUserByEmail throws an error (user not found), that's expected
      // Continue with registration
      console.log("[Register] User lookup returned error (expected for new users):", error);
    }

    // Hash the password using centralized utility
    let hashedPassword: string;
    try {
      hashedPassword = await hashPassword(password);
      console.log("[Register] Password hashed successfully");
    } catch (hashError) {
      console.error("[Register] Password hashing failed:", hashError);
      return NextResponse.json(
        { error: "Failed to process registration. Please try again." },
        { status: 500 }
      );
    }

    // Create the user in Convex
    let userId;
    try {
      userId = await convex.mutation(api.users.mutations.createUser, {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        passwordHash: hashedPassword,
        role: "user", // Default role - users can become organizers when they create events
      });
      console.log("[Register] User created successfully:", userId);
    } catch (createError) {
      console.error("[Register] Convex createUser failed:", createError);
      return NextResponse.json(
        { error: "Failed to create user account. Please try again." },
        { status: 500 }
      );
    }

    if (!userId) {
      return NextResponse.json({ error: "Failed to create user account" }, { status: 500 });
    }

    // Initialize credits for the new user (300 welcome bonus)
    try {
      await convex.mutation(api.credits.mutations.initializeCredits, {
        organizerId: userId,
      });
      console.log("[Register] Credits initialized for user:", userId);
    } catch (creditError) {
      console.error("[Register] Failed to initialize credits:", creditError);
      // Don't fail registration if credits initialization fails
    }

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
    return NextResponse.json(
      {
        error: "An error occurred during registration. Please try again.",
        debug: process.env.NODE_ENV === "development" ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}
