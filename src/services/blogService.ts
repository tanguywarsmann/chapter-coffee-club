
import { supabase } from "@/integrations/supabase/client";
import { getPublicImageUrl } from "@/lib/getPublicImageUrl";

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  author?: string;
  tags?: string[];
  published: boolean;
  published_at?: string;
  imageUrl?: string;
  imageHero?: string;
  imageAlt?: string;
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
  published_at?: string;
  imageUrl?: string;
  imageAlt?: string;
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
      .select('*, sort_date:coalesce(published_at, created_at)')
      .eq('published', true)
      .or('published_at.is.null,published_at.lte.' + new Date().toISOString())
      .order('sort_date', { ascending: false });

    if (error) {
      console.error('Error fetching published posts:', error);
      throw error;
    }

    console.log('Published posts fetched:', data);
    return (data || []).map(post => ({
      ...post,
      imageUrl: post.image_url ? getPublicImageUrl(post.image_url) : undefined,
      imageHero: post.image_url ? getPublicImageUrl(post.image_url) : undefined,
      imageAlt: post.image_alt
    }));
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
    return (data || []).map(post => ({
      ...post,
      imageUrl: post.image_url ? getPublicImageUrl(post.image_url) : undefined,
      imageHero: post.image_url ? getPublicImageUrl(post.image_url) : undefined,
      imageAlt: post.image_alt
    }));
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
    if (!data) return null;
    
    return {
      ...data,
      imageUrl: data.image_url ? getPublicImageUrl(data.image_url) : undefined,
      imageHero: data.image_url ? getPublicImageUrl(data.image_url) : undefined,
      imageAlt: data.image_alt
    };
  },

  // Créer un nouvel article
  async createPost(postData: CreateBlogPostData): Promise<BlogPost> {
    const { imageUrl, imageAlt, published_at, ...rest } = postData;
    const { data, error } = await supabase
      .from('blog_posts')
      .insert([{
        ...rest,
        image_url: imageUrl,
        image_alt: imageAlt,
        published_at: published_at,
        published: postData.published ?? true
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating post:', error);
      throw error;
    }

    return {
      ...data,
      imageUrl: data.image_url,
      imageAlt: data.image_alt
    };
  },

  // Mettre à jour un article
  async updatePost(postData: UpdateBlogPostData): Promise<BlogPost> {
    const { id, imageUrl, imageAlt, published_at, ...rest } = postData;
    
    const { data, error } = await supabase
      .from('blog_posts')
      .update({
        ...rest,
        image_url: imageUrl,
        image_alt: imageAlt,
        published_at: published_at
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating post:', error);
      throw error;
    }

    return {
      ...data,
      imageUrl: data.image_url,
      imageAlt: data.image_alt
    };
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
