"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { GraduationCap, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";

/**
 * Instructor Redirect Page
 *
 * This page redirects all /instructor/* routes to /organizer/*
 * Instructors use the organizer dashboard in this platform.
 */
export default function InstructorRedirectPage() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Get the path after /instructor/
    const subPath = pathname.replace(/^\/instructor\/?/, "");
    const targetPath = subPath ? `/organizer/${subPath}` : "/organizer/dashboard";

    // Redirect after a brief delay to show the message
    const timer = setTimeout(() => {
      router.replace(targetPath);
    }, 1500);

    return () => clearTimeout(timer);
  }, [pathname, router]);

  // Calculate the target path for display
  const subPath = pathname.replace(/^\/instructor\/?/, "");
  const targetPath = subPath ? `/organizer/${subPath}` : "/organizer/dashboard";

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="mb-6 flex items-center justify-center">
          <div className="bg-primary/10 p-4 rounded-full">
            <GraduationCap className="w-12 h-12 text-primary" />
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-2">Instructor Portal</h1>
        <p className="text-muted-foreground mb-6">
          You are being redirected to the organizer dashboard where you can manage your classes.
        </p>

        <div className="flex items-center justify-center gap-2 text-primary mb-6">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Redirecting...</span>
        </div>

        <div className="bg-card border rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{pathname}</span>
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium text-primary">{targetPath}</span>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          Not redirecting?{" "}
          <Link href={targetPath} className="text-primary hover:underline">
            Click here to go directly
          </Link>
        </p>
      </div>
    </div>
  );
}
