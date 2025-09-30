-- Diagnostic complet pour debug
-- Execute ce fichier dans Supabase SQL Editor pour vérifier les données

-- 1. Voir TOUTES les données de progression (sans filtre)
SELECT 'READING_PROGRESS_ALL' as query_type, * FROM reading_progress LIMIT 10;

-- 2. Voir si ton user a des données
SELECT 'USER_PROGRESS' as query_type, * FROM reading_progress 
WHERE user_id = 'f5e55556-c5ae-40dc-9909-88600a13393b';

-- 3. Vérifier l'état actuel de RLS (doit être FALSE après rollback)
SELECT 'RLS_STATUS' as query_type, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('reading_progress', 'reading_validations', 'reading_questions', 'books');

-- 4. Tester si authenticated peut lire (simuler le frontend)
SET LOCAL role = authenticated;
SELECT 'AUTHENTICATED_CAN_READ' as query_type, count(*) as reading_progress_count FROM reading_progress;
SELECT 'AUTHENTICATED_BOOKS' as query_type, count(*) as books_count FROM books;
SELECT 'AUTHENTICATED_QUESTIONS' as query_type, count(*) as questions_count FROM reading_questions;
RESET role;

-- 5. Vérifier que la jointure books_public fonctionne
SELECT 'JOIN_TEST' as query_type, 
       rp.id, rp.user_id, rp.book_id, rp.current_page, rp.status,
       b.title, b.slug, b.author, b.cover_url
FROM reading_progress rp
LEFT JOIN books_public b ON b.id = rp.book_id
WHERE rp.user_id = 'f5e55556-c5ae-40dc-9909-88600a13393b'
LIMIT 5;

-- 6. Tester la fonction RPC directement avec des valeurs hardcodées
SELECT 'RPC_TEST_HARDCODED' as query_type, 
       public.force_validate_segment_beta(
         '1d6511a2-e109-4d87-b3a5-0970b9f18b07'::uuid,
         '7149d6d5-899c-4bf1-b7ae-2157105fc3ce'::uuid,
         'test réponse',
         'f5e55556-c5ae-40dc-9909-88600a13393b'::uuid,
         false,
         true
       ) as result;

-- 7. Vérifier les permissions globales
SELECT 'PERMISSIONS_CHECK' as query_type,
       has_table_privilege('authenticated', 'reading_progress', 'SELECT') as can_select_progress,
       has_table_privilege('authenticated', 'books', 'SELECT') as can_select_books,
       has_table_privilege('authenticated', 'reading_questions', 'SELECT') as can_select_questions;

-- 8. Compter les données par table
SELECT 'DATA_COUNTS' as query_type,
       (SELECT count(*) FROM reading_progress) as progress_count,
       (SELECT count(*) FROM reading_validations) as validations_count,
       (SELECT count(*) FROM books) as books_count,
       (SELECT count(*) FROM reading_questions) as questions_count;