/**
 * Convex Auth Configuration
 *
 * This configures Convex to accept our custom JWT tokens issued by the Next.js API routes.
 * The tokens are created in /app/api/auth/convex-token/route.ts
 *
 * IMPORTANT: This configuration must match the issuer (iss) in the JWT tokens
 * created by /app/api/auth/convex-token/route.ts
 */

// Domain configuration based on environment
const domains = [
  // Production - Vercel
  {
    domain: "https://stepperslife.vercel.app",
    applicationID: "convex",
  },
  // Production - Custom domain
  {
    domain: "https://stepperslife.com",
    applicationID: "convex",
  },
  // Production - www subdomain
  {
    domain: "https://www.stepperslife.com",
    applicationID: "convex",
  },
  // Production - Vercel preview URLs
  {
    domain: "https://stepperslife-stepperlifes-projects.vercel.app",
    applicationID: "convex",
  },
  // Development
  {
    domain: "http://localhost:3004",
    applicationID: "convex",
  },
];

export default {
  providers: domains,
};
