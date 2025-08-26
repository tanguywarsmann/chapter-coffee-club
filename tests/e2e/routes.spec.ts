import { test, expect } from '@playwright/test';

test.describe('Pages publiques VREAD', () => {
  test('À propos rend 200 et un h1', async ({ page }) => {
    await page.goto('/a-propos');
    
    // Vérifier le status 200 (pas d'erreur de navigation)
    expect(page.url()).toContain('/a-propos');
    
    // Vérifier la présence d'un H1 contenant "propos"
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    await expect(h1).toContainText(/propos/i);
    
    // Vérifier SEO - canonical
    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveAttribute('href', 'https://www.vread.fr/a-propos');
    
    // Vérifier SEO - OG
    const ogTitle = page.locator('meta[property="og:title"]');
    await expect(ogTitle).toHaveAttribute('content', /À propos.*VREAD/);
    
    const ogUrl = page.locator('meta[property="og:url"]');
    await expect(ogUrl).toHaveAttribute('content', 'https://www.vread.fr/a-propos');
    
    const ogType = page.locator('meta[property="og:type"]');
    await expect(ogType).toHaveAttribute('content', 'website');
    
    // Vérifier JSON-LD
const jsonLd = page.locator('script[type="application/ld+json"][data-rh="true"]').first();
    await expect(jsonLd).toBeVisible();
    const jsonContent = await jsonLd.textContent();
    expect(jsonContent).toContain('"@type":"Organization"');
    expect(jsonContent).toContain('https://www.vread.fr');
  });

  test('Presse rend 200 et un h1', async ({ page }) => {
    await page.goto('/presse');
    
    // Vérifier le status 200 (pas d'erreur de navigation)
    expect(page.url()).toContain('/presse');
    
    // Vérifier la présence d'un H1 contenant "presse"
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    await expect(h1).toContainText(/presse/i);
    
    // Vérifier SEO - canonical
    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveAttribute('href', 'https://www.vread.fr/presse');
    
    // Vérifier SEO - OG
    const ogTitle = page.locator('meta[property="og:title"]');
    await expect(ogTitle).toHaveAttribute('content', /Presse.*VREAD/);
    
    const ogUrl = page.locator('meta[property="og:url"]');
    await expect(ogUrl).toHaveAttribute('content', 'https://www.vread.fr/presse');
    
    const ogType = page.locator('meta[property="og:type"]');
    await expect(ogType).toHaveAttribute('content', 'website');
    
    // Vérifier JSON-LD
    const jsonLd = page.locator('script[type="application/ld+json"]');
    await expect(jsonLd).toBeVisible();
    const jsonContent = await jsonLd.textContent();
    expect(jsonContent).toContain('"@type":"Organization"');
    expect(jsonContent).toContain('https://www.vread.fr');
  });

  test('Redirections d\'alias fonctionnent', async ({ page }) => {
    // Test /apropos -> /a-propos
    await page.goto('/apropos');
    await page.waitForURL('/a-propos');
    expect(page.url()).toContain('/a-propos');
    
    // Test /about -> /a-propos
    await page.goto('/about');
    await page.waitForURL('/a-propos');
    expect(page.url()).toContain('/a-propos');
    
    // Test /press -> /presse
    await page.goto('/press');
    await page.waitForURL('/presse');
    expect(page.url()).toContain('/presse');
    
    // Test /a-propos/index.html -> /a-propos
    await page.goto('/a-propos/index.html');
    await page.waitForURL('/a-propos');
    expect(page.url()).toContain('/a-propos');
    
    // Test /presse/index.html -> /presse
    await page.goto('/presse/index.html');
    await page.waitForURL('/presse');
    expect(page.url()).toContain('/presse');
  });

  test('404 affiche l\'UI correcte', async ({ page }) => {
    await page.goto('/pressee'); // URL inexistante
    
    // Vérifier data-testid
    const notFoundElement = page.locator('[data-testid="not-found"]');
    await expect(notFoundElement).toBeVisible();
    
    // Vérifier texte "404"
    await expect(page.locator('text=404')).toBeVisible();
  });

  test('Footer contient liens vers pages publiques', async ({ page }) => {
    await page.goto('/');
    
    // Vérifier liens footer
    const aproposLink = page.locator('footer a[href="/a-propos"]');
    await expect(aproposLink).toBeVisible();
    await expect(aproposLink).toContainText(/à propos/i);
    
    const presseLink = page.locator('footer a[href="/presse"]');
    await expect(presseLink).toBeVisible();
    await expect(presseLink).toContainText(/presse/i);
  });
});
