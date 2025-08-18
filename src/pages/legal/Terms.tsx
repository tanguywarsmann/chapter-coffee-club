import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function Terms() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background p-4">
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
              <h2 className="text-xl font-semibold text-coffee-dark">5. Modification des conditions</h2>
              <p className="text-coffee-darker/80">
                Ces conditions peuvent être modifiées. Les utilisateurs seront notifiés 
                des changements importants.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-coffee-dark">6. Contact</h2>
              <p className="text-coffee-darker/80">
                Pour toute question : <a href="mailto:contact@vread.fr" className="text-coffee-dark underline">contact@vread.fr</a>
              </p>
            </section>

            <p className="text-sm text-coffee-darker/60 border-t pt-4">
              Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}