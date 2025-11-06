import { useParams, Navigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { setCanonical } from "@/utils/seo";
import { usePaginatedPosts } from "@/hooks/usePaginatedPosts";
import BlogList from "@/components/blog/BlogList";
import BlogPagination from "@/components/blog/BlogPagination";
import { useEffect } from "react";

export default function BlogPage() {
  const { page: pageParam } = useParams<{ page: string }>();
  const page = parseInt(pageParam || '1', 10);
  
  // Rediriger la page 1 vers /blog
  if (page === 1) {
    return <Navigate to="/blog" replace />;
  }

  // Vérifier que le numéro de page est valide
  if (isNaN(page) || page < 1) {
    return <Navigate to="/blog" replace />;
  }

  const { posts, total, totalPages, isLoading, error } = usePaginatedPosts(page, 20);

  useEffect(() => {
    setCanonical(`https://www.vread.fr/blog/page/${page}`);
  }, [page]);

  // Si la page demandée dépasse le nombre total de pages, rediriger vers /blog
  if (!isLoading && totalPages > 0 && page > totalPages) {
    return <Navigate to="/blog" replace />;
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
        <title>Blog VREAD — Page {page}</title>
        <meta name="description" content={`Suite des articles VREAD – Page ${page}.`} />
        <meta property="og:title" content={`Blog VREAD — Page ${page}`} />
        <meta property="og:description" content={`Suite des articles VREAD – Page ${page}.`} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://www.vread.fr/blog/page/${page}`} />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={`Blog VREAD — Page ${page}`} />
        <meta name="twitter:description" content={`Suite des articles VREAD – Page ${page}.`} />
        <link rel="canonical" href={`https://www.vread.fr/blog/page/${page}`} />
        
        {/* Schema.org structured data for ItemList */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            "name": `Blog VREAD - Page ${page}`,
            "description": `Articles du blog VREAD - Page ${page}`,
            "url": `https://www.vread.fr/blog/page/${page}`,
            "publisher": {
              "@type": "Organization",
              "name": "VREAD",
              "url": "https://www.vread.fr"
            },
            "itemListElement": posts.map((post, i) => ({
              "@type": "ListItem",
              "position": (page - 1) * 20 + i + 1,
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
            <p className="text-sm text-white/70 mt-2">Page {page}</p>
          </header>

          <div className="max-w-none mx-auto">
            <BlogList posts={posts} />
            <BlogPagination currentPage={page} totalPages={totalPages} />
          </div>
        </div>
      </div>
    </>
  );
}