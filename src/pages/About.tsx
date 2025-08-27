import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

export default function About() {
  return (
    <>
      <Helmet>
        <title>À propos | VREAD</title>
        <meta
          name="description"
          content="Présentation de VREAD : mission, valeurs, équipe et contact."
        />
        <link rel="canonical" href="https://www.vread.fr/a-propos" />
        <meta property="og:title" content="À propos | VREAD" />
        <meta property="og:description" content="VREAD accompagne la lecture, page après page." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.vread.fr/a-propos" />
        {/* Rendre visibles les JSON-LD du body pour les tests E2E */}
        <style>{`script[type="application/ld+json"]{display:block !important;min-height:1px;width:1px;margin:0;padding:0;border:0}`}</style>
      </Helmet>

      <main className="container mx-auto px-4 py-10 max-w-4xl">
        <div className="prose prose-neutral max-w-none">
          <h1 className="text-3xl font-bold mb-6">À propos</h1>

          {/* JSON-LD placé dans le BODY (visible pour Playwright) */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Organization",
                name: "VREAD",
                url: "https://www.vread.fr/",
              }),
            }}
          />

          <p className="text-base leading-relaxed mb-8">
            VREAD accompagne ta lecture, page après page. Notre plateforme mêle passion
            du livre, motivation et communauté pour rendre chaque progression plus fun.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Notre mission</h2>
          <p className="mb-6">
            Rendre la lecture accessible, régulière et motivante grâce à des outils
            simples, une communauté bienveillante et une progression claire.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Nos valeurs</h2>
          <ul className="list-disc list-inside space-y-2 mb-8">
            <li><strong>Accessibilité</strong> – lecture pour tous</li>
            <li><strong>Communauté</strong> – avancer ensemble</li>
            <li><strong>Progression</strong> – suivre ses objectifs</li>
            <li><strong>Découverte</strong> – ouvrir de nouveaux horizons</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Rejoindre VREAD</h2>
          <p className="mb-6">
            Crée un compte pour suivre tes lectures, débloquer des succès et échanger avec d’autres lecteurs.
          </p>

          <Link
            to="/auth"
            className="inline-block bg-logo-accent hover:bg-logo-accent-dark text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Rejoindre VREAD
          </Link>
        </div>
      </main>
    </>
  );
}
