
import { useEffect } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { setCanonical } from "@/utils/seo";
import { usePaginatedPosts } from "@/hooks/usePaginatedPosts";
import BlogList from "@/components/blog/BlogList";
import BlogPagination from "@/components/blog/BlogPagination";

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
      <div className="min-h-screen bg-logo-background">
        <div className="mx-auto w-full px-4 max-w-none py-8">
          <div className="text-center text-white">Chargement des articles...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-logo-background">
        <div className="mx-auto w-full px-4 max-w-none py-8">
          <div className="text-center text-white">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{pageNum === 1 ? 'Blog VREAD — Conseils lecture, méthodes et nouveautés' : `Blog VREAD — Page ${pageNum}`}</title>
        <meta name="description" content={pageNum === 1 ? "Tous nos articles VREAD: méthodes, lecture, SEO, nouveautés…" : `Page ${pageNum} des articles VREAD: méthodes, lecture, SEO, nouveautés…`} />
        <meta property="og:title" content={pageNum === 1 ? 'Blog VREAD — Conseils lecture, méthodes et nouveautés' : `Blog VREAD — Page ${pageNum}`} />
        <meta property="og:description" content={pageNum === 1 ? "Tous nos articles VREAD: méthodes, lecture, SEO, nouveautés…" : `Page ${pageNum} des articles VREAD: méthodes, lecture, SEO, nouveautés…`} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={pageNum === 1 ? "https://www.vread.fr/blog" : `https://www.vread.fr/blog/page/${pageNum}`} />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={pageNum === 1 ? 'Blog VREAD — Conseils lecture, méthodes et nouveautés' : `Blog VREAD — Page ${pageNum}`} />
        <meta name="twitter:description" content={pageNum === 1 ? "Tous nos articles VREAD: méthodes, lecture, SEO, nouveautés…" : `Page ${pageNum} des articles VREAD: méthodes, lecture, SEO, nouveautés…`} />
        <link rel="canonical" href={pageNum === 1 ? "https://www.vread.fr/blog" : `https://www.vread.fr/blog/page/${pageNum}`} />
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
      
      <div className="min-h-screen bg-logo-background">
        <div className="mx-auto w-full px-4 max-w-none py-8">
          {/* Bouton retour à l'accueil */}
          <div className="mb-6">
            <Link to="/">
              <Button variant="ghost" className="text-white hover:text-logo-accent">
                <Home className="h-4 w-4 mr-2" />
                Retour à l'accueil
              </Button>
            </Link>
          </div>

          <header className="text-center mb-12">
            <h1 className="text-4xl font-serif font-bold text-white mb-4">Blog VREAD</h1>
            <p className="text-lg text-white/90 max-w-none mx-auto">
              Découvrez nos articles sur la lecture, les livres et la culture littéraire
            </p>
          </header>

          <div className="max-w-none mx-auto">
            <BlogList posts={posts} />
            <BlogPagination currentPage={pageNum} totalPages={totalPages} />
          </div>
        </div>
      </div>
    </>
  );
}
