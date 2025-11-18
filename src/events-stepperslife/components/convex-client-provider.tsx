"use client";

import { ConvexReactClient } from "convex/react";
import { ConvexProvider } from "convex/react";
import { ReactNode, useMemo } from "react";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL!;

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const convex = useMemo(() => {
    const client = new ConvexReactClient(convexUrl);

    // Configure authentication token fetching
    // This fetches a Convex-compatible JWT from our API
    client.setAuth(async () => {
      try {
        // Only fetch tokens in browser context (not during SSR)
        if (typeof window === "undefined") {
          return null;
        }

        const response = await fetch("/api/auth/convex-token", {
          credentials: "include", // Include cookies (session_token)
        });

        if (response.ok) {
          const { token } = await response.json();
          return token;
        }

        // Not authenticated - return null to allow unauthenticated access
        return null;
      } catch (error) {
        console.error("[Convex Auth] Failed to fetch token:", error);
        return null;
      }
    });

    return client;
  }, []);

  return (
    <ConvexProvider client={convex}>
      {children}
    </ConvexProvider>
  );
}
