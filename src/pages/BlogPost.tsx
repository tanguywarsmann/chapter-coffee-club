
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import DOMPurify from "dompurify";
import { Button } from "@/components/ui/button";
import { Calendar, User, ArrowLeft, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Helmet } from "react-helmet-async";
import { blogService } from "@/services/blogService";
import { ArticleJsonLd } from "@/components/seo/ArticleJsonLd";
import type { BlogPost } from "@/services/blogService";

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-logo-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-white">Chargement de l'article...</div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-logo-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-white">{error || 'Article non trouvé'}</div>
        </div>
      </div>
    );
  }

  const publishedDate = new Date(post.created_at);
  const modifiedDate = new Date(post.updated_at);

  return (
    <>
      <Helmet>
        <title>{post.title} - Blog READ</title>
        <meta name="description" content={post.excerpt || `Découvrez l'article "${post.title}" sur le blog READ`} />
        <meta property="og:title" content={`${post.title} - Blog READ`} />
        <meta property="og:description" content={post.excerpt || `Découvrez l'article "${post.title}" sur le blog read`} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://vread.fr/blog/${post.slug}`} />
        <meta property="article:published_time" content={post.created_at} />
        <meta property="article:modified_time" content={post.updated_at} />
        <meta property="article:author" content={post.author || 'READ'} />
        {post.tags && post.tags.map(tag => (
          <meta key={tag} property="article:tag" content={tag} />
        ))}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={`${post.title} - Blog READ`} />
        <meta name="twitter:description" content={post.excerpt || `Découvrez l'article "${post.title}" sur le blog read`} />
        <link rel="canonical" href={`https://vread.fr/blog/${post.slug}`} />
      </Helmet>
      
      <ArticleJsonLd
        title={post.title}
        description={post.excerpt || `Découvrez l'article "${post.title}" sur le blog READ`}
        author={post.author || 'READ'}
        publishedDate={post.created_at}
        modifiedDate={post.updated_at}
        url={`https://vread.fr/blog/${post.slug}`}
        tags={post.tags}
        imageUrl={post.imageHero}
      />
      
      <div className="min-h-screen bg-logo-background">
        <div className="container mx-auto px-4 py-8">
          {/* Navigation */}
          <div className="mb-6">
            <Link to="/blog">
              <Button variant="ghost" className="text-white hover:text-logo-accent">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour au blog
              </Button>
            </Link>
          </div>

          {/* Article */}
          <article className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Article Image */}
            {post.imageHero && (
              <div className="relative h-64 md:h-80 w-full overflow-hidden">
                <img 
                  src={post.imageHero} 
                  alt={post.imageAlt || post.title}
                  className="object-cover w-full h-full"
                  loading="eager"
                  width={1280}
                  height={720}
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
          </article>
        </div>
      </div>
    </>
  );
}
