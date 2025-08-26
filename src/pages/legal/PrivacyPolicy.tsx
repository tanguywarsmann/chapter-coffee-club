import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function PrivacyPolicy() {
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
              Politique de Confidentialité
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-coffee max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-coffee-dark">1. Collecte des données</h2>
              <p className="text-coffee-darker/80">
                VREAD collecte uniquement les données nécessaires au fonctionnement de l'application :
                email, progression de lecture, préférences utilisateur.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-coffee-dark">2. Utilisation des données</h2>
              <p className="text-coffee-darker/80">
                Vos données sont utilisées pour personnaliser votre expérience de lecture et 
                suivre votre progression. Aucune donnée n'est vendue à des tiers.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-coffee-dark">3. Hébergement</h2>
              <p className="text-coffee-darker/80">
                Vos données sont hébergées par Supabase (États-Unis) avec chiffrement en transit et au repos.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-coffee-dark">4. Vos droits</h2>
              <p className="text-coffee-darker/80">
                Vous pouvez accéder, modifier ou supprimer vos données à tout moment depuis les réglages 
                de l'application. La suppression de compte est définitive et irréversible.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-coffee-dark">5. Contact</h2>
              <p className="text-coffee-darker/80">
                Pour toute question : <a href="mailto:privacy@vread.fr" className="text-coffee-dark underline">privacy@vread.fr</a>
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