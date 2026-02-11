import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AppFooter from "@/components/layout/AppFooter";

export function Terms() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="p-4 flex-1">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate(-1)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-serif text-coffee-darker">
                Conditions d'Utilisation
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-coffee max-w-none space-y-6">
              <section>
                <h2 className="text-xl font-semibold text-coffee-dark">1. Service</h2>
                <p className="text-coffee-darker/80">
                  VREAD est une application de suivi de lecture qui vous accompagne dans votre 
                  progression littéraire page après page.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-coffee-dark">2. Utilisation acceptable</h2>
                <p className="text-coffee-darker/80">
                  Vous vous engagez à utiliser VREAD de manière responsable, sans perturber 
                  le service ou porter atteinte aux autres utilisateurs.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-coffee-dark">3. Propriété intellectuelle</h2>
                <p className="text-coffee-darker/80">
                  Le contenu et la technologie de VREAD sont protégés par les droits d'auteur. 
                  Les livres référencés appartiennent à leurs auteurs respectifs.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-coffee-dark">4. Limitation de responsabilité</h2>
                <p className="text-coffee-darker/80">
                  VREAD est fourni "en l'état". Nous nous efforçons d'assurer la disponibilité 
                  du service mais ne garantissons pas son fonctionnement ininterrompu.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-coffee-dark">5. Achats In-App</h2>
                <div className="space-y-4 text-coffee-darker/80">
                  <p>VREAD propose plusieurs formules Premium :</p>
                  
                  <div>
                    <h3 className="text-lg font-medium text-coffee-dark mb-2">Abonnement mensuel</h3>
                    <ul className="list-disc ml-6 space-y-1">
                      <li>Nom : VREAD Premium Mensuel</li>
                      <li>Durée : 1 mois (renouvellement automatique)</li>
                      <li>Prix : <strong>4,99€/mois</strong></li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-coffee-dark mb-2">Abonnement annuel</h3>
                    <ul className="list-disc ml-6 space-y-1">
                      <li>Nom : VREAD Premium Annuel</li>
                      <li>Durée : 1 an (renouvellement automatique)</li>
                      <li>Prix : <strong>39,99€/an</strong></li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-coffee-dark mb-2">Achat unique (Lifetime)</h3>
                    <ul className="list-disc ml-6 space-y-1">
                      <li>Nom : VREAD Premium à vie</li>
                      <li>Prix : <strong>39,99€ jusqu'au 15 février</strong> (paiement unique, accès illimité)</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-coffee-dark mb-2">Conditions des abonnements auto-renouvelables</h3>
                    <ul className="list-disc ml-6 space-y-1">
                      <li>Le paiement est débité sur votre compte Apple lors de la confirmation d'achat</li>
                      <li>L'abonnement se renouvelle automatiquement sauf annulation au moins 24 heures avant la fin de la période en cours</li>
                      <li>Le compte est débité pour le renouvellement dans les 24 heures précédant la fin de la période en cours</li>
                      <li>Vous pouvez gérer et annuler vos abonnements dans les Réglages de votre compte App Store après l'achat</li>
                    </ul>
                  </div>
                  
                  <p>
                    <strong>Politique de remboursement :</strong> Les achats effectués via Apple App Store 
                    sont soumis à la politique de remboursement d'Apple. Pour demander un remboursement, 
                    contactez le support Apple via{" "}
                    <a 
                      href="https://reportaproblem.apple.com/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-coffee-dark underline"
                    >
                      reportaproblem.apple.com
                    </a>
                  </p>
                  <p>
                    <strong>Support :</strong> Pour toute question concernant votre abonnement, 
                    contactez-nous à{" "}
                    <a href="mailto:tanguy@vread.fr" className="text-coffee-dark underline">
                      tanguy@vread.fr
                    </a>
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-coffee-dark">6. Modification des conditions</h2>
                <p className="text-coffee-darker/80">
                  Ces conditions peuvent être modifiées. Les utilisateurs seront notifiés 
                  des changements importants.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-coffee-dark">7. Contact</h2>
                <p className="text-coffee-darker/80">
                  Pour toute question : <a href="mailto:tanguy@vread.fr" className="text-coffee-dark underline">tanguy@vread.fr</a>
                </p>
              </section>

              <p className="text-sm text-coffee-darker/60 border-t pt-4">
                Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      <AppFooter />
    </div>
  );
}
