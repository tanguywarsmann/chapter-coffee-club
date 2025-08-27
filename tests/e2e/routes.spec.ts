import { test, expect } from '@playwright/test';

test.describe('Pages publiques VREAD', () => {
  test('À propos rend 200 et un h1', async ({ page }) => {
    await page.goto('/a-propos');
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('h1')).toContainText(/propos/i);
    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveAttribute('href', 'https://www.vread.fr/a-propos');
  });

  test('Redirection /presse/index.html -> /presse', async ({ page }) => {
    await page.goto('/presse/index.html');
    await page.waitForURL('**/presse');
    expect(page.url()).toMatch(/\/presse$/);
  });

  test('404 affiche l’UI correcte', async ({ page }) => {
    await page.goto('/pressee');
    await expect(page.locator('[data-testid="not-found"]')).toBeVisible();
    await expect(page.locator('text=404')).toBeVisible();
  });

  test('Footer contient liens vers pages publiques', async ({ page }) => {
    await page.goto('/');
    const aproposLink = page.locator('footer a[href="/a-propos"]');
    await expect(aproposLink).toBeVisible();
    await expect(aproposLink).toContainText(/à propos/i);

    const presseLink = page.locator('footer a[href="/presse"]');
    await expect(presseLink).toBeVisible();
    await expect(presseLink).toContainText(/presse/i);
  });
});
