import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/i18n/LanguageContext';
import { Button } from '@/components/ui/button';
import { Check, Crown, Sparkles, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { AppHeader } from '@/components/layout/AppHeader';
import { Capacitor } from '@capacitor/core';
import { IOSPurchaseCard } from '@/components/premium/IOSPurchaseCard';
import { AndroidPurchaseCard } from '@/components/premium/AndroidPurchaseCard';

export default function Premium() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const platform = Capacitor.getPlatform();
  const isIOS = platform === 'ios';
  const isAndroid = platform === 'android';

  useEffect(() => {
    console.log('[Premium Page] Component mounted');
    console.log('[Premium Page] Platform:', platform);
    console.log('[Premium Page] User authenticated:', !!user);
  }, [user, platform]);

  const handleUpgrade = async (stripeUrl: string) => {
    console.log('[Premium Page] Purchase button clicked');
    
    if (!user) {
      console.log('[Premium Page] User not authenticated, redirecting to auth');
      window.location.href = '/auth';
      return;
    }

    console.log('[Premium Page] Starting purchase flow for user:', user.id);
    setIsPurchasing(true);
    setIsLoading(true);

    const fullUrl = `${stripeUrl}?prefilled_email=${encodeURIComponent(user.email || '')}&client_reference_id=${user.id}`;
    console.log('[Premium Page] Redirecting to Stripe...');
    window.location.href = fullUrl;
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-5xl mx-auto">
          {/* Hero Section - iPad Optimized */}
          <div className="text-center mb-8 md:mb-12 px-4">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Crown className="h-12 w-12 md:h-14 md:w-14 text-yellow-500" />
              <h1 className="text-4xl md:text-6xl font-bold">{t.premium.title}</h1>
            </div>
            <div className="bg-gradient-to-r from-orange-500/10 to-yellow-500/10 rounded-xl p-6 md:p-8 mb-6">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-orange-600">
                {t.premium.earlyBirdTitle}
              </h2>
              <p className="text-lg md:text-xl text-foreground leading-relaxed max-w-3xl mx-auto font-medium">
                {t.premium.earlyBirdDesc}
              </p>
            </div>
            {!user && (
              <div className="bg-blue-500/10 border-2 border-blue-500 rounded-lg p-4 md:p-6 max-w-2xl mx-auto">
                <p className="text-base md:text-lg font-semibold text-blue-600">
                  {t.premium.loginRequired}
                </p>
                <p className="text-sm md:text-base text-muted-foreground mt-2">
                  {t.premium.loginRequiredDesc}
                </p>
              </div>
            )}
          </div>

          {/* Pricing Cards */}
          {isIOS ? (
            <div className="max-w-md mx-auto mb-12">
              <IOSPurchaseCard />
              <p className="text-center text-sm text-muted-foreground mt-6">
                {t.premium.iosPurchaseNote}
              </p>
            </div>
          ) : isAndroid ? (
            <div className="max-w-md mx-auto mb-12">
              <AndroidPurchaseCard />
              <p className="text-center text-sm text-muted-foreground mt-6">
                {t.premium.androidPurchaseNote}
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8 mb-12">
            {/* CARTE 1 - GRATUIT */}
            <Card className="p-8">
              <h3 className="text-2xl font-bold mb-2">{t.premium.cards.free.title}</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">{t.premium.cards.free.price}</span>
                <span className="text-muted-foreground ml-2 block text-sm mt-1">{t.premium.cards.free.period}</span>
              </div>
              <ul className="space-y-4 mb-6">
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>{t.premium.cards.free.features.catalog}</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>{t.premium.cards.free.features.checkpoints}</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>{t.premium.cards.free.features.tracking}</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>{t.premium.cards.free.features.badges}</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>{t.premium.cards.free.features.community}</span>
                </li>
              </ul>
            </Card>

            {/* CARTE 2 - EARLY BIRD LIFETIME */}
            <Card className="p-8 border-2 border-orange-500 relative shadow-2xl bg-gradient-to-br from-orange-50/50 to-yellow-50/50 md:scale-105 md:z-10">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1 whitespace-nowrap">
                {t.premium.earlyBirdBadge}
              </div>
              
              <div className="flex items-center gap-2 mb-2 mt-2">
                <h3 className="text-2xl font-bold">{t.premium.cards.lifetime.title}</h3>
                <Crown className="h-6 w-6 text-orange-500" />
              </div>
              
              <div className="mb-2">
                <span className="text-sm text-muted-foreground line-through">{t.premium.cards.lifetime.originalPrice}</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-orange-600">{t.premium.cards.lifetime.price}</span>
                  <Sparkles className="h-6 w-6 text-orange-500 animate-pulse" />
                </div>
                <span className="text-lg font-semibold text-orange-700">{t.premium.cards.lifetime.period}</span>
              </div>
              <p className="text-sm font-semibold text-orange-600 mb-6">
                {t.premium.cards.lifetime.validUntil}
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
                onClick={() => handleUpgrade('https://buy.stripe.com/cNi28q73k0oE7u3bBuejK00')}
                disabled={isPurchasing}
                className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-bold min-h-[56px] text-lg"
                size="lg"
              >
                {isPurchasing ? (
                  <span className="flex items-center gap-3">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    {t.premium.loading.purchase}
                  </span>
                ) : (
                  t.premium.cards.lifetime.priceWithValue.replace('{price}', '29€')
                )}
              </Button>
            </Card>

            {/* CARTE 3 - PREMIUM ANNUEL */}
            <Card className="p-8 border relative shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-2xl font-bold">{t.premium.cards.annual.title}</h3>
                <Crown className="h-6 w-6 text-yellow-500" />
              </div>
              
              <div className="mb-2">
                <span className="text-4xl font-bold">{t.premium.cards.annual.price}</span>
                <span className="text-xl text-muted-foreground">{t.premium.cards.annual.period}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-6">{t.premium.cards.annual.pricePerMonth}</p>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="font-semibold">{t.premium.cards.lifetime.features.requestBooks}</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>{t.premium.cards.lifetime.features.processing}</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>{t.premium.cards.lifetime.features.advancedStats}</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>{t.premium.cards.lifetime.features.exclusiveBadges}</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>{t.premium.cards.lifetime.features.prioritySupport}</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>{t.premium.cards.lifetime.features.earlyAccess}</span>
                </li>
              </ul>
              
              <Button 
                onClick={() => handleUpgrade('https://buy.stripe.com/7sYbJ0fzQ5IY5lV0WQejK01')}
                disabled={isPurchasing}
                className="w-full min-h-[56px] text-lg"
                size="lg"
              >
                {isPurchasing ? (
                  <span className="flex items-center gap-3">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    {t.premium.loading.purchase}
                  </span>
                ) : (
                  t.premium.cards.annual.priceWithValue.replace('{price}', '50€')
                )}
              </Button>
            </Card>
          </div>
          )}

          {/* Trust Section */}
          {!isIOS && !isAndroid && (
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">{t.premium.trust.securePayment}</p>
              <p className="text-sm text-muted-foreground">{t.premium.trust.cancelAnytime}</p>
              <p className="text-sm text-muted-foreground">{t.premium.trust.immediateAccess}</p>
            </div>
          )}

          {/* FAQ Section */}
          <div className="mt-16 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-center">{t.premium.faq.title}</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">{t.premium.faq.howItWorks.question}</h3>
                <p className="text-muted-foreground">{t.premium.faq.howItWorks.answer}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">{t.premium.faq.howMany.question}</h3>
                <p className="text-muted-foreground">{t.premium.faq.howMany.answer}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">{t.premium.faq.cancel.question}</h3>
                <p className="text-muted-foreground">{t.premium.faq.cancel.answer}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
