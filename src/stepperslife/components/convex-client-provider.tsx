"use client";

import { ConvexReactClient } from "convex/react";
import { ConvexProvider } from "convex/react";
import { ReactNode, useMemo, useEffect, useRef } from "react";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL!;

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const convex = useMemo(() => new ConvexReactClient(convexUrl), []);
  const authSetupRef = useRef(false);

  // Configure authentication AFTER mount to avoid race conditions
  useEffect(() => {
    // Guard against multiple auth setup calls
    if (authSetupRef.current) {
      return;
    }
    authSetupRef.current = true;

    // Configure authentication token fetching
    // This fetches a Convex-compatible JWT from our API
    convex.setAuth(async () => {
      try {
        // Only fetch tokens in browser context (not during SSR)
        if (typeof window === "undefined") {
          return null;
        }

        // Use absolute URL to avoid fetch errors
        const url = `${window.location.origin}/api/auth/convex-token`;
        const response = await fetch(url, {
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
  }, [convex]);

  return (
    <ConvexProvider client={convex}>
      {children}
    </ConvexProvider>
  );
}
