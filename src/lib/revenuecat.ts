// RevenueCat Android Integration
// Gère l'initialisation, les achats et la restauration pour Android
import { Purchases, LOG_LEVEL } from '@revenuecat/purchases-capacitor';

const ANDROID_KEY = import.meta.env.VITE_RC_ANDROID_KEY;

/**
 * Initialise RevenueCat au démarrage de l'app
 * À appeler dans main.tsx
 */
export async function initRevenueCat(): Promise<void> {
  if (!ANDROID_KEY || !ANDROID_KEY.startsWith('goog_')) {
    const error = '[RevenueCat] Invalid or missing VITE_RC_ANDROID_KEY (must start with goog_)';
    console.error(error);
    throw new Error(error);
  }
  
  try {
    console.log('[RevenueCat] Initialisation...');
    await Purchases.setLogLevel({ 
      level: import.meta.env.DEV ? LOG_LEVEL.DEBUG : LOG_LEVEL.WARN 
    });
    await Purchases.configure({ apiKey: ANDROID_KEY });
    console.log('[RevenueCat] Initialisé avec succès');
  } catch (e) {
    console.error('[RevenueCat] Erreur lors de la configuration:', e);
    throw e;
  }
}

/**
 * Vérifie si l'utilisateur a l'entitlement "premium" actif
 */
export async function isPremium(): Promise<boolean> {
  try {
    const { customerInfo } = await Purchases.getCustomerInfo();
    const isActive = Boolean(customerInfo.entitlements.active?.premium);
    console.log('[RevenueCat] Premium actif:', isActive);
    return isActive;
  } catch (e) {
    console.error('[RevenueCat] Erreur lors de la vérification Premium:', e);
    return false;
  }
}

/**
 * Lance l'achat du package Lifetime ($rc_lifetime)
 * @returns true si l'achat a réussi et Premium est actif
 */
export async function purchaseLifetime(): Promise<boolean> {
  try {
    console.log('[RevenueCat] Récupération des offerings...');
    const { current } = await Purchases.getOfferings();
    
    if (!current) {
      throw new Error('Aucun offering disponible');
    }

    console.log('[RevenueCat] Offerings disponibles:', current.availablePackages.map(p => p.identifier));
    
    // Chercher le package $rc_lifetime
    const pkg = current.availablePackages.find(p => p.identifier === '$rc_lifetime');
    
    if (!pkg) {
      throw new Error('Package $rc_lifetime introuvable dans l\'offering par défaut');
    }

    console.log('[RevenueCat] Lancement de l\'achat pour:', pkg.identifier);
    const { customerInfo } = await Purchases.purchasePackage({ aPackage: pkg });
    
    const isActive = Boolean(customerInfo.entitlements.active?.premium);
    console.log('[RevenueCat] Achat terminé, Premium actif:', isActive);
    
    return isActive;
  } catch (e: any) {
    console.error('[RevenueCat] Erreur lors de l\'achat:', e);
    throw e;
  }
}

/**
 * Restaure les achats précédents
 * @returns true si Premium a été restauré
 */
export async function restorePurchases(): Promise<boolean> {
  try {
    console.log('[RevenueCat] Restauration des achats...');
    const { customerInfo } = await Purchases.restorePurchases();
    
    const isActive = Boolean(customerInfo.entitlements.active?.premium);
    console.log('[RevenueCat] Restauration terminée, Premium actif:', isActive);
    
    return isActive;
  } catch (e) {
    console.error('[RevenueCat] Erreur lors de la restauration:', e);
    throw e;
  }
}

/**
 * Récupère les informations du package Lifetime pour l'affichage
 */
export async function getLifetimePackage() {
  try {
    const { current } = await Purchases.getOfferings();
    if (!current) return null;
    
    const pkg = current.availablePackages.find(p => p.identifier === '$rc_lifetime');
    return pkg || null;
  } catch (e) {
    console.error('[RevenueCat] Erreur lors de la récupération du package:', e);
    return null;
  }
}
