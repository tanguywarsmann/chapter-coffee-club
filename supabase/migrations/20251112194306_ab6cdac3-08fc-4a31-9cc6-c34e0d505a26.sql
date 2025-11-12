-- ============================================================
-- DIAGNOSTIC: Identifier toutes les vues exposant auth.users
-- ============================================================

DO $$
DECLARE
  view_rec RECORD;
  view_def TEXT;
BEGIN
  RAISE NOTICE '=== SCANNING ALL VIEWS FOR auth.users EXPOSURE ===';
  
  FOR view_rec IN 
    SELECT schemaname, viewname
    FROM pg_views
    WHERE schemaname = 'public'
  LOOP
    SELECT definition INTO view_def
    FROM pg_views
    WHERE schemaname = view_rec.schemaname
      AND viewname = view_rec.viewname;
    
    IF view_def ILIKE '%auth.users%' THEN
      RAISE WARNING '🔴 EXPOSED: %.% references auth.users', view_rec.schemaname, view_rec.viewname;
    END IF;
  END LOOP;
  
  RAISE NOTICE '=== SCAN COMPLETE ===';
END $$;