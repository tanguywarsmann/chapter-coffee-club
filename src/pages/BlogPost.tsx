
import { useParams, Link } from "react-router-dom";
import { getBlogPost } from "@/utils/blogUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, User, ArrowLeft } from "lucide-react";

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

  return (
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
                <div 
                  className="prose prose-coffee max-w-none"
                  style={{
                    lineHeight: '1.7',
                    fontSize: '1.1rem'
                  }}
                >
                  {post.content.split('\n').map((paragraph, index) => (
                    paragraph.trim() ? (
                      <p key={index} className="mb-4 text-coffee-darker">
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
  );
}
