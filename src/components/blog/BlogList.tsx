import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, User } from "lucide-react";
import type { BlogPost } from "@/services/blogService";

interface BlogListProps {
  posts: Array<{
    id: string;
    title: string;
    slug: string;
    excerpt?: string;
    imageUrl?: string;
    imageAlt?: string;
    published_at?: string;
    author?: string;
    tags?: string[];
  }>;
}

export default function BlogList({ posts }: BlogListProps) {
  if (posts.length === 0) {
    return (
      <Card className="border-coffee-light">
        <CardContent className="text-center py-12">
          <p className="text-coffee-dark">Aucun article publié pour le moment.</p>
        </CardContent>
      </Card>
    );
  }

  return (
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
                <time dateTime={post.published_at}>
                  {new Date(post.published_at || '').toLocaleDateString('fr-FR', {
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
  );
}