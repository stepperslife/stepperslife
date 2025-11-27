#!/usr/bin/env node
/**
 * Master Test Runner for Comprehensive Payment System Testing
 * Orchestrates API tests, E2E tests, and split payment verification
 */

import { spawn } from 'child_process';
import path from 'path';

interface TestPhase {
  name: string;
  description: string;
  command: string;
  args: string[];
  optional?: boolean;
}

class ComprehensiveTestRunner {
  private testPhases: TestPhase[] = [];
  private results: Map<string, { passed: boolean; duration: number; output: string }> = new Map();

  constructor() {
    this.setupTestPhases();
  }

  /**
   * Define all test phases
   */
  private setupTestPhases(): void {
    this.testPhases = [
      {
        name: 'Environment Check',
        description: 'Verify environment variables and dependencies',
        command: 'node',
        args: ['-e', `
          const required = [
            'NEXT_PUBLIC_CONVEX_URL',
            'STRIPE_SECRET_KEY',
            'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'
          ];
          const missing = required.filter(key => !process.env[key]);
          if (missing.length > 0) {
            console.error('Missing required environment variables:', missing.join(', '));
            process.exit(1);
          }
          console.log('✓ All required environment variables are set');
        `]
      },
      {
        name: 'API Tests',
        description: 'Run direct Convex API payment tests',
        command: 'ts-node',
        args: ['scripts/test-payment-api.ts']
      },
      {
        name: 'E2E Tests',
        description: 'Run Playwright end-to-end payment flow tests',
        command: 'npx',
        args: ['playwright', 'test', 'tests/comprehensive-payment-suite.spec.ts']
      },
      {
        name: 'Split Payment Verification',
        description: 'Verify Stripe split payments against Stripe API',
        command: 'ts-node',
        args: ['scripts/verify-split-payments.ts', 'application-fees'],
        optional: true
      },
      {
        name: 'Test Data Cleanup',
        description: 'Clean up test data (optional)',
        command: 'ts-node',
        args: ['scripts/cleanup-test-data.ts', 'stats'],
        optional: true
      }
    ];
  }

  /**
   * Run all test phases
   */
  async runAll(options: {
    skipOptional?: boolean;
    stopOnFailure?: boolean;
  } = {}): Promise<void> {
    console.log('\n' + '='.repeat(100));
    console.log('COMPREHENSIVE PAYMENT SYSTEM TEST RUNNER');
    console.log('='.repeat(100));
    console.log('\nTest Plan:');
    console.log('  - Phase 1: Environment validation');
    console.log('  - Phase 2: API Tests (Direct Convex testing)');
    console.log('  - Phase 3: E2E Tests (Playwright UI testing)');
    console.log('  - Phase 4: Split Payment Verification (Stripe API)');
    console.log('  - Phase 5: Cleanup and Statistics');
    console.log('\nTotal Events to Create: 10 (3 PREPAY + 7 CREDIT_CARD)');
    console.log('Total Payment Methods: 4 (Cash, Stripe, PayPal, CashApp)');
    console.log('='.repeat(100) + '\n');

    const { skipOptional = false, stopOnFailure = true } = options;

    for (const phase of this.testPhases) {
      // Skip optional phases if requested
      if (skipOptional && phase.optional) {
        console.log(`\n[SKIP] ${phase.name} (optional)`);
        continue;
      }

      console.log(`\n${'='.repeat(100)}`);
      console.log(`[PHASE] ${phase.name}`);
      console.log(`${phase.description}`);
      console.log('='.repeat(100));

      const startTime = Date.now();

      try {
        const output = await this.runPhase(phase);
        const duration = Date.now() - startTime;

        this.results.set(phase.name, {
          passed: true,
          duration,
          output
        });

        console.log(`\n✓ ${phase.name} completed in ${(duration / 1000).toFixed(2)}s`);

      } catch (error) {
        const duration = Date.now() - startTime;

        this.results.set(phase.name, {
          passed: false,
          duration,
          output: error.message
        });

        console.error(`\n✗ ${phase.name} failed after ${(duration / 1000).toFixed(2)}s`);
        console.error(`Error: ${error.message}`);

        if (stopOnFailure && !phase.optional) {
          console.error('\n[ABORT] Stopping due to failure in required phase');
          break;
        }
      }
    }

    // Print final summary
    this.printSummary();
  }

