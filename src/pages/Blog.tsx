
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Calendar, User, Tag, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet-async";
import { blogService } from "@/services/blogService";
import { WebsiteSchema } from "@/components/seo/WebsiteSchema";
import type { BlogPost } from "@/services/blogService";

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
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

  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-logo-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-white">Chargement des articles...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Blog READ - Découvrez la littérature classique</title>
        <meta name="description" content="Découvrez nos articles sur la littérature classique, les grands auteurs et l'art de la lecture lente et réfléchie." />
        
        {/* Open Graph */}
        <meta property="og:title" content="Blog READ - Découvrez la littérature classique" />
        <meta property="og:description" content="Découvrez nos articles sur la littérature classique, les grands auteurs et l'art de la lecture lente et réfléchie." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://vread.fr/blog" />
        <meta property="og:image" content="https://vread.fr/READ-logo.png" />
        <meta property="og:site_name" content="READ" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Blog READ - Découvrez la littérature classique" />
        <meta name="twitter:description" content="Découvrez nos articles sur la littérature classique, les grands auteurs et l'art de la lecture lente et réfléchie." />
        <meta name="twitter:image" content="https://vread.fr/READ-logo.png" />
        
        {/* Canonical URL */}
        <link rel="canonical" href="https://vread.fr/blog" />
        
        {/* Robots meta */}
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      </Helmet>
      
      <WebsiteSchema />
      
      <div className="min-h-screen bg-logo-background">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">
              Blog READ
            </h1>
            <p className="text-lg text-white/90 max-w-2xl mx-auto">
              Découvrez la littérature classique, explorez les grands auteurs et apprenez l'art de la lecture lente et réfléchie.
            </p>
          </div>

          {/* Search */}
          <div className="max-w-md mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Rechercher un article..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/10 border-white/20 text-white placeholder-white/70"
              />
            </div>
          </div>

          {/* Error state */}
          {error && (
            <div className="text-center text-white mb-8">
              <p>{error}</p>
            </div>
          )}

          {/* Articles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post) => (
              <article key={post.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                {/* Article Image */}
                {post.imageUrl && (
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={post.imageUrl} 
                      alt={post.imageAlt || post.title}
                      className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                      width={400}
                      height={200}
                    />
                  </div>
                )}
                
                {/* Article Content */}
                <div className="p-6">
                  <header className="mb-4">
                    <h2 className="text-xl font-serif font-bold text-coffee-darker mb-2 line-clamp-2">
                      <Link 
                        to={`/blog/${post.slug}`}
                        className="hover:text-logo-accent transition-colors"
                      >
                        {post.title}
                      </Link>
                    </h2>
                    
                    {post.excerpt && (
                      <p className="text-coffee-dark text-sm line-clamp-3 mb-4">
                        {post.excerpt}
                      </p>
                    )}
                  </header>
                  
                  <div className="flex flex-wrap items-center gap-3 text-xs text-coffee-dark mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
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
                        <User className="h-3 w-3" />
                        <span>{post.author}</span>
                      </div>
                    )}
                  </div>
                  
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {post.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="bg-coffee-light text-coffee-darker text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {post.tags.length > 3 && (
                        <Badge variant="secondary" className="bg-coffee-light text-coffee-darker text-xs">
                          +{post.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  <Link to={`/blog/${post.slug}`}>
                    <Button variant="outline" size="sm" className="w-full">
                      Lire l'article
                    </Button>
                  </Link>
                </div>
              </article>
            ))}
          </div>

          {/* Empty state */}
          {filteredPosts.length === 0 && !loading && !error && (
            <div className="text-center text-white py-12">
              <p className="text-lg mb-4">
                {searchTerm ? 'Aucun article trouvé pour cette recherche.' : 'Aucun article disponible pour le moment.'}
              </p>
              {searchTerm && (
                <Button 
                  onClick={() => setSearchTerm('')}
                  variant="outline"
                  className="text-white border-white hover:bg-white hover:text-logo-background"
                >
                  Effacer la recherche
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
