# P0 UX Audit System - Usage Guide

This comprehensive audit system evaluates your application against 6 critical P0 UX requirements for beta launch readiness.

## Quick Start

### Run Complete Audit
```bash
npx tsx scripts/run-p0-audit.ts
```

### Individual Components
```bash
# Static code scan only
npx tsx scripts/p0-audit-scan.ts

# Generate report from existing data  
npx tsx scripts/generate-p0-report.ts

# Run just the Playwright tests
npx playwright test tests/p0-audit/
```

## What Gets Audited

### P0.1 - Skeletons & Empty States ✨
- **Static Scan:** Looks for `Skeleton`, `isLoading`, `EmptyState` components
- **Runtime Tests:** Verifies loading states appear during API delays
- **Critical Pages:** Home, BookPage, QuizModal

### P0.2 - Unified Errors + Retry Logic ⚠️
- **Static Scan:** Finds `ErrorBoundary`, `toast.error`, `retry` patterns
- **Runtime Tests:** Triggers 500 errors, verifies toast + retry button
- **Infrastructure:** Global error handling with user-friendly recovery

### P0.3 - Clear Progression & Next Action CTAs 🎯
- **Static Scan:** Searches for "suivant", "continue", "prochaine action"
- **Runtime Tests:** Verifies clear next steps on book pages
- **UX Goal:** Users always know what to do next

### P0.4 - Explicit Cooldown with Countdown ⏱️
- **Static Scan:** Finds `remainingLockTime`, `LockTimer`, countdown logic
- **Runtime Tests:** Verifies mm:ss timer display during locks
- **User Experience:** Visual countdown prevents confusion

### P0.5 - Mobile-first & Basic A11y 📱
- **Static Scan:** Checks for `aria-`, `focus:`, touch target sizes
- **Runtime Tests:** Validates 44px touch targets, focus indicators
- **Standards:** WCAG AA compliance basics + mobile optimization

### P0.6 - Minimal Telemetry 📊
- **Static Scan:** Looks for `track`, `analytics`, event patterns
- **Runtime Tests:** Verifies key events are captured
- **Events:** `view_book`, `submit_answer`, `error_shown`, `cooldown_seen`

## Output Files

After running the audit, you'll get:

### 📄 `docs/p0_audit.md`
Comprehensive human-readable report with:
- Executive summary with pass/fail counts
- Detailed findings per requirement
- File paths + line numbers as proof
- Specific gaps identified
- Quick fix recommendations
- Priority-ordered fix suggestions

### 📊 `docs/p0_audit_score.json`
Structured scorecard for CI/automated tracking:
```json
{
  "score": 8,
  "maxScore": 12,
  "percentage": 67,
  "requirements": [
    {
      "id": "P0.1",
      "title": "Skeletons & Empty States", 
      "status": "green",
      "points": 2
    }
  ]
}
```

### 🗂️ `artifacts/p0-audit/`
Raw audit data:
- `scan.json` - Static analysis results with code excerpts
- `test-results.json` - Playwright test outcomes
- `p0-audit-report.json` - Combined detailed results

## Scoring System

- **Green (2 points):** Requirement fully implemented
- **Amber (1 point):** Partially implemented, needs improvement  
- **Red (0 points):** Missing or broken implementation

**Target for Beta:** Minimum 10/12 points (83%)

## Integration with CI/CD

### GitHub Actions Example
```yaml
- name: P0 UX Audit
  run: |
    npx tsx scripts/run-p0-audit.ts
    
- name: Check P0 Score
  run: |
    SCORE=$(jq '.score' docs/p0_audit_score.json)
    if [ "$SCORE" -lt 10 ]; then
      echo "P0 UX score too low: $SCORE/12"
      exit 1
    fi
```

### Pre-deploy Gate
```bash
# Fail deployment if critical UX requirements aren't met
npx tsx scripts/run-p0-audit.ts
FAILED=$(jq '.summary.failed' artifacts/p0-audit/p0-audit-report.json)
if [ "$FAILED" -gt 1 ]; then
  echo "❌ Cannot deploy: $FAILED P0 requirements failed"
  exit 1
fi
```

## Customization

### Adding New Test Cases

Create new files in `tests/p0-audit/`:

```typescript
// tests/p0-audit/custom-requirement.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Custom P0 Requirement', () => {
  test('verifies custom behavior', async ({ page }) => {
    // Your test logic
  });
});
```

### Extending Static Scan

Modify `scripts/p0-audit-scan.ts`:

```typescript
private async scanCustomRequirement(): Promise<void> {
  const patterns = ['customPattern', 'anotherPattern'];
  // Scan logic
}
```

## Troubleshooting

### Common Issues

**"Playwright not found"**
```bash
npm install -D @playwright/test
npx playwright install
```

**"No test results"** 
- Tests might be failing to run
- Check `artifacts/p0-audit/test-output.txt` for errors

**"Static scan finds nothing"**
- Verify patterns match your codebase conventions
- Check file extensions are included (ts, tsx, js, jsx)

### Debug Mode

Add verbose logging:
```bash
DEBUG=1 npx tsx scripts/run-p0-audit.ts
```

## Best Practices

1. **Run Early & Often:** Integrate into daily development workflow
2. **Fix Red Items First:** Critical failures block beta launch
3. **Document Exceptions:** If a requirement doesn't apply, document why
4. **Track Progress:** Use score trending to measure UX debt reduction
5. **Automate:** Set up CI gates to prevent UX regressions

## Extending for Production

This audit system is designed for P0 beta requirements. For production, consider:

- Advanced accessibility auditing (axe-core integration)
- Performance budgets and Core Web Vitals
- Detailed analytics validation
- Cross-browser compatibility testing
- Advanced error tracking (Sentry integration)

---

*The P0 audit ensures your application meets the minimum viable UX standards for beta launch while providing clear, actionable feedback for improvements.*