import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function About() {
  const url = 'https://www.vread.fr/a-propos';
  return (
    <main className="max-w-3xl mx-auto p-6">
      <Helmet>
        <title>À propos | VREAD</title>
        <meta name="description" content="Mission et équipe VREAD : aider chacun à lire mieux et plus souvent." />
        <link rel="canonical" href={url} />
        <meta property="og:title" content="À propos | VREAD" />
        <meta property="og:url" content={url} />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "AboutPage",
            "url": url,
            "name": "À propos",
            "description": "Mission et équipe VREAD."
          })}
        </script>
      </Helmet>
      <h1 className="text-3xl font-semibold mb-4">À propos</h1>
      <p>VREAD transforme la lecture en parcours mesurable, avec des checkpoints et des questions de validation pour garder le fil.</p>
    </main>
  );
}
