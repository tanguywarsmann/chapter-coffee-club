
export function WebsiteSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "READ",
    "url": "https://vread.fr",
    "description": "Plateforme de lecture intelligente pour découvrir et lire les grands classiques littéraires",
    "publisher": {
      "@type": "Organization",
      "name": "READ",
      "logo": {
        "@type": "ImageObject",
        "url": "https://vread.fr/READ-logo.png"
      }
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://vread.fr/blog?search={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <script 
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
