
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, User, ArrowLeft } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { blogService, BlogPost } from "@/services/blogService";

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const loadPost = async () => {
      if (!slug) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      try {
        const data = await blogService.getPostBySlug(slug);
        if (data) {
          setPost(data);
        } else {
          setNotFound(true);
        }
      } catch (error) {
        console.error('Error loading blog post:', error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-logo-background flex items-center justify-center">
        <div className="text-white">Chargement de l'article...</div>
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="min-h-screen bg-logo-background flex items-center justify-center">
        <Card className="border-coffee-light">
          <CardContent className="text-center py-12">
            <p className="text-coffee-dark">Article non trouvé.</p>
            <Link to="/blog">
              <Button className="mt-4" variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour au blog
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const description = post.excerpt || post.content.replace(/<[^>]*>/g, '').substring(0, 160) + "...";
  const publishDate = new Date(post.created_at).toISOString();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": description,
    "author": {
      "@type": "Organization",
      "name": post.author || "READ"
    },
    "publisher": {
      "@type": "Organization",
      "name": "READ",
      "url": "https://vread.fr"
    },
    "datePublished": publishDate,
    "dateModified": new Date(post.updated_at).toISOString(),
    "url": `https://vread.fr/blog/${post.slug}`,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://vread.fr/blog/${post.slug}`
    }
  };

  return (
    <>
      <Helmet>
        <title>{post.title} — READ Blog</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={`${post.title} — READ Blog`} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://vread.fr/blog/${post.slug}`} />
        <meta property="article:published_time" content={publishDate} />
        {post.author && <meta property="article:author" content={post.author} />}
        {post.tags && post.tags.map(tag => (
          <meta key={tag} property="article:tag" content={tag} />
        ))}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={`${post.title} — READ Blog`} />
        <meta name="twitter:description" content={description} />
        <link rel="canonical" href={`https://vread.fr/blog/${post.slug}`} />
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      </Helmet>
      
      <div className="min-h-screen bg-logo-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <Link to="/blog">
                <Button variant="ghost" className="text-white hover:text-logo-accent">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour au blog
                </Button>
              </Link>
            </div>

            <article>
              <Card className="border-coffee-light">
                <CardHeader className="pb-6">
                  <CardTitle className="text-3xl font-serif font-bold text-coffee-darker mb-4">
                    {post.title}
                  </CardTitle>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-coffee-dark">
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
                    <div className="flex flex-wrap gap-2 mt-4">
                      {post.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="bg-coffee-light text-coffee-darker">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  {post.excerpt && (
                    <div className="mt-4 p-4 bg-coffee-light/50 rounded-lg">
                      <p className="text-coffee-darker font-medium italic">
                        {post.excerpt}
                      </p>
                    </div>
                  )}
                </CardHeader>
                
                <CardContent>
                  <div 
                    className="prose prose-lg prose-coffee max-w-none 
                               prose-headings:text-coffee-darker prose-headings:font-serif
                               prose-p:text-coffee-darker prose-p:leading-relaxed
                               prose-strong:text-coffee-darker prose-strong:font-semibold
                               prose-a:text-coffee-dark hover:prose-a:text-coffee-darker prose-a:underline
                               prose-blockquote:border-l-coffee-light prose-blockquote:text-coffee-dark
                               prose-code:text-coffee-darker prose-code:bg-coffee-light prose-code:px-1 prose-code:rounded
                               prose-pre:bg-coffee-light prose-pre:text-coffee-darker
                               prose-ul:text-coffee-darker prose-ol:text-coffee-darker
                               prose-li:text-coffee-darker"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                  />
                </CardContent>
              </Card>
            </article>
          </div>
        </div>
      </div>
    </>
  );
}
