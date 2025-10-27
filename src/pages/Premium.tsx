import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Check, Crown, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { AppHeader } from '@/components/layout/AppHeader';
import { Capacitor } from '@capacitor/core';
import { IOSPurchaseCard } from '@/components/premium/IOSPurchaseCard';

export default function Premium() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const isIOS = Capacitor.getPlatform() === 'ios';

  const handleUpgrade = async () => {
    if (!user) {
      window.location.href = '/auth';
      return;
    }

    setIsLoading(true);

    // Stripe Payment Link with user email and ID for webhook
    const stripeUrl = `https://buy.stripe.com/cNi28q73k0oE7u3bBuejK00?prefilled_email=${encodeURIComponent(user.email || '')}&client_reference_id=${user.id}`;
    
    window.location.href = stripeUrl;
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Crown className="h-10 w-10 text-yellow-500" />
              <h1 className="text-4xl md:text-5xl font-bold">Passe en Premium</h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Débloquer toutes les fonctionnalités de VREAD et demander l'ajout de n'importe quel livre
            </p>
          </div>

          {/* Pricing Cards */}
          {isIOS ? (
            // Sur iOS : Afficher uniquement la carte IAP
            <div className="max-w-md mx-auto mb-12">
              <IOSPurchaseCard />
              <p className="text-center text-sm text-muted-foreground mt-6">
                💡 Sur iOS, les achats sont gérés par l'App Store
              </p>
            </div>
          ) : (
            // Sur Web/PWA : Afficher les cartes Stripe
            <div className="grid md:grid-cols-3 gap-8 mb-12">
            {/* CARTE 1 - GRATUIT */}
            <Card className="p-8">
              <h3 className="text-2xl font-bold mb-2">Gratuit</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">0€</span>
                <span className="text-muted-foreground ml-2 block text-sm mt-1">pour toujours</span>
              </div>
              <ul className="space-y-4 mb-6">
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Accès au catalogue de livres classiques</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Validation par checkpoints toutes les ~30 pages</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Suivi de progression et statistiques</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Badges et système de récompenses</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Communauté de lecteurs</span>
                </li>
              </ul>
            </Card>

            {/* CARTE 2 - EARLY BIRD LIFETIME (MISE EN AVANT) */}
            <Card className="p-8 border-2 border-orange-500 relative shadow-2xl bg-gradient-to-br from-orange-50/50 to-yellow-50/50 md:scale-105 md:z-10">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1 whitespace-nowrap">
                🔥 Offre de lancement - Limitée
              </div>
              
              <div className="flex items-center gap-2 mb-2 mt-2">
                <h3 className="text-2xl font-bold">Lifetime - Early Bird</h3>
                <Crown className="h-6 w-6 text-orange-500" />
              </div>
              
              <div className="mb-2">
                <span className="text-sm text-muted-foreground line-through">99€</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-orange-600">29€</span>
                  <Sparkles className="h-6 w-6 text-orange-500 animate-pulse" />
                </div>
                <span className="text-lg font-semibold text-orange-700">Accès à vie</span>
              </div>
              <p className="text-sm font-semibold text-orange-600 mb-6">
                Valable jusqu'au 15 octobre
              </p>
              
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
              
              <Button 
                onClick={() => {
                  if (!user) {
                    window.location.href = '/auth';
                    return;
                  }
                  setIsLoading(true);
                  const stripeUrl = `https://buy.stripe.com/cNi28q73k0oE7u3bBuejK00?prefilled_email=${encodeURIComponent(user.email || '')}&client_reference_id=${user.id}`;
                  window.location.href = stripeUrl;
                }}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-bold"
                size="lg"
              >
                {isLoading ? 'Redirection vers Stripe...' : 'Profiter de l\'offre - 29€ Lifetime'}
              </Button>
            </Card>

            {/* CARTE 3 - PREMIUM ANNUEL */}
            <Card className="p-8 border relative shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-2xl font-bold">Premium Annuel</h3>
                <Crown className="h-6 w-6 text-yellow-500" />
              </div>
              
              <div className="mb-2">
                <span className="text-4xl font-bold">50€</span>
                <span className="text-xl text-muted-foreground">/an</span>
              </div>
              <p className="text-sm text-muted-foreground mb-6">Soit 4,17€/mois</p>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="font-semibold">
                    Demander l'ajout de n'importe quel livre
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>Traitement sous 48-72h</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>Statistiques de lecture avancées</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>Badges exclusifs Premium</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>Support prioritaire</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>Accès anticipé aux nouvelles fonctionnalités</span>
                </li>
              </ul>
              
              <Button 
                onClick={() => {
                  if (!user) {
                    window.location.href = '/auth';
                    return;
                  }
                  setIsLoading(true);
                  const stripeUrl = `https://buy.stripe.com/7sYbJ0fzQ5IY5lV0WQejK01?prefilled_email=${encodeURIComponent(user.email || '')}&client_reference_id=${user.id}`;
                  window.location.href = stripeUrl;
                }}
                disabled={isLoading}
                className="w-full"
                size="lg"
              >
                {isLoading ? 'Redirection vers Stripe...' : 'Passer Premium - 50€/an'}
              </Button>
            </Card>
          </div>
          )}

          {/* Trust Section */}
          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              ✓ Paiement 100% sécurisé par Stripe
            </p>
            <p className="text-sm text-muted-foreground">
              ✓ Annulation possible à tout moment
            </p>
            <p className="text-sm text-muted-foreground">
              ✓ Accès immédiat après paiement
            </p>
          </div>

          {/* FAQ Section */}
          <div className="mt-16 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-center">Questions fréquentes</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Comment fonctionne la demande de livre ?</h3>
                <p className="text-muted-foreground">
                  Une fois Premium, tu peux demander n'importe quel livre via le formulaire dédié. 
                  Nous créons les questions de compréhension et ajoutons le livre ASAP.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Combien de livres puis-je demander ?</h3>
                <p className="text-muted-foreground">
                  Deux livres par deux livres ! Tu dois valider un des deux livres demandés pour en obtenir un autre.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Puis-je annuler mon abonnement ?</h3>
                <p className="text-muted-foreground">
                  Oui, tu peux annuler à tout moment. Tu garderas l'accès Premium jusqu'à la fin de ta période payée.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
