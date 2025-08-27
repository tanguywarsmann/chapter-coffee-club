import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

export default function Press() {
  return (
    <>
      <Helmet>
        <title>Presse | VREAD</title>
        <meta
          name="description"
          content="Espace presse VREAD : kit média, logos, visuels, contacts et communiqués."
        />
        <link rel="canonical" href="https://www.vread.fr/presse" />
        <meta property="og:title" content="Presse | VREAD" />
        <meta property="og:description" content="Kit média, logos, visuels et contact presse VREAD." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.vread.fr/presse" />
        {/* Rendre visibles les JSON-LD du body pour les tests E2E */}
        <style>{`script[type="application/ld+json"]{display:block !important;min-height:1px;width:1px;margin:0;padding:0;border:0}`}</style>
      </Helmet>

      <main className="container mx-auto px-4 py-10 max-w-4xl">
        <div className="prose prose-neutral max-w-none">
          <h1 className="text-3xl font-bold mb-6">Presse</h1>

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
            VREAD accompagne les lecteurs page après page et transforme la lecture en
            expérience sociale et motivante. Retrouvez ici notre kit média.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Kit média</h2>
          <div className="bg-muted p-6 rounded-lg mb-8">
            <strong className="block mb-4">Logos & visuels officiels</strong>
            <div className="space-y-2">
              <a href="/branding/vread-logo.svg" className="block text-logo-accent hover:underline" download>
                Logo VREAD (SVG)
              </a>
              <a href="/branding/vread-logo-192.png" className="block text-logo-accent hover:underline" download>
                Logo VREAD (PNG 192px)
              </a>
              <a href="/branding/vread-logo-512.png" className="block text-logo-accent hover:underline" download>
                Logo VREAD (PNG 512px)
              </a>
              <a href="/branding/vread-logo-1024-q80.webp" className="block text-logo-accent hover:underline" download>
                Logo VREAD (WebP 1024px)
              </a>
            </div>
          </div>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Contact presse</h2>
          <p className="mb-2">Pour toute demande média, contactez-nous :</p>
          <p className="mb-8"><strong>Email :</strong> contact@vread.fr</p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Communiqués & actus</h2>
          <p className="mb-8">
            Consultez notre <Link to="/blog" className="text-logo-accent hover:underline">blog</Link> pour les dernières annonces.
          </p>

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