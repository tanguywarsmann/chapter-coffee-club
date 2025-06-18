
import { test, expect } from '@playwright/test';

test.describe('Reading List - Ajout de livres', () => {
  test.beforeEach(async ({ page }) => {
    // Navigation vers la page d'accueil
    await page.goto('/');
  });

  test('un utilisateur non connecté ne peut pas ajouter un livre', async ({ page }) => {
    // Aller à la page d'exploration
    await page.goto('/explore');
    
    // Attendre qu'un livre soit visible
    await page.waitForSelector('[data-testid="book-card"]', { timeout: 10000 });
    
    // Cliquer sur le bouton d'ajout du premier livre
    const addButton = page.locator('[data-testid="add-to-reading-list-button"]').first();
    await addButton.click();
    
    // Vérifier qu'un toast d'erreur apparaît
    await expect(page.locator('.toaster')).toContainText('Vous devez être connecté');
  });

  test('un utilisateur connecté peut ajouter un livre à sa liste', async ({ page }) => {
    // Se connecter (à adapter selon votre flow d'auth)
    await page.goto('/auth');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    // Attendre la redirection vers l'accueil
    await page.waitForURL('/');
    
    // Aller à la page d'exploration
    await page.goto('/explore');
    
    // Attendre qu'un livre soit visible
    await page.waitForSelector('[data-testid="book-card"]', { timeout: 10000 });
    
    // Récupérer le titre du premier livre
    const firstBookTitle = await page.locator('[data-testid="book-card"] h3').first().textContent();
    
    // Cliquer sur le bouton d'ajout
    const addButton = page.locator('[data-testid="add-to-reading-list-button"]').first();
    await addButton.click();
    
    // Vérifier qu'un toast de succès apparaît
    await expect(page.locator('.toaster')).toContainText('ajouté à votre liste de lecture');
    
    // Aller à la page de reading list
    await page.goto('/reading-list');
    
    // Vérifier que le livre est présent dans la liste
    await expect(page.locator('[data-testid="book-card"]')).toContainText(firstBookTitle || '');
  });

  test('un double-clic n\'ajoute pas de doublon', async ({ page }) => {
    // Se connecter
    await page.goto('/auth');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('/');
    
    // Aller à la page d'exploration
    await page.goto('/explore');
    await page.waitForSelector('[data-testid="book-card"]', { timeout: 10000 });
    
    const addButton = page.locator('[data-testid="add-to-reading-list-button"]').first();
    
    // Double-clic rapide
    await addButton.click();
    await addButton.click();
    
    // Attendre un peu pour laisser le temps aux requêtes
    await page.waitForTimeout(2000);
    
    // Vérifier qu'un seul toast de succès est affiché
    const toasts = page.locator('.toast:has-text("ajouté à votre liste")');
    await expect(toasts).toHaveCount(1);
  });
});
</lov-test>

Finalement, mettons à jour le fichier de service principal pour exporter les nouvelles fonctions :

<lov-write file_path="src/services/bookService.ts">
// Export all book-related services for easy importing
export * from './books';
export * from './books/bookMutations';
export * from './books/deleteBook';
export * from './reading/readingListService';
export * from './reading/progressService';
export * from './reading/validationService';
export * from './reading/syncService';
export * from './reading/statsService';
export * from './questionService';

// Export new utilities
export * from '../utils/readingListErrors';
export * from '../utils/bookValidation';
export * from './analytics/readingListAnalytics';
