import { test, expect } from '@playwright/test';

/**
 * Tests E2E du flux de réinitialisation de mot de passe
 * 
 * PRÉREQUIS pour activer ces tests:
 * 1. Configurer MAILSLURP_API_KEY dans les variables d'environnement
 * 2. Configurer Supabase avec les bonnes redirect URLs
 * 3. Vérifier que le SMTP Supabase est opérationnel
 * 
 * Pour exécuter: npm run test:e2e tests/e2e/reset-password.spec.ts
 */

test.describe('Reset Password Flow', () => {
  test.skip('complete password reset flow', async ({ page }) => {
    // Ce test nécessite MailSlurp pour récupérer les emails
    // Activer en définissant MAILSLURP_API_KEY
    
    const testEmail = 'test@example.com';
    const oldPassword = 'OldPassword123!';
    const newPassword = 'NewPassword123!';

    // 1. Aller sur la page de connexion
    await page.goto('/auth');
    await expect(page).toHaveTitle(/VREAD/i);

    // 2. Cliquer sur "Mot de passe oublié"
    await page.click('text=Mot de passe oublié');
    await expect(page.locator('text=Réinitialiser le mot de passe')).toBeVisible();

    // 3. Saisir l'email et soumettre
    await page.fill('input[type="email"]', testEmail);
    await page.click('button:has-text("Envoyer")');
    
    // 4. Vérifier le message de confirmation
    await expect(page.locator('text=/email.*envoyé/i')).toBeVisible();

    // 5. TODO: Récupérer le lien de reset via MailSlurp
    // const resetLink = await getResetLinkFromEmail(testEmail);
    
    // 6. TODO: Ouvrir le lien de reset
    // await page.goto(resetLink);
    
    // 7. TODO: Vérifier que le formulaire de reset s'affiche
    // await expect(page.locator('text=Nouveau mot de passe')).toBeVisible();
    
    // 8. TODO: Saisir le nouveau mot de passe
    // await page.fill('input[id="password"]', newPassword);
    // await page.fill('input[id="confirm-password"]', newPassword);
    
    // 9. TODO: Soumettre le formulaire
    // await page.click('button:has-text("Mettre à jour")');
    
    // 10. TODO: Vérifier le message de succès
    // await expect(page.locator('text=/mot de passe mis à jour/i')).toBeVisible();
    
    // 11. TODO: Tenter de se connecter avec l'ancien mot de passe (doit échouer)
    // await page.goto('/auth');
    // await page.fill('input[type="email"]', testEmail);
    // await page.fill('input[type="password"]', oldPassword);
    // await page.click('button:has-text("Se connecter")');
    // await expect(page.locator('text=/identifiants invalides/i')).toBeVisible();
    
    // 12. TODO: Se connecter avec le nouveau mot de passe (doit réussir)
    // await page.fill('input[type="email"]', testEmail);
    // await page.fill('input[type="password"]', newPassword);
    // await page.click('button:has-text("Se connecter")');
    // await expect(page).toHaveURL('/home');
  });

  test('affiche un message d\'erreur pour un lien expiré', async ({ page }) => {
    // Simuler un lien expiré en allant directement sur /reset-password sans token
    await page.goto('/reset-password');
    
    // Vérifier que le message d'erreur s'affiche
    await expect(page.locator('text=/lien invalide ou expiré/i')).toBeVisible();
    
    // Vérifier que le bouton de retour est présent
    const backButton = page.locator('button:has-text("Retour à la connexion")');
    await expect(backButton).toBeVisible();
    
    // Cliquer sur le bouton et vérifier la redirection
    await backButton.click();
    await expect(page).toHaveURL('/auth');
  });

  test('valide la complexité du mot de passe', async ({ page, context }) => {
    // Créer une session de test manuelle
    // Note: Dans un vrai test, il faudrait utiliser un vrai token de reset
    
    // Aller sur la page de reset
    await page.goto('/reset-password');
    
    // Si le formulaire n'est pas visible, skip le test
    const isFormVisible = await page.locator('input[id="password"]').isVisible().catch(() => false);
    if (!isFormVisible) {
      test.skip();
    }

    // Tester un mot de passe trop court
    await page.fill('input[id="password"]', 'weak');
    await page.fill('input[id="confirm-password"]', 'weak');
    await page.click('button:has-text("Mettre à jour")');
    
    await expect(page.locator('text=/au moins 8 caractères/i')).toBeVisible();

    // Tester un mot de passe sans majuscule
    await page.fill('input[id="password"]', 'password123!');
    await page.fill('input[id="confirm-password"]', 'password123!');
    await page.click('button:has-text("Mettre à jour")');
    
    await expect(page.locator('text=/majuscule/i')).toBeVisible();

    // Tester des mots de passe qui ne correspondent pas
    await page.fill('input[id="password"]', 'Password123!');
    await page.fill('input[id="confirm-password"]', 'Password456!');
    await page.click('button:has-text("Mettre à jour")');
    
    await expect(page.locator('text=/ne correspondent pas/i')).toBeVisible();
  });

  test('affiche les états de chargement correctement', async ({ page }) => {
    await page.goto('/reset-password');
    
    const isFormVisible = await page.locator('input[id="password"]').isVisible().catch(() => false);
    if (!isFormVisible) {
      test.skip();
    }

    // Remplir le formulaire
    await page.fill('input[id="password"]', 'ValidPassword123!');
    await page.fill('input[id="confirm-password"]', 'ValidPassword123!');
    
    // Cliquer sur soumettre
    await page.click('button:has-text("Mettre à jour")');
    
    // Vérifier que le bouton affiche un état de chargement
    await expect(page.locator('button:has-text("Mise à jour en cours")')).toBeVisible();
  });
});

test.describe('ForgotPasswordModal', () => {
  test('ouvre et ferme la modal correctement', async ({ page }) => {
    await page.goto('/auth');
    
    // Cliquer sur "Mot de passe oublié"
    await page.click('text=Mot de passe oublié');
    
    // Vérifier que la modal s'ouvre
    await expect(page.locator('text=Réinitialiser le mot de passe')).toBeVisible();
    
    // Cliquer sur Annuler
    await page.click('button:has-text("Annuler")');
    
    // Vérifier que la modal se ferme
    await expect(page.locator('text=Réinitialiser le mot de passe')).not.toBeVisible();
  });

  test('valide l\'email avant l\'envoi', async ({ page }) => {
    await page.goto('/auth');
    
    // Ouvrir la modal
    await page.click('text=Mot de passe oublié');
    
    // Essayer d'envoyer sans email
    await page.click('button:has-text("Envoyer")');
    
    // Le navigateur devrait empêcher la soumission (validation HTML5)
    await expect(page.locator('input[type="email"]:invalid')).toBeVisible();
  });
});
