-- Mise à jour de la politique books pour corriger l'accès aux jointures
-- Utiliser auth.uid() IS NOT NULL au lieu de auth.role() = 'authenticated'
ALTER POLICY "Authenticated users can read published books" 
ON books 
USING (auth.uid() IS NOT NULL AND is_published = true);