
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getBlogPosts } from '@/utils/blogUtils';
import { BlogPost } from '@/types/blog';
import { toast } from 'sonner';
import { Edit, Plus, Save } from 'lucide-react';

export function BlogEditor() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editSlug, setEditSlug] = useState('');

  useEffect(() => {
    const blogPosts = getBlogPosts();
    setPosts(blogPosts);
  }, []);

  const handleEditPost = (post: BlogPost) => {
    setSelectedPost(post);
    setEditTitle(post.title);
    setEditSlug(post.slug);
    // Reconstruct markdown content with frontmatter
    const frontmatter = `---
title: "${post.title}"
date: "${post.date}"
slug: "${post.slug}"
description: "${post.description || ''}"
author: "${post.author || 'READ'}"
tags: [${post.tags?.map(tag => `"${tag}"`).join(', ') || ''}]
published: true
---

`;
    setEditContent(frontmatter + post.content.replace(/<[^>]*>/g, '')); // Remove HTML tags for editing
    setIsEditing(true);
  };

  const handleSavePost = () => {
    if (!selectedPost) return;
    
    // En mode développement, on ne peut que simuler la sauvegarde
    console.log('Saving post:', {
      title: editTitle,
      slug: editSlug,
      content: editContent
    });
    
    toast.success('Article sauvegardé (simulation en mode dev)');
    setIsEditing(false);
    setSelectedPost(null);
  };

  const handleCreateNew = () => {
    const now = new Date().toISOString().split('T')[0];
    const frontmatter = `---
title: "Nouvel article"
date: "${now}"
slug: "nouvel-article-${now}"
description: "Description de l'article"
author: "READ"
tags: ["tag1", "tag2"]
published: true
---

# Nouvel article

Votre contenu ici...
`;
    setEditContent(frontmatter);
    setEditTitle('Nouvel article');
    setEditSlug(`nouvel-article-${now}`);
    setSelectedPost(null);
    setIsEditing(true);
  };

  if (isEditing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            {selectedPost ? 'Modifier l\'article' : 'Nouvel article'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Titre</Label>
            <Input
              id="title"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Titre de l'article"
            />
          </div>
          
          <div>
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={editSlug}
              onChange={(e) => setEditSlug(e.target.value)}
              placeholder="slug-de-l-article"
            />
          </div>

          <div>
            <Label htmlFor="content">Contenu Markdown</Label>
            <Textarea
              id="content"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              placeholder="Contenu de l'article en Markdown..."
              className="min-h-[400px] font-mono text-sm"
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSavePost} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Sauvegarder
            </Button>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Annuler
            </Button>
          </div>

          <div className="text-sm text-muted-foreground">
            <strong>Note :</strong> En mode développement, la sauvegarde est simulée. 
            Pour une vraie sauvegarde, il faudrait une API backend.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Articles de blog</span>
          <Button onClick={handleCreateNew} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nouvel article
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {posts.map((post) => (
            <div key={post.slug} className="flex items-center justify-between p-3 border rounded">
              <div>
                <h3 className="font-medium">{post.title}</h3>
                <p className="text-sm text-muted-foreground">{post.date} • {post.slug}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => handleEditPost(post)}>
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          ))}
          
          {posts.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Aucun article trouvé
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
