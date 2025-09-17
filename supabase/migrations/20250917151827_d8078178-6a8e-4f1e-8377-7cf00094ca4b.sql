-- Rollback sécuritaire pour diagnostic
-- S'assurer que RLS est désactivé pour debug
ALTER TABLE reading_progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE reading_validations DISABLE ROW LEVEL SECURITY;
ALTER TABLE reading_questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE books DISABLE ROW LEVEL SECURITY;
ALTER TABLE books_public DISABLE ROW LEVEL SECURITY;

-- Permissions complètes temporaires pour debug
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Vérifier que les données existent
DO $$
BEGIN
  RAISE NOTICE 'Progress count: %', (SELECT count(*) FROM reading_progress);
  RAISE NOTICE 'Validations count: %', (SELECT count(*) FROM reading_validations);
  RAISE NOTICE 'Books count: %', (SELECT count(*) FROM books);
  RAISE NOTICE 'Questions count: %', (SELECT count(*) FROM reading_questions);
END $$;