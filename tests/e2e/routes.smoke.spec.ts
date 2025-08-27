// tests/e2e/routes.smoke.spec.ts
import { test, expect } from '@playwright/test';

const PAGES = ['/', '/explore', '/auth'];

for (const path of PAGES) {
  test(`200 + titre non vide sur ${path}`, async ({ page, request }) => {
    const res = await request.get(path);
    expect(res.status(), `${path} should return 200`).toBe(200);

    const nav = await page.goto(path, { waitUntil: 'networkidle' });
    expect(nav?.ok(), `${path} page.goto ok`).toBeTruthy();

    // Tolérant: un <title> non vide suffit à prouver que la page s’est rendue
    await expect(page).toHaveTitle(/\S+/);

    // Si un heading de niveau 1 existe, on vérifie qu’il est visible, sinon on n’échoue pas
    const heading = page.locator('h1, [role="heading"][aria-level="1"], [data-testid="page-title"]');
    if (await heading.count()) {
      await expect(heading.first()).toBeVisible();
    }
  });
}

test('balise canonique présente et absolue sur la home', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const canonical = page.locator('link[rel="canonical"]');
  // On vérifie l’attribut, pas la visibilité (les balises <head> ne sont jamais "visibles")
  await expect(canonical).toHaveAttribute('href', /https:\/\/(www\.)?vread\.fr\/?$/);
});
