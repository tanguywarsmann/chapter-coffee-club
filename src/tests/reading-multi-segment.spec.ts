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

  test('doit permettre de valider plusieurs segments sans blocage', async ({ page }) => {
    // Étape 1: Valider le premier segment
    const validateButton1 = page.locator('[data-testid="validate-button"]').first();
    await expect(validateButton1).toBeVisible();
    await validateButton1.click();

    // Confirmation de validation
    const confirmButton = page.locator('[data-testid="validation-confirm-button"]');
    await expect(confirmButton).toBeVisible();
    await confirmButton.click();

    // Répondre au quiz du premier segment
    const answerInput = page.locator('[data-testid="quiz-answer-input"]');
    await expect(answerInput).toBeVisible();
    await answerInput.fill('oui');

    const submitQuizButton = page.locator('[data-testid="quiz-submit-button"]');
    await expect(submitQuizButton).toBeEnabled();
    await submitQuizButton.click();

    // Attendre le message de succès
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    
    // Fermer le message de succès
    const closeSuccessButton = page.locator('[data-testid="success-close-button"]');
    await closeSuccessButton.click();

    // Étape 2: Valider le deuxième segment
    // Attendre un peu pour que l'état se stabilise
    await page.waitForTimeout(500);

    const validateButton2 = page.locator('[data-testid="validate-button"]').first();
    await expect(validateButton2).toBeVisible();
    await expect(validateButton2).toBeEnabled({ timeout: 10000 });
    
    await validateButton2.click();

    // Confirmation de validation du deuxième segment
    const confirmButton2 = page.locator('[data-testid="validation-confirm-button"]');
    await expect(confirmButton2).toBeVisible();
    await expect(confirmButton2).toBeEnabled();
    await confirmButton2.click();

    // Répondre au quiz du deuxième segment
    const answerInput2 = page.locator('[data-testid="quiz-answer-input"]');
    await expect(answerInput2).toBeVisible();
    await answerInput2.fill('oui');

    const submitQuizButton2 = page.locator('[data-testid="quiz-submit-button"]');
    await expect(submitQuizButton2).toBeEnabled();
    await submitQuizButton2.click();

    // Vérifier le succès du deuxième segment
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
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