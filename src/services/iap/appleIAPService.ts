import { Capacitor } from '@capacitor/core';
import { Purchases, LOG_LEVEL } from '@revenuecat/purchases-capacitor';
import { RevenueCatProduct, RevenueCatPackage } from './types';
import { supabase } from '@/integrations/supabase/client';
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
      console.log('[IAP] ❌ Not on iOS, skipping initialization');
      return;
    }

    if (this.isInitialized) {
      console.log('[IAP] ✅ Already initialized, skipping');
      return;
    }

    try {
      console.log('[IAP] 🚀 Starting RevenueCat SDK initialization...');
      console.log('[IAP] API Key:', this.apiKey.substring(0, 10) + '...');

      // Configuration du SDK RevenueCat avec la clé publique
      await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG });
      console.log('[IAP] ✓ Log level set to DEBUG');
      
      await Purchases.configure({
        apiKey: this.apiKey,
      });
      console.log('[IAP] ✓ SDK configured with API key');

      this.isInitialized = true;
      console.log('[IAP] ✅ RevenueCat SDK FULLY initialized and ready');
    } catch (error) {
      console.error('[IAP] ❌ Initialization error:', error);
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
      console.log('[IAP] ⚠️ Not initialized in getProducts, initializing...');
      await this.initialize();
    }

    try {
      console.log('[IAP] 📦 Fetching offerings from RevenueCat...');
      const offerings = await Purchases.getOfferings();
      console.log('[IAP] ✓ Offerings received:', JSON.stringify(offerings, null, 2));
      
      if (!offerings.current) {
        console.error('[IAP] ❌ CRITICAL: No current offering found in RevenueCat Dashboard');
        console.error('[IAP] 🔍 Available offerings:', Object.keys(offerings.all || {}).join(', '));
        console.error('[IAP] 💡 ACTION REQUIRED: Configure an offering as "current" in RevenueCat dashboard');
        toast.error('Configuration RevenueCat manquante. Contacte le support.');
        return [];
      }

      console.log('[IAP] ✓ Current offering ID:', offerings.current.identifier);
      console.log('[IAP] ✓ Available packages:', offerings.current.availablePackages.map((p: any) => ({
        id: p.identifier,
        productId: p.product.identifier
      })));

      // Trouver le package lifetime
      const lifetimePackage = offerings.current.availablePackages.find(
        (pkg: RevenueCatPackage) => pkg.identifier === 'lifetime' || pkg.product.identifier === this.productId
      );

      if (!lifetimePackage) {
        console.error('[IAP] ❌ CRITICAL: Lifetime package not found');
        console.error('[IAP] 🔍 Looking for: identifier="lifetime" OR productId="' + this.productId + '"');
        console.error('[IAP] 📋 Available:', offerings.current.availablePackages.map((p: any) => 
          `${p.identifier} (${p.product.identifier})`
        ).join(', '));
        console.error('[IAP] 💡 ACTION REQUIRED: Create a package with identifier "lifetime" in RevenueCat');
        toast.error('Produit Premium non configuré. Contacte le support.');
        return [];
      }

      console.log('[IAP] ✅ Product retrieved successfully:', {
        id: lifetimePackage.product.identifier,
        price: lifetimePackage.product.priceString,
        title: lifetimePackage.product.title
      });
      return [lifetimePackage.product];
    } catch (error: any) {
      console.error('[IAP] ❌ CRITICAL Error fetching products:', error);
      console.error('[IAP] Error name:', error.name);
      console.error('[IAP] Error message:', error.message);
      console.error('[IAP] Error stack:', error.stack);
      toast.error('Impossible de charger les produits. Vérifie ta connexion.');
      return [];
    }
  }

  /**
   * Lance le processus d'achat du Lifetime via RevenueCat
   */
  async purchaseLifetime(): Promise<boolean> {
    if (!this.isIOS()) {
      console.error('[IAP] ❌ Not on iOS platform');
      toast.error('Les achats in-app ne sont disponibles que sur iOS');
      return false;
    }

    if (!this.isInitialized) {
      console.log('[IAP] ⚠️ Not initialized, initializing now...');
      try {
        await this.initialize();
        console.log('[IAP] ✓ Initialization complete');
      } catch (initError) {
        console.error('[IAP] ❌ CRITICAL: Initialization failed in purchase:', initError);
        toast.error('Impossible d\'initialiser les achats. Redémarre l\'app.');
        return false;
      }
    }

    try {
      console.log('[IAP] 🛒 Starting purchase flow for product:', this.productId);
      console.log('[IAP] 📱 Device:', Capacitor.getPlatform());
      console.log('[IAP] 🔐 API Key configured:', this.apiKey.substring(0, 15) + '...');

      // Récupérer l'offering
      console.log('[IAP] 📦 Fetching offerings from RevenueCat...');
      const offerings = await Purchases.getOfferings();
      console.log('[IAP] ✓ Offerings received:', JSON.stringify({
        current: offerings.current?.identifier,
        all: Object.keys(offerings.all || {})
      }));
      
      if (!offerings.current) {
        console.error('[IAP] ❌ CRITICAL: No current offering available');
        console.error('[IAP] 💡 ACTION: Go to RevenueCat Dashboard → Offerings → Set one as current');
        toast.error('Configuration manquante. Contacte le support.');
        throw new Error('No current offering available');
      }

      console.log('[IAP] ✓ Current offering found:', offerings.current.identifier);
      console.log('[IAP] 📋 Available packages:', offerings.current.availablePackages.map((p: any) => ({
        id: p.identifier,
        productId: p.product.identifier,
        price: p.product.priceString
      })));

      // Trouver le package lifetime
      const lifetimePackage = offerings.current.availablePackages.find(
        (pkg: RevenueCatPackage) => pkg.identifier === 'lifetime' || pkg.product.identifier === this.productId
      );

      if (!lifetimePackage) {
        console.error('[IAP] ❌ CRITICAL: Lifetime package not found in offerings');
        console.error('[IAP] 🔍 Searched for: identifier="lifetime" OR productId="' + this.productId + '"');
        console.error('[IAP] 📋 Available packages:', offerings.current.availablePackages.map((p: any) => 
          `${p.identifier} (${p.product.identifier})`
        ));
        console.error('[IAP] 💡 ACTION: Create package "lifetime" with product "' + this.productId + '" in RevenueCat');
        toast.error('Produit introuvable. Contacte le support.');
        throw new Error('Lifetime package not found');
      }

      console.log('[IAP] ✅ Lifetime package found:', lifetimePackage.identifier);
      console.log('[IAP] 💰 Price:', lifetimePackage.product.priceString);
      console.log('[IAP] 📝 Product details:', {
        id: lifetimePackage.product.identifier,
        title: lifetimePackage.product.title,
        description: lifetimePackage.product.description,
        currencyCode: lifetimePackage.product.currencyCode
      });
      console.log('[IAP] 🚀 Launching Apple purchase dialog...');

      // Effectuer l'achat via RevenueCat
      const purchaseResult = await Purchases.purchasePackage({
        aPackage: lifetimePackage
      });

      console.log('[IAP] ✅ Purchase successful!', JSON.stringify({
        customerInfo: purchaseResult.customerInfo.entitlements.active,
        productIdentifier: purchaseResult.productIdentifier
      }));

      // RevenueCat gère automatiquement la validation du receipt
      // Activer Premium dans le profil
      console.log('[IAP] 💾 Activating premium in Supabase...');
      await this.activatePremium('apple');
      console.log('[IAP] ✅ Premium activated in database');

      toast.success('Tu as maintenant accès à Premium à vie 🎉');

      return true;
    } catch (error: any) {
      console.error('[IAP] ❌ Purchase error:', error);
      console.error('[IAP] Error type:', typeof error);
      console.error('[IAP] Error code:', error.code);
      console.error('[IAP] Error message:', error.message);
      console.error('[IAP] Error userInfo:', error.userInfo);
      console.error('[IAP] Full error object:', JSON.stringify(error, null, 2));
      
      if (error.code === '1' || error.message?.includes('cancelled')) {
        console.log('[IAP] ℹ️ User cancelled purchase (this is normal)');
        toast('Tu as annulé l\'achat');
      } else {
        console.error('[IAP] ❌ CRITICAL: Purchase failed with unexpected error');
        console.error('[IAP] 💡 Check: 1) Product exists in App Store Connect 2) RevenueCat configured 3) Network connection');
        toast.error('Impossible de finaliser l\'achat. Réessaye plus tard.');
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
      toast.error('Les achats in-app ne sont disponibles que sur iOS');
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
        toast.success('Ton accès Premium a été restauré');
        
        // Activer Premium dans le profil
        await this.activatePremium('apple');
        return true;
      } else {
        toast('Aucun achat Premium n\'a été trouvé sur ce compte Apple');
        return false;
      }
    } catch (error) {
      console.error('[IAP] Restore error:', error);
      toast.error('Impossible de restaurer les achats. Réessaye plus tard.');
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
