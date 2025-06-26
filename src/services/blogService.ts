
import { supabase } from "@/integrations/supabase/client";

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  author?: string;
  tags?: string[];
  published: boolean;
  image_url?: string;
  image_alt?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateBlogPostData {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  author?: string;
  tags?: string[];
  published?: boolean;
  image_url?: string;
  image_alt?: string;
}

export interface UpdateBlogPostData extends Partial<CreateBlogPostData> {
  id: string;
}

export const blogService = {
  // Récupérer tous les articles publiés
  async getPublishedPosts(): Promise<BlogPost[]> {
    console.log('Fetching published posts...');
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching published posts:', error);
      throw error;
    }

    console.log('Published posts fetched:', data);
    return data || [];
  },

  // Récupérer tous les articles (pour l'admin)
  async getAllPosts(): Promise<BlogPost[]> {
    console.log('Fetching all posts...');
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all posts:', error);
      throw error;
    }

    console.log('All posts fetched:', data);
    return data || [];
  },

  // Récupérer un article par slug
  async getPostBySlug(slug: string): Promise<BlogPost | null> {
    console.log('Fetching post by slug:', slug);
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .maybeSingle();

    if (error) {
      console.error('Error fetching post by slug:', error);
      throw error;
    }

    console.log('Post fetched by slug:', data);
    return data;
  },

  // Créer un nouvel article
  async createPost(postData: CreateBlogPostData): Promise<BlogPost> {
    const { data, error } = await supabase
      .from('blog_posts')
      .insert([{
        ...postData,
        published: postData.published ?? true
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating post:', error);
      throw error;
    }

    return data;
  },

  // Mettre à jour un article
  async updatePost(postData: UpdateBlogPostData): Promise<BlogPost> {
    const { id, ...updateData } = postData;
    
    const { data, error } = await supabase
      .from('blog_posts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating post:', error);
      throw error;
    }

    return data;
  },

  // Supprimer un article
  async deletePost(id: string): Promise<void> {
    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  },

  // Upload d'image pour le blog
  async uploadImage(file: File): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('blog-images')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Error uploading image:', uploadError);
      throw uploadError;
    }

    const { data } = supabase.storage
      .from('blog-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  },

  // Supprimer une image du blog
  async deleteImage(imageUrl: string): Promise<void> {
    if (!imageUrl) return;

    // Extraire le nom du fichier de l'URL
    const urlParts = imageUrl.split('/');
    const fileName = urlParts[urlParts.length - 1];

    const { error } = await supabase.storage
      .from('blog-images')
      .remove([fileName]);

    if (error) {
      console.error('Error deleting image:', error);
      throw error;
    }
  }
};
