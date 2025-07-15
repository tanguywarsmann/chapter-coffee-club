
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, User, Home } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { blogService } from "@/services/blogService";
import type { BlogPost } from "@/services/blogService";

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const data = await blogService.getPublishedPosts();
        setPosts(data);
        setError(null);
      } catch (error) {
        setError('Erreur lors du chargement des articles');
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-logo-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-white">Chargement des articles...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-logo-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-white">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Blog READ — Découvrez nos articles sur la lecture</title>
        <meta name="description" content="Découvrez nos articles sur la lecture, les livres et la culture littéraire. Blog de l'application READ." />
        <meta property="og:title" content="Blog READ — Découvrez nos articles sur la lecture" />
        <meta property="og:description" content="Découvrez nos articles sur la lecture, les livres et la culture littéraire. Blog de l'application READ." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://vread.fr/blog" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Blog READ — Découvrez nos articles sur la lecture" />
        <meta name="twitter:description" content="Découvrez nos articles sur la lecture, les livres et la culture littéraire. Blog de l'application READ." />
        <link rel="canonical" href="https://vread.fr/blog" />
        
        {/* Schema.org structured data for blog */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Blog",
            "name": "Blog READ",
            "description": "Découvrez nos articles sur la lecture, les livres et la culture littéraire",
            "url": "https://vread.fr/blog",
            "publisher": {
              "@type": "Organization",
              "name": "READ",
              "url": "https://vread.fr"
            },
            "mainEntity": posts.map(post => ({
              "@type": "BlogPosting",
              "headline": post.title,
              "description": post.excerpt || "",
              "datePublished": post.created_at,
              "dateModified": post.updated_at,
              "author": {
                "@type": "Organization",
                "name": post.author || "READ"
              },
              "url": `https://vread.fr/blog/${post.slug}`
            }))
          })}
        </script>
      </Helmet>
      
      <div className="min-h-screen bg-logo-background">
        <div className="container mx-auto px-4 py-8">
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
            <h1 className="text-4xl font-serif font-bold text-white mb-4">Blog READ</h1>
            <p className="text-lg text-white/90 max-w-2xl mx-auto">
              Découvrez nos articles sur la lecture, les livres et la culture littéraire
            </p>
          </header>

          <div className="max-w-4xl mx-auto">
            {posts.length === 0 ? (
              <Card className="border-coffee-light">
                <CardContent className="text-center py-12">
                  <p className="text-coffee-dark">Aucun article publié pour le moment.</p>
                </CardContent>
              </Card>
            ) : (
                <div className="space-y-6">
                {posts.map((post) => (
                  <Card key={post.id} className="border-coffee-light hover:shadow-lg transition-shadow">
                    {post.imageUrl && (
                      <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
                        <img 
                          src={post.imageUrl} 
                          alt={post.imageAlt || post.title}
                          className="object-cover w-full h-full"
                          loading="lazy"
                          width={640}
                          height={360}
                        />
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex-1">
                          <CardTitle className="text-xl font-serif text-coffee-darker mb-2">
                            <Link 
                              to={`/blog/${post.slug}`}
                              className="hover:text-coffee-dark transition-colors"
                            >
                              {post.title}
                            </Link>
                          </CardTitle>
                          {post.excerpt && (
                            <CardDescription className="text-base text-coffee-dark">
                              {post.excerpt}
                            </CardDescription>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-coffee-dark mt-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <time dateTime={post.created_at}>
                            {new Date(post.created_at).toLocaleDateString('fr-FR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </time>
                        </div>
                        
                        {post.author && (
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            <span>{post.author}</span>
                          </div>
                        )}
                      </div>
                      
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {post.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="bg-coffee-light text-coffee-darker">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
