import * as Sentry from "@sentry/nextjs";

const isProduction = process.env.NODE_ENV === "production";

// GlitchTip (self-hosted, Sentry-compatible) - errors.toolboxhosting.com
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Lower sampling rate in production to reduce costs and improve performance
  tracesSampleRate: isProduction ? 0.1 : 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  environment: process.env.NODE_ENV || "production",

  // Only initialize if DSN is configured
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,

  beforeSend(event) {
    // Filter out Square payment warnings
    if (event.message?.includes("SQUARE_ACCESS_TOKEN")) {
      return null;
    }
    return event;
  },
});
