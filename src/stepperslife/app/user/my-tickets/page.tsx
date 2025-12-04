"use client";

import { redirect } from "next/navigation";
import { useEffect } from "react";

// Redirect to the main my-tickets page which has the full implementation
export default function UserMyTicketsPage() {
  useEffect(() => {
    // Client-side redirect
    window.location.href = "/my-tickets";
  }, []);

  // Show loading while redirecting
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="text-center">
        <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-muted-foreground">Redirecting to your tickets...</p>
      </div>
    </div>
  );
}
