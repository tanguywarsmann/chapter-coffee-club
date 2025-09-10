import { test, expect } from '@playwright/test';

test.describe('P0.3 - Clear Progression & Next Action CTA', () => {
  test('Book page shows clear next action', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to load and find a book
    await page.waitForTimeout(2000);
    
    const bookLinks = page.locator('a[href*="/book/"]');
    if (await bookLinks.count() > 0) {
      await bookLinks.first().click();
      
      // Wait for book page to load
      await page.waitForTimeout(2000);
      
      // Look for next action CTAs
      const ctaSelectors = [
        'button:has-text("Suivant")',
        'button:has-text("Continuer")',
        'button:has-text("Next")',
        'button:has-text("Segment suivant")',
        '[data-testid*="next"]',
        '[data-testid*="continue"]',
        'text*="Prochaine action"',
        'text*="À faire maintenant"'
      ];

      let foundCTA = false;
      for (const selector of ctaSelectors) {
        const cta = page.locator(selector);
        if (await cta.count() > 0) {
          foundCTA = true;
          break;
        }
      }

      expect(foundCTA, 'Book page should show clear next action CTA').toBe(true);
    }
  });

  test('Progress indicators are visible', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);
    
    const bookLinks = page.locator('a[href*="/book/"]');
    if (await bookLinks.count() > 0) {
      await bookLinks.first().click();
      await page.waitForTimeout(2000);
      
      // Look for progress indicators
      const progressSelectors = [
        '[role="progressbar"]',
        '.progress',
        '[data-testid*="progress"]',
        'text*="%"',
        'text*="/"', // Like "5/10"
        '[class*="progress"]'
      ];

      let foundProgress = false;
      for (const selector of progressSelectors) {
        const progress = page.locator(selector);
        if (await progress.count() > 0) {
          foundProgress = true;
          break;
        }
      }

      expect(foundProgress, 'Should show progress indicators').toBe(true);
    }
  });

  test('Current segment or chapter is clearly indicated', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);
    
    const bookLinks = page.locator('a[href*="/book/"]');
    if (await bookLinks.count() > 0) {
      await bookLinks.first().click();
      await page.waitForTimeout(2000);
      
      // Look for current position indicators
      const positionSelectors = [
        'text*="Segment"',
        'text*="Chapitre"',
        'text*="Chapter"',
        'text*="Actuel"',
        'text*="Current"',
        '[data-testid*="current"]',
        '[class*="current"]'
      ];

      let foundPosition = false;
      for (const selector of positionSelectors) {
        const position = page.locator(selector);
        if (await position.count() > 0) {
          foundPosition = true;
          break;
        }
      }

      expect(foundPosition, 'Should clearly indicate current position').toBe(true);
    }
  });
});