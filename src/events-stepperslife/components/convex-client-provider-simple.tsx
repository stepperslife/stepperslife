"use client";

import { ConvexReactClient } from "convex/react";
import { ConvexProvider } from "convex/react";
import { ReactNode, useMemo } from "react";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL!;

/**
 * SIMPLIFIED Convex Client Provider - NO AUTH
 * This version removes the auth setup to test if that's blocking the connection
 */
export function ConvexClientProviderSimple({ children }: { children: ReactNode }) {
  const convex = useMemo(() => {
    console.log("[ConvexClientProviderSimple] Creating Convex client with URL:", convexUrl);
    const client = new ConvexReactClient(convexUrl);
    console.log("[ConvexClientProviderSimple] Client created successfully");
    return client;
  }, []);

  console.log("[ConvexClientProviderSimple] Rendering provider");

  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
