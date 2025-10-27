import { Capacitor } from '@capacitor/core';
import { InAppPurchases, IAPProduct } from './types';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

class AppleIAPService {
  private productId = 'com.vread.app.lifetime';
  private isInitialized = false;

  /**
   * Initialise le service IAP Apple
   * Doit être appelé au démarrage de l'app sur iOS
   */
  async initialize(): Promise<void> {
    if (!this.isIOS()) {
      console.log('[IAP] Not on iOS, skipping initialization');
      return;
    }

    try {
      console.log('[IAP] Initializing Apple IAP...');
      
      // Connexion au store Apple
      const { value } = await InAppPurchases.connect();
      console.log('[IAP] Connected to Apple Store:', value);

      // Enregistrement du produit
      await InAppPurchases.register({
        products: [
          {
            id: this.productId,
            type: 'non-consumable'
          }
        ]
      });
      console.log('[IAP] Product registered:', this.productId);

      // Écouter les événements d'achat
      this.setupPurchaseListener();

      this.isInitialized = true;
      console.log('[IAP] Initialization complete');
    } catch (error) {
      console.error('[IAP] Initialization error:', error);
      throw error;
    }
  }

  /**
   * Récupère les informations du produit depuis Apple
   * (prix localisé, titre, description)
   */
  async getProducts(): Promise<IAPProduct[]> {
    if (!this.isIOS()) {
      console.log('[IAP] Not on iOS');
      return [];
    }

    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const { products } = await InAppPurchases.getProducts({
        productIds: [this.productId]
      });

      console.log('[IAP] Products retrieved:', products);
      return products || [];
    } catch (error) {
      console.error('[IAP] Error fetching products:', error);
      return [];
    }
  }

  /**
   * Lance le processus d'achat du Lifetime
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

      // Déclenche l'achat natif iOS
      const { value } = await InAppPurchases.purchase({
        productId: this.productId
      });

      console.log('[IAP] Purchase initiated:', value);
      
      // Le listener gérera la suite (approved → verified → finished)
      return true;
    } catch (error: any) {
      console.error('[IAP] Purchase error:', error);
      
      if (error.code === 'E_USER_CANCELLED') {
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
   * Restaure les achats précédents
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
      
      const { value } = await InAppPurchases.restorePurchases();
      console.log('[IAP] Restore result:', value);

      if (value && value.length > 0) {
        // Vérifier si le lifetime est dans les achats restaurés
        const lifetimeFound = value.some((purchase: any) => 
          purchase.productId === this.productId
        );

        if (lifetimeFound) {
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
   * Écoute les événements d'achat
   * Gère le cycle de vie : approved → verified → finished
   */
  private setupPurchaseListener() {
    InAppPurchases.addListener('purchaseUpdated', async (purchase) => {
      console.log('[IAP] Purchase updated:', purchase);

      if (purchase.state === 'approved') {
        console.log('[IAP] Purchase approved, verifying...');
        
        // Vérifier le receipt côté serveur
        const verified = await this.verifyReceipt(purchase.receipt);
        
        if (verified) {
          // Activer Premium
          await this.activatePremium('apple');
          
          // Finaliser la transaction
          await InAppPurchases.finish({
            transactionId: purchase.transactionId
          });
          
          toast({
            title: 'Achat réussi ! 🎉',
            description: 'Tu as maintenant accès à Premium à vie',
          });
        } else {
          console.error('[IAP] Receipt verification failed');
          toast({
            title: 'Erreur de vérification',
            description: 'Impossible de vérifier l\'achat. Contacte le support.',
            variant: 'destructive'
          });
        }
      } else if (purchase.state === 'failed') {
        console.error('[IAP] Purchase failed:', purchase);
        toast({
          title: 'Achat échoué',
          description: 'L\'achat n\'a pas pu être finalisé',
          variant: 'destructive'
        });
      }
    });
  }

  /**
   * Vérifie le receipt Apple côté serveur
   * Appelle l'edge function verify-apple-iap
   */
  private async verifyReceipt(receipt: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('[IAP] No user found');
        return false;
      }

      console.log('[IAP] Verifying receipt with edge function...');

      const { data, error } = await supabase.functions.invoke('verify-apple-iap', {
        body: {
          receipt,
          productId: this.productId,
          userId: user.id
        }
      });

      if (error) {
        console.error('[IAP] Verification error:', error);
        return false;
      }

      console.log('[IAP] Verification result:', data);
      return data?.valid === true;
    } catch (error) {
      console.error('[IAP] Receipt verification failed:', error);
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
