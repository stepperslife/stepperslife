import * as Sentry from "@sentry/nextjs";

const isProduction = process.env.NODE_ENV === "production";

Sentry.init({
  dsn: process.env.SENTRY_DSN || "https://aba7ae328b85a86cfffc763b430dc463@o4510231346216960.ingest.us.sentry.io/4510231347920896",

  // Lower sampling rate in production to reduce costs and improve performance
  tracesSampleRate: isProduction ? 0.1 : 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  environment: process.env.NODE_ENV || "production",
});
