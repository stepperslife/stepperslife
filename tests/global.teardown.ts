/**
 * Global Teardown for Playwright Tests
 *
 * This file handles cleanup after all tests have completed.
 * It runs once after all test projects have finished.
 */

import { test as teardown } from "@playwright/test";
import fs from "fs";
import path from "path";

const AUTH_DIR = path.join(__dirname, ".auth");

teardown("cleanup test artifacts", async () => {
  console.log("\n🧹 Running global teardown...\n");

  // Clean up auth files (optional - uncomment if you want fresh auth each run)
  // const authFile = path.join(AUTH_DIR, "admin.json");
  // if (fs.existsSync(authFile)) {
  //   fs.unlinkSync(authFile);
  //   console.log("  ✅ Cleaned up auth file");
  // }

  // Log completion
  console.log("  ✅ Global teardown complete\n");
});

teardown("generate test summary", async () => {
  console.log("\n" + "=".repeat(60));
  console.log("TEST RUN COMPLETE");
  console.log("=".repeat(60));

  // Check for test results
  const resultsFile = path.join(__dirname, "..", "test-results", "results.json");

  if (fs.existsSync(resultsFile)) {
    try {
      const results = JSON.parse(fs.readFileSync(resultsFile, "utf-8"));

      const stats = results.stats || {};
      console.log(`\n📊 Test Statistics:`);
      console.log(`   Total:    ${stats.expected || 0}`);
      console.log(`   Passed:   ${stats.expected - (stats.unexpected || 0) - (stats.flaky || 0)}`);
      console.log(`   Failed:   ${stats.unexpected || 0}`);
      console.log(`   Flaky:    ${stats.flaky || 0}`);
      console.log(`   Skipped:  ${stats.skipped || 0}`);
      console.log(`   Duration: ${((stats.duration || 0) / 1000).toFixed(2)}s`);
    } catch {
      console.log("  Could not parse test results");
    }
  }

  console.log("\n📁 Reports available at:");
  console.log("   HTML: test-results/html-report/index.html");
  console.log("   JSON: test-results/results.json");
  console.log("\n" + "=".repeat(60) + "\n");
});
