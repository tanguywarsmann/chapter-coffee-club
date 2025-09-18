-- Activer RLS sur la table blog_posts pour sécuriser l'accès
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Créer une politique pour permettre la lecture publique des articles publiés
CREATE POLICY "sitemap_public_read_published" ON public.blog_posts
FOR SELECT
TO anon
USING (published = true);