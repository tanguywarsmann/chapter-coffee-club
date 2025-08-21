import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { PublicLayout } from "@/components/layout/PublicLayout";

export default function About() {
  return (
    <PublicLayout>
      <Helmet>
        <title>VREAD - À propos de l'application de lecture</title>
        <meta name="description" content="VREAD est l'application qui t'accompagne dans ta lecture, page après page. Découvrez notre mission et notre équipe." />
        <link rel="canonical" href="https://www.vread.fr/a-propos" />
        
        <meta property="og:title" content="VREAD - À propos" />
        <meta property="og:description" content="VREAD est l'application qui t'accompagne dans ta lecture, page après page." />
        <meta property="og:url" content="https://www.vread.fr/a-propos" />
        <meta property="og:image" content="https://www.vread.fr/branding/vread-logo-512.png" />
        <meta property="og:locale" content="fr_FR" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="VREAD - À propos" />
        <meta name="twitter:description" content="VREAD est l'application qui t'accompagne dans ta lecture, page après page." />
        <meta name="twitter:image" content="https://www.vread.fr/branding/vread-logo-512.png" />
        <meta name="twitter:url" content="https://www.vread.fr/a-propos" />
        
        <script type="application/ld+json">
          {`{"@context":"https://schema.org","@type":"Organization","name":"VREAD","url":"https://www.vread.fr/"}`}
        </script>
      </Helmet>

      <main className="container mx-auto px-4 py-10 max-w-4xl">
        <div className="prose prose-neutral max-w-none">
          <h1 className="text-h1 text-logo-accent mb-6">VREAD - À propos de notre mission</h1>
          
          <p className="text-body-lg mb-8">
            VREAD est l'application innovante qui révolutionne votre expérience de lecture en vous accompagnant page après page dans votre parcours littéraire. Notre plateforme combine passion pour la lecture et technologie moderne pour créer une communauté de lecteurs engagés.
          </p>
          
          <h2 className="text-h2 text-foreground mb-4 mt-8">Notre mission</h2>
          <p className="text-body mb-6">
            Nous croyons que la lecture doit être accessible, motivante et sociale. VREAD transforme la lecture solitaire en une aventure collective où chaque page tournée devient une victoire partagée.
          </p>
          
          <h2 className="text-h2 text-foreground mb-4 mt-8">Nos valeurs</h2>
          <ul className="list-disc list-inside space-y-2 mb-6">
            <li>
              <strong>Accessibilité :</strong> Rendre la lecture accessible à tous, quel que soit le niveau
            </li>
            <li>
              <strong>Communauté :</strong> Créer des liens entre lecteurs passionnés
            </li>
            <li>
              <strong>Progression :</strong> Accompagner chaque lecteur dans son évolution
            </li>
            <li>
              <strong>Découverte :</strong> Ouvrir de nouveaux horizons littéraires
            </li>
          </ul>
          
          <h2 className="text-h2 text-foreground mb-4 mt-8">L'équipe VREAD</h2>
          <p className="text-body mb-8">
            Notre équipe est composée de passionnés de littérature et d'experts en technologie, unis par la vision commune de démocratiser la lecture et de créer la plus belle communauté de lecteurs francophones.
          </p>
          
          <Link 
            to="/auth" 
            className="inline-block bg-logo-accent hover:bg-logo-accent-dark text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Rejoindre VREAD
          </Link>
        </div>
      </main>
    </PublicLayout>
  );
}