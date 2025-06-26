
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
}

export interface UpdateBlogPostData extends Partial<CreateBlogPostData> {
  id: string;
}

export const blogService = {
  // Récupérer tous les articles publiés
  async getPublishedPosts(): Promise<BlogPost[]> {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching published posts:', error);
      throw error;
    }

    return data || [];
  },

  // Récupérer tous les articles (pour l'admin)
  async getAllPosts(): Promise<BlogPost[]> {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all posts:', error);
      throw error;
    }

    return data || [];
  },

  // Récupérer un article par slug
  async getPostBySlug(slug: string): Promise<BlogPost | null> {
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
  }
};
