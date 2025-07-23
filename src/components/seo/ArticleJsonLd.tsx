import { Helmet } from "react-helmet-async";

interface ArticleJsonLdProps {
  title: string;
  description: string;
  author: string;
  authorUrl?: string;
  publishedDate: string;
  modifiedDate: string;
  url: string;
  tags?: string[];
  imageUrl?: string;
}

export function ArticleJsonLd({
  title,
  description,
  author,
  authorUrl,
  publishedDate,
  modifiedDate,
  url,
  tags = [],
  imageUrl
}: ArticleJsonLdProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": title,
    "description": description,
    "author": {
      "@type": "Organization",
      "name": author,
      ...(authorUrl && { "url": authorUrl })
    },
    "publisher": {
      "@type": "Organization",
      "name": "READ",
      "url": "https://vread.fr",
      "logo": {
        "@type": "ImageObject",
        "url": "https://vread.fr/READ-logo.png"
      }
    },
    "datePublished": publishedDate,
    "dateModified": modifiedDate,
    "url": url,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": url
    },
    "keywords": tags.length > 0 ? tags.join(", ") : "littérature, lecture, books",
    "articleSection": "Littérature",
    "inLanguage": "fr-FR",
    ...(imageUrl && {
      "image": {
        "@type": "ImageObject",
        "url": imageUrl,
        "width": 1200,
        "height": 630
      }
    })
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
}