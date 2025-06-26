import { useParams, Link } from "react-router-dom";
import { getBlogPost } from "@/utils/blogUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, User, ArrowLeft } from "lucide-react";
import { Helmet } from "react-helmet-async";

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  
  if (!slug) {
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

  const post = getBlogPost(slug);

  if (!post) {
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

  const description = post.description || post.content.substring(0, 160) + "...";
  const publishDate = new Date(post.date).toISOString();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": description,
    "author": {
      "@type": "Organization",
      "name": "READ"
    },
    "publisher": {
      "@type": "Organization",
      "name": "READ",
      "url": "https://vread.fr"
    },
    "datePublished": publishDate,
    "dateModified": publishDate,
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
                <Button variant="ghost" className="text-coffee-dark hover:text-coffee-darker">
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
                    <div className="flex flex-wrap gap-2 mt-4">
                      {post.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="bg-coffee-light text-coffee-darker">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardHeader>
                
                <CardContent>
                  <div className="prose prose-lg prose-coffee max-w-none prose-headings:text-coffee-darker prose-p:text-coffee-darker prose-strong:text-coffee-darker prose-a:text-coffee-dark hover:prose-a:text-coffee-darker">
                    {post.content.split('\n').map((paragraph, index) => (
                      paragraph.trim() ? (
                        <p key={index} className="mb-4">
                          {paragraph}
                        </p>
                      ) : (
                        <br key={index} />
                      )
                    ))}
                  </div>
                </CardContent>
              </Card>
            </article>
          </div>
        </div>
      </div>
    </>
  );
}
