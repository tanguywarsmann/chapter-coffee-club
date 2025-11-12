-- ============================================
-- DIAGNOSTIC APPROFONDI - Identification précise
-- ============================================

-- 1. Identifier EXACTEMENT quelles vues exposent auth.users
DO $$
DECLARE
  view_rec RECORD;
BEGIN
  RAISE NOTICE '=== VUES EXPOSANT auth.users ===';
  FOR view_rec IN
    SELECT 
      schemaname,
      viewname,
      definition
    FROM pg_views
    WHERE schemaname = 'public'
      AND definition ILIKE '%auth.users%'
  LOOP
    RAISE NOTICE 'Vue problématique: %.%', view_rec.schemaname, view_rec.viewname;
    RAISE NOTICE 'Definition: %', view_rec.definition;
  END LOOP;
END $$;

-- 2. Lister toutes les vues SECURITY DEFINER
DO $$
DECLARE
  sec_view RECORD;
BEGIN
  RAISE NOTICE '=== VUES SECURITY DEFINER ===';
  FOR sec_view IN
    SELECT 
      schemaname,
      viewname,
      viewowner,
      definition
    FROM pg_views
    WHERE schemaname = 'public'
  LOOP
    IF sec_view.definition ILIKE '%security%definer%' THEN
      RAISE NOTICE 'Vue SECURITY DEFINER: %.%', sec_view.schemaname, sec_view.viewname;
    END IF;
  END LOOP;
END $$;

-- 3. Tables avec RLS activé mais sans politiques
DO $$
DECLARE
  table_rec RECORD;
  policy_count INTEGER;
BEGIN
  RAISE NOTICE '=== TABLES RLS SANS POLITIQUES ===';
  FOR table_rec IN
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
      AND rowsecurity = true
  LOOP
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = table_rec.tablename;
    
    IF policy_count = 0 THEN
      RAISE NOTICE 'Table sans politique: % (RLS activé mais 0 politiques)', table_rec.tablename;
    END IF;
  END LOOP;
END $$;

-- 4. Vérifier les grants sur auth.users
DO $$
DECLARE
  grant_rec RECORD;
BEGIN
  RAISE NOTICE '=== GRANTS SUR auth.users ===';
  FOR grant_rec IN
    SELECT grantee, privilege_type, is_grantable
    FROM information_schema.table_privileges
    WHERE table_schema = 'auth'
      AND table_name = 'users'
      AND grantee IN ('anon', 'authenticated', 'public')
  LOOP
    RAISE NOTICE 'GRANT DANGEREUX: % a % sur auth.users (grantable: %)', 
      grant_rec.grantee, grant_rec.privilege_type, grant_rec.is_grantable;
  END LOOP;
END $$;

-- 5. Analyser les dépendances des vues
DO $$
DECLARE
  dep_rec RECORD;
BEGIN
  RAISE NOTICE '=== DÉPENDANCES DES VUES VERS auth ===';
  FOR dep_rec IN
    SELECT DISTINCT
      v.schemaname AS view_schema,
      v.viewname AS view_name,
      d.refobjid::regclass AS depends_on
    FROM pg_views v
    JOIN pg_depend d ON d.objid = (v.schemaname || '.' || v.viewname)::regclass::oid
    WHERE v.schemaname = 'public'
      AND d.refobjid::regclass::text LIKE 'auth.%'
  LOOP
    RAISE NOTICE 'Vue %.% dépend de %', 
      dep_rec.view_schema, dep_rec.view_name, dep_rec.depends_on;
  END LOOP;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Erreur analyse dépendances: %', SQLERRM;
END $$;

-- 6. Résumé final
DO $$
BEGIN
  RAISE NOTICE '====================================';
  RAISE NOTICE 'DIAGNOSTIC TERMINÉ';
  RAISE NOTICE 'Vérifiez les logs ci-dessus pour:';
  RAISE NOTICE '1. Vues exposant auth.users';
  RAISE NOTICE '2. Vues SECURITY DEFINER';
  RAISE NOTICE '3. Tables RLS sans politiques';
  RAISE NOTICE '4. Grants dangereux sur auth.users';
  RAISE NOTICE '====================================';
END $$;