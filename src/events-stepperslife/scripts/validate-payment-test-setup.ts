#!/usr/bin/env node
/**
 * Payment Test Setup Validation
 * Validates that all test infrastructure is in place and ready to use
 */

import fs from 'fs';
import path from 'path';

interface ValidationResult {
  category: string;
  checks: { name: string; passed: boolean; details?: string }[];
}

class SetupValidator {
  private results: ValidationResult[] = [];

  async validate(): Promise<void> {
    console.log('\n' + '='.repeat(80));
    console.log('PAYMENT TEST INFRASTRUCTURE VALIDATION');
    console.log('='.repeat(80) + '\n');

    this.validateFileStructure();
    this.validateEnvironment();
    this.validateDependencies();
    this.validateNPMScripts();
    this.validateDocumentation();

    this.printResults();
  }

  private validateFileStructure(): void {
    const category = 'File Structure';
    const checks = [];

    const requiredFiles = [
      'tests/helpers/payment-test-data.ts',
      'tests/helpers/organizer-setup.ts',
      'tests/helpers/payment-assertions.ts',
      'tests/comprehensive-payment-suite.spec.ts',
      'scripts/verify-split-payments.ts',
      'scripts/cleanup-test-data.ts',
      'scripts/run-comprehensive-payment-tests.ts',
    ];

    for (const file of requiredFiles) {
      const exists = fs.existsSync(path.join(process.cwd(), file));
      checks.push({
        name: file,
        passed: exists,
        details: exists ? 'Found' : 'Missing'
      });
    }

    this.results.push({ category, checks });
  }

  private validateEnvironment(): void {
    const category = 'Environment Variables';
    const checks = [];

    const required = [
      'NEXT_PUBLIC_CONVEX_URL',
      'STRIPE_SECRET_KEY',
      'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'
    ];

    const optional = [
      'SQUARE_ACCESS_TOKEN',
      'PAYPAL_CLIENT_ID',
      'PLAYWRIGHT_TEST_BASE_URL'
    ];

    // Check .env.local exists
    const envExists = fs.existsSync(path.join(process.cwd(), '.env.local'));
    checks.push({
      name: '.env.local file',
      passed: envExists,
      details: envExists ? 'Found' : 'Missing - create from .env.example'
    });

    if (envExists) {
      const envContent = fs.readFileSync(path.join(process.cwd(), '.env.local'), 'utf-8');

      for (const varName of required) {
        const exists = envContent.includes(varName);
        checks.push({
          name: `${varName} (required)`,
          passed: exists,
          details: exists ? 'Configured' : 'Missing'
        });
      }

      for (const varName of optional) {
        const exists = envContent.includes(varName);
        checks.push({
          name: `${varName} (optional)`,
          passed: exists,
          details: exists ? 'Configured' : 'Not configured'
        });
      }
    }

    this.results.push({ category, checks });
  }

  private validateDependencies(): void {
    const category = 'Dependencies';
    const checks = [];

    const packageJson = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf-8')
    );

    const requiredDeps = {
      'convex': 'dependencies',
      'stripe': 'dependencies',
      '@stripe/stripe-js': 'dependencies',
      '@playwright/test': 'devDependencies',
      'ts-node': 'devDependencies'
    };

    for (const [dep, section] of Object.entries(requiredDeps)) {
      const exists = packageJson[section]?.[dep];
      checks.push({
        name: `${dep} (${section})`,
        passed: !!exists,
        details: exists ? `v${exists}` : 'Missing'
      });
    }

    // Check node_modules
    const nodeModulesExists = fs.existsSync(path.join(process.cwd(), 'node_modules'));
    checks.push({
      name: 'node_modules installed',
      passed: nodeModulesExists,
      details: nodeModulesExists ? 'Found' : 'Run npm install'
    });

    this.results.push({ category, checks });
  }

  private validateNPMScripts(): void {
    const category = 'NPM Scripts';
    const checks = [];

    const packageJson = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf-8')
    );

    const requiredScripts = [
      'test:payment:all',
      'test:payment:api',
      'test:payment:e2e',
      'test:payment:verify',
      'test:payment:cleanup'
    ];

    for (const script of requiredScripts) {
      const exists = packageJson.scripts?.[script];
      checks.push({
        name: script,
        passed: !!exists,
        details: exists ? 'Configured' : 'Missing'
      });
    }

    this.results.push({ category, checks });
  }

  private validateDocumentation(): void {
    const category = 'Documentation';
    const checks = [];

    const docs = [
      'PAYMENT_TEST_QUICKSTART.md',
      'tests/PAYMENT_TESTING_GUIDE.md',
      'COMPREHENSIVE_PAYMENT_TEST_SUMMARY.md'
    ];

    for (const doc of docs) {
      const exists = fs.existsSync(path.join(process.cwd(), doc));
      checks.push({
        name: doc,
        passed: exists,
        details: exists ? 'Available' : 'Missing'
      });
    }

    this.results.push({ category, checks });
  }

  private printResults(): void {
    let totalChecks = 0;
    let passedChecks = 0;

    console.log('\nValidation Results:\n');

    for (const result of this.results) {
      console.log(`\n${result.category}`);
      console.log('-'.repeat(80));

      for (const check of result.checks) {
        totalChecks++;
        if (check.passed) passedChecks++;

        const status = check.passed ? '✓' : '✗';
        const color = check.passed ? '\x1b[32m' : '\x1b[31m';
        const reset = '\x1b[0m';

        console.log(`${color}${status}${reset} ${check.name}`);
        if (check.details) {
          console.log(`  ${check.details}`);
        }
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('SUMMARY');
    console.log('='.repeat(80));
    console.log(`Total Checks: ${totalChecks}`);
    console.log(`Passed: ${passedChecks}`);
    console.log(`Failed: ${totalChecks - passedChecks}`);
    console.log(`Success Rate: ${((passedChecks / totalChecks) * 100).toFixed(2)}%`);
    console.log('='.repeat(80));

    if (passedChecks === totalChecks) {
      console.log('\n✅ All validation checks passed!');
      console.log('\nYou can now run the payment tests:');
      console.log('  npm run test:payment:all     - Full comprehensive test suite');
      console.log('  npm run test:payment:e2e     - Playwright E2E tests only');
      console.log('\nNote: The API test scripts need to be adapted to your actual Convex schema.');
      console.log('The E2E Playwright tests and all infrastructure are ready to use.\n');
    } else {
      console.log('\n⚠️  Some checks failed. Please review the issues above.');
      console.log('\nCommon fixes:');
      console.log('  - Missing files: Test infrastructure files are in place');
      console.log('  - Environment: Create .env.local with required variables');
      console.log('  - Dependencies: Run npm install');
      console.log('\nSee PAYMENT_TEST_QUICKSTART.md for detailed setup instructions.\n');
    }
  }
}

// Run validation
const validator = new SetupValidator();
validator.validate()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Validation failed:', error);
    process.exit(1);
  });
