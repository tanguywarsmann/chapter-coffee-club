import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Check, Crown, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { AppHeader } from '@/components/layout/AppHeader';

export default function Premium() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgrade = async () => {
    if (!user) {
      window.location.href = '/auth';
      return;
    }

    setIsLoading(true);

    // TODO: Replace with actual Stripe Payment Link from dashboard
    // Add user.id as client_reference_id for webhook
    const stripeUrl = `https://buy.stripe.com/test_VOTRE_PAYMENT_LINK?prefilled_email=${encodeURIComponent(user.email || '')}&client_reference_id=${user.id}`;
    
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
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Free Plan */}
            <Card className="p-8">
              <h3 className="text-2xl font-bold mb-2">Gratuit</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">0€</span>
                <span className="text-muted-foreground ml-2">pour toujours</span>
              </div>
              <ul className="space-y-4 mb-6">
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Accès au catalogue de livres classiques</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Validation par checkpoints tous les ~20 pages</span>
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

            {/* Premium Plan */}
            <Card className="p-8 border-2 border-primary relative shadow-lg">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                <Sparkles className="h-4 w-4" />
                Recommandé
              </div>
              
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-2xl font-bold">Premium</h3>
                <Crown className="h-6 w-6 text-yellow-500" />
              </div>
              
              <div className="mb-2">
                <span className="text-4xl font-bold">50€</span>
                <span className="text-xl text-muted-foreground">/an</span>
              </div>
              <p className="text-sm text-muted-foreground mb-6">Soit 4,17€/mois</p>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="font-medium">Tout du plan Gratuit</span>
                </li>
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
                onClick={handleUpgrade} 
                disabled={isLoading}
                className="w-full"
                size="lg"
              >
                {isLoading ? 'Redirection vers Stripe...' : 'Passer Premium'}
              </Button>
            </Card>
          </div>

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
                  Nous créons les questions de compréhension et ajoutons le livre sous 48-72h.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Combien de livres puis-je demander ?</h3>
                <p className="text-muted-foreground">
                  Illimité ! Tu peux demander autant de livres que tu veux pendant toute la durée de ton abonnement.
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
