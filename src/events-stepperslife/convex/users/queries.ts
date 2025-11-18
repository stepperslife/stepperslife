import { v } from "convex/values";
import { query } from "../_generated/server";

/**
 * Get current authenticated user
 */
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    console.log("[getCurrentUser] Raw identity:", JSON.stringify(identity));

    // Require authentication
    if (!identity) {
      console.log("[getCurrentUser] No identity found");
      return null;
    }

    // Parse the identity (which is a JSON string from our NextAuth integration)
    let userInfo;
    try {
      userInfo = typeof identity === "string" ? JSON.parse(identity) : identity;
    } catch (error) {
      console.error("[getCurrentUser] Failed to parse identity:", error);
      userInfo = identity;
    }

    const email = userInfo.email || identity.email;
    console.log("[getCurrentUser] Extracted email:", email);

    if (!email) {
      console.log("[getCurrentUser] No email found in identity");
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    console.log("[getCurrentUser] Found user:", user ? `${user.email} (${user._id})` : "null");

    return user;
  },
});

/**
 * Check if user is authenticated
 */
export const isAuthenticated = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    return !!identity;
  },
});

/**
 * Get user by ID (includes password hash - use getUserByIdPublic for client-facing endpoints)
 */
export const getUserById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

/**
 * Get user by ID without password hash (safe for client-facing endpoints)
 */
export const getUserByIdPublic = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);

    if (!user) {
      return null;
    }

    // Don't return password hash to client
    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },
});

/**
 * Get user by email address
 */
export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    return user;
  },
});

/**
 * Get Stripe Connect account info for current user
 */
export const getStripeConnectAccount = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const userInfo = typeof identity === "string" ? JSON.parse(identity) : identity;
    const email = userInfo.email || identity.email;
    if (!email) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (!user) {
      return null;
    }

    return {
      stripeConnectedAccountId: user.stripeConnectedAccountId,
      stripeAccountSetupComplete: user.stripeAccountSetupComplete,
      acceptsStripePayments: user.acceptsStripePayments,
    };
  },
});

/**
 * Get PayPal account info for current user
 */
export const getPayPalAccount = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const userInfo = typeof identity === "string" ? JSON.parse(identity) : identity;
    const email = userInfo.email || identity.email;
    if (!email) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (!user) {
      return null;
    }

    return {
      paypalMerchantId: user.paypalMerchantId,
      paypalAccountSetupComplete: user.paypalAccountSetupComplete,
      paypalPartnerReferralId: user.paypalPartnerReferralId,
      paypalOnboardingStatus: user.paypalOnboardingStatus,
      acceptsPaypalPayments: user.acceptsPaypalPayments,
    };
  },
});
