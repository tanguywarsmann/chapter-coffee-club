-- Vérifier et créer les policies Storage pour le bucket covers
-- Politique pour permettre aux admins d'uploader des images dans covers/auto/

-- Admin peut insérer des fichiers dans covers/auto/
CREATE POLICY IF NOT EXISTS "admin_insert_covers" 
ON storage.objects 
FOR INSERT 
TO authenticated 
WITH CHECK (
  bucket_id = 'covers' 
  AND name LIKE 'auto/%'
  AND public.get_current_user_admin_status() = true
);

-- Admin peut mettre à jour des fichiers dans covers/auto/
CREATE POLICY IF NOT EXISTS "admin_update_covers" 
ON storage.objects 
FOR UPDATE 
TO authenticated 
USING (
  bucket_id = 'covers' 
  AND name LIKE 'auto/%'
  AND public.get_current_user_admin_status() = true
) 
WITH CHECK (
  bucket_id = 'covers' 
  AND name LIKE 'auto/%'
  AND public.get_current_user_admin_status() = true
);

-- Admin peut supprimer des fichiers dans covers/auto/
CREATE POLICY IF NOT EXISTS "admin_delete_covers" 
ON storage.objects 
FOR DELETE 
TO authenticated 
USING (
  bucket_id = 'covers' 
  AND name LIKE 'auto/%'
  AND public.get_current_user_admin_status() = true
);