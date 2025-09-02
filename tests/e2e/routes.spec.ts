import { test, expect } from '@playwright/test';

test.describe('Pages publiques VREAD', () => {
  test('À propos rend 200 et un h1', async ({ page }) => {
    await page.goto('/a-propos', { waitUntil: 'domcontentloaded' });

    // Statut OK (pas d'erreur de navigation)
    expect(page.url()).toContain('/a-propos');

    // H1 : accepte "à propos" ou "vread"
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    const h1Text = (await h1.innerText()).toLowerCase();
    expect(h1Text).toMatch(/(propos|vread)/);

    // Canonical
    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveAttribute('href', /https:\/\/www\.vread\.fr\/a-propos\/?$/);

    // Open Graph
    const ogTitle = page.locator('meta[property="og:title"]');
    const ogContent = await ogTitle.getAttribute('content');
    expect(ogContent).toBeTruthy();
    expect(ogContent!).toMatch(/vread/i);
    expect(ogContent!).toMatch(/propos/i);

    const ogUrl = page.locator('meta[property="og:url"]');
    await expect(ogUrl).toHaveAttribute('content', /https:\/\/www\.vread\.fr\/a-propos\/?$/);

    const ogType = page.locator('meta[property="og:type"]');
    await expect(ogType).toHaveAttribute('content', 'website');
  });

  test('Presse rend 200 et un h1', async ({ page }) => {
    await page.goto('/presse', { waitUntil: 'domcontentloaded' });

    // Statut OK
    expect(page.url()).toContain('/presse');

    // H1 : doit contenir "presse"
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    await expect(h1).toContainText(/presse/i);

    // Canonical
    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveAttribute('href', /https:\/\/www\.vread\.fr\/presse\/?$/);

    // Open Graph
    const ogTitle = page.locator('meta[property="og:title"]');
    const ogContent = await ogTitle.getAttribute('content');
    expect(ogContent).toBeTruthy();
    expect(ogContent!).toMatch(/vread/i);
    expect(ogContent!).toMatch(/presse/i);

    const ogUrl = page.locator('meta[property="og:url"]');
    await expect(ogUrl).toHaveAttribute('content', /https:\/\/www\.vread\.fr\/presse\/?$/);

    const ogType = page.locator('meta[property="og:type"]');
    await expect(ogType).toHaveAttribute('content', 'website');
  });

  test("Redirections d'alias fonctionnent", async ({ page }) => {
    // /apropos -> /a-propos
    await page.goto('/apropos');
    await page.waitForURL(/\/a-propos\/?$/);
    expect(page.url()).toMatch(/\/a-propos\/?$/);

    // /about -> /a-propos
    await page.goto('/about');
    await page.waitForURL(/\/a-propos\/?$/);
    expect(page.url()).toMatch(/\/a-propos\/?$/);

    // /press -> /presse
    await page.goto('/press');
    await page.waitForURL(/\/presse\/?$/);
    expect(page.url()).toMatch(/\/presse\/?$/);

    // /a-propos/index.html -> /a-propos
    await page.goto('/a-propos/index.html');
    await page.waitForURL(/\/a-propos\/?$/);
    expect(page.url()).toMatch(/\/a-propos\/?$/);

    // /presse/index.html -> /presse
    await page.goto('/presse/index.html');
    await page.waitForURL(/\/presse\/?$/);
    expect(page.url()).toMatch(/\/presse\/?$/);
  });

  test("404 affiche l'UI correcte", async ({ page }) => {
    await page.goto('/pressee'); // URL inexistante

    const notFoundElement = page.locator('[data-testid="not-found"]');
    await expect(notFoundElement).toBeVisible();

    await expect(page.locator('text=404')).toBeVisible();
  });

  test('Footer contient liens vers pages publiques', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const aproposLink = page.locator('footer a[href="/a-propos"]');
    await expect(aproposLink).toBeVisible();
    await expect(aproposLink).toContainText(/à propos/i);

    const presseLink = page.locator('footer a[href="/presse"]');
    await expect(presseLink).toBeVisible();
    await expect(presseLink).toContainText(/presse/i);
  });
});
