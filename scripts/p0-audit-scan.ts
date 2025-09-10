#!/usr/bin/env tsx

/**
 * P0 UX AUDIT - Static Code Scanner
 * 
 * Scans codebase for P0 UX requirements and generates proofs with file paths + line numbers
 */

import { glob } from 'glob';
import * as fs from 'fs';
import * as path from 'path';

export interface AuditEvidence {
  file: string;
  lines: number[];
  excerpt: string;
  context: string;
}

export interface AuditResult {
  requirement: string;
  status: 'green' | 'amber' | 'red';
  evidence: AuditEvidence[];
  gaps: string[];
  quickFix: string;
}

class P0AuditScanner {
  private results: AuditResult[] = [];
  private evidence: Map<string, AuditEvidence[]> = new Map();

  async scan(): Promise<void> {
    console.log('🔍 Starting P0 UX Audit Static Scan...');

    // Scan patterns for each P0 requirement
    await this.scanSkeletonsAndEmptyStates();
    await this.scanErrorsAndRetry();
    await this.scanProgressionAndCTA();
    await this.scanCooldown();
    await this.scanMobileAndA11y();
    await this.scanTelemetry();

    await this.generateReport();
  }

  private async scanSkeletonsAndEmptyStates(): Promise<void> {
    const patterns = [
      'Skeleton',
      'Loader',
      'Shimmer',
      'isLoading',
      'loading',
      'EmptyState',
      'NoData',
      'empty'
    ];

    const evidence: AuditEvidence[] = [];

    for (const pattern of patterns) {
      const files = await glob('src/**/*.{ts,tsx}');
      
      for (const file of files) {
        const content = fs.readFileSync(file, 'utf-8');
        const lines = content.split('\n');
        
        const matchingLines: number[] = [];
        lines.forEach((line, index) => {
          if (line.includes(pattern) && !line.includes('//') && !line.includes('*')) {
            matchingLines.push(index + 1);
          }
        });

        if (matchingLines.length > 0) {
          const excerpt = this.extractExcerpt(lines, matchingLines);
          evidence.push({
            file: file.replace('src/', ''),
            lines: matchingLines,
            excerpt,
            context: pattern
          });
        }
      }
    }

    // Check specific critical pages
    const criticalPages = ['pages/Home.tsx', 'pages/BookPage.tsx', 'components/books/QuizModal.tsx'];
    const hasSkeletonsInPages = criticalPages.map(page => 
      evidence.some(e => e.file.includes(page.replace('pages/', '').replace('components/', '')) && 
        (e.context.includes('Skeleton') || e.context.includes('loading')))
    );

    const status: 'green' | 'amber' | 'red' = hasSkeletonsInPages.every(has => has) ? 'green' : 
                                               hasSkeletonsInPages.some(has => has) ? 'amber' : 'red';

    const gaps = [];
    if (!hasSkeletonsInPages[0]) gaps.push('Home page missing skeleton loading states');
    if (!hasSkeletonsInPages[1]) gaps.push('BookPage missing skeleton loading states');
    if (!hasSkeletonsInPages[2]) gaps.push('QuizModal missing skeleton/loading feedback');

    this.results.push({
      requirement: 'P0.1 Skeletons & Empty States',
      status,
      evidence: evidence.slice(0, 10), // Limit evidence for readability
      gaps,
      quickFix: 'Add <Skeleton /> components to loading states in missing pages'
    });
  }

  private async scanErrorsAndRetry(): Promise<void> {
    const patterns = [
      'ErrorBoundary',
      'componentDidCatch',
      'toast.error',
      'showToast',
      'retry',
      'backoff',
      'fetchWithRetry'
    ];

    const evidence: AuditEvidence[] = [];

    for (const pattern of patterns) {
      const files = await glob('src/**/*.{ts,tsx}');
      
      for (const file of files) {
        const content = fs.readFileSync(file, 'utf-8');
        const lines = content.split('\n');
        
        const matchingLines: number[] = [];
        lines.forEach((line, index) => {
          if (line.includes(pattern)) {
            matchingLines.push(index + 1);
          }
        });

        if (matchingLines.length > 0) {
          const excerpt = this.extractExcerpt(lines, matchingLines);
          evidence.push({
            file: file.replace('src/', ''),
            lines: matchingLines,
            excerpt,
            context: pattern
          });
        }
      }
    }

    const hasErrorBoundary = evidence.some(e => e.context === 'ErrorBoundary');
    const hasToastErrors = evidence.some(e => e.context === 'toast.error');
    const hasRetry = evidence.some(e => e.context.includes('retry'));

    let status: 'green' | 'amber' | 'red' = 'red';
    if (hasErrorBoundary && hasToastErrors && hasRetry) status = 'green';
    else if (hasErrorBoundary && hasToastErrors) status = 'amber';

    const gaps = [];
    if (!hasRetry) gaps.push('Missing exponential backoff/retry logic');
    if (!hasErrorBoundary) gaps.push('Missing global ErrorBoundary');

    this.results.push({
      requirement: 'P0.2 Unified Errors + Retry',
      status,
      evidence: evidence.slice(0, 8),
      gaps,
      quickFix: 'Implement fetchWithRetry wrapper with p-retry library'
    });
  }

