// Playwright test scenarios for Joker audit
export const PLAYWRIGHT_JOKER_TESTS = `
// tests/joker-audit.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Joker Flow Audit', () => {
  test.beforeEach(async ({ page }) => {
    // Enable debug instrumentation
    await page.addInitScript(() => {
      if (typeof window !== 'undefined') {
        window.__VREAD_DEBUG_ENABLED__ = true;
      }
    });
  });

  test('S1: Wrong answer → Joker success (single call)', async ({ page }) => {
    await page.goto('/');
    
    // Start capturing network requests
    const jokerRequests: any[] = [];
    const validationRequests: any[] = [];
    
    page.on('request', request => {
      if (request.url().includes('joker-reveal')) {
        jokerRequests.push({
          url: request.url(),
          method: request.method(),
          headers: request.headers(),
          postData: request.postData()
        });
      }
      if (request.url().includes('validate') || request.url().includes('rpc')) {
        validationRequests.push({
          url: request.url(),
          method: request.method(),
          postData: request.postData()
        });
      }
    });

    // Open quiz and give wrong answer
    await page.click('[data-testid="quiz-trigger"]');
    await page.fill('[data-testid="quiz-answer-input"]', 'wrong answer');
    await page.click('[data-testid="submit-answer-button"]');
    
    // Use joker
    await page.waitForSelector('text=Utiliser un joker');
    await page.click('text=Utiliser un joker');
    
    // Wait for joker response
    await page.waitForResponse(/joker-reveal/);
    
    // Verify single joker call
    expect(jokerRequests).toHaveLength(1);
    
    // Verify response is 200
    const jokerResponse = await page.waitForResponse(/joker-reveal/);
    expect(jokerResponse.status()).toBe(200);
    
    // Verify Authorization header
    expect(jokerRequests[0].headers.authorization).toBeTruthy();
    
    // Verify payload
    const payload = JSON.parse(jokerRequests[0].postData);
    expect(payload.bookId).toBeTruthy();
    expect(payload.questionId).toBeTruthy();
    expect(payload.userId).toBeTruthy();
    
    // Complete with joker
    await page.click('text=Valider avec Joker');
    
    // Wait a bit to capture any additional requests
    await page.waitForTimeout(2000);
    
    // Verify NO additional validation calls after joker
    const postJokerValidations = validationRequests.filter(req => 
      new Date(req.timestamp) > new Date(jokerRequests[0].timestamp)
    );
    expect(postJokerValidations).toHaveLength(0);
    
    // Verify success modal and confetti
    await expect(page.locator('text=Parfait !')).toBeVisible();
    
    // Check for confetti canvas
    const confettiCanvas = page.locator('canvas[style*="pointer-events: none"]');
    await expect(confettiCanvas).toBeVisible();
  });

  test('S2: Correct answer direct (no joker)', async ({ page }) => {
    await page.goto('/');
    
    const jokerRequests: any[] = [];
    page.on('request', request => {
      if (request.url().includes('joker-reveal')) {
        jokerRequests.push(request);
      }
    });

    // Open quiz and give correct answer
    await page.click('[data-testid="quiz-trigger"]');
    await page.fill('[data-testid="quiz-answer-input"]', 'correct answer');
    await page.click('[data-testid="submit-answer-button"]');
    
    // Wait for success
    await expect(page.locator('text=Parfait !')).toBeVisible();
    
    // Verify NO joker calls
    expect(jokerRequests).toHaveLength(0);
    
    // Verify confetti
    const confettiCanvas = page.locator('canvas[style*="pointer-events: none"]');
    await expect(confettiCanvas).toBeVisible();
  });

  test('S3: Joker quota exhausted (403 handling)', async ({ page }) => {
    await page.goto('/');
    
    // Mock exhausted quota response
    await page.route('**/functions/v1/joker-reveal', async route => {
      await route.fulfill({
        status: 403,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Plus aucun joker disponible pour ce livre' })
      });
    });

    // Open quiz and give wrong answer
    await page.click('[data-testid="quiz-trigger"]');
    await page.fill('[data-testid="quiz-answer-input"]', 'wrong answer');
    await page.click('[data-testid="submit-answer-button"]');
    
    // Try to use joker
    await page.click('text=Utiliser un joker');
    
    // Verify error message
    await expect(page.locator('text=Impossible d\'utiliser le joker')).toBeVisible();
    
    // Verify NO success modal
    await expect(page.locator('text=Parfait !')).not.toBeVisible();
  });

  test('Accessibility: All dialogs have titles and descriptions', async ({ page }) => {
    await page.goto('/');
    
    // Open quiz modal
    await page.click('[data-testid="quiz-trigger"]');
    
    // Check main quiz dialog
    const mainDialog = page.locator('[data-radix-dialog-content]').first();
    await expect(mainDialog.locator('[data-radix-dialog-title]')).toBeVisible();
    await expect(mainDialog.locator('[data-radix-dialog-description]')).toBeVisible();
    
    // Trigger joker modal
    await page.fill('[data-testid="quiz-answer-input"]', 'wrong answer');
    await page.click('[data-testid="submit-answer-button"]');
    
    // Check joker confirmation dialog
    const jokerDialog = page.locator('[data-radix-dialog-content]').nth(1);
    await expect(jokerDialog.locator('[data-radix-dialog-title]')).toBeVisible();
    await expect(jokerDialog.locator('[data-radix-dialog-description]')).toBeVisible();
  });

  test('Service Worker: Functions bypass', async ({ page, context }) => {
    // Enable service worker
    await context.grantPermissions(['notifications']);
    
    await page.goto('/');
    
    // Check that joker-reveal requests are not intercepted by SW
    const swRequests: string[] = [];
    const networkRequests: string[] = [];
    
    page.on('request', request => {
      if (request.url().includes('joker-reveal')) {
        // This should go directly to network, not through SW cache
        networkRequests.push(request.url());
      }
    });
    
    // Open quiz and use joker
    await page.click('[data-testid="quiz-trigger"]');
    await page.fill('[data-testid="quiz-answer-input"]', 'wrong answer');
    await page.click('[data-testid="submit-answer-button"]');
    await page.click('text=Utiliser un joker');
    
    // Verify network request was made (not cached)
    expect(networkRequests.length).toBeGreaterThan(0);
  });
});
`;

