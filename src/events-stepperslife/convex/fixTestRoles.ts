import { internalMutation } from "./_generated/server";

/**
 * One-time fix for test user roles
 * Run: npx convex run fixTestRoles
 */
export default internalMutation({
  args: {},
  handler: async (ctx) => {

    // Fix admin-test@stepperslife.com
    const adminUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", "admin-test@stepperslife.com"))
      .first();

    if (adminUser) {
      await ctx.db.patch(adminUser._id, {
        role: "admin",
        canCreateTicketedEvents: true,
        updatedAt: Date.now(),
      });
    }

    // Fix user-test@stepperslife.com
    const regularUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", "user-test@stepperslife.com"))
      .first();

    if (regularUser) {
      await ctx.db.patch(regularUser._id, {
        role: "user",
        updatedAt: Date.now(),
      });
    }

    return {
      success: true,
      adminUpdated: !!adminUser,
      userUpdated: !!regularUser,
    };
  },
});
