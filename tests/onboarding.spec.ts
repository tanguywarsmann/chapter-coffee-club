import { test, expect } from '@playwright/test';

test('Welcome ne s\'affiche qu\'une fois et jamais après', async ({ page }) => {
  // No flag: doit s'afficher
  await page.context().clearCookies();
  await page.addInitScript(() => localStorage.clear());
  await page.goto('/');

  // Attendre le modal
  await expect(page.getByRole('dialog', { name: /Bienvenue sur VREAD/i })).toBeVisible();

  // Fermer
  await page.getByRole('button', { name: /Commencer|Plus tard/i }).first().click();
  await expect(page.getByRole('dialog')).toBeHidden();

  // Naviguer
  await page.goto('/explore');
  await expect(page.getByRole('dialog')).toHaveCount(0);

  // Recharger même session
  await page.reload();
  await expect(page.getByRole('dialog')).toHaveCount(0);

  // Nouvelle page Home
  await page.goto('/');
  await expect(page.getByRole('dialog')).toHaveCount(0);
});