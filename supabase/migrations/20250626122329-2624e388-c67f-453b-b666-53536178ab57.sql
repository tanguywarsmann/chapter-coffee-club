
-- Ajouter la colonne image_alt à la table blog_posts
ALTER TABLE public.blog_posts 
ADD COLUMN image_alt TEXT;

-- Ajouter un commentaire pour documenter la colonne
COMMENT ON COLUMN public.blog_posts.image_alt IS 'Texte alternatif de l''image SEO pour l''accessibilité et le référencement';

-- Créer le bucket pour les images de blog
INSERT INTO storage.buckets (id, name, public) 
VALUES ('blog-images', 'blog-images', true);

-- Politique RLS pour permettre l'upload d'images (lecture publique)
CREATE POLICY "Public can view blog images" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'blog-images');

-- Politique RLS pour permettre l'upload aux utilisateurs authentifiés
CREATE POLICY "Authenticated users can upload blog images" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'blog-images' AND auth.role() = 'authenticated');

-- Politique RLS pour permettre la suppression aux utilisateurs authentifiés
CREATE POLICY "Authenticated users can delete blog images" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'blog-images' AND auth.role() = 'authenticated');

-- Politique RLS pour permettre la mise à jour aux utilisateurs authentifiés
CREATE POLICY "Authenticated users can update blog images" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'blog-images' AND auth.role() = 'authenticated');
