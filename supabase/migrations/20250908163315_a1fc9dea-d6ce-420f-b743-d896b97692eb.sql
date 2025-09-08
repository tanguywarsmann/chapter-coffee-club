-- Vue pour exposer les livres explorables avec une catégorie claire
CREATE OR REPLACE VIEW books_explore AS
SELECT
  b.*,
  CASE
    WHEN b.tags @> ARRAY['Religion']::text[] THEN 'religion'
    WHEN b.tags @> ARRAY['Essai']::text[] THEN 'essai'
    WHEN b.tags && ARRAY['Biographie','Autobiographie']::text[] THEN 'bio'
    ELSE 'litterature'
  END AS category
FROM books b
WHERE coalesce(b.is_published, false) = true;

-- Politique RLS de lecture sur la table books
ALTER TABLE books ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_published_books"
ON books FOR SELECT
USING (coalesce(is_published, false) = true);