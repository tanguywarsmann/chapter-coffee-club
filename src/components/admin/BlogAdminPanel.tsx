
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { toast } from 'sonner';
import { Edit, Plus, Save, Trash2, Eye } from 'lucide-react';
import { blogService, BlogPost, CreateBlogPostData } from '@/services/blogService';
import { ImageUpload } from './ImageUpload';

export function BlogAdminPanel() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [formData, setFormData] = useState<CreateBlogPostData>({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    author: 'READ',
    tags: [],
    published: true,
    imageUrl: '',
    imageAlt: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const data = await blogService.getAllPosts();
      setPosts(data);
    } catch (error) {
      console.error('Error loading posts:', error);
      toast.error('Erreur lors du chargement des articles');
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[àáâãäå]/g, 'a')
      .replace(/[èéêë]/g, 'e')
      .replace(/[ìíîï]/g, 'i')
      .replace(/[òóôõö]/g, 'o')
      .replace(/[ùúûü]/g, 'u')
      .replace(/[ç]/g, 'c')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: prev.slug || generateSlug(title)
    }));
  };

  const handleCreateNew = () => {
    setEditingPost(null);
    setFormData({
      title: '',
      slug: '',
      content: '',
      excerpt: '',
      author: 'READ',
      tags: [],
      published: true,
      imageUrl: '',
      imageAlt: ''
    });
    setIsEditing(true);
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt || '',
      author: post.author || 'READ',
      tags: post.tags || [],
      published: post.published,
      imageUrl: post.imageUrl || '',
      imageAlt: post.imageAlt || ''
    });
    setIsEditing(true);
  };

  const handleImageChange = (imageUrl: string, imageAlt: string) => {
    setFormData(prev => ({
      ...prev,
      imageUrl: imageUrl,
      imageAlt: imageAlt
    }));
  };

  const handleImageRemove = () => {
    setFormData(prev => ({
      ...prev,
      imageUrl: '',
      imageAlt: ''
    }));
  };

  const handleSave = async () => {
    if (!formData.title || !formData.slug || !formData.content) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setLoading(true);
    try {
      if (editingPost) {
        await blogService.updatePost({
          id: editingPost.id,
          ...formData
        });
        toast.success('Article mis à jour avec succès');
      } else {
        await blogService.createPost(formData);
        toast.success('Article créé avec succès');
      }
      
      await loadPosts();
      setIsEditing(false);
      setEditingPost(null);
    } catch (error) {
      console.error('Error saving post:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) return;

    try {
      await blogService.deletePost(id);
      toast.success('Article supprimé avec succès');
      await loadPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  if (isEditing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            {editingPost ? 'Modifier l\'article' : 'Nouvel article'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Titre *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Titre de l'article"
              />
            </div>
            
            <div>
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                placeholder="slug-de-l-article"
              />
            </div>
          </div>

          <ImageUpload
            currentImageUrl={formData.imageUrl}
            currentImageAlt={formData.imageAlt}
            onImageChange={handleImageChange}
            onImageRemove={handleImageRemove}
          />

          <div>
            <Label htmlFor="excerpt">Extrait</Label>
            <Textarea
              id="excerpt"
              value={formData.excerpt}
              onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
              placeholder="Résumé de l'article..."
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="content">Contenu *</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Contenu de l'article (HTML ou Markdown)..."
              className="min-h-[300px] font-mono text-sm"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="published"
              checked={formData.published}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, published: !!checked }))
              }
            />
            <Label htmlFor="published">Publié</Label>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleSave} 
              disabled={loading}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {loading ? 'Sauvegarde...' : 'Sauvegarder'}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setIsEditing(false)}
              disabled={loading}
            >
              Annuler
            </Button>
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
        {posts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Aucun article trouvé
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titre</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell className="font-medium">{post.title}</TableCell>
                  <TableCell className="text-muted-foreground">{post.slug}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs ${
                      post.published 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {post.published ? 'Publié' : 'Brouillon'}
                    </span>
                  </TableCell>
                  <TableCell>
                    {new Date(post.created_at).toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`/blog/${post.slug}`, '_blank')}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(post)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(post.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
