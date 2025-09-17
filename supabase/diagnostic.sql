-- Vérifier les types de colonnes (critique pour les casts)
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('reading_progress', 'reading_validations', 'reading_questions')
  AND column_name IN ('book_id', 'user_id', 'segment')
ORDER BY table_name, column_name;

-- Vérifier si RLS est activé
SELECT 
  tablename,
  rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('reading_progress', 'reading_validations', 'reading_questions');

-- Vérifier les policies existantes
SELECT 
  tablename,
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('reading_progress', 'reading_validations', 'reading_questions')
ORDER BY tablename, policyname;

-- Tester si l'utilisateur peut lire ses données
SET LOCAL role = 'authenticated';
SET LOCAL request.jwt.claims = '{"sub": "f5e55556-c5ae-40dc-9909-88600a13393b"}';

SELECT count(*) as progress_count FROM reading_progress;
SELECT count(*) as validation_count FROM reading_validations;
SELECT count(*) as questions_count FROM reading_questions;

RESET role;