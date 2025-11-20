import AppFooter from "@/components/layout/AppFooter";
import { SEOHead } from "@/components/seo/SEOHead";
import { Link } from "react-router-dom";

export default function About() {
  return (
    <div className="flex flex-col min-h-screen">
      <SEOHead
        title="VREAD · À propos — L'application qui transforme votre lecture"
        description="Découvrez VREAD, l'application révolutionnaire qui gamifie votre lecture grâce à des questions IA, un système de progression motivant et une communauté de lecteurs passionnés. Transformez chaque page en succès !"
        canonical="https://www.vread.fr/a-propos"
        tags={["lecture", "application", "motivation", "communauté", "livres", "gamification"]}
      />

      <main className="container mx-auto px-4 py-10 max-w-4xl flex-1">
        <div className="prose prose-neutral max-w-none">
          <h1 className="text-4xl font-bold mb-6">VREAD : Révolutionnez votre façon de lire</h1>

          {/* ... content ... */}

          <div className="bg-logo-background text-white p-8 rounded-lg text-center mt-12">
            <h3 className="text-2xl font-bold mb-4">Prêt à transformer votre lecture ?</h3>
            <p className="mb-6 text-lg">
              Rejoignez des milliers de lecteurs qui ont déjà révolutionné leurs habitudes de lecture avec VREAD.
            </p>
            <Link
              to="/auth"
              onClick={() => window.scrollTo({ top: 0, behavior: 'instant' })}
              className="inline-block bg-white text-logo-background hover:bg-gray-100 px-8 py-4 rounded-lg font-bold text-lg transition-colors shadow-lg"
            >
              Créer mon compte gratuitement
            </Link>
          </div>
        </div>
      </main>

      <AppFooter />
    </div>
  );
}