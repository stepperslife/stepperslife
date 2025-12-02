/**
 * Convex Auth Configuration
 *
 * This configures Convex to accept our custom JWT tokens issued by the Next.js API routes.
 * The tokens are created in /app/api/auth/convex-token/route.ts
 *
 * IMPORTANT: This configuration must match the issuer (iss) in the JWT tokens
 * created by /app/api/auth/convex-token/route.ts
 *
 * Required JWT fields: header (kid, alg, typ), payload (sub, iss, exp, iat)
 * The applicationID must match the "aud" field in the JWT
 */

export default {
  providers: [
    // Production - Custom domain
    {
      type: "customJwt" as const,
      issuer: "https://stepperslife.com",
      jwks: "https://stepperslife.com/.well-known/jwks.json",
      algorithm: "RS256" as const,
      applicationID: "convex",
    },
    // Production - www subdomain
    {
      type: "customJwt" as const,
      issuer: "https://www.stepperslife.com",
      jwks: "https://www.stepperslife.com/.well-known/jwks.json",
      algorithm: "RS256" as const,
      applicationID: "convex",
    },
    // Production - Vercel
    {
      type: "customJwt" as const,
      issuer: "https://stepperslife.vercel.app",
      jwks: "https://stepperslife.vercel.app/.well-known/jwks.json",
      algorithm: "RS256" as const,
      applicationID: "convex",
    },
    // Production - Vercel preview URLs
    {
      type: "customJwt" as const,
      issuer: "https://stepperslife-stepperlifes-projects.vercel.app",
      jwks: "https://stepperslife-stepperlifes-projects.vercel.app/.well-known/jwks.json",
      algorithm: "RS256" as const,
      applicationID: "convex",
    },
    // Development
    {
      type: "customJwt" as const,
      issuer: "http://localhost:3004",
      jwks: "http://localhost:3004/.well-known/jwks.json",
      algorithm: "RS256" as const,
      applicationID: "convex",
    },
  ],
};
