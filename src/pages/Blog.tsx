import { useEffect } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { setCanonical } from "@/utils/seo";
import { usePaginatedPosts } from "@/hooks/usePaginatedPosts";
import BlogList from "@/components/blog/BlogList";
import BlogPagination from "@/components/blog/BlogPagination";
import AppFooter from "@/components/layout/AppFooter";

export default function Blog() {
  const params = useParams();
  const pageNum = Math.max(1, Number(params.page ?? 1) || 1);
  const pageSize = 12;
  
  const { posts, totalPages, total, isLoading, error } = usePaginatedPosts(pageNum, pageSize);

  useEffect(() => {
    const canonical = pageNum === 1 ? 'https://www.vread.fr/blog' : `https://www.vread.fr/blog/page/${pageNum}`;
    setCanonical(canonical);
  }, [pageNum]);

  // Si on tape une page au-delà du dernier index, rediriger vers la dernière page
  if (pageNum > totalPages && total > 0) {
    return <Navigate to={`/blog/page/${totalPages}`} replace />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-logo-background flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-white">Chargement des articles...</div>
        </div>
        <AppFooter />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-logo-background flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-white">{error}</div>
        </div>
        <AppFooter />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Helmet>
        <title>{pageNum === 1 ? 'Blog VREAD | Conseils et méthodes pour mieux lire' : `Blog VREAD — Page ${pageNum}`}</title>
        <meta name="description" content={pageNum === 1 ? "Découvrez des conseils scientifiques et des méthodes concrètes pour améliorer votre lecture, créer une routine et retenir ce que vous lisez." : `Page ${pageNum} - Découvrez nos articles pour améliorer votre lecture`} />
        <link rel="canonical" href={pageNum === 1 ? "https://www.vread.fr/blog" : `https://www.vread.fr/blog/page/${pageNum}`} />
        
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={pageNum === 1 ? 'Blog VREAD | Conseils et méthodes pour mieux lire' : `Blog VREAD — Page ${pageNum}`} />
        <meta property="og:description" content={pageNum === 1 ? "Découvrez des conseils scientifiques et des méthodes concrètes pour améliorer votre lecture, créer une routine et retenir ce que vous lisez." : `Page ${pageNum} - Découvrez nos articles pour améliorer votre lecture`} />
        <meta property="og:url" content={pageNum === 1 ? "https://www.vread.fr/blog" : `https://www.vread.fr/blog/page/${pageNum}`} />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={pageNum === 1 ? 'Blog VREAD | Conseils et méthodes pour mieux lire' : `Blog VREAD — Page ${pageNum}`} />
        <meta name="twitter:description" content={pageNum === 1 ? "Découvrez des conseils scientifiques et des méthodes concrètes pour améliorer votre lecture, créer une routine et retenir ce que vous lisez." : `Page ${pageNum} - Découvrez nos articles pour améliorer votre lecture`} />
        {pageNum > 1 && (
          <link rel="prev" href={pageNum - 1 === 1 ? "https://www.vread.fr/blog" : `https://www.vread.fr/blog/page/${pageNum - 1}`} />
        )}
        {pageNum < totalPages && (
          <link rel="next" href={`https://www.vread.fr/blog/page/${pageNum + 1}`} />
        )}
        
        {/* Schema.org structured data for ItemList */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            "name": "Blog VREAD",
            "description": "Tous nos articles VREAD: méthodes, lecture, SEO, nouveautés…",
            "url": "https://www.vread.fr/blog",
            "publisher": {
              "@type": "Organization",
              "name": "VREAD",
              "url": "https://www.vread.fr"
            },
            "itemListElement": posts.map((post, i) => ({
              "@type": "ListItem",
              "position": i + 1,
              "url": `https://www.vread.fr/blog/${post.slug}`
            }))
          })}
        </script>
      </Helmet>
      
      <div className="flex-1 bg-logo-background">
        <div className="container mx-auto px-4 py-12">
          {/* Bouton retour à l'accueil */}
          <div className="mb-8">
            <Link to="/">
              <Button variant="ghost" className="text-white hover:text-logo-accent group transition-all duration-300">
                <Home className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Retour à l'accueil
              </Button>
            </Link>
          </div>

          <header className="text-center mb-16 space-y-4">
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-4 tracking-tight">
              Blog VREAD
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto font-light leading-relaxed">
              Découvrez nos articles sur la lecture, les livres et la culture littéraire
            </p>
            <div className="w-24 h-1 bg-logo-accent mx-auto rounded-full mt-8 opacity-80" />
          </header>

          <div className="max-w-7xl mx-auto">
            <BlogList posts={posts} />
            <div className="mt-16">
              <BlogPagination currentPage={pageNum} totalPages={totalPages} />
            </div>
          </div>
        </div>
      </div>

      <AppFooter />
    </div>
  );
}
