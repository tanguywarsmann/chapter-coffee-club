-- Corriger les permissions sur la table books pour permettre les joins
-- Autoriser la lecture des livres publiés aux utilisateurs authentifiés
DROP POLICY IF EXISTS "Books are readable by all users" ON books;
DROP POLICY IF EXISTS "books_select_published" ON books;

CREATE POLICY "Authenticated users can read published books" 
ON books FOR SELECT 
USING (auth.role() = 'authenticated' AND is_published = true);