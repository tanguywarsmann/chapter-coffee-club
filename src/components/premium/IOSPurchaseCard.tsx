import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Sparkles, Loader2 } from 'lucide-react';
import { appleIAPService } from '@/services/iap/appleIAPService';
import { RevenueCatProduct } from '@/services/iap/types';
import { PremiumBadge } from './PremiumBadge';
import { toast } from 'sonner';

export function IOSPurchaseCard() {
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [product, setProduct] = useState<RevenueCatProduct | null>(null);

  useEffect(() => {
    console.log('[iOS Purchase Card] Component mounted');
    initializeIAP();
  }, []);

  const initializeIAP = async () => {
    try {
      console.log('[iOS Purchase Card] Starting IAP initialization...');
      setIsLoading(true);
      await appleIAPService.initialize();
      console.log('[iOS Purchase Card] IAP service initialized');
      
      const products = await appleIAPService.getProducts();
      console.log('[iOS Purchase Card] Products fetched:', products);
      
      if (products && products.length > 0) {
        setProduct(products[0]);
        console.log('[iOS Purchase Card] Product loaded:', products[0]);
      } else {
        console.warn('[iOS Purchase Card] No products found');
        toast.error('Impossible de récupérer les informations du produit');
      }
    } catch (error) {
      console.error('[iOS Purchase Card] Initialization error:', error);
      toast.error('Impossible d\'initialiser le store Apple');
    } finally {
      setIsLoading(false);
      console.log('[iOS Purchase Card] Initialization complete');
    }
  };

  const handlePurchase = async () => {
    console.log('[iOS Purchase Card] Purchase button clicked');
    setIsPurchasing(true);
    try {
      console.log('[iOS Purchase Card] Starting purchase flow...');
      const success = await appleIAPService.purchaseLifetime();
      if (!success) {
        console.log('[iOS Purchase Card] Purchase cancelled or failed');
      } else {
        console.log('[iOS Purchase Card] Purchase successful');
      }
    } catch (error) {
      console.error('[iOS Purchase Card] Purchase error:', error);
    } finally {
      setIsPurchasing(false);
      console.log('[iOS Purchase Card] Purchase flow complete');
    }
  };

  const handleRestore = async () => {
    console.log('[iOS Purchase Card] Restore button clicked');
    setIsRestoring(true);
    try {
      console.log('[iOS Purchase Card] Starting restore flow...');
      await appleIAPService.restorePurchases();
      console.log('[iOS Purchase Card] Restore complete');
    } catch (error) {
      console.error('[iOS Purchase Card] Restore error:', error);
    } finally {
      setIsRestoring(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="p-8 border-2 border-orange-500 relative shadow-2xl bg-gradient-to-br from-orange-50/50 to-yellow-50/50">
        <div className="text-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-lg md:text-xl font-semibold text-foreground">Chargement du store Apple...</p>
          <p className="text-sm text-muted-foreground mt-2">Connexion à l'App Store en cours</p>
        </div>
      </Card>
    );
  }

  const displayPrice = product?.priceString || '29,99 €';

  return (
    <Card className="p-8 border-2 border-orange-500 relative shadow-2xl bg-gradient-to-br from-orange-50/50 to-yellow-50/50 md:scale-105 md:z-10">
      {/* Badge Early Bird */}
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1 whitespace-nowrap">
        🔥 Offre de lancement - Limitée
      </div>
      
      {/* Header */}
      <div className="flex items-center gap-2 mb-2 mt-2">
        <h3 className="text-2xl font-bold">Premium à Vie</h3>
        <PremiumBadge size="md" variant="compact" />
      </div>
      
      {/* Prix */}
      <div className="mb-2">
        <span className="text-sm text-muted-foreground line-through">99€</span>
        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-bold text-orange-600">{displayPrice}</span>
          <Sparkles className="h-6 w-6 text-orange-500 animate-pulse" />
        </div>
        <span className="text-lg font-semibold text-orange-700">Accès à vie</span>
      </div>
      
      <p className="text-sm font-semibold text-orange-600 mb-6">
        🍎 Achat via App Store
      </p>
      
      {/* Features */}
      <ul className="space-y-4 mb-8">
        <li className="flex items-start gap-3">
          <Check className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
          <span className="font-semibold">
            Demander l'ajout de n'importe quel livre
          </span>
        </li>
        <li className="flex items-start gap-3">
          <Check className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
          <span>Traitement sous 48-72h</span>
        </li>
        <li className="flex items-start gap-3">
          <Check className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
          <span>Statistiques de lecture avancées</span>
        </li>
        <li className="flex items-start gap-3">
          <Check className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
          <span>Badges exclusifs Premium</span>
        </li>
        <li className="flex items-start gap-3">
          <Check className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
          <span>Support prioritaire</span>
        </li>
        <li className="flex items-start gap-3">
          <Check className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
          <span>Accès anticipé aux nouvelles fonctionnalités</span>
        </li>
      </ul>
      
      {/* Bouton d'achat - iPad Optimized */}
      <Button 
        onClick={handlePurchase}
        disabled={isPurchasing || !product}
        className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-bold mb-3 min-h-[56px] text-lg"
        size="lg"
      >
        {isPurchasing ? (
          <span className="flex items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin" />
            Chargement de l'achat...
          </span>
        ) : (
          `Acheter - ${displayPrice}`
        )}
      </Button>

      {/* Bouton restauration (obligatoire Apple) - iPad Optimized */}
      <Button 
        onClick={handleRestore}
        disabled={isRestoring}
        variant="outline"
        className="w-full min-h-[48px] text-base"
        size="lg"
      >
        {isRestoring ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Restauration...
          </span>
        ) : (
          'Restaurer mes achats'
        )}
      </Button>

      {/* Info légale Apple */}
      <p className="text-xs text-muted-foreground text-center mt-4">
        Paiement traité par l'App Store. Pas d'abonnement, paiement unique.
      </p>
    </Card>
  );
}
