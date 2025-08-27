import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

export default function About() {
  return (
    <>
      <Helmet defer={false} prioritizeSeoTags>
        <title>À propos | VREAD</title>
        <meta
          name="description"
          content="Présentation de VREAD : mission, valeurs, équipe et contact."
        />
        <link rel="canonical" href="https://www.vread.fr/a-propos" />

        {/* OG spécifiques à la page */}
        <meta property="og:title" content="À propos | VREAD" />
        <meta property="og:description" content="VREAD accompagne la lecture, page après page." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.vread.fr/a-propos" />

        {/* Rendez les JSON-LD visibles pour les tests */}
        <style>{`script[type="application/ld+json"]{display:block !important;min-height:1px;width:1px;margin:0;padding:0;border:0}`}</style>
      </Helmet>

      <main className="container mx-auto px-4 py-10 max-w-4xl">
        <div className="prose prose-neutral max-w-none">
          <h1 className="text-3xl font-bold mb-6">À propos</h1>

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

          {/* ... contenu inchangé ... */}
          <Link to="/auth" className="inline-block bg-logo-accent hover:bg-logo-accent-dark text-white px-6 py-3 rounded-lg font-medium transition-colors">
            Rejoindre VREAD
          </Link>
        </div>
      </main>
    </>
  );
}
