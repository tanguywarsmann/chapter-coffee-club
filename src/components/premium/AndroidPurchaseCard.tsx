import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Check, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { isPremium, purchaseLifetime, restorePurchases, getLifetimePackage } from '@/lib/revenuecat';
import type { PurchasesPackage } from '@revenuecat/purchases-capacitor';

export function AndroidPurchaseCard() {
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isPremiumActive, setIsPremiumActive] = useState(false);
  const [packageInfo, setPackageInfo] = useState<PurchasesPackage | null>(null);

  useEffect(() => {
    console.log('[AndroidPurchaseCard] Component mounted');
    initializeRevenueCat();
  }, []);

  const initializeRevenueCat = async () => {
    try {
      setIsLoading(true);
      console.log('[AndroidPurchaseCard] Initializing...');

      // Vérifier si Premium est déjà actif
      const active = await isPremium();
      setIsPremiumActive(active);

      // Récupérer les infos du package
      const pkg = await getLifetimePackage();
      setPackageInfo(pkg);

      console.log('[AndroidPurchaseCard] Initialized - Premium active:', active);
    } catch (error) {
      console.error('[AndroidPurchaseCard] Initialization error:', error);
      toast.error('Erreur lors du chargement du store Android');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchase = async () => {
    console.log('[AndroidPurchaseCard] Purchase button clicked');
    setIsPurchasing(true);

    try {
      const success = await purchaseLifetime();
      
      if (success) {
        toast.success('🎉 VREAD Premium activé !', {
          description: 'Tu as maintenant accès à toutes les fonctionnalités Premium'
        });
        setIsPremiumActive(true);
      } else {
        toast.error('Achat non confirmé', {
          description: 'Vérifie ton compte Play Store'
        });
      }
    } catch (error: any) {
      console.error('[AndroidPurchaseCard] Purchase error:', error);
      
      // Gérer l'annulation de l'achat
      if (error.code === '1' || error.message?.includes('cancelled')) {
        toast('Achat annulé');
      } else {
        toast.error('Erreur lors de l\'achat', {
          description: error.message || 'Réessaye plus tard'
        });
      }
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleRestore = async () => {
    console.log('[AndroidPurchaseCard] Restore button clicked');
    setIsRestoring(true);

    try {
      const success = await restorePurchases();
      
      if (success) {
        toast.success('✅ Achats restaurés !', {
          description: 'Ton accès Premium a été rétabli'
        });
        setIsPremiumActive(true);
      } else {
        toast.info('Aucun achat à restaurer', {
          description: 'Aucun achat Premium trouvé sur ce compte Google Play'
        });
      }
    } catch (error) {
      console.error('[AndroidPurchaseCard] Restore error:', error);
      toast.error('Erreur lors de la restauration', {
        description: 'Réessaye plus tard'
      });
    } finally {
      setIsRestoring(false);
    }
  };

  // Si Premium est déjà actif, afficher un message de confirmation
  if (isPremiumActive) {
    return (
      <Card className="p-8 border-2 border-green-500 bg-gradient-to-br from-green-50/50 to-emerald-50/50">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Crown className="h-10 w-10 text-yellow-500" />
            <h2 className="text-3xl font-bold">Premium Actif ✓</h2>
          </div>
          <p className="text-lg text-muted-foreground">
            Merci pour ton soutien ! Tu as accès à toutes les fonctionnalités Premium.
          </p>
        </div>
      </Card>
    );
  }

  // Affichage pendant le chargement
  if (isLoading) {
    return (
      <Card className="p-8">
        <div className="flex flex-col items-center justify-center space-y-4 py-8">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-lg text-muted-foreground">Chargement du store Android...</p>
        </div>
      </Card>
    );
  }

  // Prix à afficher
  const displayPrice = packageInfo?.product.priceString || '29,99€';

  return (
    <Card className="p-8 border-2 border-orange-500 relative shadow-2xl bg-gradient-to-br from-orange-50/50 to-yellow-50/50">
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1 whitespace-nowrap">
        🔥 Offre de lancement - Limitée
      </div>

      <div className="flex items-center gap-2 mb-2 mt-2">
        <h3 className="text-2xl font-bold">Lifetime - Early Bird</h3>
        <Crown className="h-6 w-6 text-orange-500" />
      </div>

      <div className="mb-4">
        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-bold text-orange-600">{displayPrice}</span>
        </div>
        <span className="text-lg font-semibold text-orange-700">Accès à vie - Paiement unique</span>
      </div>

      {/* Features */}
      <ul className="space-y-3 mb-6">
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

      {/* Buttons */}
      <div className="space-y-3">
        <Button
          onClick={handlePurchase}
          disabled={isPurchasing || isRestoring}
          className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-bold min-h-[56px] text-lg"
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

        <Button
          onClick={handleRestore}
          disabled={isPurchasing || isRestoring}
          variant="outline"
          className="w-full min-h-[56px] text-base"
          size="lg"
        >
          {isRestoring ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Restauration en cours...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Restaurer mes achats
            </span>
          )}
        </Button>
      </div>

      <p className="text-center text-sm text-muted-foreground mt-4">
        💡 Les achats sont gérés par Google Play Store
      </p>
    </Card>
  );
}
