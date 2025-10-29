import { Capacitor } from '@capacitor/core';
import { Purchases, LOG_LEVEL } from '@revenuecat/purchases-capacitor';
import { RevenueCatProduct, RevenueCatPackage } from './types';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

class AppleIAPService {
  private productId = 'com.vread.app.lifetime';
  private isInitialized = false;
  // Clé publique SDK RevenueCat (safe pour le client)
  private apiKey = 'appl_LqGBafbkvvzjeVyWijyguTTO0yB';

  /**
   * Initialise RevenueCat SDK
   * Doit être appelé au démarrage de l'app sur iOS
   */
  async initialize(): Promise<void> {
    if (!this.isIOS()) {
      console.log('[IAP] Not on iOS, skipping initialization');
      return;
    }

    try {
      console.log('[IAP] Initializing RevenueCat SDK...');

      // Configuration du SDK RevenueCat avec la clé publique
      await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG });
      await Purchases.configure({
        apiKey: this.apiKey,
      });

      console.log('[IAP] RevenueCat SDK initialized');
      this.isInitialized = true;
    } catch (error) {
      console.error('[IAP] Initialization error:', error);
      throw error;
    }
  }

  /**
   * Récupère les informations du produit depuis RevenueCat
   * (prix localisé, titre, description)
   */
  async getProducts(): Promise<RevenueCatProduct[]> {
    if (!this.isIOS()) {
      console.log('[IAP] Not on iOS');
      return [];
    }

    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // Récupérer les offerings depuis RevenueCat
      const offerings = await Purchases.getOfferings();
      
      if (!offerings.current) {
        console.warn('[IAP] No current offering found in RevenueCat');
        return [];
      }

      // Trouver le package lifetime
      const lifetimePackage = offerings.current.availablePackages.find(
        (pkg: RevenueCatPackage) => pkg.identifier === 'lifetime' || pkg.product.identifier === this.productId
      );

      if (!lifetimePackage) {
        console.warn('[IAP] Lifetime package not found');
        return [];
      }

      console.log('[IAP] Product retrieved:', lifetimePackage.product);
      return [lifetimePackage.product];
    } catch (error) {
      console.error('[IAP] Error fetching products:', error);
      return [];
    }
  }

  /**
   * Lance le processus d'achat du Lifetime via RevenueCat
   */
  async purchaseLifetime(): Promise<boolean> {
    if (!this.isIOS()) {
      toast({
        title: 'Erreur',
        description: 'Les achats in-app ne sont disponibles que sur iOS',
        variant: 'destructive'
      });
      return false;
    }

    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      console.log('[IAP] Starting purchase for:', this.productId);

      // Récupérer l'offering
      const offerings = await Purchases.getOfferings();
      
      if (!offerings.current) {
        throw new Error('No current offering available');
      }

      // Trouver le package lifetime
      const lifetimePackage = offerings.current.availablePackages.find(
        (pkg: RevenueCatPackage) => pkg.identifier === 'lifetime' || pkg.product.identifier === this.productId
      );

      if (!lifetimePackage) {
        throw new Error('Lifetime package not found');
      }

      // Effectuer l'achat via RevenueCat
      const purchaseResult = await Purchases.purchasePackage({
        aPackage: lifetimePackage
      });

      console.log('[IAP] Purchase successful:', purchaseResult);

      // RevenueCat gère automatiquement la validation du receipt
      // Activer Premium dans le profil
      await this.activatePremium('apple');

      toast({
        title: 'Achat réussi ! 🎉',
        description: 'Tu as maintenant accès à Premium à vie',
      });

      return true;
    } catch (error: any) {
      console.error('[IAP] Purchase error:', error);
      
      if (error.code === '1' || error.message?.includes('cancelled')) {
        toast({
          title: 'Achat annulé',
          description: 'Tu as annulé l\'achat',
        });
      } else {
        toast({
          title: 'Erreur d\'achat',
          description: 'Impossible de finaliser l\'achat. Réessaye plus tard.',
          variant: 'destructive'
        });
      }
      
      return false;
    }
  }

  /**
   * Restaure les achats précédents via RevenueCat
   * Obligatoire pour Apple : doit être accessible dans l'UI
   */
  async restorePurchases(): Promise<boolean> {
    if (!this.isIOS()) {
      toast({
        title: 'Erreur',
        description: 'Les achats in-app ne sont disponibles que sur iOS',
        variant: 'destructive'
      });
      return false;
    }

    try {
      console.log('[IAP] Restoring purchases...');
      
      // RevenueCat gère automatiquement la restauration
      const customerInfo = await Purchases.restorePurchases();
      console.log('[IAP] Restore result:', customerInfo);

      // Vérifier si l'utilisateur a un entitlement actif
      const hasLifetime = customerInfo.customerInfo.entitlements.active['premium'] !== undefined;

      if (hasLifetime) {
        toast({
          title: 'Achat restauré !',
          description: 'Ton accès Premium a été restauré',
        });
        
        // Activer Premium dans le profil
        await this.activatePremium('apple');
        return true;
      } else {
        toast({
          title: 'Aucun achat trouvé',
          description: 'Aucun achat Premium n\'a été trouvé sur ce compte Apple',
        });
        return false;
      }
    } catch (error) {
      console.error('[IAP] Restore error:', error);
      toast({
        title: 'Erreur de restauration',
        description: 'Impossible de restaurer les achats. Réessaye plus tard.',
        variant: 'destructive'
      });
      return false;
    }
  }

  /**
   * Active Premium dans le profil utilisateur
   */
  private async activatePremium(type: 'apple' | 'stripe'): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('[IAP] No user found');
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          is_premium: true,
          premium_since: new Date().toISOString(),
          premium_type: type
        })
        .eq('id', user.id);

      if (error) {
        console.error('[IAP] Failed to activate premium:', error);
      } else {
        console.log('[IAP] Premium activated successfully');
      }
    } catch (error) {
      console.error('[IAP] Error activating premium:', error);
    }
  }

  /**
   * Vérifie si on est sur iOS natif
   */
  private isIOS(): boolean {
    return Capacitor.getPlatform() === 'ios';
  }
}

// Export singleton
export const appleIAPService = new AppleIAPService();
