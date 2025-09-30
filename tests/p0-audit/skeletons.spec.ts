import { test, expect } from '@playwright/test';

test.describe('P0.1 - Skeletons & Empty States', () => {
  test('Home page shows skeleton while loading', async ({ page }) => {
    // Intercept API calls and delay them
    await page.route('**/api/**', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      route.continue();
    });

    await page.goto('/');

    // Look for skeleton indicators
    const skeletonSelectors = [
      '[data-testid*="skeleton"]',
      '.animate-pulse',
      '[class*="skeleton"]',
      '[class*="loading"]',
      '.shimmer'
    ];

    let foundSkeleton = false;
    for (const selector of skeletonSelectors) {
      const skeleton = page.locator(selector);
      if (await skeleton.count() > 0) {
        foundSkeleton = true;
        break;
      }
    }

    expect(foundSkeleton, 'Home page should show skeleton/loading state').toBe(true);
  });

  test('Book page shows skeleton while loading', async ({ page }) => {
    await page.route('**/api/**', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      route.continue();
    });

    // Navigate to a book page (assuming there's at least one book)
    await page.goto('/');
    await page.waitForTimeout(3000); // Let home load
    
    const bookLinks = page.locator('a[href*="/book/"]');
    if (await bookLinks.count() > 0) {
      await bookLinks.first().click();
      
      const skeletonSelectors = [
        '[data-testid*="skeleton"]',
        '.animate-pulse',
        '[class*="skeleton"]',
        '[class*="loading"]'
      ];

      let foundSkeleton = false;
      for (const selector of skeletonSelectors) {
        const skeleton = page.locator(selector);
        if (await skeleton.count() > 0) {
          foundSkeleton = true;
          break;
        }
      }

      expect(foundSkeleton, 'Book page should show skeleton/loading state').toBe(true);
    }
  });

  test('Empty states are properly displayed', async ({ page }) => {
    // Mock empty API responses
    await page.route('**/api/**', async (route) => {
      const url = route.request().url();
      
      if (url.includes('books') || url.includes('reading')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: [], count: 0 })
        });
      } else {
        route.continue();
      }
    });

    await page.goto('/reading-list');
    
    // Look for empty state indicators
    const emptyStateSelectors = [
      '[data-testid*="empty"]',
      'text="Aucun"',
      'text="Vide"',
      'text="No data"',
      '[class*="empty"]'
    ];

    let foundEmptyState = false;
    for (const selector of emptyStateSelectors) {
      const emptyState = page.locator(selector);
      if (await emptyState.count() > 0) {
        foundEmptyState = true;
        break;
      }
    }

    expect(foundEmptyState, 'Should show empty state when no data').toBe(true);
  });
});