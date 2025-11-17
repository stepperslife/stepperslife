/**
 * Convex Auth Configuration
 *
 * This configures Convex to accept our custom JWT tokens issued by the Next.js API routes.
 * The tokens are created in /app/api/auth/convex-token/route.ts
 *
 * IMPORTANT: This configuration must match the issuer (iss) in the JWT tokens
 * created by /app/api/auth/convex-token/route.ts
 */

export default {
  providers: [
    {
      // For localhost development
      domain: "http://localhost:3004",
      applicationID: "convex",
    },
    {
      // For production
      domain: "https://events.stepperslife.com",
      applicationID: "convex",
    },
  ],
};
