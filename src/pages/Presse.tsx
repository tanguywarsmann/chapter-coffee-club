import { Helmet } from "react-helmet-async";

export default function Presse() {
  return (
    <main className="container mx-auto max-w-3xl px-4 py-10">
      <Helmet>
        <title>Presse – VREAD</title>
        <link rel="canonical" href="https://www.vread.fr/presse" />
      </Helmet>

      <h1 className="text-3xl font-bold mb-6">Presse</h1>
      
      <Helmet>
        <style>{`script[type="application/ld+json"]{display:block !important;min-height:1px;width:1px;margin:0;padding:0;border:0}`}</style>
      </Helmet>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "VREAD",
            "url": "https://www.vread.fr/"
          })
        }}
      />
      
      <p className="text-base leading-relaxed">
        Dossier de présentation, chiffres clés, visuels officiels, et contact.
      </p>
    </main>
  );
}