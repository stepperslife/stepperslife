"use client";

import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";

export default function HelpPage() {
  return (
    <>
      <PublicHeader />
      <div className="min-h-screen bg-muted py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-card rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-foreground mb-6">Help Center</h1>
          <p className="text-muted-foreground mb-4">Help Center coming soon.</p>
          <p className="text-muted-foreground">
            For immediate assistance, please contact us at support@stepperslife.com
          </p>
        </div>
      </div>
      <PublicFooter />
    </>
  );
}
