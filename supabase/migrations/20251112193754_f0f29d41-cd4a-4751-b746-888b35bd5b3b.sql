-- ============================================================
-- PHASE 3: Activer RLS sur tables PUBLIC critiques
-- Apple App Store Compliance - Security Fix
-- ============================================================

-- Activer RLS sur toutes les tables public qui ont des policies mais RLS désactivé
DO $$
DECLARE
  table_record RECORD;
  rls_enabled BOOLEAN;
BEGIN
  FOR table_record IN 
    SELECT DISTINCT tablename 
    FROM pg_policies 
    WHERE schemaname = 'public'
  LOOP
    -- Vérifier si RLS est déjà activé
    SELECT relrowsecurity INTO rls_enabled
    FROM pg_class
    WHERE relname = table_record.tablename
    AND relnamespace = 'public'::regnamespace;
    
    IF NOT rls_enabled THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_record.tablename);
      RAISE NOTICE 'RLS enabled on public.%', table_record.tablename;
    END IF;
  END LOOP;
END $$;

-- Vérification finale : lister toutes les tables public sans RLS
DO $$
DECLARE
  missing_rls TEXT;
BEGIN
  SELECT string_agg(tablename, ', ') INTO missing_rls
  FROM (
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public'
      AND tablename NOT IN (
        SELECT tablename 
        FROM pg_tables t
        JOIN pg_class c ON c.relname = t.tablename AND c.relnamespace = 'public'::regnamespace
        WHERE c.relrowsecurity = true
      )
  ) sub;
  
  IF missing_rls IS NOT NULL THEN
    RAISE NOTICE 'Tables without RLS: %', missing_rls;
  ELSE
    RAISE NOTICE 'All public tables have RLS enabled ✓';
  END IF;
END $$;