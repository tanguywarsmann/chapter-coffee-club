
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import DOMPurify from "dompurify";
import { Button } from "@/components/ui/button";
import { Calendar, User, ArrowLeft, Tag, Share2, Clock, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Helmet } from "react-helmet-async";
import { blogService } from "@/services/blogService";
import { setCanonical } from "@/utils/seo";
import type { BlogPost } from "@/services/blogService";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { trackPageView, trackReadingTime, trackShare } from "@/utils/analytics";

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const href = window.location.href.replace('http://', 'https://');
    setCanonical(href);
    
    const loadPost = async () => {
      if (!slug) {
        setError('Article non trouvé');
        setLoading(false);
        return;
      }

      try {
        const data = await blogService.getPostBySlug(slug);
        if (data) {
          setPost(data);
          setError(null);
        } else {
          setError('Article non trouvé');
        }
      } catch (error) {
        setError('Erreur lors du chargement de l\'article');
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [slug]);

  // Charger les articles liés
  useEffect(() => {
    const loadRelatedPosts = async () => {
      if (!post?.tags || post.tags.length === 0) return;

      try {
        const { data } = await supabase
          .from('blog_posts')
          .select('id, title, slug, excerpt, image_url, image_alt, tags, published_at')
          .contains('tags', post.tags)
          .neq('id', post.id)
          .eq('published', true)
          .limit(3);

        if (data) {
          setRelatedPosts(data.map(p => ({
            ...p,
            content: '',
            created_at: p.published_at || '',
            updated_at: p.published_at || '',
            published: true,
            imageHero: p.image_url,
            imageAlt: p.image_alt
          })));
        }
      } catch (error) {
        console.error('Erreur lors du chargement des articles liés:', error);
      }
    };

    loadRelatedPosts();
  }, [post]);

  // Track page view
  useEffect(() => {
    if (post) {
      trackPageView(post.title, `/blog/${post.slug}`);
    }
  }, [post]);

  // Track reading time
  useEffect(() => {
    if (!post) return;
    
    const startTime = Date.now();
    return () => {
      const timeSpent = Math.round((Date.now() - startTime) / 1000);
      if (timeSpent > 5) { // Only track if user spent more than 5 seconds
        trackReadingTime(post.title, timeSpent);
      }
    };
  }, [post]);

  if (loading) {
    return (
      <div className="min-h-screen bg-logo-background">
        <div className="mx-auto w-full px-4 max-w-none py-8">
          <div className="text-center text-white">Chargement de l'article...</div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-logo-background">
        <div className="mx-auto w-full px-4 max-w-none py-8">
          <div className="text-center text-white">{error || 'Article non trouvé'}</div>
        </div>
      </div>
    );
  }

  const publishedDate = new Date(post.created_at);
  const modifiedDate = new Date(post.updated_at);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt || post.title,
          url: window.location.href
        });
        trackShare(post.title, 'web_share');
        toast.success('Article partagé avec succès');
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          toast.error('Erreur lors du partage');
        }
      }
    } else {
      // Fallback: copier l'URL dans le presse-papier
      try {
        await navigator.clipboard.writeText(window.location.href);
        trackShare(post.title, 'clipboard');
        toast.success('Lien copié dans le presse-papier');
      } catch (error) {
        toast.error('Impossible de copier le lien');
      }
    }
  };

  return (
    <>
      <Helmet>
        <title>{post.title} | VREAD Blog</title>
        <meta name="description" content={post.excerpt || `Découvrez l'article "${post.title}" sur le blog VREAD`} />
        {post.tags && post.tags.length > 0 && (
          <meta name="keywords" content={post.tags.join(', ')} />
        )}
        <link rel="canonical" href={`https://www.vread.fr/blog/${post.slug}`} />
        
        {/* Open Graph */}
        <meta property="og:type" content="article" />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt || `Découvrez l'article "${post.title}" sur le blog VREAD`} />
        <meta property="og:url" content={`https://www.vread.fr/blog/${post.slug}`} />
        <meta property="og:image" content={post.imageHero || 'https://www.vread.fr/branding/vread-logo-512.png'} />
        <meta property="article:published_time" content={post.created_at} />
        {post.author && <meta property="article:author" content={post.author} />}
        {post.tags && post.tags.length > 0 && (
          <meta property="article:tag" content={post.tags.join(', ')} />
        )}
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={post.excerpt || `Découvrez l'article "${post.title}" sur le blog VREAD`} />
        <meta name="twitter:image" content={post.imageHero || 'https://www.vread.fr/branding/vread-logo-512.png'} />
        
        {/* Schema.org structured data for article */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": post.title,
            "description": post.excerpt || "",
            "author": {
              "@type": "Organization",
              "name": post.author || "VREAD"
            },
            "publisher": {
              "@type": "Organization",
              "name": "VREAD",
              "url": "https://www.vread.fr",
              "logo": {
                "@type": "ImageObject",
                "url": "https://www.vread.fr/branding/vread-logo-512.png"
              }
            },
            "datePublished": post.created_at,
            "dateModified": post.updated_at,
            "url": `https://www.vread.fr/blog/${post.slug}`,
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": `https://www.vread.fr/blog/${post.slug}`
            },
            "keywords": post.tags?.join(", ") || "",
            "articleSection": "Littérature",
            "image": post.imageHero || "https://www.vread.fr/branding/vread-logo-512.png"
          })}
        </script>
      </Helmet>
      
      <div className="min-h-screen bg-logo-background">
        <div className="mx-auto w-full px-4 max-w-none py-8">
          {/* Navigation */}
          <div className="mb-6">
            <Link to="/blog">
              <Button variant="ghost" className="text-white hover:text-logo-accent">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour au blog
              </Button>
            </Link>
          </div>

          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex items-center gap-2 text-sm text-white/80">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  Accueil
                </Link>
              </li>
              <li><ChevronRight className="h-4 w-4" /></li>
              <li>
                <Link to="/blog" className="hover:text-white transition-colors">
                  Blog
                </Link>
              </li>
              <li><ChevronRight className="h-4 w-4" /></li>
              <li className="text-white/60 truncate max-w-md">{post.title}</li>
            </ol>
          </nav>

          {/* Article */}
          <article className="max-w-none mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Article Image */}
            {post.imageHero && (
              <div className="relative h-64 md:h-80 w-full overflow-hidden">
                <img 
                  src={post.imageHero} 
                  alt={post.imageAlt || post.title}
                  className="object-cover w-full h-full"
                  loading="lazy"
                  decoding="async"
                  width={1200}
                  height={630}
                />
              </div>
            )}
            
            {/* Article Header */}
            <header className="p-8 pb-6">
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-coffee-darker mb-4">
                {post.title}
              </h1>
              
              {post.excerpt && (
                <p className="text-lg text-coffee-dark mb-6 leading-relaxed">
                  {post.excerpt}
                </p>
              )}
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-coffee-dark mb-4">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <time dateTime={post.created_at}>
                    {publishedDate.toLocaleDateString('fr-FR', {
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

                {post.reading_time && (
                  <>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{post.reading_time} min de lecture</span>
                    </div>
                  </>
                )}

                <Button
                  onClick={handleShare}
                  variant="ghost"
                  size="sm"
                  className="ml-auto text-coffee-dark hover:text-logo-accent"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Partager
                </Button>
              </div>
              
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <Tag className="h-4 w-4 text-coffee-dark mt-1" />
                  {post.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="bg-coffee-light text-coffee-darker">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </header>

            {/* Article Content */}
            <div 
              className="px-8 pb-8 prose prose-lg max-w-none prose-headings:text-coffee-darker prose-p:text-coffee-dark prose-strong:text-coffee-darker prose-a:text-logo-accent prose-a:no-underline hover:prose-a:underline"
              dangerouslySetInnerHTML={{ 
                __html: DOMPurify.sanitize(post.content, {
                  ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote', 'a', 'img', 'code', 'pre'],
                  ALLOWED_ATTR: ['href', 'target', 'rel', 'src', 'alt', 'title', 'class'],
                  ALLOW_DATA_ATTR: false
                })
              }}
            />

            {/* Articles liés */}
            {relatedPosts.length > 0 && (
              <section className="px-8 pb-8 mt-8 border-t border-coffee-light pt-8">
                <h2 className="text-2xl font-serif font-bold text-coffee-darker mb-6">Articles liés</h2>
                <div className="grid md:grid-cols-3 gap-6">
                  {relatedPosts.map(related => (
                    <Link 
                      to={`/blog/${related.slug}`} 
                      key={related.id}
                      className="group block"
                    >
                      <article className="bg-coffee-lightest rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        {related.imageHero && (
                          <div className="relative h-40 w-full overflow-hidden">
                            <img 
                              src={related.imageHero} 
                              alt={related.imageAlt || related.title}
                              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                              width={400}
                              height={200}
                            />
                          </div>
                        )}
                        <div className="p-4">
                          <h3 className="font-semibold text-coffee-darker mb-2 group-hover:text-logo-accent transition-colors line-clamp-2">
                            {related.title}
                          </h3>
                          {related.excerpt && (
                            <p className="text-sm text-coffee-dark line-clamp-3">
                              {related.excerpt}
                            </p>
                          )}
                        </div>
                      </article>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </article>
        </div>
      </div>
    </>
  );
}
