"use client";

import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithAuth } from "convex/react";
import { ReactNode, useMemo, useCallback, useState, useEffect } from "react";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL!;

// Auth hook that fetches Convex token from our API
// IMPORTANT: isLoading is set to false initially so public queries work immediately
// while auth is being resolved in the background
function useAuthFromToken() {
  const [token, setToken] = useState<string | null>(null);
  // Start with isLoading: false so queries work immediately
  // Auth will be resolved in the background
  const [isLoading, setIsLoading] = useState(false);

  // Fetch token on mount and when session changes
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const response = await fetch("/api/auth/convex-token", {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          setToken(data.token);
        } else {
          setToken(null);
        }
      } catch (error) {
        console.error("[ConvexAuth] Error fetching token:", error);
        setToken(null);
      }
    };

    fetchToken();

    // Re-fetch token periodically (every 5 minutes) to handle expiration
    const interval = setInterval(fetchToken, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchAccessToken = useCallback(
    async ({ forceRefreshToken }: { forceRefreshToken: boolean }) => {
      if (forceRefreshToken) {
        try {
          const response = await fetch("/api/auth/convex-token", {
            credentials: "include",
          });
          if (response.ok) {
            const data = await response.json();
            setToken(data.token);
            return data.token;
          }
        } catch (error) {
          console.error("[ConvexAuth] Error refreshing token:", error);
        }
        setToken(null);
        return null;
      }
      return token;
    },
    [token]
  );

  return useMemo(
    () => ({
      isLoading,
      isAuthenticated: !!token,
      fetchAccessToken,
    }),
    [isLoading, token, fetchAccessToken]
  );
}

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const convex = useMemo(() => new ConvexReactClient(convexUrl), []);

  return (
    <ConvexProviderWithAuth client={convex} useAuth={useAuthFromToken}>
      {children}
    </ConvexProviderWithAuth>
  );
}
