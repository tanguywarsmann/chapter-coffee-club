import { test, expect } from '@playwright/test';

const PAGES = ['/', '/explore', '/auth'];

for (const path of PAGES) {
  test(`200 + <h1> sur ${path}`, async ({ page, request }) => {
    const res = await request.get(path);
    expect(res.status()).toBe(200);
    await page.goto(path);
    await expect(page.locator('h1')).toBeVisible();
  });
}

test('canonique présente sur la home', async ({ page }) => {
  await page.goto('/');
  const canonical = page.locator('link[rel="canonical"]');
  await expect(canonical).toBeVisible();
});