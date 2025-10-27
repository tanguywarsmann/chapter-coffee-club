import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Check, Sparkles } from 'lucide-react';
import { appleIAPService } from '@/services/iap/appleIAPService';
import { PremiumBadge } from './PremiumBadge';
import { toast } from '@/hooks/use-toast';

export function IOSPurchaseCard() {
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [product, setProduct] = useState<any>(null);

  useEffect(() => {
    initializeIAP();
  }, []);

  const initializeIAP = async () => {
    try {
      setIsLoading(true);
      await appleIAPService.initialize();
      const products = await appleIAPService.getProducts();
      
      if (products && products.length > 0) {
        setProduct(products[0]);
        console.log('[iOS Purchase] Product loaded:', products[0]);
      } else {
        console.warn('[iOS Purchase] No products found');
        toast({
          title: 'Erreur de chargement',
          description: 'Impossible de récupérer les informations du produit',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('[iOS Purchase] Initialization error:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'initialiser le store Apple',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchase = async () => {
    setIsPurchasing(true);
    try {
      const success = await appleIAPService.purchaseLifetime();
      if (!success) {
        console.log('[iOS Purchase] Purchase cancelled or failed');
      }
    } catch (error) {
      console.error('[iOS Purchase] Purchase error:', error);
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleRestore = async () => {
    setIsRestoring(true);
    try {
      await appleIAPService.restorePurchases();
    } catch (error) {
      console.error('[iOS Purchase] Restore error:', error);
    } finally {
      setIsRestoring(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="p-8 border-2 border-orange-500 relative shadow-2xl bg-gradient-to-br from-orange-50/50 to-yellow-50/50">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Chargement du store Apple...</p>
        </div>
      </Card>
    );
  }

  const displayPrice = product?.price || '29,99 €';

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
      
      {/* Bouton d'achat */}
      <Button 
        onClick={handlePurchase}
        disabled={isPurchasing || !product}
        className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-bold mb-3"
        size="lg"
      >
        {isPurchasing ? 'Achat en cours...' : `Acheter - ${displayPrice}`}
      </Button>

      {/* Bouton restauration (obligatoire Apple) */}
      <Button 
        onClick={handleRestore}
        disabled={isRestoring}
        variant="outline"
        className="w-full"
        size="sm"
      >
        {isRestoring ? 'Restauration...' : 'Restaurer mes achats'}
      </Button>

      {/* Info légale Apple */}
      <p className="text-xs text-muted-foreground text-center mt-4">
        Paiement traité par l'App Store. Pas d'abonnement, paiement unique.
      </p>
    </Card>
  );
}
