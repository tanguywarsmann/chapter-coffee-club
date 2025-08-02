-- 1a) Ajouter la colonne published_at
ALTER TABLE blog_posts
  ADD COLUMN published_at timestamp with time zone;

-- 1b) Changer le défaut de published
ALTER TABLE blog_posts
  ALTER COLUMN published SET DEFAULT false;

-- 1c) Mettre published à false pour tous les billets planifiés futurs
UPDATE blog_posts
  SET published = false
WHERE published = true
  AND published_at > now();

-- Index pour accélérer la requête cron
CREATE INDEX idx_blog_posts_published_schedule ON blog_posts (published, published_at);

-- Remplace la politique SELECT existante
DROP POLICY "Anyone can view published blog posts" ON blog_posts;

CREATE POLICY "View only published & due posts" 
  ON blog_posts FOR SELECT
  USING (
    published = true
    AND (published_at IS NULL OR published_at <= now())
  );