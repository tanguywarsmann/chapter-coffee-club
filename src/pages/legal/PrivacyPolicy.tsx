import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";

export function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>Politique de Confidentialité - VREAD</title>
        <meta name="description" content="Politique de confidentialité de VREAD : collecte, utilisation et protection de vos données personnelles." />
        <meta name="robots" content="index, follow" />
      </Helmet>

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
              <CardTitle className="text-h3 font-serif text-coffee-darker">
                Politique de Confidentialité
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-coffee max-w-none space-y-6">
              <section>
                <h2 className="text-h4 font-semibold text-coffee-dark">1. Introduction</h2>
                <p className="text-coffee-darker/80">
                  VREAD ("nous", "notre") s'engage à protéger la vie privée de ses utilisateurs.
                  Cette politique décrit comment nous collectons, utilisons et protégeons vos données personnelles
                  lorsque vous utilisez notre application mobile et web.
                </p>
              </section>

              <section>
                <h2 className="text-h4 font-semibold text-coffee-dark">2. Données collectées</h2>
                <p className="text-coffee-darker/80">
                  Nous collectons les données suivantes :
                </p>
                <ul className="text-coffee-darker/80 list-disc pl-6">
                  <li><strong>Informations de compte</strong> : adresse e-mail, nom d'utilisateur</li>
                  <li><strong>Données de lecture</strong> : livres lus, progression, objectifs, statistiques</li>
                  <li><strong>Préférences</strong> : paramètres de l'application, thème, langue</li>
                  <li><strong>Données d'utilisation</strong> : interactions avec l'application, fonctionnalités utilisées</li>
                  <li><strong>Données techniques</strong> : type d'appareil, système d'exploitation, identifiants d'appareil</li>
                </ul>
              </section>

              <section>
                <h2 className="text-h4 font-semibold text-coffee-dark">3. Utilisation des données</h2>
                <p className="text-coffee-darker/80">
                  Vos données sont utilisées pour :
                </p>
                <ul className="text-coffee-darker/80 list-disc pl-6">
                  <li>Fournir et améliorer nos services</li>
                  <li>Personnaliser votre expérience de lecture</li>
                  <li>Suivre votre progression et vos objectifs</li>
                  <li>Communiquer avec vous concernant votre compte</li>
                  <li>Analyser l'utilisation de l'application pour l'améliorer</li>
                  <li>Assurer la sécurité et prévenir les abus</li>
                </ul>
                <p className="text-coffee-darker/80 mt-2">
                  <strong>Nous ne vendons jamais vos données à des tiers.</strong>
                </p>
              </section>

              <section>
                <h2 className="text-h4 font-semibold text-coffee-dark">4. Partage des données</h2>
                <p className="text-coffee-darker/80">
                  Nous partageons vos données uniquement avec :
                </p>
                <ul className="text-coffee-darker/80 list-disc pl-6">
                  <li><strong>Supabase</strong> : hébergement de la base de données (États-Unis)</li>
                  <li><strong>RevenueCat</strong> : gestion des abonnements et achats in-app</li>
                  <li><strong>Fournisseurs de services</strong> : uniquement pour les services essentiels</li>
                </ul>
                <p className="text-coffee-darker/80 mt-2">
                  Ces tiers sont contractuellement tenus de protéger vos données et de les utiliser
                  uniquement pour les services demandés.
                </p>
              </section>

              <section>
                <h2 className="text-h4 font-semibold text-coffee-dark">5. Sécurité des données</h2>
                <p className="text-coffee-darker/80">
                  Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles appropriées :
                </p>
                <ul className="text-coffee-darker/80 list-disc pl-6">
                  <li>Chiffrement des données en transit (HTTPS/TLS)</li>
                  <li>Chiffrement des données au repos</li>
                  <li>Authentification sécurisée</li>
                  <li>Accès limité aux données personnelles</li>
                  <li>Surveillance et journalisation des accès</li>
                </ul>
              </section>

              <section>
                <h2 className="text-h4 font-semibold text-coffee-dark">6. Conservation des données</h2>
                <p className="text-coffee-darker/80">
                  Nous conservons vos données aussi longtemps que votre compte est actif ou que cela est
                  nécessaire pour vous fournir nos services. Lorsque vous supprimez votre compte,
                  vos données personnelles sont supprimées définitivement dans un délai de 30 jours.
                </p>
              </section>

              <section>
                <h2 className="text-h4 font-semibold text-coffee-dark">7. Vos droits (RGPD)</h2>
                <p className="text-coffee-darker/80">
                  Conformément au RGPD, vous disposez des droits suivants :
                </p>
                <ul className="text-coffee-darker/80 list-disc pl-6">
                  <li><strong>Droit d'accès</strong> : consulter vos données personnelles</li>
                  <li><strong>Droit de rectification</strong> : corriger vos données inexactes</li>
                  <li><strong>Droit à l'effacement</strong> : supprimer votre compte et vos données</li>
                  <li><strong>Droit à la portabilité</strong> : recevoir vos données dans un format structuré</li>
                  <li><strong>Droit d'opposition</strong> : vous opposer au traitement de vos données</li>
                  <li><strong>Droit de limitation</strong> : limiter le traitement de vos données</li>
                </ul>
                <p className="text-coffee-darker/80 mt-2">
                  Pour exercer ces droits, vous pouvez :
                </p>
                <ul className="text-coffee-darker/80 list-disc pl-6">
                  <li>Gérer vos données directement depuis les réglages de l'application</li>
                  <li>Nous contacter à : <a href="mailto:privacy@vread.fr" className="text-coffee-dark underline">privacy@vread.fr</a></li>
                </ul>
              </section>

              <section>
                <h2 className="text-h4 font-semibold text-coffee-dark">8. Données des mineurs</h2>
                <p className="text-coffee-darker/80">
                  VREAD est destiné aux utilisateurs de 13 ans et plus. Nous ne collectons pas
                  sciemment de données personnelles d'enfants de moins de 13 ans. Si vous pensez
                  qu'un enfant nous a fourni des données personnelles, contactez-nous immédiatement.
                </p>
              </section>

              <section>
                <h2 className="text-h4 font-semibold text-coffee-dark">9. Cookies et technologies similaires</h2>
                <p className="text-coffee-darker/80">
                  Nous utilisons des cookies et technologies similaires pour améliorer votre expérience,
                  analyser l'utilisation et personnaliser le contenu. Vous pouvez gérer vos préférences
                  de cookies dans les paramètres de votre navigateur.
                </p>
              </section>

              <section>
                <h2 className="text-h4 font-semibold text-coffee-dark">10. Modifications de cette politique</h2>
                <p className="text-coffee-darker/80">
                  Nous pouvons modifier cette politique de confidentialité occasionnellement.
                  Les modifications seront publiées sur cette page avec une date de mise à jour actualisée.
                  Nous vous encourageons à consulter régulièrement cette page.
                </p>
              </section>

              <section>
                <h2 className="text-h4 font-semibold text-coffee-dark">11. Contact et réclamations</h2>
                <p className="text-coffee-darker/80">
                  Pour toute question concernant cette politique ou vos données personnelles :
                </p>
                <ul className="text-coffee-darker/80 list-disc pl-6">
                  <li>Email : <a href="mailto:privacy@vread.fr" className="text-coffee-dark underline">privacy@vread.fr</a></li>
                  <li>Support : <a href="mailto:support@vread.fr" className="text-coffee-dark underline">support@vread.fr</a></li>
                </ul>
                <p className="text-coffee-darker/80 mt-2">
                  Vous avez également le droit de déposer une plainte auprès de la CNIL (Commission Nationale
                  de l'Informatique et des Libertés) si vous estimez que vos droits ne sont pas respectés.
                </p>
              </section>

              <p className="text-body-sm text-coffee-darker/60 border-t pt-4">
                Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}<br />
                Version 1.1
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
