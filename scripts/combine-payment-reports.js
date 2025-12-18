/**
 * Combine Payment Test Reports
 * Aggregates results from multiple test runs
 */

const fs = require("fs");
const path = require("path");

const RESULTS_DIR = "test-results/payment-audit";
const OUTPUT_FILE = path.join(RESULTS_DIR, "combined-report.json");

function combineReports() {
  console.log("Combining payment audit reports...\n");

  const runs = [];
  let totalPassed = 0;
  let totalFailed = 0;
  let totalSkipped = 0;
  let totalTests = 0;

  // Find all run directories
  for (let i = 1; i <= 10; i++) {
    const runDir = path.join(RESULTS_DIR, `run-${i}`);

    if (!fs.existsSync(runDir)) {
      break;
    }

    // Look for results.json or test output
    const resultsFile = path.join(runDir, "results.json");
    const outputFile = path.join(runDir, "output.log");

    const runResult = {
      run: i,
      status: "unknown",
      passed: 0,
      failed: 0,
      skipped: 0,
      duration: 0,
      timestamp: new Date().toISOString(),
    };

    if (fs.existsSync(resultsFile)) {
      try {
        const results = JSON.parse(fs.readFileSync(resultsFile, "utf-8"));
        runResult.passed = results.stats?.passed || 0;
        runResult.failed = results.stats?.failed || 0;
        runResult.skipped = results.stats?.skipped || 0;
        runResult.duration = results.stats?.duration || 0;
        runResult.status = runResult.failed === 0 ? "PASSED" : "FAILED";
      } catch (e) {
        console.log(`Could not parse results for run ${i}`);
      }
    } else if (fs.existsSync(outputFile)) {
      // Parse output log for results
      const output = fs.readFileSync(outputFile, "utf-8");

      // Look for Playwright output patterns
      const passMatch = output.match(/(\d+) passed/);
      const failMatch = output.match(/(\d+) failed/);
      const skipMatch = output.match(/(\d+) skipped/);

      if (passMatch) runResult.passed = parseInt(passMatch[1]);
      if (failMatch) runResult.failed = parseInt(failMatch[1]);
      if (skipMatch) runResult.skipped = parseInt(skipMatch[1]);

      runResult.status = runResult.failed === 0 ? "PASSED" : "FAILED";
    }

    runs.push(runResult);
    totalPassed += runResult.passed;
    totalFailed += runResult.failed;
    totalSkipped += runResult.skipped;
    totalTests += runResult.passed + runResult.failed + runResult.skipped;

    console.log(
      `Run ${i}: ${runResult.status} (${runResult.passed} passed, ${runResult.failed} failed, ${runResult.skipped} skipped)`
    );
  }

  // Generate combined report
  const combinedReport = {
    generatedAt: new Date().toISOString(),
    totalRuns: runs.length,
    summary: {
      totalTests,
      totalPassed,
      totalFailed,
      totalSkipped,
      passRate: totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(2) + "%" : "N/A",
    },
    allRunsPassed: runs.every((r) => r.status === "PASSED"),
    runs,
  };

  // Write combined report
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(combinedReport, null, 2));
  console.log(`\nCombined report written to: ${OUTPUT_FILE}`);

  // Print summary
  console.log("\n" + "=".repeat(50));
  console.log("           COMBINED RESULTS");
  console.log("=".repeat(50));
  console.log(`Total Runs: ${runs.length}`);
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Pass Rate: ${combinedReport.summary.passRate}`);
  console.log("");

  if (combinedReport.allRunsPassed) {
    console.log("✅ ALL RUNS PASSED");
  } else {
    console.log("❌ SOME RUNS FAILED");
  }

  console.log("=".repeat(50) + "\n");

  return combinedReport;
}

// Run if called directly
if (require.main === module) {
  try {
    const report = combineReports();
    process.exit(report.allRunsPassed ? 0 : 1);
  } catch (error) {
    console.error("Error combining reports:", error);
    process.exit(1);
  }
}

module.exports = { combineReports };