  /**
   * Run a single test phase
   */
  private async runPhase(phase: TestPhase): Promise<string> {
    return new Promise((resolve, reject) => {
      let output = '';
      let errorOutput = '';

      const child = spawn(phase.command, phase.args, {
        cwd: process.cwd(),
        env: process.env,
        stdio: ['pipe', 'pipe', 'pipe']
      });

      child.stdout?.on('data', (data) => {
        const text = data.toString();
        output += text;
        process.stdout.write(text); // Stream to console
      });

      child.stderr?.on('data', (data) => {
        const text = data.toString();
        errorOutput += text;
        process.stderr.write(text); // Stream to console
      });

      child.on('error', (error) => {
        reject(new Error(`Failed to start command: ${error.message}`));
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve(output);
        } else {
          reject(new Error(`Process exited with code ${code}\n${errorOutput}`));
        }
      });
    });
  }

  /**
   * Print test summary
   */
  private printSummary(): void {
    console.log('\n' + '='.repeat(100));
    console.log('TEST SUMMARY');
    console.log('='.repeat(100) + '\n');

    const phases = Array.from(this.results.entries());
    const passed = phases.filter(([_, result]) => result.passed).length;
    const failed = phases.filter(([_, result]) => !result.passed).length;
    const totalDuration = phases.reduce((sum, [_, result]) => sum + result.duration, 0);

    phases.forEach(([name, result]) => {
      const status = result.passed ? '✓ PASS' : '✗ FAIL';
      const duration = (result.duration / 1000).toFixed(2);
      console.log(`${status} - ${name} (${duration}s)`);
    });

    console.log('\n' + '-'.repeat(100));
    console.log(`Total Phases: ${phases.length}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    console.log(`Total Duration: ${(totalDuration / 1000).toFixed(2)}s`);
    console.log(`Success Rate: ${((passed / phases.length) * 100).toFixed(2)}%`);
    console.log('='.repeat(100) + '\n');

    // Exit code based on results
    if (failed > 0) {
      process.exit(1);
    }
  }

  /**
   * Run specific phase by name
   */
  async runPhaseByName(phaseName: string): Promise<void> {
    const phase = this.testPhases.find(p => p.name.toLowerCase() === phaseName.toLowerCase());

    if (!phase) {
      console.error(`Phase "${phaseName}" not found`);
      console.log('\nAvailable phases:');
      this.testPhases.forEach(p => console.log(`  - ${p.name}`));
      process.exit(1);
    }

    console.log(`\nRunning phase: ${phase.name}\n`);

    try {
      await this.runPhase(phase);
      console.log(`\n✓ ${phase.name} completed successfully`);
      process.exit(0);
    } catch (error) {
      console.error(`\n✗ ${phase.name} failed: ${error.message}`);
      process.exit(1);
    }
  }
}

// CLI Interface
if (require.main === module) {
  const runner = new ComprehensiveTestRunner();

  const command = process.argv[2];
  const arg = process.argv[3];

  switch (command) {
    case 'all':
      runner.runAll({ skipOptional: false, stopOnFailure: true })
        .then(() => {
          console.log('\n✓ All tests completed');
          process.exit(0);
        })
        .catch((error) => {
          console.error('\n✗ Test suite failed:', error);
          process.exit(1);
        });
      break;

    case 'required':
      runner.runAll({ skipOptional: true, stopOnFailure: true })
        .then(() => {
          console.log('\n✓ All required tests completed');
          process.exit(0);
        })
        .catch((error) => {
          console.error('\n✗ Test suite failed:', error);
          process.exit(1);
        });
      break;

    case 'phase':
      if (!arg) {
        console.error('Usage: node run-comprehensive-payment-tests.js phase <phase-name>');
        process.exit(1);
      }
      runner.runPhaseByName(arg);
      break;

    case 'help':
    default:
      console.log('Comprehensive Payment System Test Runner');
      console.log('\nUsage:');
      console.log('  npm run test:payment:all          - Run all test phases (required + optional)');
      console.log('  npm run test:payment:required     - Run only required phases');
      console.log('  npm run test:payment:phase <name> - Run a specific phase');
      console.log('\nAvailable Phases:');
      console.log('  - Environment Check');
      console.log('  - API Tests');
      console.log('  - E2E Tests');
      console.log('  - Split Payment Verification');
      console.log('  - Test Data Cleanup');
      console.log('\nExample:');
      console.log('  npm run test:payment:all');
      console.log('  npm run test:payment:phase "API Tests"');
      process.exit(0);
  }
}

export default ComprehensiveTestRunner;
