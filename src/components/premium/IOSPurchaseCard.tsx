import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Sparkles, Loader2 } from 'lucide-react';
import { useTranslation } from '@/i18n/LanguageContext';
import { appleIAPService } from '@/services/iap/appleIAPService';
import { RevenueCatProduct } from '@/services/iap/types';
import { PremiumBadge } from './PremiumBadge';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export function IOSPurchaseCard() {
  const { t } = useTranslation();
  const { pollForPremiumStatus, supabase } = useAuth();
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
      console.log('[iOS Purchase Card] 🎬 Starting IAP initialization...');
      setIsLoading(true);

      // L'initialisation devrait déjà être faite dans main.tsx
      console.log('[iOS Purchase Card] 🔧 Ensuring IAP service is initialized...');
      await appleIAPService.initialize();
      console.log('[iOS Purchase Card] ✅ IAP service ready');

      console.log('[iOS Purchase Card] 📦 Fetching products...');
      const products = await appleIAPService.getProducts();
      console.log('[iOS Purchase Card] ✓ Products fetched, count:', products?.length || 0);

      if (products && products.length > 0) {
        setProduct(products[0]);
        console.log('[iOS Purchase Card] ✅ Product loaded successfully:');
        console.log('  - ID:', products[0].identifier);
        console.log('  - Title:', products[0].title);
        console.log('  - Price:', products[0].priceString);
        console.log('  - Currency:', products[0].currencyCode);
      } else {
        console.error('[iOS Purchase Card] ❌ No products found from RevenueCat');
        toast.error(t.premium.toast.error);
      }
    } catch (error) {
      console.error('[iOS Purchase Card] ❌ Initialization error:', error);
      toast.error(t.premium.toast.error);
    } finally {
      setIsLoading(false);
      console.log('[iOS Purchase Card] 🏁 Initialization complete');
    }
  };

  const activatePremiumViaRPC = async (): Promise<boolean> => {
    try {
      console.log('[iOS Purchase Card] 🔧 RPC not available, using polling fallback...');
      // RPC function not yet implemented in Supabase
      return await pollForPremiumStatus();
    } catch (err) {
      console.error('[iOS Purchase Card] ❌ Exception calling RPC:', err);
      // Fallback au polling
      console.log('[iOS Purchase Card] 💡 Falling back to polling...');
      return await pollForPremiumStatus();
    }
  };

  const handlePurchase = async () => {
    console.log('[iOS Purchase Card] 🛒 Purchase button clicked by user');
    console.log('[iOS Purchase Card] Product available:', !!product);
    console.log('[iOS Purchase Card] Already purchasing:', isPurchasing);

    if (isPurchasing) {
      console.warn('[iOS Purchase Card] ⚠️ Purchase already in progress, ignoring click');
      return;
    }

    setIsPurchasing(true);
    try {
      console.log('[iOS Purchase Card] 🚀 Calling appleIAPService.purchaseLifetime()...');
      const success = await appleIAPService.purchaseLifetime();

      if (!success) {
        console.log('[iOS Purchase Card] ❌ Purchase cancelled or failed');
      } else {
        console.log('[iOS Purchase Card] ✅ Purchase successful!');
        console.log('[iOS Purchase Card] 🚀 Activating premium via RPC (with polling fallback)...');
        const activated = await activatePremiumViaRPC();

        if (activated) {
          console.log('[iOS Purchase Card] 🎉 Premium successfully activated!');
        } else {
          console.log('[iOS Purchase Card] ⚠️ Premium activation may have failed');
        }
      }
    } catch (error) {
      console.error('[iOS Purchase Card] ❌ Purchase error:', error);
    } finally {
      setIsPurchasing(false);
      console.log('[iOS Purchase Card] 🏁 Purchase flow complete');
    }
  };

  const handleRestore = async () => {
    console.log('[iOS Purchase Card] Restore button clicked');
    setIsRestoring(true);
    try {
      console.log('[iOS Purchase Card] Starting restore flow...');
      const success = await appleIAPService.restorePurchases();
      console.log('[iOS Purchase Card] Restore complete');

      if (success) {
        console.log('[iOS Purchase Card] 🚀 Activating restored premium via RPC (with polling fallback)...');
        const activated = await activatePremiumViaRPC();

        if (activated) {
          console.log('[iOS Purchase Card] 🎉 Premium successfully restored!');
        } else {
          console.log('[iOS Purchase Card] ⚠️ Premium restoration may have failed');
        }
      }
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
          <p className="text-lg md:text-xl font-semibold text-foreground">{t.premium.loading.storeApple}</p>
          <p className="text-sm text-muted-foreground mt-2">{t.premium.loading.connecting}</p>
        </div>
      </Card>
    );
  }

  const displayPrice = product?.priceString || '29,99 €';

  return (
    <Card className="p-8 border-2 border-orange-500 relative shadow-2xl bg-gradient-to-br from-orange-50/50 to-yellow-50/50 md:scale-105 md:z-10">
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1 whitespace-nowrap">
        {t.premium.earlyBirdBadge}
      </div>

      <div className="flex items-center gap-2 mb-2 mt-2">
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

      <p className="text-sm font-semibold text-orange-600 mb-6">
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
        disabled={isPurchasing || !product}
        className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-bold mb-3 min-h-[56px] text-lg"
        size="lg"
      >
        {isPurchasing ? (
          <span className="flex items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin" />
            {t.premium.loading.purchase}
          </span>
        ) : (
          `${t.premium.buttons.buy} - ${displayPrice}`
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

      <p className="text-xs text-muted-foreground text-center mt-4">
        {t.premium.trust.appleNote}
      </p>
    </Card>
  );
}
