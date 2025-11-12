-- ============================================
-- PHASE 1: DIAGNOSTIC PRÉCIS DE SÉCURITÉ
-- Objectif: Identifier toute exposition de auth.users
-- ============================================

-- 1. Vérifier les grants directs sur auth.users
DO $$ 
DECLARE
  grant_record RECORD;
BEGIN
  RAISE NOTICE '=== GRANTS SUR auth.users ===';
  FOR grant_record IN 
    SELECT grantee, privilege_type 
    FROM information_schema.table_privileges 
    WHERE table_schema = 'auth' AND table_name = 'users'
  LOOP
    RAISE NOTICE 'Grantee: %, Privilege: %', grant_record.grantee, grant_record.privilege_type;
  END LOOP;
END $$;

-- 2. Lister TOUTES les vues et leurs dépendances vers auth.users
DO $$
DECLARE
  view_record RECORD;
BEGIN
  RAISE NOTICE '=== VUES REFERENCANT auth.users (directement ou indirectement) ===';
  FOR view_record IN
    SELECT DISTINCT
      v.table_schema,
      v.table_name,
      v.view_definition
    FROM information_schema.views v
    WHERE v.table_schema = 'public'
      AND v.view_definition ILIKE '%auth.users%'
  LOOP
    RAISE NOTICE 'Vue: %.% - Definition contient auth.users', view_record.table_schema, view_record.table_name;
  END LOOP;
END $$;

-- 3. Vérifier les permissions sur v_apple_iap_summary spécifiquement
DO $$
DECLARE
  perm_record RECORD;
BEGIN
  RAISE NOTICE '=== PERMISSIONS SUR v_apple_iap_summary ===';
  FOR perm_record IN
    SELECT grantee, privilege_type
    FROM information_schema.table_privileges
    WHERE table_schema = 'public' 
      AND table_name = 'v_apple_iap_summary'
  LOOP
    RAISE NOTICE 'Grantee: %, Privilege: %', perm_record.grantee, perm_record.privilege_type;
  END LOOP;
END $$;

-- 4. Identifier TOUTES les tables sans RLS activé
DO $$
DECLARE
  table_record RECORD;
BEGIN
  RAISE NOTICE '=== TABLES SANS RLS ACTIVE ===';
  FOR table_record IN
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename NOT LIKE 'v_%'
      AND tablename NOT IN (
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
          AND rowsecurity = true
      )
  LOOP
    RAISE NOTICE 'Table sans RLS: %', table_record.tablename;
  END LOOP;
END $$;

-- 5. Lister les fonctions SECURITY DEFINER sans search_path
DO $$
DECLARE
  func_record RECORD;
BEGIN
  RAISE NOTICE '=== FONCTIONS SECURITY DEFINER SANS search_path ===';
  FOR func_record IN
    SELECT 
      n.nspname as schema_name,
      p.proname as function_name,
      pg_get_functiondef(p.oid) as definition
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
      AND p.prosecdef = true  -- SECURITY DEFINER
      AND NOT pg_get_functiondef(p.oid) ILIKE '%search_path%'
  LOOP
    RAISE NOTICE 'Fonction sans search_path: %.%', func_record.schema_name, func_record.function_name;
  END LOOP;
END $$;

-- 6. Vérifier les vues SECURITY DEFINER
DO $$
DECLARE
  view_sec_record RECORD;
BEGIN
  RAISE NOTICE '=== VUES AVEC SECURITY DEFINER ===';
  FOR view_sec_record IN
    SELECT 
      schemaname,
      viewname,
      viewowner
    FROM pg_views
    WHERE schemaname = 'public'
      AND definition ILIKE '%security definer%'
  LOOP
    RAISE NOTICE 'Vue SECURITY DEFINER: %.% (owner: %)', 
      view_sec_record.schemaname, 
      view_sec_record.viewname,
      view_sec_record.viewowner;
  END LOOP;
END $$;

-- 7. Résumé final
DO $$
BEGIN
  RAISE NOTICE '=== DIAGNOSTIC TERMINE ===';
  RAISE NOTICE 'Vérifiez les logs ci-dessus pour identifier:';
  RAISE NOTICE '1. Les grants sur auth.users';
  RAISE NOTICE '2. Les vues exposant auth.users';
  RAISE NOTICE '3. Les tables sans RLS';
  RAISE NOTICE '4. Les fonctions sans search_path';
END $$;