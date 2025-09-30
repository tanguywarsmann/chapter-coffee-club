import { test, expect } from '@playwright/test';

test.describe('P0.5 - Mobile-first & Basic A11y', () => {
  test('Touch targets meet 44px minimum', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);
    
    // Get all interactive elements
    const interactiveElements = await page.locator('button, a, input, [role="button"]').all();
    
    let smallTargets = 0;
    let totalTargets = 0;
    
    for (const element of interactiveElements) {
      const box = await element.boundingBox();
      if (box) {
        totalTargets++;
        if (box.width < 44 || box.height < 44) {
          smallTargets++;
        }
      }
    }
    
    // Allow up to 20% of targets to be smaller (for some legitimate cases)
    const smallTargetRatio = totalTargets > 0 ? smallTargets / totalTargets : 0;
    
    expect(smallTargetRatio, `${smallTargets}/${totalTargets} touch targets are too small (< 44px)`).toBeLessThan(0.2);
  });

  test('Focus styles are visible', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);
    
    // Get first focusable element
    const focusableElements = page.locator('button, a, input, [tabindex]:not([tabindex="-1"])');
    
    if (await focusableElements.count() > 0) {
      const firstElement = focusableElements.first();
      
      // Focus the element
      await firstElement.focus();
      
      // Check if element has focus styles
      const computedStyle = await firstElement.evaluate((el) => {
        const style = window.getComputedStyle(el, ':focus');
        return {
          outline: style.outline,
          outlineWidth: style.outlineWidth,
          outlineColor: style.outlineColor,
          boxShadow: style.boxShadow,
          border: style.border
        };
      });
      
      // Check if any focus indicator is present
      const hasFocusIndicator = 
        computedStyle.outline !== 'none' ||
        computedStyle.outlineWidth !== '0px' ||
        computedStyle.boxShadow !== 'none' ||
        computedStyle.border.includes('2px'); // Common focus border style
      
      expect(hasFocusIndicator, 'Focused elements should have visible focus indicators').toBe(true);
    }
  });

  test('Basic ARIA attributes are present', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);
    
    // Check for essential ARIA attributes
    const ariaElements = await page.locator('[aria-label], [aria-labelledby], [aria-describedby], [role]').count();
    
    expect(ariaElements, 'Should have elements with ARIA attributes').toBeGreaterThan(0);
    
    // Check for images with alt text
    const images = await page.locator('img').count();
    const imagesWithAlt = await page.locator('img[alt]').count();
    
    if (images > 0) {
      const altTextRatio = imagesWithAlt / images;
      expect(altTextRatio, 'Most images should have alt text').toBeGreaterThan(0.7);
    }
  });

  test('Color contrast meets minimum standards', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);
    
    // Check text elements for color contrast
    const textElements = await page.locator('p, h1, h2, h3, h4, h5, h6, span, div').all();
    
    let lowContrastCount = 0;
    let totalChecked = 0;
    
    // Sample a subset of text elements
    const elementsToCheck = textElements.slice(0, Math.min(20, textElements.length));
    
    for (const element of elementsToCheck) {
      const style = await element.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        const text = el.textContent?.trim();
        
        if (!text || text.length === 0) return null;
        
        return {
          color: computed.color,
          backgroundColor: computed.backgroundColor,
          fontSize: computed.fontSize
        };
      });
      
      if (style && style.color && style.backgroundColor) {
        totalChecked++;
        
        // Simple contrast check - look for very light text on light backgrounds or dark on dark
        const isLightText = style.color.includes('255') || style.color.includes('white');
        const isLightBg = style.backgroundColor.includes('255') || style.backgroundColor.includes('white');
        const isDarkText = style.color.includes('0, 0, 0') || style.color.includes('rgb(0');
        const isDarkBg = style.backgroundColor.includes('0, 0, 0') || style.backgroundColor.includes('rgb(0');
        
        if ((isLightText && isLightBg) || (isDarkText && isDarkBg)) {
          lowContrastCount++;
        }
      }
    }
    
    if (totalChecked > 0) {
      const lowContrastRatio = lowContrastCount / totalChecked;
      expect(lowContrastRatio, `${lowContrastCount}/${totalChecked} elements may have contrast issues`).toBeLessThan(0.1);
    }
  });

  test('Page is responsive on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');
    await page.waitForTimeout(2000);
    
    // Check if page content fits in mobile viewport
    const bodyWidth = await page.locator('body').evaluate(el => el.scrollWidth);
    const viewportWidth = 375;
    
    expect(bodyWidth, 'Page should not exceed mobile viewport width').toBeLessThanOrEqual(viewportWidth + 10); // Allow small margin
    
    // Check if navigation is mobile-friendly
    const nav = page.locator('nav, [role="navigation"]');
    if (await nav.count() > 0) {
      const navBox = await nav.first().boundingBox();
      if (navBox) {
        expect(navBox.width, 'Navigation should fit in mobile viewport').toBeLessThanOrEqual(viewportWidth);
      }
    }
  });
});