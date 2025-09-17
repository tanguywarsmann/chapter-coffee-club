import { test, expect } from '@playwright/test';

test.describe('P0.4 - Explicit Cooldown with Countdown', () => {
  test('Cooldown timer is visible when locked', async ({ page }) => {
    // Mock lock state in API response
    await page.route('**/api/**', async (route) => {
      const url = route.request().url();
      
      if (url.includes('lock') || url.includes('validation')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ 
            locked: true, 
            remainingTime: 300, // 5 minutes
            message: 'Cooldown active'
          })
        });
      } else {
        route.continue();
      }
    });

    await page.goto('/');
    await page.waitForTimeout(2000);
    
    const bookLinks = page.locator('a[href*="/book/"]');
    if (await bookLinks.count() > 0) {
      await bookLinks.first().click();
      await page.waitForTimeout(2000);
      
      // Look for cooldown indicators
      const cooldownSelectors = [
        'text*=":"', // Time format like 05:00
        'text*="min"',
        'text*="sec"',
        '[data-testid*="timer"]',
        '[data-testid*="cooldown"]',
        '[data-testid*="lock"]',
        'text*="Verrouillé"',
        'text*="Locked"',
        'text*="Attendre"',
        'text*="Wait"'
      ];

      let foundCooldown = false;
      for (const selector of cooldownSelectors) {
        const cooldown = page.locator(selector);
        if (await cooldown.count() > 0) {
          foundCooldown = true;
          break;
        }
      }

      expect(foundCooldown, 'Should show cooldown timer when locked').toBe(true);
    }
  });

  test('Countdown decreases over time', async ({ page }) => {
    // Mock decreasing remaining time
    let remainingTime = 300; // Start with 5 minutes

    await page.route('**/api/**', async (route) => {
      const url = route.request().url();
      
      if (url.includes('lock') || url.includes('validation')) {
        remainingTime = Math.max(0, remainingTime - 5); // Decrease by 5 seconds each call
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ 
            locked: remainingTime > 0, 
            remainingTime,
            message: remainingTime > 0 ? 'Cooldown active' : 'Ready'
          })
        });
      } else {
        route.continue();
      }
    });

    await page.goto('/');
    await page.waitForTimeout(2000);
    
    const bookLinks = page.locator('a[href*="/book/"]');
    if (await bookLinks.count() > 0) {
      await bookLinks.first().click();
      await page.waitForTimeout(2000);
      
      // Check for timer format (mm:ss)
      const timerRegex = /\d{1,2}:\d{2}/;
      
      let foundTimer = false;
      const timerSelectors = [
        '[data-testid*="timer"]',
        '[data-testid*="cooldown"]',
        'text*=":"'
      ];

      for (const selector of timerSelectors) {
        const timer = page.locator(selector);
        const timerText = await timer.textContent();
        if (timerText && timerRegex.test(timerText)) {
          foundTimer = true;
          
          // Wait and check if it decreases (if we can find the same element again)
          await page.waitForTimeout(1000);
          const newTimerText = await timer.textContent();
          
          // The time should have changed (decreased)
          expect(newTimerText).not.toBe(timerText);
          break;
        }
      }

      if (!foundTimer) {
        // Check if any text contains time format
        const pageText = await page.textContent('body');
        foundTimer = pageText ? timerRegex.test(pageText) : false;
      }

      expect(foundTimer, 'Should show countdown timer with mm:ss format').toBe(true);
    }
  });

  test('UI is disabled during cooldown', async ({ page }) => {
    await page.route('**/api/**', async (route) => {
      const url = route.request().url();
      
      if (url.includes('lock') || url.includes('validation')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ 
            locked: true, 
            remainingTime: 180,
            message: 'Please wait'
          })
        });
      } else {
        route.continue();
      }
    });

    await page.goto('/');
    await page.waitForTimeout(2000);
    
    const bookLinks = page.locator('a[href*="/book/"]');
    if (await bookLinks.count() > 0) {
      await bookLinks.first().click();
      await page.waitForTimeout(2000);
      
      // Look for disabled buttons or UI elements
      const disabledSelectors = [
        'button:disabled',
        '[disabled]',
        '[aria-disabled="true"]',
        '.disabled',
        '[class*="disabled"]'
      ];

      let foundDisabled = false;
      for (const selector of disabledSelectors) {
        const disabled = page.locator(selector);
        if (await disabled.count() > 0) {
          foundDisabled = true;
          break;
        }
      }

      expect(foundDisabled, 'Should have disabled UI elements during cooldown').toBe(true);
    }
  });
});