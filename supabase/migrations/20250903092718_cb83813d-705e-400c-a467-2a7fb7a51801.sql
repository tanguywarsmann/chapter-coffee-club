-- Diagnostic complet des problèmes reportés

-- 1. Vérifier les données de couverture dans books_public
SELECT 
  id, 
  title, 
  author, 
  cover_url,
  CASE 
    WHEN cover_url IS NULL THEN 'NULL'
    WHEN cover_url = '' THEN 'EMPTY'
    ELSE 'HAS_VALUE'
  END as cover_status
FROM books_public 
WHERE title ILIKE '%albertine%' OR title ILIKE '%écume%'
LIMIT 5;

-- 2. Vérifier les questions publiques vs privées pour les jokers
SELECT 
  'public' as source,
  COUNT(*) as question_count,
  COUNT(CASE WHEN question IS NOT NULL AND question != '' THEN 1 END) as valid_questions
FROM reading_questions_public

UNION ALL

SELECT 
  'private' as source,
  COUNT(*) as question_count,
  COUNT(CASE WHEN question IS NOT NULL AND question != '' THEN 1 END) as valid_questions
FROM reading_questions;

-- 3. Exemple de question avec réponse pour tester les jokers
SELECT 
  rq.id,
  rq.book_slug,
  rq.segment,
  rq.question,
  CASE WHEN rq.answer IS NOT NULL THEN 'HAS_ANSWER' ELSE 'NO_ANSWER' END as answer_status
FROM reading_questions rq
WHERE rq.book_slug = 'albertine-disparue'
  AND rq.segment = 1
LIMIT 1;