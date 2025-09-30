import { Helmet } from "react-helmet-async";

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  noindex?: boolean;
  ogImage?: string;
  ogType?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  tags?: string[];
  section?: string;
}

export function SEOHead({ 
  title, 
  description, 
  canonical,
  noindex = false,
  ogImage,
  ogType = 'website',
  publishedTime,
  modifiedTime,
  author,
  tags = [],
  section
}: SEOProps) {
  const fullCanonical = canonical || (typeof window !== 'undefined' ? window.location.href : '');
  
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={noindex ? "noindex, nofollow" : "index, follow"} />
      <link rel="canonical" href={fullCanonical} />
      
      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={fullCanonical} />
      {ogImage && <meta property="og:image" content={ogImage} />}
      
      {/* Article specific */}
      {ogType === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {ogType === 'article' && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {ogType === 'article' && author && (
        <meta property="article:author" content={author} />
      )}
      {ogType === 'article' && section && (
        <meta property="article:section" content={section} />
      )}
      {ogType === 'article' && tags.map(tag => (
        <meta key={tag} property="article:tag" content={tag} />
      ))}
      
      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {ogImage && <meta name="twitter:image" content={ogImage} />}
      
      {/* Additional SEO */}
      <meta name="author" content={author || "VREAD"} />
      {tags.length > 0 && <meta name="keywords" content={tags.join(", ")} />}
    </Helmet>
  );
}