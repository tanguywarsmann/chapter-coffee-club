
import { BlogPost } from "@/services/blogService";

interface ArticleSchemaProps {
  post: BlogPost;
}

export function ArticleSchema({ post }: ArticleSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "description": post.excerpt || "",
    "author": {
      "@type": "Organization",
      "name": post.author || "READ"
    },
    "publisher": {
      "@type": "Organization",
      "name": "READ",
      "logo": {
        "@type": "ImageObject",
        "url": "https://vread.fr/READ-logo.png"
      }
    },
    "datePublished": post.created_at,
    "dateModified": post.updated_at,
    "url": `https://vread.fr/blog/${post.slug}`,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://vread.fr/blog/${post.slug}`
    },
    "keywords": post.tags?.join(", ") || "",
    "articleSection": "Littérature",
    "image": post.imageUrl || "https://vread.fr/READ-logo.png"
  };

  return (
    <script 
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
