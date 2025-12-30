import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
// import "../styles/seating-design-system.css"; // Seating feature hidden
import { ConvexClientProvider } from "@/components/convex-client-provider";
import { ServiceWorkerRegister } from "@/components/service-worker-register";
import { ThemeProvider } from "@/components/theme-provider";
import { CartProvider } from "@/contexts/CartContext";
import { FoodCartProvider } from "@/contexts/FoodCartContext";
import { EventCartProvider } from "@/contexts/EventCartContext";
import { UnifiedCartProvider } from "@/contexts/UnifiedCartContext";
import { ShoppingCart } from "@/components/ShoppingCart";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { FloatingScanButton } from "@/components/FloatingScanButton";
import { validateEnv } from "@/lib/env-validator";
import { Toaster } from "sonner";

// Validate environment variables at startup (server-side only)
if (typeof window === "undefined") {
  try {
    validateEnv();
  } catch (error) {
    console.error("❌ Environment validation failed:", error);
    // In development, show the error but don't crash
    // In production, this will prevent the app from starting with invalid config
    if (process.env.NODE_ENV === "production") {
      throw error;
    }
  }
}

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
  adjustFontFallback: true,
  fallback: ["system-ui", "arial"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: true,
  adjustFontFallback: true,
  fallback: ["ui-monospace", "monospace"],
});

export const metadata: Metadata = {
  title: "SteppersLife Events - Discover Amazing Steppin Events Nationwide",
  description:
    "Your premier platform for discovering and attending steppin events. Buy tickets, manage events with advanced seating charts, and connect with the steppin community.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icon-light-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-light-512.png", sizes: "512x512", type: "image/png" },
      { url: "/stepperslife-logo-light.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/icon-light-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-light-512.png", sizes: "512x512", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SteppersLife Events",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#DC2626",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}');
              `}
            </Script>
          </>
        )}
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* Skip to main content link for keyboard accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
        >
          Skip to main content
        </a>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
          forcedTheme={undefined}
        >
          {/* ServiceWorkerRegister disabled during testing */}
          <ConvexClientProvider>
            <CartProvider>
              <FoodCartProvider>
                <EventCartProvider>
                  <UnifiedCartProvider>
                    <main id="main-content">{children}</main>
                    <ShoppingCart />
                    <MobileBottomNav />
                    <FloatingScanButton />
                    <Toaster position="top-right" richColors closeButton />
                  </UnifiedCartProvider>
                </EventCartProvider>
              </FoodCartProvider>
            </CartProvider>
          </ConvexClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
