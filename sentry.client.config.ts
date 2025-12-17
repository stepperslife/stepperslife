import * as Sentry from "@sentry/nextjs";

const isProduction = process.env.NODE_ENV === "production";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || "https://aba7ae328b85a86cfffc763b430dc463@o4510231346216960.ingest.us.sentry.io/4510231347920896",

  // Lower sampling rate in production to reduce costs and improve performance
  tracesSampleRate: isProduction ? 0.1 : 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // Capture 100% of errors with session replay
  replaysOnErrorSampleRate: 1.0,

  // Capture 10% of normal sessions (lower in production)
  replaysSessionSampleRate: isProduction ? 0.05 : 0.1,

  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  environment: process.env.NODE_ENV || "production",

  beforeSend(event) {
    // Filter out Square payment warnings
    if (event.message?.includes("SQUARE_ACCESS_TOKEN")) {
      return null;
    }
    return event;
  },
});
