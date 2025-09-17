#!/usr/bin/env tsx

/**
 * P0 UX AUDIT - Main Orchestrator
 * 
 * Runs complete P0 audit including static scan, runtime tests, and report generation
 */

import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { P0ReportGenerator } from './generate-p0-report';

class P0AuditOrchestrator {
  private artifactsDir = 'artifacts/p0-audit';

  async runFullAudit(): Promise<void> {
    console.log('🎯 Starting Complete P0 UX Audit...');
    console.log('=====================================\n');

    // Create artifacts directory
    fs.mkdirSync(this.artifactsDir, { recursive: true });

    try {
      // Step 1: Run static code scan
      console.log('1️⃣ Running static code scan...');
      await this.runStaticScan();

      // Step 2: Run Playwright tests
      console.log('\n2️⃣ Running runtime tests...');
      await this.runTests();

      // Step 3: Generate comprehensive report
      console.log('\n3️⃣ Generating final report...');
      await this.generateReport();

      // Step 4: Summary
      console.log('\n4️⃣ Audit complete!');
      this.printFinalSummary();

    } catch (error) {
      console.error('❌ Audit failed:', error);
      process.exit(1);
    }
  }

  private async runStaticScan(): Promise<void> {
    return new Promise((resolve, reject) => {
      const process = spawn('npx', ['tsx', 'scripts/p0-audit-scan.ts'], {
        stdio: 'inherit',
        shell: true
      });

      process.on('close', (code) => {
        if (code === 0) {
          console.log('✅ Static scan completed');
          resolve();
        } else {
          console.log('⚠️ Static scan completed with warnings');
          resolve(); // Don't fail the entire audit for scan issues
        }
      });

      process.on('error', (error) => {
        console.warn('⚠️ Static scan error (continuing):', error.message);
        resolve(); // Continue audit even if scan fails
      });
    });
  }

  private async runTests(): Promise<void> {
    return new Promise((resolve) => {
      // First, check if Playwright is configured
      if (!fs.existsSync('playwright.config.ts')) {
        console.log('⚠️ Playwright not configured, skipping tests');
        resolve();
        return;
      }

      const testProcess = spawn('npx', [
        'playwright', 'test', 
        'tests/p0-audit/',
        '--reporter=json',
        `--output-dir=${this.artifactsDir}`
      ], {
        stdio: 'pipe',
        shell: true
      });

      let output = '';
      testProcess.stdout?.on('data', (data) => {
        output += data.toString();
      });

      testProcess.stderr?.on('data', (data) => {
        console.log(data.toString());
      });

      testProcess.on('close', (code) => {
        // Save test output
        try {
          const results = JSON.parse(output);
          fs.writeFileSync(
            path.join(this.artifactsDir, 'test-results.json'),
            JSON.stringify(results, null, 2)
          );
        } catch (e) {
          // If JSON parsing fails, save raw output
          fs.writeFileSync(
            path.join(this.artifactsDir, 'test-output.txt'),
            output
          );
        }

        if (code === 0) {
          console.log('✅ Tests completed successfully');
        } else {
          console.log('⚠️ Some tests failed (continuing audit)');
        }
        resolve();
      });

      testProcess.on('error', (error) => {
        console.warn('⚠️ Test execution error (continuing):', error.message);
        resolve();
      });
    });
  }

  private async generateReport(): Promise<void> {
    const generator = new P0ReportGenerator();
    await generator.generate();
  }

  private printFinalSummary(): void {
    console.log('\n🎉 P0 UX AUDIT COMPLETE');
    console.log('========================');
    console.log('\n📋 What was audited:');
    console.log('  ✅ Skeletons & Empty States');
    console.log('  ✅ Unified Errors + Retry Logic');
    console.log('  ✅ Clear Progression & Next Action CTAs');
    console.log('  ✅ Explicit Cooldown with Countdown');
    console.log('  ✅ Mobile-first & Basic Accessibility');
    console.log('  ✅ Minimal Telemetry Implementation');

    console.log('\n📁 Generated files:');
    console.log('  📄 docs/p0_audit.md - Detailed report');
    console.log('  📊 docs/p0_audit_score.json - Score card');
    console.log('  🗂️ artifacts/p0-audit/ - Raw data & proofs');

    console.log('\n🔍 Next steps:');
    console.log('  1. Review docs/p0_audit.md for detailed findings');
    console.log('  2. Address any RED (failed) requirements immediately');
    console.log('  3. Plan fixes for AMBER (warning) requirements');
    console.log('  4. Re-run audit after implementing fixes');

    console.log('\n💡 To re-run: npm run audit:p0');
  }
}

// Run if called directly
if (require.main === module) {
  const orchestrator = new P0AuditOrchestrator();
  orchestrator.runFullAudit().catch(console.error);
}

export { P0AuditOrchestrator };