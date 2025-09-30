import { test, expect } from "@playwright/test";

test("Barre de recherche visible et fonctionnelle sur mobile", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/explore?cat=litterature");
  const input = page.getByPlaceholder("Titre ou auteur…");
  await expect(input).toBeVisible();

  await input.fill("Zola");
  await page.getByRole("button", { name: "Rechercher" }).click();
  await expect(page).toHaveURL(/q=Zola/);
});