  private async scanProgressionAndCTA(): Promise<void> {
    const patterns = [
      'next',
      'suivant',
      'segment suivant',
      'continue',
      'prochaine action',
      'NextSegment',
      'CTA'
    ];

    const evidence: AuditEvidence[] = [];

    for (const pattern of patterns) {
      const files = await glob('src/**/*.{ts,tsx}');
      
      for (const file of files) {
        const content = fs.readFileSync(file, 'utf-8');
        const lines = content.split('\n');
        
        const matchingLines: number[] = [];
        lines.forEach((line, index) => {
          if (line.toLowerCase().includes(pattern.toLowerCase())) {
            matchingLines.push(index + 1);
          }
        });

        if (matchingLines.length > 0) {
          const excerpt = this.extractExcerpt(lines, matchingLines);
          evidence.push({
            file: file.replace('src/', ''),
            lines: matchingLines,
            excerpt,
            context: pattern
          });
        }
      }
    }

    const hasProgressionUI = evidence.length > 0;
    const status: 'green' | 'amber' | 'red' = hasProgressionUI ? 'green' : 'red';

    this.results.push({
      requirement: 'P0.3 Clear Progression & Next Action CTA',
      status,
      evidence: evidence.slice(0, 6),
      gaps: hasProgressionUI ? [] : ['Missing clear next action CTAs'],
      quickFix: 'Add NextSegmentButton component with clear progression indicators'
    });
  }

  private async scanCooldown(): Promise<void> {
    const patterns = [
      'cooldown',
      'remainingLockTime',
      'setInterval',
      'mm:ss',
      'LockTimer',
      'countdown'
    ];

    const evidence: AuditEvidence[] = [];

    for (const pattern of patterns) {
      const files = await glob('src/**/*.{ts,tsx}');
      
      for (const file of files) {
        const content = fs.readFileSync(file, 'utf-8');
        const lines = content.split('\n');
        
        const matchingLines: number[] = [];
        lines.forEach((line, index) => {
          if (line.includes(pattern)) {
            matchingLines.push(index + 1);
          }
        });

        if (matchingLines.length > 0) {
          const excerpt = this.extractExcerpt(lines, matchingLines);
          evidence.push({
            file: file.replace('src/', ''),
            lines: matchingLines,
            excerpt,
            context: pattern
          });
        }
      }
    }

    const hasLockTimer = evidence.some(e => e.context === 'LockTimer' || e.context === 'remainingLockTime');
    const hasCountdown = evidence.some(e => e.context.includes('countdown') || e.context.includes('setInterval'));
    
    let status: 'green' | 'amber' | 'red' = 'red';
    if (hasLockTimer && hasCountdown) status = 'green';
    else if (hasLockTimer) status = 'amber';

    const gaps = [];
    if (!hasCountdown) gaps.push('Missing visual countdown timer (mm:ss format)');

    this.results.push({
      requirement: 'P0.4 Explicit Cooldown with Countdown',
      status,
      evidence: evidence.slice(0, 6),
      gaps,
      quickFix: 'Implement useCountdown hook with mm:ss display in LockTimer'
    });
  }

