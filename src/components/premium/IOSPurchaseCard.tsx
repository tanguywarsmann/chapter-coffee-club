import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/i18n/LanguageContext';
import { appleIAPService } from '@/services/iap/appleIAPService';
import { RevenueCatProduct } from '@/services/iap/types';
import { Check, Loader2, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { PremiumBadge } from './PremiumBadge';

export function IOSPurchaseCard() {
  const { t } = useTranslation();
  const { pollForPremiumStatus, supabase, isPremium } = useAuth();
  const isAlreadyPremium = isPremium;
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [product, setProduct] = useState<RevenueCatProduct | null>(null);
  const [productError, setProductError] = useState<string | null>(null);

  const initializeIAP = async () => {
    try {
      setIsLoading(true);

      // L'initialisation devrait déjà être faite dans main.tsx
      await appleIAPService.initialize();

      const products = await appleIAPService.getProducts();

      if (products && products.length > 0) {
        setProduct(products[0]);
        setProductError(null);

        if (import.meta.env.DEV) {
          console.log('[iOS Purchase Card] Product loaded', {
            id: products[0].identifier,
            title: products[0].title,
            price: products[0].priceString,
            currency: products[0].currencyCode,
          });
        }
      } else {
        setProduct(null);
        setProductError('Impossible de charger le produit. Réessaie plus tard.');
        toast.error(t.premium.toast.error);
      }
    } catch (error) {
      console.error('[iOS Purchase Card] Initialization error:', error);
      setProduct(null);
      setProductError('Impossible de charger le produit. Réessaie plus tard.');
      toast.error(t.premium.toast.error);
    } finally {
      setIsLoading(false);
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: we initialize once.
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('[iOS Purchase Card] Component mounted');
    }
    initializeIAP();
  }, []);


  const activatePremiumViaRPC = async (showToastOnUpgrade: boolean = true): Promise<boolean> => {
    try {
      // RPC function not yet implemented in Supabase
      return await pollForPremiumStatus(showToastOnUpgrade);
    } catch (err) {
      console.error('[iOS Purchase Card] Exception calling RPC:', err);
      // Fallback au polling
      return await pollForPremiumStatus(showToastOnUpgrade);
    }
  };

  const handlePurchase = async () => {
    if (!product) {
      const message = 'Le produit n\'est pas disponible pour le moment. Réessaie plus tard.';
      setProductError(message);
      toast.error(message);
      return;
    }

    if (isPurchasing) {
      return;
    }

    setIsPurchasing(true);
    try {
      const success = await appleIAPService.purchaseLifetime();

      if (success) {
        const activated = await activatePremiumViaRPC();

        if (activated) {
          setProductError(null);
        } else {
          setProductError('Premium a bien été acheté mais l’activation a pris du retard. Réessaie plus tard ou contacte le support.');
        }
      } else {
        setProductError('L’achat a été annulé ou n’a pas pu être confirmé.');
      }
    } catch (error) {
      console.error('[iOS Purchase Card] Purchase error:', error);
      setProductError('Une erreur est survenue pendant l’achat. Réessaie plus tard.');
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleRestore = async () => {
    setIsRestoring(true);
    try {
      const success = await appleIAPService.restorePurchases();

      if (success) {
        const activated = await activatePremiumViaRPC(false); // don't show "you're premium" toast on restore

        if (activated) {
          setProductError(null);
        } else {
          setProductError("Premium a été restauré mais l'activation complète a pris du retard.'");
        }
      }
    } catch (error) {
      console.error('[iOS Purchase Card] Restore error:', error);
      setProductError('Une erreur est survenue pendant la restauration. Réessaie plus tard.');
    } finally {
      setIsRestoring(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="p-8 border-2 border-orange-500 relative shadow-2xl bg-gradient-to-br from-orange-50/50 to-yellow-50/50">
        <div className="text-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-lg md:text-xl font-semibold text-foreground">{t.premium.loading.storeApple}</p>
          <p className="text-sm text-muted-foreground mt-2">{t.premium.loading.connecting}</p>
        </div>
      </Card>
    );
  }

  const displayPrice = product?.priceString || '29,99 €';

  return (
    <Card className="p-8 border-2 border-orange-500 relative shadow-2xl bg-gradient-to-br from-orange-50/50 to-yellow-50/50 md:scale-105 md:z-10">
      {/* Early Bird Badge with urgency */}
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-4 py-1.5 rounded-full text-sm font-semibold flex items-center gap-1.5 whitespace-nowrap shadow-lg">
        <span className="animate-pulse">🔥</span>
        {t.premium.earlyBirdBadge}
      </div>

      {/* Social proof */}
      <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground mt-4 mb-2">
        <span className="flex items-center gap-1">
          <span className="text-yellow-500">⭐</span> 5/5 App Store
        </span>
        <span className="text-muted-foreground/50">•</span>
        <span>2000+ lecteurs Premium</span>
      </div>

      <div className="flex items-center gap-2 mb-2">
        <h3 className="text-2xl font-bold">{t.premium.cards.lifetime.titleAlt}</h3>
        <PremiumBadge size="md" variant="compact" />
      </div>

      <div className="mb-2">
        <span className="text-sm text-muted-foreground line-through">{t.premium.cards.lifetime.originalPrice}</span>
        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-bold text-orange-600">{displayPrice}</span>
          <Sparkles className="h-6 w-6 text-orange-500 animate-pulse" />
        </div>
        <span className="text-lg font-semibold text-orange-700">{t.premium.cards.lifetime.period}</span>
      </div>

      {/* Urgency deadline */}
      <div className="bg-orange-100 border border-orange-200 rounded-lg px-3 py-2 mb-4">
        <p className="text-sm font-semibold text-orange-700 text-center">
          ⏰ {t.premium.cards.lifetime.validUntil}
        </p>
      </div>

      <p className="text-xs text-muted-foreground text-center mb-4">
        {t.premium.cards.lifetime.iosNote}
      </p>

      <ul className="space-y-4 mb-8">
        <li className="flex items-start gap-3">
          <Check className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
          <span className="font-semibold">{t.premium.cards.lifetime.features.requestBooks}</span>
        </li>
        <li className="flex items-start gap-3">
          <Check className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
          <span>{t.premium.cards.lifetime.features.processing}</span>
        </li>
        <li className="flex items-start gap-3">
          <Check className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
          <span>{t.premium.cards.lifetime.features.advancedStats}</span>
        </li>
        <li className="flex items-start gap-3">
          <Check className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
          <span>{t.premium.cards.lifetime.features.exclusiveBadges}</span>
        </li>
        <li className="flex items-start gap-3">
          <Check className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
          <span>{t.premium.cards.lifetime.features.prioritySupport}</span>
        </li>
        <li className="flex items-start gap-3">
          <Check className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
          <span>{t.premium.cards.lifetime.features.earlyAccess}</span>
        </li>
      </ul>

      <Button
        onClick={handlePurchase}
        disabled={isPurchasing || isAlreadyPremium}
        className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-bold mb-3 min-h-[56px] text-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02]"
        size="lg"
      >
        {isAlreadyPremium ? (
          "Vous êtes déjà Premium ✓"
        ) : isPurchasing ? (
          <span className="flex items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin" />
            {t.premium.loading.purchase}
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Débloquer Premium - {displayPrice}
          </span>
        )}
      </Button>

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
            {t.premium.loading.restoring}
          </span>
        ) : (
          t.premium.buttons.restore
        )}
      </Button>

      {productError && (
        <p className="mt-4 text-sm text-red-600">
          {productError}
        </p>
      )}

      {isAlreadyPremium && (
        <p className="mt-3 text-sm text-muted-foreground text-center">
          Vous avez déjà acheté l'accès Premium à vie avec ce compte.
        </p>
      )}

      <p className="text-xs text-muted-foreground text-center mt-4">
        {t.premium.trust.appleNote}
      </p>
    </Card>
  );
}
