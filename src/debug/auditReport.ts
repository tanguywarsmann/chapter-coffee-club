// Audit Report Generator - Analyze Joker flow issues
export interface AuditReport {
  timestamp: string;
  summary: {
    totalErrors: number;
    criticalIssues: string[];
    warnings: string[];
    passedChecks: string[];
  };
  jokerFlow: {
    multipleRevealCalls: boolean;
    doubleValidation: boolean;
    missingAuthHeaders: boolean;
    payloadMismatch: boolean;
    quotaBypass: boolean;
  };
  accessibility: {
    missingDialogTitles: string[];
    missingDialogDescriptions: string[];
    focusTrapIssues: string[];
  };
  animations: {
    confettiVisible: boolean;
    framerMotionIssues: string[];
  };
  networkIssues: {
    workboxInterference: boolean;
    manifestMissing: boolean;
    corsErrors: string[];
  };
  proposedFixes: {
    file: string;
    issue: string;
    fix: string;
  }[];
}

export class JokerAuditor {
  private report: AuditReport;
  
  constructor() {
    this.report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalErrors: 0,
        criticalIssues: [],
        warnings: [],
        passedChecks: []
      },
      jokerFlow: {
        multipleRevealCalls: false,
        doubleValidation: false,
        missingAuthHeaders: false,
        payloadMismatch: false,
        quotaBypass: false
      },
      accessibility: {
        missingDialogTitles: [],
        missingDialogDescriptions: [],
        focusTrapIssues: []
      },
      animations: {
        confettiVisible: false,
        framerMotionIssues: []
      },
      networkIssues: {
        workboxInterference: false,
        manifestMissing: false,
        corsErrors: []
      },
      proposedFixes: []
    };
  }

  public analyzeDebugLogs(logs: any[]): void {
    console.group('[AUDIT] Analyzing debug logs');
    
    // Analyze joker reveal calls
    const jokerCalls = logs.filter(l => 
      l.args[0]?.includes?.('joker-reveal') || 
      l.args[0]?.includes?.('[NET] joker-reveal')
    );
    
    const validationCalls = logs.filter(l => 
      l.args[0]?.includes?.('validation') || 
      l.args[0]?.includes?.('validateReadingSegmentBeta') ||
      l.args[0]?.includes?.('[NET] validation-call')
    );

    console.log('Found joker calls:', jokerCalls.length);
    console.log('Found validation calls:', validationCalls.length);

    // Check for multiple joker reveal calls
    if (jokerCalls.length > 1) {
      this.report.jokerFlow.multipleRevealCalls = true;
      this.report.summary.criticalIssues.push('Multiple joker-reveal calls detected');
      this.report.proposedFixes.push({
        file: 'src/components/books/QuizModal.tsx',
        issue: 'Multiple joker calls',
        fix: 'Add inFlightRef protection in handleJokerConfirm'
      });
    }

    // Check for double validation after joker
    const jokerValidationPairs = this.findJokerValidationPairs(jokerCalls, validationCalls);
    if (jokerValidationPairs.length > 0) {
      this.report.jokerFlow.doubleValidation = true;
      this.report.summary.criticalIssues.push('Double validation after joker detected');
      this.report.proposedFixes.push({
        file: 'src/components/books/QuizModal.tsx',
        issue: 'Double validation after joker',
        fix: 'Remove validation call after joker success - joker-reveal edge function handles validation'
      });
    }

    // Check auth headers
    jokerCalls.forEach(call => {
      const requestData = call.args[1];
      if (requestData && !requestData.headers?.Authorization) {
        this.report.jokerFlow.missingAuthHeaders = true;
        this.report.summary.criticalIssues.push('Missing Authorization header in joker call');
      }
    });

    // Check payload structure
    jokerCalls.forEach(call => {
      const requestData = call.args[1];
      if (requestData?.requestBody) {
        if (!requestData.requestBody.bookId || !requestData.requestBody.questionId || !requestData.requestBody.userId) {
          this.report.jokerFlow.payloadMismatch = true;
          this.report.summary.warnings.push('Incomplete payload in joker call');
        }
      }
    });

    console.groupEnd();
  }

  private findJokerValidationPairs(jokerCalls: any[], validationCalls: any[]): any[] {
    const pairs = [];
    
    jokerCalls.forEach(jokerCall => {
      const jokerTime = new Date(jokerCall.ts).getTime();
      
      // Look for validation calls within 5 seconds after joker call
      const followingValidations = validationCalls.filter(valCall => {
        const valTime = new Date(valCall.ts).getTime();
        return valTime > jokerTime && valTime - jokerTime < 5000;
      });
      
      if (followingValidations.length > 0) {
        pairs.push({ jokerCall, validations: followingValidations });
      }
    });
    
    return pairs;
  }

  public checkAccessibility(): void {
    console.group('[AUDIT] Checking accessibility');
    
    const dialogs = document.querySelectorAll('[data-radix-dialog-content]');
    
    dialogs.forEach((dialog, index) => {
      const title = dialog.querySelector('[data-radix-dialog-title]');
      const description = dialog.querySelector('[data-radix-dialog-description]');
      
      if (!title) {
        this.report.accessibility.missingDialogTitles.push(`Dialog ${index + 1}`);
        this.report.summary.warnings.push(`Missing DialogTitle in dialog ${index + 1}`);
      }
      
      if (!description) {
        this.report.accessibility.missingDialogDescriptions.push(`Dialog ${index + 1}`);
        this.report.summary.warnings.push(`Missing DialogDescription in dialog ${index + 1}`);
      }
    });
    
    console.groupEnd();
  }

  public checkAnimations(): void {
    console.group('[AUDIT] Checking animations');
    
    // Check if confetti canvas exists
    const confettiCanvas = document.querySelector('canvas[style*="pointer-events: none"]');
    this.report.animations.confettiVisible = !!confettiCanvas;
    
    if (confettiCanvas) {
      this.report.summary.passedChecks.push('Confetti canvas found');
    } else {
      this.report.summary.warnings.push('Confetti canvas not found');
    }
    
    // Check for Framer Motion presence
    const motionElements = document.querySelectorAll('[data-framer-appear-id]');
    if (motionElements.length === 0) {
      this.report.animations.framerMotionIssues.push('No Framer Motion elements detected');
    }
    
    console.groupEnd();
  }

  public checkNetwork(): void {
    console.group('[AUDIT] Checking network configuration');
    
    // Check if manifest exists
    fetch('/manifest.webmanifest', { method: 'HEAD' })
      .then(response => {
        this.report.networkIssues.manifestMissing = !response.ok;
        if (response.ok) {
          this.report.summary.passedChecks.push('Manifest file accessible');
        } else {
          this.report.summary.warnings.push('Manifest file missing or inaccessible');
        }
      })
      .catch(() => {
        this.report.networkIssues.manifestMissing = true;
        this.report.summary.warnings.push('Manifest file fetch failed');
      });
    
    console.groupEnd();
  }

  public generateReport(): AuditReport {
    console.group('[AUDIT] Final Report');
    
    this.report.summary.totalErrors = 
      this.report.summary.criticalIssues.length + 
      this.report.summary.warnings.length;
    
    console.log('📊 Audit Summary:');
    console.log(`Total Issues: ${this.report.summary.totalErrors}`);
    console.log(`Critical Issues: ${this.report.summary.criticalIssues.length}`);
    console.log(`Warnings: ${this.report.summary.warnings.length}`);
    console.log(`Passed Checks: ${this.report.summary.passedChecks.length}`);
    
    if (this.report.summary.criticalIssues.length > 0) {
      console.error('🚨 Critical Issues:');
      this.report.summary.criticalIssues.forEach(issue => console.error(`- ${issue}`));
    }
    
    if (this.report.proposedFixes.length > 0) {
      console.log('🔧 Proposed Fixes:');
      this.report.proposedFixes.forEach(fix => {
        console.log(`📄 ${fix.file}: ${fix.issue}`);
        console.log(`   💡 ${fix.fix}`);
      });
    }
    
    console.groupEnd();
    
    return this.report;
  }
}

// Global audit function
export function runJokerAudit(): AuditReport {
  const auditor = new JokerAuditor();
  
  // Get debug logs if available
  const debugDump = (window as any).__VREAD_DEBUG_DUMP__?.();
  if (debugDump?.logs) {
    auditor.analyzeDebugLogs(debugDump.logs);
  }
  
  // Run other checks
  auditor.checkAccessibility();
  auditor.checkAnimations();
  auditor.checkNetwork();
  
  return auditor.generateReport();
}

// Expose to window for manual testing
if (typeof window !== 'undefined') {
  (window as any).__VREAD_AUDIT__ = runJokerAudit;
}