import { test, expect } from '@playwright/test';

test.describe('Pages publiques VREAD', () => {
  test('À propos rend 200 et un h1', async ({ page }) => {
    const res = await page.goto('/a-propos', { waitUntil: 'domcontentloaded' });
    expect(res?.ok()).toBeTruthy();
    await expect(page.locator('h1')).toHaveText(/propos/i);
  });

  test('Presse rend 200 et un h1', async ({ page }) => {
    const res = await page.goto('/presse', { waitUntil: 'domcontentloaded' });
    expect(res?.ok()).toBeTruthy();
    await expect(page.locator('h1')).toHaveText(/presse|médias/i);
  });

  test('JSON-LD présent sur À propos', async ({ page }) => {
    await page.goto('/a-propos');
    const ld = page.locator('script[type="application/ld+json"]');
    await expect(ld).toHaveCount(1);
    const json = await ld.first().evaluate(el => el.textContent || '');
    const data = JSON.parse(json);
    expect(data['@type']).toBe('Organization');
    expect(data.url).toContain('https://www.vread.fr/');
  });

  const redirects = [
    ['/apropos', '/a-propos'],
    ['/about', '/a-propos'],
    ['/press', '/presse'],
    ['/a-propos/index.html', '/a-propos'],
    ['/presse/index.html', '/presse'],
  ];

  for (const [src, dest] of redirects) {
    test(`Redirect ${src} -> ${dest}`, async ({ page, context, baseURL }) => {
      const req = await context.request.get(`${baseURL}${src}`, { maxRedirects: 0 });
      expect([301, 308]).toContain(req.status());
      expect(req.headers()['location']).toBe(dest);
    });
  }

  test('NotFound UI sur route inconnue', async ({ page }) => {
    await page.goto('/pressee', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('[data-testid="not-found"], h1, main'))
      .toContainText(/404|introuvable|not found/i);
  });

  test('Canonique et OG sur À propos', async ({ page }) => {
    await page.goto('/a-propos');
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    expect(canonical).toBeTruthy();
    expect(canonical).toContain('/a-propos');
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
    expect((ogTitle || '').toLowerCase()).toContain('propos');
  });

  test('Footer utilise Link pour la nav interne', async ({ page }) => {
    await page.goto('/');
    const links = page.locator('footer a[href="/a-propos"], footer a[href="/presse"]');
    await expect(links).toHaveCount(2);
  });
});