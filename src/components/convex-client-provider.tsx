"use client";

import { ConvexReactClient, ConvexProvider } from "convex/react";
import { ReactNode, useMemo } from "react";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL!;

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const convex = useMemo(() => new ConvexReactClient(convexUrl), []);

  // Note: Authentication setup temporarily disabled for debugging
  // Will re-enable once basic connectivity is confirmed

  return (
    <ConvexProvider client={convex}>
      {children}
    </ConvexProvider>
  );
}
