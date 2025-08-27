import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function Press() {
  const url = 'https://www.vread.fr/presse';
  return (
    <main className="max-w-3xl mx-auto p-6">
      <Helmet>
        <title>Presse | VREAD</title>
        <meta name="description" content="Kit média, logos et contact presse VREAD." />
        <link rel="canonical" href={url} />
        <meta property="og:title" content="Presse | VREAD" />
        <meta property="og:url" content={url} />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "url": url,
            "name": "Presse VREAD"
          })}
        </script>
      </Helmet>
      <h1 className="text-3xl font-semibold mb-4">Presse</h1>
      <p>Téléchargez les logos officiels de VREAD :</p>
      <ul className="list-disc pl-6">
        <li><a className="underline" href="/branding/vread-logo-192.png" download>Logo PNG 192px</a></li>
        <li><a className="underline" href="/branding/vread-logo-512.png" download>Logo PNG 512px</a></li>
        <li><a className="underline" href="/branding/vread-logo-1024-q80.webp" download>Logo WebP 1024px</a></li>
      </ul>
    </main>
  );
}