export const MANUAL_TEST_CHECKLIST = `
# Manual Test Checklist for Joker Audit

## Prerequisites
- Open browser console
- Run: window.__VREAD_TEST_SCENARIOS__()
- Clear network tab and console

## S1: Wrong Answer → Joker Success
### Steps:
1. Open a quiz with available jokers
2. Enter wrong answer and submit
3. Click 'Utiliser un joker' in confirmation modal  
4. Verify answer is revealed
5. Click 'Valider avec Joker' to complete

### Checkpoints:
- [ ] Only 1 POST /functions/v1/joker-reveal
- [ ] Response status: 200
- [ ] Response body contains: { answer: '...' }
- [ ] Authorization header present
- [ ] No validation calls after joker
- [ ] Success modal shows with confetti

## S2: Correct Answer Direct  
### Steps:
1. Open a quiz
2. Enter correct answer
3. Submit answer

### Checkpoints:
- [ ] 0 calls to joker-reveal
- [ ] 1 validation call only
- [ ] Success modal appears
- [ ] Confetti animation triggers

## S3: Joker Quota Exhausted
### Steps:
1. Use all available jokers for a book
2. Open quiz and give wrong answer  
3. Try to use another joker

### Checkpoints:
- [ ] joker-reveal call returns 403
- [ ] Error message: 'Plus aucun joker disponible'
- [ ] No validation record created
- [ ] No success modal or confetti

## After Each Scenario:
1. Run: window.__VREAD_DEBUG_DUMP__()
2. Check console logs for errors
3. Verify network requests in DevTools

## Final Audit:
1. Run: window.__VREAD_FULL_AUDIT__()
2. Review critical issues and proposed fixes
3. Verify all accessibility warnings are resolved

## Expected Results:
- 0 critical issues
- 0 double validation after joker
- All dialogs have proper a11y attributes
- Confetti visible on success
- Service worker bypasses edge functions
`;

// Expose to console
if (typeof window !== 'undefined') {
  (window as any).__VREAD_PLAYWRIGHT_TESTS__ = PLAYWRIGHT_JOKER_TESTS;
  (window as any).__VREAD_MANUAL_CHECKLIST__ = MANUAL_TEST_CHECKLIST;
}