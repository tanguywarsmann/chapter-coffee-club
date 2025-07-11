import { test, expect } from '@playwright/test';

test.describe('Validation multi-segments', () => {
  test.beforeEach(async ({ page }) => {
    // Configuration initiale - aller sur la page d'un livre
    await page.goto('/books/8dac5387-e878-4c2e-bd97-b9fbe201db01');
    
    // Attendre que la page soit chargée
    await page.waitForLoadState('networkidle');
    
    // S'assurer qu'on est connecté (simuler une connexion si nécessaire)
    const loginButton = page.locator('[data-testid="login-button"]');
    if (await loginButton.isVisible()) {
      // Si pas connecté, simuler une connexion
      await page.evaluate(() => {
        localStorage.setItem('test-user', JSON.stringify({ id: 'test-user-id' }));
      });
      await page.reload();
    }
  });

  test('should allow validation of multiple segments without isValidating blocking', async ({ page }) => {
    // Validate first segment
    await page.getByTestId('main-validate-button').click();
    await page.getByTestId('validation-confirm-button').click();
    
    // Answer quiz correctly
    await page.getByTestId('quiz-answer-button').click();
    await page.getByTestId('quiz-submit-button').click();
    
    // Wait for success message and close it
    await expect(page.getByTestId('success-message')).toBeVisible();
    await page.getByTestId('success-close-button').click();
    
    // Wait for isValidating to become false (check console logs)
    await page.waitForFunction(() => {
      return window.console.info.toString().includes('[isValidating] false');
    }, { timeout: 2000 });
    
    // Validate second segment - button should be active (not blocked by isValidating)
    await page.getByTestId('main-validate-button').click();
    
    // Critical test: validation button should be enabled for second segment
    await expect(page.getByTestId('validation-confirm-button')).toBeEnabled();
    
    // Complete second validation without blocking
    await page.getByTestId('validation-confirm-button').click();
    await page.getByTestId('quiz-answer-button').click();
    await page.getByTestId('quiz-submit-button').click();
    
    // Should successfully see second success message
    await expect(page.getByTestId('success-message')).toBeVisible();
  });

  test('doit gérer les erreurs sans bloquer isSubmitting', async ({ page }) => {
    // Simuler une erreur réseau
    await page.route('**/reading_validations', (route) => {
      route.abort('failed');
    });

    const validateButton = page.locator('[data-testid="validate-button"]').first();
    await expect(validateButton).toBeVisible();
    await validateButton.click();

    const confirmButton = page.locator('[data-testid="validation-confirm-button"]');
    await expect(confirmButton).toBeVisible();
    await confirmButton.click();

    // Simuler une réponse correcte qui va échouer côté réseau
    const answerInput = page.locator('[data-testid="quiz-answer-input"]');
    await expect(answerInput).toBeVisible();
    await answerInput.fill('oui');

    const submitQuizButton = page.locator('[data-testid="quiz-submit-button"]');
    await expect(submitQuizButton).toBeEnabled();
    await submitQuizButton.click();

    // Attendre le message d'erreur
    await expect(page.locator('text=Erreur lors de la validation')).toBeVisible();

    // Réessayer après l'erreur - le bouton doit être de nouveau actif
    await page.unroute('**/reading_validations');
    
    await validateButton.click();
    await confirmButton.click();
    
    // Le bouton de soumission doit être actif (pas bloqué par isSubmitting)
    await expect(submitQuizButton).toBeEnabled();
  });

  test('doit réinitialiser l\'état lors du changement de segment', async ({ page }) => {
    // Ouvrir la modale de validation
    const validateButton = page.locator('[data-testid="validate-button"]').first();
    await validateButton.click();

    // Fermer la modale sans valider
    const cancelButton = page.locator('[data-testid="validation-cancel-button"]');
    await cancelButton.click();

    // Rouvrir la modale - elle doit être dans un état propre
    await validateButton.click();
    
    const confirmButton = page.locator('[data-testid="validation-confirm-button"]');
    await expect(confirmButton).toBeEnabled();
    
    // Vérifier qu'il n'y a pas d'indicateur de chargement résiduel
    await expect(page.locator('[data-testid="validation-loading"]')).not.toBeVisible();
  });
});