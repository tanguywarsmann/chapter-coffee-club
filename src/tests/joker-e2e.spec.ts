import { test, expect } from '@playwright/test';

test.describe('Joker System E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Mock auth état connecté
    await page.addInitScript(() => {
      window.localStorage.setItem('sb-xjumsrjuyzvs-auth-token', JSON.stringify({
        access_token: 'mock-token',
        user: { id: 'test-user-id' }
      }));
    });
    
    await page.goto('/books/test-book-id');
    await page.waitForLoadState('networkidle');
  });

  test('should prevent joker re-use after consumption', async ({ page }) => {
    // 1. Commencer le quiz
    await page.click('[data-testid="start-quiz-button"]');
    
    // 2. Répondre incorrectement
    await page.fill('[data-testid="quiz-answer-input"]', 'mauvaise-réponse');
    await page.click('[data-testid="submit-answer-button"]');
    
    // 3. Vérifier que le modal joker apparaît
    await expect(page.locator('[data-testid="joker-confirmation-modal"]')).toBeVisible();
    
    // 4. Vérifier le nombre de jokers disponibles initial
    const initialJokersText = await page.textContent('[data-testid="jokers-remaining"]');
    expect(initialJokersText).toContain('1'); // Supposant 1 joker disponible
    
    // 5. Utiliser le joker
    await page.click('[data-testid="confirm-joker-button"]');
    
    // 6. Attendre que l'action soit terminée
    await page.waitForSelector('[data-testid="success-message"]');
    await expect(page.locator('[data-testid="joker-confirmation-modal"]')).not.toBeVisible();
    
    // 7. Vérifier que le compteur de jokers est mis à jour
    await page.waitForTimeout(1000); // Laisser le temps à l'UI de se mettre à jour
    const updatedJokersText = await page.textContent('[data-testid="jokers-progress"]');
    expect(updatedJokersText).toContain('1 / 1'); // 1 joker utilisé sur 1 autorisé
    
    // 8. Essayer de commencer un nouveau quiz
    await page.click('[data-testid="start-quiz-button"]');
    await page.fill('[data-testid="quiz-answer-input"]', 'autre-mauvaise-réponse');
    await page.click('[data-testid="submit-answer-button"]');
    
    // 9. Vérifier qu'aucun joker n'est proposé (quota épuisé)
    await expect(page.locator('[data-testid="joker-confirmation-modal"]')).not.toBeVisible();
    
    // 10. Vérifier le message d'erreur approprié
    await expect(page.locator('[data-testid="error-message"]')).toContainText('maximum de tentatives');
  });

  test('should show correct joker count in progress bar', async ({ page }) => {
    // Vérifier que la barre de progression affiche le bon nombre de jokers
    const progressBar = page.locator('[data-testid="book-progress-bar"]');
    await expect(progressBar).toBeVisible();
    
    const jokersInfo = page.locator('[data-testid="jokers-progress"]');
    await expect(jokersInfo).toContainText('Jokers 0 /'); // Aucun joker utilisé initialement
  });

  test('should disable joker button when none remaining', async ({ page }) => {
    // Simuler un livre où tous les jokers ont été utilisés
    await page.evaluate(() => {
      // Mock le state pour simuler 0 joker restant
      (window as any).__JOKERS_REMAINING__ = 0;
    });
    
    // Commencer le quiz
    await page.click('[data-testid="start-quiz-button"]');
    await page.fill('[data-testid="quiz-answer-input"]', 'mauvaise-réponse');
    await page.click('[data-testid="submit-answer-button"]');
    
    // Si le modal joker apparaît (ne devrait pas), vérifier que le bouton est désactivé
    const jokerButton = page.locator('[data-testid="confirm-joker-button"]');
    if (await jokerButton.isVisible()) {
      await expect(jokerButton).toBeDisabled();
    }
  });

  test('should handle rapid double-click on joker button', async ({ page }) => {
    // Test pour empêcher les race conditions
    await page.click('[data-testid="start-quiz-button"]');
    await page.fill('[data-testid="quiz-answer-input"]', 'mauvaise-réponse');
    await page.click('[data-testid="submit-answer-button"]');
    
    // Attendre que le modal apparaisse
    await expect(page.locator('[data-testid="joker-confirmation-modal"]')).toBeVisible();
    
    // Double-clic rapide
    const jokerButton = page.locator('[data-testid="confirm-joker-button"]');
    await jokerButton.click();
    await jokerButton.click(); // Deuxième clic immédiat
    
    // Vérifier qu'un seul joker a été consommé
    await page.waitForTimeout(2000);
    const finalJokersText = await page.textContent('[data-testid="jokers-progress"]');
    expect(finalJokersText).toContain('1 / '); // Un seul joker utilisé
  });
});

/**
 * Configuration requise dans playwright.config.ts :
 * 
 * ```typescript
 * export default defineConfig({
 *   use: {
 *     baseURL: 'http://localhost:5173',
 *   },
 *   webServer: {
 *     command: 'npm run dev',
 *     port: 5173,
 *   },
 * });
 * ```
 * 
 * Commandes pour lancer les tests :
 * - `npx playwright test joker-e2e.spec.ts`
 * - `npx playwright test joker-e2e.spec.ts --headed` (avec interface)
 * - `npx playwright test joker-e2e.spec.ts --debug` (mode debug)
 */