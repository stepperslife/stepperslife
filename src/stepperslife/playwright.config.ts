import { defineConfig, devices } from "@playwright/test";
import * as dotenv from "dotenv";
import path from "path";

// Load environment variables from .env.local
dotenv.config({ path: ".env.local" });

// Auth storage state paths
const AUTH_FILE = path.join(__dirname, "tests/.auth/admin.json");

export default defineConfig({
  testDir: "./tests",

  // Run tests in parallel for faster execution (when possible)
  fullyParallel: true,
  forbidOnly: !!process.env.CI,

  // Retry on failure - add retries locally for slow Convex connections
  retries: process.env.CI ? 2 : 1,

  // Use multiple workers in CI, 1 locally for debugging
  workers: process.env.CI ? 4 : 1,

  // Enhanced reporters
  reporter: [
    ["list"],
    ["html", { outputFolder: "test-results/html-report", open: "never" }],
    ["json", { outputFile: "test-results/results.json" }],
  ],

  // Global timeout settings
  timeout: 60000, // 60 seconds per test
  expect: {
    timeout: 10000, // 10 seconds for assertions
    // Visual comparison settings
    toHaveScreenshot: {
      maxDiffPixels: 100,
      threshold: 0.2,
    },
  },

  // Output directory for test artifacts
  outputDir: "test-results/artifacts",

  use: {
    // Base URL for the application
    baseURL: process.env.BASE_URL || "http://localhost:3004",

    // Capture trace on first retry
    trace: "on-first-retry",

    // Screenshot settings
    screenshot: "only-on-failure",

    // Video recording
    video: "retain-on-failure",

    // Viewport size
    viewport: { width: 1280, height: 720 },

    // Ignore HTTPS errors (for self-signed certs)
    ignoreHTTPSErrors: true,

    // Navigation timeout - increased for slow Convex connections
    navigationTimeout: 45000,

    // Action timeout - increased for slow Convex connections
    actionTimeout: 15000,
  },

  projects: [
    // =========================================================================
    // SETUP PROJECT - Runs auth setup first
    // =========================================================================
    {
      name: "setup",
      testMatch: /.*\.setup\.ts/,
      teardown: "cleanup",
    },

    // =========================================================================
    // CLEANUP PROJECT - Runs after all tests
    // =========================================================================
    {
      name: "cleanup",
      testMatch: /global\.teardown\.ts/,
    },

    // =========================================================================
    // MAIN TEST PROJECTS
    // =========================================================================

    // Desktop Chrome - with auth
    {
      name: "chromium-auth",
      use: {
        ...devices["Desktop Chrome"],
        storageState: AUTH_FILE,
        launchOptions: {
          args: ["--disable-dev-shm-usage"],
        },
      },
      dependencies: ["setup"],
    },

    // Desktop Chrome - without auth (public pages)
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        launchOptions: {
          args: ["--disable-dev-shm-usage"],
        },
      },
    },

    // Desktop Firefox
    {
      name: "firefox",
      use: {
        ...devices["Desktop Firefox"],
      },
    },

    // Desktop Safari
    {
      name: "webkit",
      use: {
        ...devices["Desktop Safari"],
      },
    },

    // =========================================================================
    // MOBILE TEST PROJECTS
    // =========================================================================

    // Mobile Chrome (Android)
    {
      name: "mobile-chrome",
      use: {
        ...devices["Pixel 5"],
      },
    },

    // Mobile Safari (iOS)
    {
      name: "mobile-safari",
      use: {
        ...devices["iPhone 13"],
      },
    },

    // =========================================================================
    // TABLET TEST PROJECTS
    // =========================================================================

    // iPad
    {
      name: "tablet",
      use: {
        ...devices["iPad (gen 7)"],
      },
    },
  ],

  // We're testing the live development site
  webServer: undefined,
});
