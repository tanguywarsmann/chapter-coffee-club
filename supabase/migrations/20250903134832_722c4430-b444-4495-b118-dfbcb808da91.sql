-- Corriger la politique RLS de la table books pour permettre les jointures
DROP POLICY IF EXISTS "Authenticated users can read published books" ON books;

-- Créer une nouvelle politique plus permissive pour les utilisateurs authentifiés
CREATE POLICY "Authenticated users can read published books" 
ON books 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND is_published = true);