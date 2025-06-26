
-- Ajouter la colonne image_url à la table blog_posts
ALTER TABLE public.blog_posts 
ADD COLUMN image_url TEXT;

-- Ajouter un commentaire pour documenter la colonne
COMMENT ON COLUMN public.blog_posts.image_url IS 'URL de l''image principale de l''article pour le SEO et les réseaux sociaux';