  private async scanMobileAndA11y(): Promise<void> {
    const patterns = [
      'aria-',
      'role=',
      'min-h-11',
      'h-11',
      'touch-target',
      'focus:',
      'sr-only',
      'alt=',
      'tabIndex'
    ];

    const evidence: AuditEvidence[] = [];

    for (const pattern of patterns) {
      const files = await glob('src/**/*.{ts,tsx}');
      
      for (const file of files) {
        const content = fs.readFileSync(file, 'utf-8');
        const lines = content.split('\n');
        
        const matchingLines: number[] = [];
        lines.forEach((line, index) => {
          if (line.includes(pattern)) {
            matchingLines.push(index + 1);
          }
        });

        if (matchingLines.length > 0) {
          const excerpt = this.extractExcerpt(lines, matchingLines);
          evidence.push({
            file: file.replace('src/', ''),
            lines: matchingLines,
            excerpt,
            context: pattern
          });
        }
      }
    }

    const hasAriaLabels = evidence.some(e => e.context.includes('aria-'));
    const hasFocusStyles = evidence.some(e => e.context.includes('focus:'));
    const hasTouchTargets = evidence.some(e => e.context.includes('h-11') || e.context.includes('min-h-11'));

    let status: 'green' | 'amber' | 'red' = 'red';
    if (hasAriaLabels && hasFocusStyles && hasTouchTargets) status = 'green';
    else if ((hasAriaLabels && hasFocusStyles) || hasTouchTargets) status = 'amber';

    const gaps = [];
    if (!hasAriaLabels) gaps.push('Missing ARIA labels for accessibility');
    if (!hasFocusStyles) gaps.push('Missing focus styles for keyboard navigation');
    if (!hasTouchTargets) gaps.push('Buttons may not meet 44px touch target size');

    this.results.push({
      requirement: 'P0.5 Mobile-first & Basic A11y',
      status,
      evidence: evidence.slice(0, 8),
      gaps,
      quickFix: 'Add min-h-11 to buttons, aria-labels, and focus: styles throughout'
    });
  }

  private async scanTelemetry(): Promise<void> {
    const patterns = [
      'track',
      'analytics',
      'plausible',
      'posthog',
      'mixpanel',
      'telemetry',
      'event',
      'metric'
    ];

    const evidence: AuditEvidence[] = [];

    for (const pattern of patterns) {
      const files = await glob('src/**/*.{ts,tsx}');
      
      for (const file of files) {
        const content = fs.readFileSync(file, 'utf-8');
        const lines = content.split('\n');
        
        const matchingLines: number[] = [];
        lines.forEach((line, index) => {
          if (line.toLowerCase().includes(pattern) && 
              !line.includes('//') && 
              !line.includes('import') &&
              !line.includes('interface')) {
            matchingLines.push(index + 1);
          }
        });

        if (matchingLines.length > 0) {
          const excerpt = this.extractExcerpt(lines, matchingLines);
          evidence.push({
            file: file.replace('src/', ''),
            lines: matchingLines,
            excerpt,
            context: pattern
          });
        }
      }
    }

    const hasAnalytics = evidence.length > 0;
    const status: 'green' | 'amber' | 'red' = hasAnalytics ? 'green' : 'red';

    this.results.push({
      requirement: 'P0.6 Minimal Telemetry',
      status,
      evidence: evidence.slice(0, 6),
      gaps: hasAnalytics ? [] : ['Missing analytics/telemetry implementation'],
      quickFix: 'Implement analytics service with key events: view_book, submit_answer, error_shown'
    });
  }

  private extractExcerpt(lines: string[], matchingLines: number[]): string {
    if (matchingLines.length === 0) return '';
    
    const start = Math.max(0, Math.min(...matchingLines) - 2);
    const end = Math.min(lines.length, Math.max(...matchingLines) + 2);
    
    return lines
      .slice(start, end)
      .map((line, index) => `${start + index + 1}: ${line}`)
      .join('\n');
  }

  private async generateReport(): Promise<void> {
    // Create artifacts directory
    const artifactsDir = 'artifacts/p0-audit';
    fs.mkdirSync(artifactsDir, { recursive: true });

    // Generate scan results JSON
    const scanResults = {
      timestamp: new Date().toISOString(),
      results: this.results,
      summary: {
        total: this.results.length,
        green: this.results.filter(r => r.status === 'green').length,
        amber: this.results.filter(r => r.status === 'amber').length,
        red: this.results.filter(r => r.status === 'red').length,
        score: this.calculateScore()
      }
    };

    fs.writeFileSync(
      path.join(artifactsDir, 'scan.json'), 
      JSON.stringify(scanResults, null, 2)
    );

    console.log(`✅ Static scan complete. Results saved to ${artifactsDir}/scan.json`);
    console.log(`📊 Score: ${scanResults.summary.score}/12 (${scanResults.summary.green} green, ${scanResults.summary.amber} amber, ${scanResults.summary.red} red)`);
  }

  private calculateScore(): number {
    return this.results.reduce((score, result) => {
      switch (result.status) {
        case 'green': return score + 2;
        case 'amber': return score + 1;
        case 'red': return score + 0;
        default: return score;
      }
    }, 0);
  }
}

// Run if called directly
if (require.main === module) {
  const scanner = new P0AuditScanner();
  scanner.scan().catch(console.error);
}

export { P0AuditScanner };