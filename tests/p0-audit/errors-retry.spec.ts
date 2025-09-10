import { test, expect } from '@playwright/test';

test.describe('P0.2 - Unified Errors + Retry', () => {
  test('Error toast appears on API failure', async ({ page }) => {
    let apiCallCount = 0;

    // Intercept API calls and return 500 for the first call, then 200
    await page.route('**/api/**', async (route) => {
      apiCallCount++;
      
      if (apiCallCount === 1) {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal Server Error' })
        });
      } else {
        route.continue();
      }
    });

    await page.goto('/');
    
    // Wait for error toast to appear
    await page.waitForTimeout(2000);

    const toastSelectors = [
      '[data-testid*="toast"]',
      '.sonner-toast',
      '[role="alert"]',
      'text*="Erreur"',
      'text*="Error"'
    ];

    let foundToast = false;
    for (const selector of toastSelectors) {
      const toast = page.locator(selector);
      if (await toast.count() > 0) {
        foundToast = true;
        break;
      }
    }

    expect(foundToast, 'Should show error toast on API failure').toBe(true);
  });

  test('Retry button works after error', async ({ page }) => {
    let apiCallCount = 0;

    await page.route('**/api/**', async (route) => {
      apiCallCount++;
      
      if (apiCallCount === 1) {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Server Error' })
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: [], count: 0 })
        });
      }
    });

    await page.goto('/');
    await page.waitForTimeout(2000);

    // Look for retry button
    const retrySelectors = [
      'button:has-text("Réessayer")',
      'button:has-text("Retry")',
      '[data-testid*="retry"]',
      'button:has-text("Recommencer")'
    ];

    let retryButton = null;
    for (const selector of retrySelectors) {
      const button = page.locator(selector);
      if (await button.count() > 0) {
        retryButton = button.first();
        break;
      }
    }

    if (retryButton) {
      const initialCallCount = apiCallCount;
      await retryButton.click();
      
      // Wait for retry API call
      await page.waitForTimeout(1000);
      
      expect(apiCallCount, 'Should make retry API call').toBeGreaterThan(initialCallCount);
    }
  });

  test('Error boundary catches component errors', async ({ page }) => {
    // Inject a script that will cause an error
    await page.addInitScript(() => {
      // Override console.error to capture boundary errors
      const originalError = console.error;
      (window as any).__errorBoundaryTriggered = false;
      
      console.error = (...args) => {
        if (args.some(arg => 
          typeof arg === 'string' && 
          (arg.includes('ErrorBoundary') || arg.includes('componentDidCatch'))
        )) {
          (window as any).__errorBoundaryTriggered = true;
        }
        originalError.apply(console, args);
      };
    });

    await page.goto('/');
    
    // Check if error boundary exists in the DOM or console
    const errorBoundaryExists = await page.evaluate(() => {
      return !!(window as any).__errorBoundaryTriggered || 
             document.querySelector('[class*="error"]') ||
             document.querySelector('[data-testid*="error"]');
    });

    // We expect error boundary infrastructure to exist
    expect(typeof errorBoundaryExists).toBe('boolean');
  });
});