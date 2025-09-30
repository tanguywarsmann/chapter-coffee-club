-- 1. Fonction helper pour lire le flag is_admin dans le JWT
CREATE OR REPLACE FUNCTION public.get_current_user_admin_status()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid()),
    FALSE
  );
$$;

-- 2. Nettoyer les anciennes policies
DROP POLICY IF EXISTS public_read_books ON books;
DROP POLICY IF EXISTS public_read_published_books ON books;
DROP POLICY IF EXISTS admin_read_all_books ON books;
DROP POLICY IF EXISTS authenticated_update_cover ON books;
DROP POLICY IF EXISTS admin_update_books ON books;
DROP POLICY IF EXISTS "Authenticated users can read published books" ON books;
DROP POLICY IF EXISTS "Admins can update books" ON books;
DROP POLICY IF EXISTS "Admins can delete books" ON books;
DROP POLICY IF EXISTS "Allow insert for authenticated" ON books;

-- 3. Nouvelles policies RLS

-- a) Lecture publique = uniquement les livres publiés
CREATE POLICY "Public can read published books"
ON books FOR SELECT
TO public
USING (COALESCE(is_published, false) = true);

-- b) Lecture admin = tous les livres si is_admin = true
CREATE POLICY "Admins can read all books"
ON books FOR SELECT
TO authenticated
USING (public.get_current_user_admin_status() = true);

-- c) Update complet réservé aux admins
CREATE POLICY "Admins can update books"
ON books FOR UPDATE
TO authenticated
USING (public.get_current_user_admin_status() = true)
WITH CHECK (public.get_current_user_admin_status() = true);

-- d) Insert réservé aux admins
CREATE POLICY "Admins can insert books"
ON books FOR INSERT
TO authenticated
WITH CHECK (public.get_current_user_admin_status() = true);

-- e) Delete réservé aux admins
CREATE POLICY "Admins can delete books"
ON books FOR DELETE
TO authenticated
USING (public.get_current_user_admin_status() = true);