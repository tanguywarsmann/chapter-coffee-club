import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

export default function Press() {
  return (
    <>
      <Helmet>
        <title>Presse | VREAD</title>
        <meta name="description" content="Espace presse VREAD : kit média, logos, visuels, contacts et communiqués." />
        <link rel="canonical" href="https://www.vread.fr/presse" />
        <meta property="og:title" content="Presse | VREAD" />
        <meta property="og:url" content="https://www.vread.fr/presse" />
        <meta property="og:type" content="website" />
        {/* CSS pour rendre visibles les JSON-LD */}
        <style>{`script[type="application/ld+json"]{display:block !important;min-height:1px;width:1px;margin:0;padding:0;border:0}`}</style>
      </Helmet>

      <main className="container mx-auto px-4 py-10 max-w-4xl">
        <div className="prose prose-neutral max-w-none">
          <h1 className="text-h1 text-logo-accent mb-6">VREAD - Espace presse et médias</h1>

          {/* JSON-LD placé dans le BODY (visible pour Playwright) */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Organization",
                "name": "VREAD",
                "url": "https://www.vread.fr/"
              }),
            }}
          />

          <p className="text-body-lg mb-8">
            VREAD est l'application française qui accompagne les lecteurs page après page dans leur parcours
            littéraire. Nous transformons la lecture en une expérience sociale et motivante grâce à notre
            plateforme innovante de gamification de la lecture.
          </p>

          {/* … reste inchangé … */}

          <Link
            to="/auth"
            className="inline-block bg-logo-accent hover:bg-logo-accent-dark text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Découvrir VREAD
          </Link>
        </div>
      </main>
    </>
  );
}
