import { Link } from "react-router-dom";
import { getBlogPosts } from "@/utils/blogUtils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, User } from "lucide-react";
import { Helmet } from "react-helmet-async";

export default function Blog() {
  const posts = getBlogPosts();

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
      </Helmet>
      
      <div className="min-h-screen bg-logo-background">
        <div className="container mx-auto px-4 py-8">
          <header className="text-center mb-12">
            <h1 className="text-4xl font-serif font-bold text-coffee-darker mb-4">Blog READ</h1>
            <p className="text-lg text-coffee-dark max-w-2xl mx-auto">
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
                  <Card key={post.slug} className="border-coffee-light hover:shadow-lg transition-shadow">
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
                          {post.description && (
                            <CardDescription className="text-base">
                              {post.description}
                            </CardDescription>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-coffee-dark">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <time dateTime={post.date}>
                            {new Date(post.date).toLocaleDateString('fr-FR', {
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
