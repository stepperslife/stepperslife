"use client";

import { ConvexReactClient, ConvexProvider } from "convex/react";
import { ReactNode, useMemo, useEffect, useRef, useCallback } from "react";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL!;

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const convex = useMemo(() => new ConvexReactClient(convexUrl), []);
  const authSetupRef = useRef(false);

  // Memoized auth callback
  const fetchToken = useCallback(async () => {
    try {
      // Only fetch tokens in browser context
      if (typeof window === "undefined") {
        return null;
      }

      const url = `${window.location.origin}/api/auth/convex-token`;
      const response = await fetch(url, {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        return data.token || null;
      }

      // Not authenticated - allow unauthenticated access
      return null;
    } catch (error) {
      console.error("[Convex Auth] Token fetch error:", error);
      return null;
    }
  }, []);

  // Configure authentication
  useEffect(() => {
    if (authSetupRef.current) return;
    authSetupRef.current = true;

    convex.setAuth(fetchToken);
  }, [convex, fetchToken]);

  return (
    <ConvexProvider client={convex}>
      {children}
    </ConvexProvider>
  );
}
